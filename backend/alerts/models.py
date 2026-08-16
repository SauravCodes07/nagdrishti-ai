from django.db import models

ALERT_CHANNEL_CHOICES = [
    ('SMS', 'SMS'),
    ('WhatsApp', 'WhatsApp'),
]


class AlertLog(models.Model):
    zone = models.ForeignKey('zones.Zone', on_delete=models.CASCADE, related_name='alert_logs')
    risk_category_at_send = models.CharField(max_length=20)
    channel = models.CharField(max_length=20, choices=ALERT_CHANNEL_CHOICES)
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"Alert {self.channel} for {self.zone.name} ({self.risk_category_at_send}) - {self.status}"
