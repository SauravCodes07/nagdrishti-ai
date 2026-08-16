from django.db import models

try:
    from django.contrib.gis.db import models as gis_models
    PointField = gis_models.PointField
except Exception:
    PointField = models.JSONField

VERIFICATION_STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Verified', 'Verified'),
    ('Rejected', 'Rejected'),
]


class Report(models.Model):
    reporter_location = PointField()
    photo = models.ImageField(upload_to='reports/', null=True, blank=True)
    description = models.TextField(blank=True)
    zone = models.ForeignKey('zones.Zone', on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    pothole_detected = models.BooleanField(null=True, blank=True)
    pothole_confidence = models.FloatField(null=True, blank=True)
    waterlogging_detected = models.BooleanField(null=True, blank=True)
    waterlogging_confidence = models.FloatField(null=True, blank=True)
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='Pending',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report #{self.id} ({self.verification_status})"
