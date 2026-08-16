from rest_framework import serializers
from .models import RiskScore


class RiskScoreSerializer(serializers.ModelSerializer):
    zone_name = serializers.ReadOnlyField(source="zone.name")

    class Meta:
        model = RiskScore
        fields = ["id", "zone", "zone_name", "score", "category", "computed_at"]
