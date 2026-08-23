"""
NagDrishti AI — Live Traffic Engine (TomTom Traffic Integration)
Provides real-time traffic flow status and traffic incidents proxy with server-side caching.
If TomTom API key is not configured or fails, returns a graceful fallback without breaking the map or routing.
"""

import os
import time
import logging
import requests
from django.http import JsonResponse
from django.views import View

logger = logging.getLogger(__name__)

# Nagpur District Bounding Box for traffic queries: minLon,minLat,maxLon,maxLat
NAGPUR_DISTRICT_BBOX = "78.24,20.58,79.66,21.75"

# 60-Second In-Memory Cache for Traffic Requests
_TRAFFIC_INCIDENTS_CACHE = {
    "timestamp": 0,
    "bbox": "",
    "data": None,
}

_TRAFFIC_FLOW_CACHE = {
    "timestamp": 0,
    "data": None,
}

CACHE_TTL_SECONDS = 60


def get_tomtom_api_key():
    """Retrieves TomTom API key from environment."""
    return os.environ.get("TOMTOM_API_KEY") or os.environ.get("NEXT_PUBLIC_TOMTOM_API_KEY", "")


class TrafficIncidentsView(View):
    """
    GET /api/traffic/incidents/?bbox=minLon,minLat,maxLon,maxLat
    Returns real-time traffic incidents (accidents, congestion, roadworks, closures) from TomTom Traffic API.
    Cached for 60 seconds to prevent rate limiting.
    """

    def get(self, request, *args, **kwargs):
        bbox = request.GET.get("bbox", NAGPUR_DISTRICT_BBOX)
        api_key = get_tomtom_api_key()

        now = time.time()
        # Return cached incidents if fresh
        if (
            _TRAFFIC_INCIDENTS_CACHE["data"] is not None
            and _TRAFFIC_INCIDENTS_CACHE["bbox"] == bbox
            and (now - _TRAFFIC_INCIDENTS_CACHE["timestamp"]) < CACHE_TTL_SECONDS
        ):
            return JsonResponse(_TRAFFIC_INCIDENTS_CACHE["data"])

        if not api_key:
            fallback_response = {
                "status": "unavailable",
                "live": False,
                "message": "TomTom API key not configured on server. Traffic layer running in passive mode.",
                "incidents": [],
                "timestamp": int(now),
                "cached": False,
            }
            return JsonResponse(fallback_response)

        try:
            # TomTom Incident Details v5
            # https://api.tomtom.com/traffic/services/5/incidentDetails?bbox={bbox}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code},from,to,length,delay,roadNumbers}}}&key={key}
            url = f"https://api.tomtom.com/traffic/services/5/incidentDetails"
            params = {
                "key": api_key,
                "bbox": bbox,
                "language": "en-GB",
                "fields": "{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code},from,to,length,delay,roadNumbers}}}",
            }

            resp = requests.get(url, params=params, timeout=5)
            if resp.status_code == 200:
                raw_data = resp.json()
                parsed_incidents = []
                for inc in raw_data.get("incidents", []):
                    props = inc.get("properties", {})
                    geom = inc.get("geometry", {})
                    events = props.get("events", [])
                    event_desc = events[0].get("description", "Traffic Disruption") if events else "Traffic Disruption"

                    coords = geom.get("coordinates", [])
                    # Coordinates can be a single point or line
                    point = None
                    if geom.get("type") == "Point" and len(coords) >= 2:
                        point = [coords[1], coords[0]]  # [lat, lng]
                    elif geom.get("type") == "LineString" and len(coords) > 0 and len(coords[0]) >= 2:
                        point = [coords[0][1], coords[0][0]]

                    parsed_incidents.append({
                        "id": inc.get("id") or f"inc_{len(parsed_incidents)}",
                        "type": inc.get("type", "Incident"),
                        "description": event_desc,
                        "road": props.get("from") or props.get("roadNumbers", ["Nagpur Corridor"])[0] if props.get("roadNumbers") else "Nagpur Roadway",
                        "to": props.get("to", ""),
                        "delay_seconds": props.get("delay", 0),
                        "delay_minutes": round(props.get("delay", 0) / 60, 1),
                        "length_meters": props.get("length", 0),
                        "magnitude": props.get("magnitudeOfDelay", 0),
                        "icon_category": props.get("iconCategory", 0),
                        "coordinates": point,
                        "raw_geometry": geom,
                    })

                result = {
                    "status": "ok",
                    "live": True,
                    "provider": "TomTom Traffic Incidents API",
                    "count": len(parsed_incidents),
                    "incidents": parsed_incidents,
                    "timestamp": int(now),
                    "cached": False,
                }

                _TRAFFIC_INCIDENTS_CACHE["timestamp"] = now
                _TRAFFIC_INCIDENTS_CACHE["bbox"] = bbox
                _TRAFFIC_INCIDENTS_CACHE["data"] = result

                return JsonResponse(result)
            else:
                logger.warning(f"TomTom incidents request returned status {resp.status_code}: {resp.text[:200]}")
                return JsonResponse({
                    "status": "unavailable",
                    "live": False,
                    "message": f"TomTom API status {resp.status_code}",
                    "incidents": [],
                    "timestamp": int(now),
                })
        except Exception as exc:
            logger.error(f"Error fetching TomTom traffic incidents: {exc}")
            return JsonResponse({
                "status": "unavailable",
                "live": False,
                "message": "Traffic service temporarily unreachable.",
                "incidents": [],
                "timestamp": int(now),
            })


class TrafficFlowView(View):
    """
    GET /api/traffic/flow/
    Returns status and configuration for TomTom Traffic Flow raster overlay tiles.
    """

    def get(self, request, *args, **kwargs):
        api_key = get_tomtom_api_key()
        now = time.time()

        if not api_key:
            return JsonResponse({
                "status": "unavailable",
                "live": False,
                "message": "TomTom API key not configured.",
                "tile_url": None,
                "timestamp": int(now),
            })

        # TomTom Traffic Flow Raster Tile URL template
        # Style relative0 displays green/yellow/orange/red speeds relative to free flow
        tile_url = f"https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{{z}}/{{x}}/{{y}}.png?key={api_key}&thickness=8"

        return JsonResponse({
            "status": "ok",
            "live": True,
            "provider": "TomTom Traffic Flow API",
            "tile_url": tile_url,
            "refresh_interval_seconds": 60,
            "timestamp": int(now),
        })
