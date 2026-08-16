from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from zones.models import Zone, WeatherReading
from reports.models import Report
from risk.models import RiskScore
from risk.scoring import compute_zone_risk


class PriorityQueueView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        """
        GET /api/priority-queue/ (admin only)
        Returns zones ranked by risk urgency (Severe > High > Medium > Low) and pending issues.
        """
        zones = Zone.objects.all()
        queue = []

        category_weights = {
            "Severe": 4,
            "High": 3,
            "Medium": 2,
            "Low": 1,
        }

        for zone in zones:
            latest_risk = RiskScore.objects.filter(zone=zone).order_by("-computed_at").first()
            if not latest_risk:
                score, category = compute_zone_risk(zone)
            else:
                score, category = latest_risk.score, latest_risk.category

            pending_reports = Report.objects.filter(zone=zone, verification_status="Pending").count()
            verified_reports = Report.objects.filter(zone=zone, verification_status="Verified").count()

            queue.append({
                "zone_id": zone.id,
                "zone_name": zone.name,
                "risk_score": score,
                "risk_category": category,
                "dispatch_status": zone.dispatch_status,
                "elevation_factor": zone.elevation_factor,
                "drainage_capacity": zone.drainage_capacity,
                "pending_reports_count": pending_reports,
                "verified_reports_count": verified_reports,
                "priority_weight": category_weights.get(category, 0) * 100 + score,
            })

        # Rank by priority_weight descending
        queue.sort(key=lambda x: x["priority_weight"], reverse=True)
        return Response({"priority_queue": queue, "total_zones": len(queue)}, status=status.HTTP_200_OK)


class SimulateRainfallView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        """
        POST /api/simulate-rainfall/ (admin only)
        Accepts rainfall_intensity_mm and optional zone_id.
        Simulates rainfall and updates risk scores.
        """
        rainfall_intensity = request.data.get("rainfall_intensity_mm")
        zone_id = request.data.get("zone_id")

        if rainfall_intensity is None:
            return Response(
                {"error": "Missing required field 'rainfall_intensity_mm'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            rainfall_val = float(rainfall_intensity)
        except (ValueError, TypeError):
            return Response(
                {"error": "'rainfall_intensity_mm' must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        target_zones = []

        if zone_id:
            try:
                target_zones = [Zone.objects.get(pk=zone_id)]
            except Zone.DoesNotExist:
                return Response(
                    {"error": f"Zone with id {zone_id} not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            target_zones = list(Zone.objects.all())

        results = []
        for zone in target_zones:
            # Write WeatherReading with source="simulated"
            WeatherReading.objects.create(
                zone=zone,
                rainfall_intensity_mm=rainfall_val,
                source="simulated",
                recorded_at=now,
            )
            # Recompute zone risk score
            score, category = compute_zone_risk(zone)
            results.append({
                "zone_id": zone.id,
                "zone_name": zone.name,
                "rainfall_intensity_mm": rainfall_val,
                "new_risk_score": score,
                "new_risk_category": category,
                "dispatch_status": zone.dispatch_status,
            })

        return Response({
            "message": f"Rainfall of {rainfall_val}mm simulated successfully.",
            "affected_zones_count": len(results),
            "results": results,
        }, status=status.HTTP_200_OK)
