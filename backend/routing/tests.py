from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from zones.models import Zone
from routing.pathfinding import (
    build_nagpur_road_network,
    find_nearest_node,
    haversine_distance_m,
    calculate_safe_route,
)


class RoutingPathfindingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.zone1 = Zone.objects.create(
            name="Dharampeth",
            boundary={
                "type": "Polygon",
                "coordinates": [[
                    [79.055, 21.140],
                    [79.075, 21.140],
                    [79.075, 21.155],
                    [79.055, 21.155],
                    [79.055, 21.140],
                ]]
            },
            elevation_factor=0.35,
            drainage_capacity=0.70,
            dispatch_status="Unassigned",
        )
        self.zone2 = Zone.objects.create(
            name="Lakadganj",
            boundary={
                "type": "Polygon",
                "coordinates": [[
                    [79.115, 21.145],
                    [79.145, 21.145],
                    [79.145, 21.165],
                    [79.115, 21.165],
                    [79.115, 21.145],
                ]]
            },
            elevation_factor=0.50,
            drainage_capacity=0.45,
            dispatch_status="Unassigned",
        )

    def test_01_osmnx_real_road_network_graph(self):
        G = build_nagpur_road_network()
        # Real OSMnx graph for Nagpur has thousands of nodes and edges
        self.assertGreaterEqual(len(G.nodes), 1000)
        self.assertGreaterEqual(len(G.edges), 2000)

    def test_02_routing_pathfinding(self):
        G = build_nagpur_road_network()
        node_id = find_nearest_node(G, 21.1458, 79.0882)
        # OSM node IDs are integers
        self.assertIsInstance(node_id, (int, str))

    def test_03_safe_route_calculation_algorithm(self):
        # Arbitrary real coordinates in Nagpur: Dharampeth (21.1472, 79.0664) -> Lakadganj (21.1550, 79.1300)
        res = calculate_safe_route(21.1472, 79.0664, 21.1550, 79.1300)
        self.assertEqual(res["status"], "safe_route_found")
        self.assertGreater(res["distance_km"], 0.5)
        self.assertGreater(len(res["coordinates"]), 2)
        self.assertIn("safety_explanation", res)
        self.assertGreaterEqual(res["total_nodes_in_network"], 1000)

    def test_04_arbitrary_points_route(self):
        # Sitabuldi (21.1465, 79.0825) -> Sadar (21.1605, 79.0830)
        res = calculate_safe_route(21.1465, 79.0825, 21.1605, 79.0830)
        self.assertEqual(res["status"], "safe_route_found")
        self.assertGreater(len(res["coordinates"]), 2)

    def test_09_endpoint_get_route_public(self):
        response = self.client.get("/api/route/?from=21.1472,79.0664&to=21.1550,79.1300")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "safe_route_found")
        self.assertIn("coordinates", response.data)
        self.assertIn("distance_km", response.data)

    def test_route_api_endpoint_missing_params(self):
        response = self.client.get("/api/route/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
