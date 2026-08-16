from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Zone, WeatherReading
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


class CityWeatherView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        GET /api/zones/weather/ (public)
        Returns current citywide weather aggregates from latest readings.
        """
        latest_readings = WeatherReading.objects.all().order_by("-recorded_at")[:10]
        if latest_readings:
            avg_rain = sum(r.rainfall_intensity_mm for r in latest_readings) / len(latest_readings)
            max_rain = max(r.rainfall_intensity_mm for r in latest_readings)
            source = latest_readings[0].source
            rec_at = latest_readings[0].recorded_at.isoformat() if latest_readings[0].recorded_at else None

            if max_rain >= 50.0:
                condition = "Torrential Downpour / Severe Thunderstorms"
            elif max_rain >= 25.0:
                condition = "Heavy Monsoon Rain"
            elif max_rain >= 5.0:
                condition = "Moderate Showers"
            elif max_rain > 0.0:
                condition = "Light Drizzle"
            else:
                condition = "Clear / Overcast"

            return Response({
                "rainfall_intensity_mm": round(max_rain, 1),
                "average_rainfall_mm": round(avg_rain, 1),
                "condition": condition,
                "source": source,
                "recorded_at": rec_at,
            }, status=status.HTTP_200_OK)

        return Response({
            "rainfall_intensity_mm": 0.0,
            "average_rainfall_mm": 0.0,
            "condition": "Clear",
            "source": "open_meteo",
            "recorded_at": None,
        }, status=status.HTTP_200_OK)
