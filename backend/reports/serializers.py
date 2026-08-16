from rest_framework import serializers
from .models import Report
from zones.models import Zone
from routing.pathfinding import get_zone_for_point, validate_nagpur_coordinates


class ReportSerializer(serializers.ModelSerializer):
    zone_name = serializers.ReadOnlyField(source="zone.name")

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter_location",
            "photo",
            "description",
            "zone",
            "zone_name",
            "pothole_detected",
            "pothole_confidence",
            "waterlogging_detected",
            "waterlogging_confidence",
            "verification_status",
            "created_at",
        ]


class ReportCreateSerializer(serializers.ModelSerializer):
    lat = serializers.FloatField(required=False, write_only=True)
    lng = serializers.FloatField(required=False, write_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter_location",
            "photo",
            "description",
            "lat",
            "lng",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "reporter_location": {"required": False},
        }

    def validate(self, attrs):
        lat = attrs.get("lat")
        lng = attrs.get("lng")
        loc = attrs.get("reporter_location")

        target_lat = None
        target_lng = None

        if lat is not None and lng is not None:
            target_lat = float(lat)
            target_lng = float(lng)
        elif isinstance(loc, dict) and "coordinates" in loc:
            target_lng, target_lat = loc["coordinates"]
        elif isinstance(loc, list) and len(loc) >= 2:
            target_lng, target_lat = loc[0], loc[1]

        if target_lat is not None and target_lng is not None:
            is_valid, msg = validate_nagpur_coordinates(target_lat, target_lng)
            if not is_valid:
                raise serializers.ValidationError({"location": msg})

        return attrs

    def create(self, validated_data):
        lat = validated_data.pop("lat", None)
        lng = validated_data.pop("lng", None)
        location = validated_data.get("reporter_location")

        if lat is not None and lng is not None:
            location = {"type": "Point", "coordinates": [float(lng), float(lat)]}
            validated_data["reporter_location"] = location

        report = super().create(validated_data)

        # Spatial lookup for Zone assignment
        target_lat = None
        target_lng = None
        if isinstance(location, dict) and "coordinates" in location:
            target_lng, target_lat = location["coordinates"]
        elif isinstance(location, list) and len(location) >= 2:
            target_lng, target_lat = location[0], location[1]
        elif hasattr(location, "coords"):
            target_lng, target_lat = location.coords

        if target_lat is not None and target_lng is not None:
            zones = list(Zone.objects.all())
            assigned_zone = get_zone_for_point(target_lat, target_lng, zones)
            if assigned_zone:
                report.zone = assigned_zone
                report.save(update_fields=["zone"])

        # Trigger Hugging Face detection
        try:
            from reports.services.detection import run_huggingface_detection
            run_huggingface_detection(report)
        except Exception:
            pass

        return report
