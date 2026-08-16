from rest_framework import serializers
from .models import AlertLog


class AlertLogSerializer(serializers.ModelSerializer):
    zone_name = serializers.ReadOnlyField(source="zone.name")

    class Meta:
        model = AlertLog
        fields = [
            "id",
            "zone",
            "zone_name",
            "risk_category_at_send",
            "channel",
            "sent_at",
            "status",
        ]
