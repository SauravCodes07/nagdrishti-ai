from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .pathfinding import calculate_safe_route


class RoutePathfindView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        GET /api/route/?from=lat,lng&to=lat,lng (public)
        """
        from_param = request.query_params.get("from")
        to_param = request.query_params.get("to")

        if not from_param or not to_param:
            return Response(
                {"error": "Missing required query parameters: 'from' and 'to' (e.g. ?from=21.1458,79.0882&to=21.1605,79.0830)"},
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
            return Response(
                {"error": f"Invalid coordinate format for 'from' or 'to'. Expected lat,lng numbers. Details: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            route_result = calculate_safe_route(from_lat, from_lng, to_lat, to_lng)
            if route_result.get("status") == "routing_unavailable":
                return Response(route_result, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            return Response(route_result, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"status": "routing_unavailable", "error": f"Pathfinding failed: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
