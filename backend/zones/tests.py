from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from zones.models import Zone, WeatherReading, TrafficReading
from reports.models import Report
from risk.models import RiskScore
from alerts.models import AlertLog
from risk.scoring import calculate_risk_score, compute_zone_risk
from routing.pathfinding import calculate_safe_route
from zones.services.weather import fetch_and_record_weather_for_zone


class NagDrishtiCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create admin and regular users
        self.admin_user = User.objects.create_superuser('admin_tester', 'admin@test.com', 'pass123')
        self.regular_user = User.objects.create_user('citizen_tester', 'citizen@test.com', 'pass123')

        # Create test Zone (Dharampeth)
        self.zone = Zone.objects.create(
            name="Dharampeth",
            elevation_factor=0.35,
            drainage_capacity=0.70,
            dispatch_status="Unassigned",
            boundary={
                "type": "Polygon",
                "coordinates": [[
                    [79.055, 21.140],
                    [79.075, 21.140],
                    [79.075, 21.155],
                    [79.055, 21.155],
                    [79.055, 21.140],
                ]]
            }
        )

        self.zone2 = Zone.objects.create(
            name="Sitabuldi",
            elevation_factor=0.40,
            drainage_capacity=0.60,
            dispatch_status="Unassigned",
            boundary={
                "type": "Polygon",
                "coordinates": [[
                    [79.075, 21.140],
                    [79.090, 21.140],
                    [79.090, 21.152],
                    [79.075, 21.152],
                    [79.075, 21.140],
                ]]
            }
        )

    def test_01_risk_scoring_formula(self):
        """Test standalone risk scoring formula and category mapping."""
        # Low risk test
        score, category = calculate_risk_score(
            rainfall=10.0,
            drainage_deficit=20.0,
            elevation_factor=10.0,
            historical_incidents=0.0,
            report_density=0.0
        )
        self.assertLessEqual(score, 25.0)
        self.assertEqual(category, "Low")

        # Severe risk test
        score_sev, cat_sev = calculate_risk_score(
            rainfall=90.0,
            drainage_deficit=80.0,
            elevation_factor=70.0,
            historical_incidents=80.0,
            report_density=90.0
        )
        self.assertGreater(score_sev, 75.0)
        self.assertEqual(cat_sev, "Severe")

    def test_02_routing_pathfinding(self):
        """Test A* safe route calculation across Nagpur network."""
        result = calculate_safe_route(
            from_lat=21.1458, from_lng=79.0882,
            to_lat=21.1605, to_lng=79.0830
        )
        self.assertEqual(result["status"], "safe_route_found")
        self.assertIn("coordinates", result)
        self.assertGreater(result["distance_meters"], 0)

    def test_03_weather_ingestion(self):
        """Test weather ingestion service records reading with valid source."""
        reading = fetch_and_record_weather_for_zone(self.zone)
        self.assertIn(reading.source, ["open_meteo", "imd_api", "simulated"])
        self.assertEqual(reading.zone, self.zone)

    def test_04_endpoint_post_report_public(self):
        """POST /api/reports/ (public)"""
        payload = {
            "lat": 21.1472,
            "lng": 79.0664,
            "description": "Waterlogging near Dharampeth square",
        }
        res = self.client.post('/api/reports/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", res.data)
        self.assertEqual(res.data["zone_name"], "Dharampeth")

    def test_05_endpoint_get_reports_admin_only(self):
        """GET /api/reports/ (admin only)"""
        res_anon = self.client.get('/api/reports/')
        self.assertIn(res_anon.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.get('/api/reports/')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)

    def test_06_endpoint_patch_report_verify_admin_only(self):
        """PATCH /api/reports/{id}/verify/ (admin only)"""
        rep = Report.objects.create(
            reporter_location={"type": "Point", "coordinates": [79.06, 21.14]},
            description="Pothole test",
            zone=self.zone
        )

        self.client.force_authenticate(user=None)
        res_anon = self.client.patch(f'/api/reports/{rep.id}/verify/', {'verification_status': 'Verified'}, format='json')
        self.assertIn(res_anon.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.patch(f'/api/reports/{rep.id}/verify/', {'verification_status': 'Verified'}, format='json')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(res_admin.data["verification_status"], "Verified")

    def test_07_endpoint_get_zones_risk_public(self):
        """GET /api/zones/risk/ (public)"""
        res = self.client.get('/api/zones/risk/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 2)

    def test_08_endpoint_patch_zone_dispatch_admin_only(self):
        """PATCH /api/zones/{id}/dispatch/ (admin only)"""
        self.client.force_authenticate(user=None)
        res_anon = self.client.patch(f'/api/zones/{self.zone.id}/dispatch/', {'dispatch_status': 'Dispatched'}, format='json')
        self.assertIn(res_anon.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.patch(f'/api/zones/{self.zone.id}/dispatch/', {'dispatch_status': 'Dispatched'}, format='json')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(res_admin.data["dispatch_status"], "Dispatched")

    def test_09_endpoint_get_route_public(self):
        """GET /api/route/?from=lat,lng&to=lat,lng (public)"""
        res = self.client.get('/api/route/?from=21.1458,79.0882&to=21.1605,79.0830')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "safe_route_found")
        self.assertIn("coordinates", res.data)

    def test_10_endpoint_get_priority_queue_admin_only(self):
        """GET /api/priority-queue/ (admin only)"""
        self.client.force_authenticate(user=None)
        res_anon = self.client.get('/api/priority-queue/')
        self.assertIn(res_anon.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.get('/api/priority-queue/')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertIn("priority_queue", res_admin.data)

    def test_11_endpoint_post_simulate_rainfall_admin_only(self):
        """POST /api/simulate-rainfall/ (admin only)"""
        self.client.force_authenticate(user=None)
        res_anon = self.client.post('/api/simulate-rainfall/', {'rainfall_intensity_mm': 45.0}, format='json')
        self.assertIn(res_anon.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.post('/api/simulate-rainfall/', {'stage': 'downpour'}, format='json')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertIn("stage", res_admin.data)
        self.assertEqual(res_admin.data["stage"], "downpour")

    def test_12_endpoint_get_alerts_admin_only(self):
        """GET /api/alerts/ (admin only)"""
        AlertLog.objects.create(
            zone=self.zone,
            risk_category_at_send="High",
            channel="SMS",
            status="sent_test",
        )
        self.client.force_authenticate(user=None)
        res_anon = self.client.get('/api/alerts/')
        self.assertIn(res_anon.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.get('/api/alerts/')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_admin.data), 1)

    def test_13_auth_login_and_current_user(self):
        """Test Admin login and /api/auth/me/"""
        # Test valid login
        res_login = self.client.post('/api/auth/login/', {'username': 'admin_tester', 'password': 'pass123'}, format='json')
        self.assertEqual(res_login.status_code, status.HTTP_200_OK)
        self.assertTrue(res_login.data["user"]["is_superuser"])

        # Test invalid password
        res_fail = self.client.post('/api/auth/login/', {'username': 'admin_tester', 'password': 'wrongpassword'}, format='json')
        self.assertEqual(res_fail.status_code, status.HTTP_401_UNAUTHORIZED)
