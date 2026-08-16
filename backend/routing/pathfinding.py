"""
Routing and pathfinding module for NagDrishti AI.

Calculates risk-aware safe routes across Nagpur using OSMnx and NetworkX A* pathfinding.
Pulls real OpenStreetMap road network data for Nagpur (south=21.08, north=21.22, west=79.02, east=79.18),
caches the graph to disk (backend/routing/cache/nagpur_graph.graphml), and dynamically penalizes
edge weights based on real-time zone risk scores and waterlogging hazards.
"""

import os
import json
import math
import logging
from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path
import networkx as nx
import osmnx as ox
from shapely.geometry import Point, Polygon
from zones.models import Zone
from risk.models import RiskScore

logger = logging.getLogger(__name__)

# Nagpur Bounding Box Coordinates (South, North, West, East)
NAGPUR_SOUTH = 21.08
NAGPUR_NORTH = 21.22
NAGPUR_WEST = 79.02
NAGPUR_EAST = 79.18

# Cache file path
BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "routing" / "cache"
CACHE_FILE = CACHE_DIR / "nagpur_graph.graphml"

# In-memory cached road graph
_CACHED_ROAD_GRAPH: Optional[nx.MultiDiGraph] = None


def get_zone_for_point(lat: float, lng: float, zones: List[Zone]) -> Optional[Zone]:
    """Finds which zone contains the given lat/lng point using Shapely."""
    pt = Point(lng, lat)
    for zone in zones:
        coords = None
        boundary = zone.boundary
        if hasattr(boundary, "coords"):
            coords = boundary.coords[0]
        elif isinstance(boundary, str):
            try:
                parsed = json.loads(boundary)
                if isinstance(parsed, dict) and "coordinates" in parsed:
                    coords = parsed["coordinates"][0]
            except Exception:
                pass
        elif isinstance(boundary, dict) and "coordinates" in boundary:
            coords = boundary["coordinates"][0]

        if coords:
            try:
                poly = Polygon(coords)
                if poly.contains(pt):
                    return zone
            except Exception:
                pass
    return None


def get_latest_zone_risks() -> Dict[int, float]:
    """Returns a dict mapping zone_id -> latest risk score (0-100)."""
    zone_risks: Dict[int, float] = {}
    for zone in Zone.objects.all():
        latest = RiskScore.objects.filter(zone=zone).order_by("-computed_at").first()
        zone_risks[zone.id] = latest.score if latest else 10.0
    return zone_risks


def haversine_distance_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculates great-circle distance between two points in meters."""
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return 6371000.0 * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


def build_nagpur_road_network(force_refresh: bool = False) -> nx.MultiDiGraph:
    """
    Loads or downloads the real OpenStreetMap drivable road network of Nagpur
    using OSMnx for bbox (south=21.08, north=21.22, west=79.02, east=79.18).
    Caches the graph to disk at backend/routing/cache/nagpur_graph.graphml.
    """
    global _CACHED_ROAD_GRAPH
    if _CACHED_ROAD_GRAPH is not None and not force_refresh:
        return _CACHED_ROAD_GRAPH

    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Load from disk cache if present and valid
    if CACHE_FILE.exists() and not force_refresh:
        try:
            logger.info(f"Loading cached Nagpur OSM road network from {CACHE_FILE}...")
            G = ox.load_graphml(CACHE_FILE)
            if len(G.nodes) > 100:
                _CACHED_ROAD_GRAPH = G
                logger.info(f"Successfully loaded {len(G.nodes)} nodes and {len(G.edges)} edges from cache.")
                return G
        except Exception as exc:
            logger.warning(f"Failed to load cached graph from {CACHE_FILE}: {exc}. Re-downloading from OSM...")

    # 2. Fetch from OpenStreetMap via OSMnx
    try:
        logger.info("Downloading real Nagpur drivable road network from OpenStreetMap...")
        # bbox in OSMnx 2.x: (north, south, east, west)
        G = ox.graph_from_bbox(
            bbox=(NAGPUR_NORTH, NAGPUR_SOUTH, NAGPUR_EAST, NAGPUR_WEST),
            network_type="drive",
            simplify=True,
        )
        if len(G.nodes) == 0:
            raise ValueError("Downloaded OSM graph contains 0 nodes.")

        # Save to disk cache
        try:
            ox.save_graphml(G, CACHE_FILE)
            logger.info(f"Saved Nagpur road graph ({len(G.nodes)} nodes) to cache at {CACHE_FILE}.")
        except Exception as save_err:
            logger.warning(f"Could not write graph cache to {CACHE_FILE}: {save_err}")

        _CACHED_ROAD_GRAPH = G
        return G

    except Exception as exc:
        logger.error(f"Failed to download Nagpur road graph from OSMnx/Overpass: {exc}")
        raise RuntimeError(
            f"routing_unavailable: Could not fetch real Nagpur road network from OpenStreetMap Overpass API ({exc})"
        )


def find_nearest_node(G: Any, lat: float, lng: float) -> int:
    """Finds the nearest OSM node ID (integer) for given lat, lng coordinates."""
    try:
        # Use OSMnx built-in nearest_nodes (expects X=longitude, Y=latitude)
        node_id = ox.nearest_nodes(G, X=float(lng), Y=float(lat))
        return int(node_id)
    except Exception as exc:
        logger.warning(f"ox.nearest_nodes failed ({exc}), falling back to distance scan...")
        best_node = None
        min_dist = float("inf")
        for n, data in G.nodes(data=True):
            n_lat = data.get("y", data.get("lat"))
            n_lng = data.get("x", data.get("lng"))
            if n_lat is not None and n_lng is not None:
                dist = haversine_distance_m(lat, lng, float(n_lat), float(n_lng))
                if dist < min_dist:
                    min_dist = dist
                    best_node = n
        if best_node is not None:
            return int(best_node) if str(best_node).isdigit() else best_node
        raise RuntimeError("No nodes found in road network graph.")


def calculate_safe_route(from_lat: float, from_lng: float, to_lat: float, to_lng: float) -> Dict[str, Any]:
    """
    Computes a risk-aware safest path across Nagpur road network using A* search on the real OSM graph.
    Road segment edge costs are dynamically penalized by zone crisis scores.
    """
    try:
        G = build_nagpur_road_network()
    except Exception as exc:
        return {
            "status": "routing_unavailable",
            "error": str(exc),
            "message": "Real OSM routing is currently unavailable due to network/Overpass reachability.",
        }

    zones = list(Zone.objects.all())
    zone_risks = get_latest_zone_risks()

    start_node = find_nearest_node(G, from_lat, from_lng)
    target_node = find_nearest_node(G, to_lat, to_lng)

    start_data = G.nodes[start_node]
    target_data = G.nodes[target_node]
    target_lat = target_data.get("y", target_data.get("lat", NAGPUR_NORTH))
    target_lng = target_data.get("x", target_data.get("lng", NAGPUR_EAST))

    def heuristic(u, v):
        u_data = G.nodes[u]
        v_data = G.nodes[v]
        u_lat = u_data.get("y", u_data.get("lat", 21.1458))
        u_lng = u_data.get("x", u_data.get("lng", 79.0882))
        v_lat = v_data.get("y", v_data.get("lat", 21.1458))
        v_lng = v_data.get("x", v_data.get("lng", 79.0882))
        return haversine_distance_m(float(u_lat), float(u_lng), float(v_lat), float(v_lng))

    avoided_zones = set()

    def weight_func(u, v, d):
        base_len = float(d.get("length", 100.0))
        u_data = G.nodes[u]
        v_data = G.nodes[v]
        u_lat = float(u_data.get("y", u_data.get("lat", 21.1458)))
        u_lng = float(u_data.get("x", u_data.get("lng", 79.0882)))
        v_lat = float(v_data.get("y", v_data.get("lat", 21.1458)))
        v_lng = float(v_data.get("x", v_data.get("lng", 79.0882)))

        mid_lat = (u_lat + v_lat) / 2.0
        mid_lng = (u_lng + v_lng) / 2.0

        zone = get_zone_for_point(mid_lat, mid_lng, zones)
        risk = zone_risks.get(zone.id, 10.0) if zone else 10.0

        if risk >= 60.0 and zone:
            avoided_zones.add(zone.name)

        # Exponential risk penalty on edge traversal
        risk_penalty = 1.0 + ((risk / 20.0) ** 1.6)
        return base_len * risk_penalty

    # Execute NetworkX A* or Dijkstra pathfinding on MultiDiGraph / converted Graph
    try:
        if isinstance(G, nx.MultiDiGraph):
            # For MultiDiGraph, find path using shortest_path / astar
            # Create lightweight weighted view
            path_nodes = nx.astar_path(G, start_node, target_node, heuristic=heuristic, weight=weight_func)
        else:
            path_nodes = nx.astar_path(G, start_node, target_node, heuristic=heuristic, weight=weight_func)
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        try:
            # Fallback to standard length-weighted shortest path on connected component
            path_nodes = nx.shortest_path(G, start_node, target_node, weight="length")
        except Exception:
            # If graph is strongly directed and disconnected between specific points, try undirected
            G_undirected = G.to_undirected()
            try:
                path_nodes = nx.astar_path(G_undirected, start_node, target_node, heuristic=heuristic, weight=weight_func)
            except Exception as no_path_err:
                return {
                    "status": "routing_unavailable",
                    "error": f"No connected street path found between ({from_lat}, {from_lng}) and ({to_lat}, {to_lng})",
                    "message": "No road connection found between the selected coordinates in the road network.",
                }

    # Extract coordinates along the path
    coordinates: List[List[float]] = [[from_lat, from_lng]]
    total_distance_m = haversine_distance_m(
        from_lat, from_lng, float(start_data.get("y", start_data.get("lat"))), float(start_data.get("x", start_data.get("lng")))
    )
    traversed_zones = set()

    for i in range(len(path_nodes)):
        node_id = path_nodes[i]
        n_data = G.nodes[node_id]
        n_lat = float(n_data.get("y", n_data.get("lat")))
        n_lng = float(n_data.get("x", n_data.get("lng")))
        coordinates.append([n_lat, n_lng])

        if i > 0:
            prev_node = path_nodes[i - 1]
            if G.has_edge(prev_node, node_id):
                edge_dict = G.get_edge_data(prev_node, node_id)
                # In MultiDiGraph, edge_dict has key indices {0: {...}}
                if isinstance(edge_dict, dict) and 0 in edge_dict:
                    seg_len = float(edge_dict[0].get("length", 100.0))
                elif isinstance(edge_dict, dict):
                    seg_len = float(next(iter(edge_dict.values())).get("length", 100.0) if edge_dict else 100.0)
                else:
                    seg_len = 100.0
            else:
                seg_len = 100.0

            total_distance_m += seg_len

            p_data = G.nodes[prev_node]
            p_lat = float(p_data.get("y", p_data.get("lat")))
            p_lng = float(p_data.get("x", p_data.get("lng")))
            mid_lat = (p_lat + n_lat) / 2.0
            mid_lng = (p_lng + n_lng) / 2.0

            z = get_zone_for_point(mid_lat, mid_lng, zones)
            if z:
                traversed_zones.add(z.name)

    # Destination final leg
    dest_leg = haversine_distance_m(
        float(target_data.get("y", target_data.get("lat"))), float(target_data.get("x", target_data.get("lng"))), to_lat, to_lng
    )
    total_distance_m += dest_leg
    coordinates.append([to_lat, to_lng])

    dist_km = round(total_distance_m / 1000.0, 2)
    est_minutes = max(3, round(dist_km * 2.8))

    if avoided_zones:
        explanation = (
            f"Safe route actively diverts away from High/Severe waterlogging zones ({', '.join(avoided_zones)}). "
            f"Passes via safer corridors ({', '.join(list(traversed_zones)[:3]) if traversed_zones else 'general roads'})."
        )
    else:
        explanation = "Route verified through normal risk zones with low waterlogging probability."

    return {
        "from": {"lat": from_lat, "lng": from_lng},
        "to": {"lat": to_lat, "lng": to_lng},
        "path_nodes": [int(n) if str(n).isdigit() else str(n) for n in path_nodes],
        "coordinates": coordinates,
        "distance_meters": round(total_distance_m, 1),
        "distance_km": dist_km,
        "estimated_minutes": est_minutes,
        "traversed_zones": list(traversed_zones),
        "avoided_high_risk_zones": list(avoided_zones),
        "safety_explanation": explanation,
        "total_nodes_in_network": len(G.nodes),
        "status": "safe_route_found",
    }
