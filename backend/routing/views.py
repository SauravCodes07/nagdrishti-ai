import logging
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .pathfinding import calculate_safe_route

logger = logging.getLogger(__name__)


class RoutePathfindView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        GET /api/route/?from=lat,lng&to=lat,lng (public)
        """
        from_param = request.query_params.get("from")
        to_param = request.query_params.get("to")

        logger.info(f"Incoming route calculation request: from={from_param}, to={to_param}")

        if not from_param or not to_param:
            logger.warning(f"Route calculation rejected: missing parameters (from={from_param}, to={to_param})")
            return Response(
                {
                    "status": "error",
                    "error": "Missing required query parameters: 'from' and 'to' (e.g. ?from=21.1458,79.0882&to=21.1605,79.0830)",
                    "message": "Please specify both starting point and destination.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from_parts = [float(p.strip()) for p in from_param.split(",")]
            to_parts = [float(p.strip()) for p in to_param.split(",")]

            if len(from_parts) != 2 or len(to_parts) != 2:
                raise ValueError("Parameters must each contain exactly lat,lng")

            from_lat, from_lng = from_parts
            to_lat, to_lng = to_parts

        except Exception as exc:
            logger.warning(f"Route coordinate parsing failed for '{from_param}' -> '{to_param}': {exc}")
            return Response(
                {
                    "status": "error",
                    "error": f"Invalid coordinate format. Expected lat,lng numbers. Details: {exc}",
                    "message": "Invalid coordinates provided.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            route_result = calculate_safe_route(from_lat, from_lng, to_lat, to_lng)
            if route_result.get("status") == "error":
                logger.warning(f"Route calculation validation error: {route_result.get('error')}")
                return Response(route_result, status=status.HTTP_400_BAD_REQUEST)
            if route_result.get("status") == "routing_unavailable":
                logger.error(f"Route calculation unavailable: {route_result.get('error')}")
                return Response(route_result, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            logger.info(f"Route calculated successfully: {route_result.get('distance_km')} km across {route_result.get('node_count')} nodes.")
            return Response(route_result, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception(f"Unhandled exception during calculate_safe_route({from_lat}, {from_lng}, {to_lat}, {to_lng}):")
            return Response(
                {
                    "status": "routing_unavailable",
                    "error": f"Pathfinding calculation failure: {exc}",
                    "message": "Internal error calculating road route across road network.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
