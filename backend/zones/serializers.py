from rest_framework import serializers
from .models import Zone, WeatherReading, TrafficReading
from risk.models import RiskScore


class WeatherReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherReading
        fields = ["id", "rainfall_intensity_mm", "source", "recorded_at"]


class TrafficReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficReading
        fields = ["id", "congestion_level", "recorded_at"]


class ZoneRiskSerializer(serializers.ModelSerializer):
    latest_risk_score = serializers.SerializerMethodField()
    risk_category = serializers.SerializerMethodField()
    latest_weather = serializers.SerializerMethodField()
    latest_traffic = serializers.SerializerMethodField()

    class Meta:
        model = Zone
        fields = [
            "id",
            "name",
            "boundary",
            "elevation_factor",
            "drainage_capacity",
            "dispatch_status",
            "latest_risk_score",
            "risk_category",
            "latest_weather",
            "latest_traffic",
        ]

    def get_latest_risk_score(self, obj):
        latest = RiskScore.objects.filter(zone=obj).order_by("-computed_at").first()
        return latest.score if latest else None

    def get_risk_category(self, obj):
        latest = RiskScore.objects.filter(zone=obj).order_by("-computed_at").first()
        return latest.category if latest else "Low"

    def get_latest_weather(self, obj):
        latest = WeatherReading.objects.filter(zone=obj).order_by("-recorded_at").first()
        if latest:
            return {
                "rainfall_intensity_mm": latest.rainfall_intensity_mm,
                "source": latest.source,
                "recorded_at": latest.recorded_at.isoformat() if latest.recorded_at else None,
            }
        return None

    def get_latest_traffic(self, obj):
        latest = TrafficReading.objects.filter(zone=obj).order_by("-recorded_at").first()
        if latest:
            return {
                "congestion_level": latest.congestion_level,
                "recorded_at": latest.recorded_at.isoformat() if latest.recorded_at else None,
            }
        return None
