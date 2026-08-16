from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from zones.models import Zone
from alerts.models import AlertLog
from alerts.services.notify import check_and_send_zone_alert


class AlertServiceAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser("admin", "admin@nagdrishti.ai", "admin123")
        self.regular_user = User.objects.create_user("citizen", "citizen@nagdrishti.ai", "password123")

        self.zone = Zone.objects.create(
            name="Mahal",
            boundary={
                "type": "Polygon",
                "coordinates": [[
                    [79.090, 21.140],
                    [79.115, 21.140],
                    [79.115, 21.155],
                    [79.090, 21.155],
                    [79.090, 21.140],
                ]]
            },
            elevation_factor=0.50,
            drainage_capacity=0.45,
            dispatch_status="Unassigned",
        )

    def test_alert_not_triggered_for_low_or_medium_risk(self):
        alert = check_and_send_zone_alert(self.zone, score=20.0, category="Low")
        self.assertIsNone(alert)

        alert_med = check_and_send_zone_alert(self.zone, score=45.0, category="Medium")
        self.assertIsNone(alert_med)

    def test_alert_triggered_for_high_and_severe_risk(self):
        alert_high = check_and_send_zone_alert(self.zone, score=65.0, category="High", channel="SMS")
        self.assertIsNotNone(alert_high)
        self.assertEqual(alert_high.risk_category_at_send, "High")
        self.assertEqual(alert_high.zone, self.zone)
        self.assertTrue(AlertLog.objects.filter(zone=self.zone).exists())

    def test_alert_deduplication_within_60_minutes(self):
        alert1 = check_and_send_zone_alert(self.zone, score=80.0, category="Severe", channel="SMS")
        self.assertIsNotNone(alert1)

        # Immediate duplicate should be suppressed
        alert2 = check_and_send_zone_alert(self.zone, score=85.0, category="Severe", channel="SMS")
        self.assertIsNone(alert2)

    def test_alerts_endpoint_admin_only(self):
        # Unauthenticated
        unauth_res = self.client.get("/api/alerts/")
        self.assertIn(unauth_res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Admin
        self.client.force_authenticate(user=self.admin_user)
        admin_res = self.client.get("/api/alerts/")
        self.assertEqual(admin_res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(admin_res.data, list)
