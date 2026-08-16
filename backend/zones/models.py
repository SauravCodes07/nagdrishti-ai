from django.db import models

try:
    from django.contrib.gis.db import models as gis_models
    PolygonField = gis_models.PolygonField
except Exception:
    PolygonField = models.JSONField

DISPATCH_STATUS_CHOICES = [
    ('Unassigned', 'Unassigned'),
    ('Dispatched', 'Dispatched'),
    ('Resolved', 'Resolved'),
]

WEATHER_SOURCE_CHOICES = [
    ('imd_api', 'imd_api'),
    ('simulated', 'simulated'),
]


class Zone(models.Model):
    name = models.CharField(max_length=100)
    boundary = PolygonField()
    elevation_factor = models.FloatField()
    drainage_capacity = models.FloatField()
    dispatch_status = models.CharField(
        max_length=20,
        choices=DISPATCH_STATUS_CHOICES,
        default='Unassigned',
    )

    def __str__(self):
        return self.name


class WeatherReading(models.Model):
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='weather_readings')
    rainfall_intensity_mm = models.FloatField()
    source = models.CharField(max_length=20, choices=WEATHER_SOURCE_CHOICES)
    recorded_at = models.DateTimeField()

    def __str__(self):
        return f"{self.zone.name} - {self.rainfall_intensity_mm}mm ({self.source}) at {self.recorded_at}"


class TrafficReading(models.Model):
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='traffic_readings')
    congestion_level = models.IntegerField()  # 0-100
    recorded_at = models.DateTimeField()

    def __str__(self):
        return f"{self.zone.name} - Congestion {self.congestion_level}% at {self.recorded_at}"
