from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from zones.models import Zone, WeatherReading
from reports.models import Report
from risk.models import RiskScore
from alerts.models import AlertLog
from alerts.services.notify import check_and_send_zone_alert
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
            photo_confirmed = Report.objects.filter(zone=zone, waterlogging_detected=True).exists()

            latest_weather = WeatherReading.objects.filter(zone=zone).order_by("-recorded_at").first()
            rainfall = latest_weather.rainfall_intensity_mm if latest_weather else 0.0

            queue.append({
                "zone_id": zone.id,
                "zone_name": zone.name,
                "risk_score": score,
                "risk_category": category,
                "photo_confirmed": photo_confirmed,
                "rainfall_mm": rainfall,
                "dispatch_status": zone.dispatch_status,
                "elevation_factor": zone.elevation_factor,
                "drainage_capacity": zone.drainage_capacity,
                "pending_reports_count": pending_reports,
                "verified_reports_count": verified_reports,
                "priority_weight": category_weights.get(category, 0) * 100 + score,
            })

        # Rank by priority_weight descending
        queue.sort(key=lambda x: x["priority_weight"], reverse=True)
        return Response({
            "priority_queue": queue,
            "total_zones": len(queue),
            "severe_count": sum(1 for q in queue if q["risk_category"] == "Severe"),
            "high_count": sum(1 for q in queue if q["risk_category"] == "High"),
        }, status=status.HTTP_200_OK)


class SimulateRainfallView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        """
        POST /api/simulate-rainfall/ (admin only)
        Supports both raw rainfall parameters and structured 8-stage crisis simulation scenarios.
        Stages:
          1. 'baseline'    - Dry conditions (0mm rain, Low risk, Unassigned)
          2. 'onset'       - Light rainfall starts across city (12-18mm)
          3. 'downpour'    - Heavy localized cloudburst in vulnerable zones (55-85mm)
          4. 'escalation'  - Risk engine recalculates High/Severe crisis index
          5. 'waterlogging'- Emergence of photo-confirmed waterlogging hazard
          6. 'alert'       - Twilio emergency dispatch triggered
          7. 'dispatch'    - Municipal pumps & quick-response teams dispatched
          8. 'resolve'     - Drainage clearing, flood recedes, marked Resolved
          Or 'full_cycle' / direct 'rainfall_intensity_mm'.
        """
        stage = request.data.get("stage")
        rainfall_intensity = request.data.get("rainfall_intensity_mm")
        zone_id = request.data.get("zone_id")
        now = timezone.now()

        all_zones = list(Zone.objects.all())
        if not all_zones:
            return Response({"error": "No zones found in database to simulate."}, status=status.HTTP_400_BAD_REQUEST)

        # Vulnerable low-lying zones in Nagpur
        vulnerable_names = ["Gandhibagh", "Mahal", "Nehru Nagar", "Sitabuldi"]
        vulnerable_zones = [z for z in all_zones if z.name in vulnerable_names] or all_zones[:2]

        stage_description = ""
        affected_zones = []

        if stage == "baseline":
            stage_description = "Stage 1: BASELINE — Clear weather across Nagpur. Normal traffic and low risk."
            for z in all_zones:
                WeatherReading.objects.create(zone=z, rainfall_intensity_mm=0.0, source="simulated", recorded_at=now)
                z.dispatch_status = "Unassigned"
                z.save(update_fields=["dispatch_status"])
                score, cat = compute_zone_risk(z)
                affected_zones.append({"zone_id": z.id, "name": z.name, "score": score, "category": cat, "rainfall": 0.0})

        elif stage == "onset":
            stage_description = "Stage 2: RAINFALL ONSET — Scattered light showers (15mm) across Nagpur."
            for z in all_zones:
                val = 15.0 if z in vulnerable_zones else 8.0
                WeatherReading.objects.create(zone=z, rainfall_intensity_mm=val, source="simulated", recorded_at=now)
                score, cat = compute_zone_risk(z)
                affected_zones.append({"zone_id": z.id, "name": z.name, "score": score, "category": cat, "rainfall": val})

        elif stage == "downpour" or stage == "escalation":
            stage_description = "Stage 3 & 4: DOWNPOUR & RISK ESCALATION — Heavy downpour (75mm) over low-lying basins. High/Severe crisis triggered."
            for z in all_zones:
                val = 75.0 if z in vulnerable_zones else 20.0
                WeatherReading.objects.create(zone=z, rainfall_intensity_mm=val, source="simulated", recorded_at=now)
                score, cat = compute_zone_risk(z)
                affected_zones.append({"zone_id": z.id, "name": z.name, "score": score, "category": cat, "rainfall": val})

        elif stage == "waterlogging":
            stage_description = "Stage 5: WATERLOGGING EMERGENCE — Citizen incident report with photo confirms severe waterlogging."
            for z in vulnerable_zones:
                WeatherReading.objects.create(zone=z, rainfall_intensity_mm=85.0, source="simulated", recorded_at=now)
                # Create a photo-confirmed waterlogging report
                Report.objects.create(
                    reporter_location={"type": "Point", "coordinates": [79.10, 21.15]},
                    description="Severe waterlogging and knee-deep puddle near market square",
                    zone=z,
                    pothole_detected=True,
                    pothole_confidence=0.88,
                    waterlogging_detected=True,
                    waterlogging_confidence=0.94,
                    verification_status="Pending",
                )
                score, cat = compute_zone_risk(z)
                affected_zones.append({"zone_id": z.id, "name": z.name, "score": score, "category": cat, "rainfall": 85.0})

        elif stage == "alert":
            stage_description = "Stage 6: EMERGENCY ALERT DISPATCH — Automated Twilio SMS/WhatsApp alerts triggered for municipal response teams."
            for z in vulnerable_zones:
                WeatherReading.objects.create(zone=z, rainfall_intensity_mm=90.0, source="simulated", recorded_at=now)
                score, cat = compute_zone_risk(z)
                # Force alert trigger
                check_and_send_zone_alert(z, score, cat, channel="SMS")
                check_and_send_zone_alert(z, score, cat, channel="WhatsApp")
                affected_zones.append({"zone_id": z.id, "name": z.name, "score": score, "category": cat, "rainfall": 90.0})

        elif stage == "dispatch":
            stage_description = "Stage 7: CIVIC DISPATCH — Municipal water dewatering pumps and quick-response teams deployed."
            for z in vulnerable_zones:
                z.dispatch_status = "Dispatched"
                z.save(update_fields=["dispatch_status"])
                score, cat = compute_zone_risk(z)
                affected_zones.append({"zone_id": z.id, "name": z.name, "score": score, "category": cat, "dispatch_status": "Dispatched"})

        elif stage == "resolve":
            stage_description = "Stage 8: RESOLUTION — Flood waters cleared by dewatering pumps. Ward hazard resolved."
            for z in all_zones:
                WeatherReading.objects.create(zone=z, rainfall_intensity_mm=0.0, source="simulated", recorded_at=now)
                z.dispatch_status = "Resolved"
                z.save(update_fields=["dispatch_status"])
                # Mark pending reports as verified
                Report.objects.filter(zone=z, verification_status="Pending").update(verification_status="Verified")
                score, cat = compute_zone_risk(z)
                affected_zones.append({"zone_id": z.id, "name": z.name, "score": score, "category": cat, "dispatch_status": "Resolved"})

        else:
            # Custom or standard numeric rainfall simulation
            val = float(rainfall_intensity) if rainfall_intensity is not None else 45.0
            target_zones = [Zone.objects.get(pk=zone_id)] if zone_id else all_zones
            stage_description = f"Simulated custom rainfall of {val}mm across {len(target_zones)} zone(s)."

            for z in target_zones:
                WeatherReading.objects.create(zone=z, rainfall_intensity_mm=val, source="simulated", recorded_at=now)
                score, cat = compute_zone_risk(z)
                affected_zones.append({
                    "zone_id": z.id,
                    "name": z.name,
                    "rainfall": val,
                    "score": score,
                    "category": cat,
                    "dispatch_status": z.dispatch_status,
                })

        return Response({
            "message": "Rainfall simulation executed successfully.",
            "stage": stage or "custom",
            "description": stage_description,
            "affected_zones_count": len(affected_zones),
            "results": affected_zones,
            "timestamp": now.isoformat(),
        }, status=status.HTTP_200_OK)
