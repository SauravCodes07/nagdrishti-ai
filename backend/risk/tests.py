from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from zones.models import Zone, WeatherReading
from risk.models import RiskScore
from risk.scoring import calculate_risk_score, classify_category, compute_zone_risk


class RiskScoringAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser("admin", "admin@nagdrishti.ai", "admin123")
        self.regular_user = User.objects.create_user("citizen", "citizen@nagdrishti.ai", "password123")

        self.zone = Zone.objects.create(
            name="Sitabuldi",
            boundary={
                "type": "Polygon",
                "coordinates": [[
                    [79.075, 21.140],
                    [79.090, 21.140],
                    [79.090, 21.152],
                    [79.075, 21.152],
                    [79.075, 21.140],
                ]]
            },
            elevation_factor=0.40,
            drainage_capacity=0.60,
            dispatch_status="Unassigned",
        )

    def test_risk_formula_calculation(self):
        # score = 0.35*rainfall + 0.25*drainage_deficit + 0.15*elevation_factor + 0.15*historical_incidents + 0.10*report_density
        # rainfall = 80 -> 0.35*80 = 28.0
        # drainage_deficit = 40 -> 0.25*40 = 10.0
        # elevation_factor = 40 -> 0.15*40 = 6.0
        # historical_incidents = 20 -> 0.15*20 = 3.0
        # report_density = 30 -> 0.10*30 = 3.0
        # Total = 50.0 (Medium / border High)
        score, category = calculate_risk_score(
            rainfall=80,
            drainage_deficit=40,
            elevation_factor=40,
            historical_incidents=20,
            report_density=30,
        )
        self.assertEqual(score, 50.0)
        self.assertEqual(category, "Medium")

    def test_category_classification_thresholds(self):
        self.assertEqual(classify_category(15.0), "Low")
        self.assertEqual(classify_category(25.0), "Low")
        self.assertEqual(classify_category(35.0), "Medium")
        self.assertEqual(classify_category(50.0), "Medium")
        self.assertEqual(classify_category(65.0), "High")
        self.assertEqual(classify_category(75.0), "High")
        self.assertEqual(classify_category(85.0), "Severe")
        self.assertEqual(classify_category(100.0), "Severe")

    def test_compute_zone_risk_execution(self):
        score, category = compute_zone_risk(self.zone)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 100.0)
        self.assertIn(category, ["Low", "Medium", "High", "Severe"])
        self.assertTrue(RiskScore.objects.filter(zone=self.zone).exists())

    def test_priority_queue_endpoint_admin_only(self):
        # Unauthenticated
        unauth_res = self.client.get("/api/priority-queue/")
        self.assertIn(unauth_res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Admin
        self.client.force_authenticate(user=self.admin_user)
        admin_res = self.client.get("/api/priority-queue/")
        self.assertEqual(admin_res.status_code, status.HTTP_200_OK)
        self.assertIn("priority_queue", admin_res.data)
        self.assertGreaterEqual(len(admin_res.data["priority_queue"]), 1)

    def test_simulate_rainfall_8_stages(self):
        self.client.force_authenticate(user=self.admin_user)

        stages = ["baseline", "onset", "downpour", "waterlogging", "alert", "dispatch", "resolve"]
        for st in stages:
            res = self.client.post("/api/simulate-rainfall/", {"stage": st}, format="json")
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(res.data["stage"], st)
            self.assertIn("description", res.data)
            self.assertIn("results", res.data)
