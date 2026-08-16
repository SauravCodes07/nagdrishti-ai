from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Zone
from .serializers import ZoneRiskSerializer
from risk.models import RiskScore
from risk.scoring import compute_zone_risk


class ZoneRiskListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """GET /api/zones/risk/ (public)"""
        zones = Zone.objects.all()
        # Compute risk score for any zone that doesn't have one yet
        for zone in zones:
            if not RiskScore.objects.filter(zone=zone).exists():
                try:
                    compute_zone_risk(zone)
                except Exception:
                    pass

        serializer = ZoneRiskSerializer(zones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ZoneDispatchView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        """PATCH /api/zones/{id}/dispatch/ (admin only)"""
        zone = get_object_or_404(Zone, pk=pk)
        dispatch_status = request.data.get("dispatch_status")

        valid_statuses = ["Unassigned", "Dispatched", "Resolved"]
        if dispatch_status not in valid_statuses:
            return Response(
                {"error": f"Invalid dispatch_status. Must be one of: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        zone.dispatch_status = dispatch_status
        zone.save(update_fields=["dispatch_status"])

        serializer = ZoneRiskSerializer(zone)
        return Response(serializer.data, status=status.HTTP_200_OK)
