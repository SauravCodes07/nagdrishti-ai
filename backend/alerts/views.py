from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AlertLog
from .serializers import AlertLogSerializer
from zones.models import Zone
from risk.models import RiskScore


class AlertLogListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        """
        GET /api/alerts/ (admin only)
        Returns audit trail of automated emergency alerts sent.
        """
        logs = AlertLog.objects.all().order_by("-sent_at")[:50]
        serializer = AlertLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BroadcastAlertListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        GET /api/alerts/broadcast/ (public)
        Returns public active civic emergency alerts and flood advisories across Nagpur.
        """
        broadcasts = []

        # 1. From recent AlertLogs
        logs = AlertLog.objects.all().order_by("-sent_at")[:20]
        for log in logs:
            broadcasts.append({
                "id": log.id,
                "zone_name": log.zone.name if log.zone else "Nagpur Citywide",
                "severity": log.risk_category_at_send or "Severe",
                "message": f"Emergency Protocol Active: Zone {log.zone.name} is under {log.risk_category_at_send} flood/road-hazard risk.",
                "created_at": log.sent_at.isoformat() if log.sent_at else None,
                "channel": log.channel,
                "status": log.status,
            })

        # 2. If no alert logs, derive from active Severe/High risk zones
        if not broadcasts:
            for zone in Zone.objects.all():
                latest_risk = RiskScore.objects.filter(zone=zone).order_by("-computed_at").first()
                if latest_risk and latest_risk.category in ["Severe", "High"]:
                    broadcasts.append({
                        "id": f"zone-{zone.id}",
                        "zone_name": zone.name,
                        "severity": latest_risk.category,
                        "message": f"Civic Advisory: Elevated waterlogging and traffic congestion risk detected in {zone.name} (Risk Score: {latest_risk.score:.1f}/100).",
                        "created_at": latest_risk.computed_at.isoformat() if latest_risk.computed_at else None,
                        "channel": "Broadcast",
                        "status": "Active",
                    })

        return Response(broadcasts, status=status.HTTP_200_OK)
