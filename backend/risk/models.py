from django.db import models

RISK_CATEGORY_CHOICES = [
    ('Low', 'Low'),
    ('Medium', 'Medium'),
    ('High', 'High'),
    ('Severe', 'Severe'),
]


class RiskScore(models.Model):
    zone = models.ForeignKey('zones.Zone', on_delete=models.CASCADE, related_name='risk_scores')
    score = models.FloatField()  # 0-100
    category = models.CharField(max_length=20, choices=RISK_CATEGORY_CHOICES)
    computed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.zone.name} - Score {self.score} ({self.category})"
