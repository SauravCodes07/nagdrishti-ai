from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from zones.models import Zone, WeatherReading, TrafficReading
from zones.services.weather import get_zone_centroid, fetch_and_record_weather_for_zone
from unittest.mock import patch, MagicMock


class ZoneModelAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser("admin", "admin@nagdrishti.ai", "admin123")
        self.regular_user = User.objects.create_user("citizen", "citizen@nagdrishti.ai", "password123")

        self.zone = Zone.objects.create(
            name="Dharampeth",
            boundary={
                "type": "Polygon",
                "coordinates": [[
                    [79.055, 21.140],
                    [79.075, 21.140],
                    [79.075, 21.155],
                    [79.055, 21.155],
                    [79.055, 21.140],
                ]]
            },
            elevation_factor=0.35,
            drainage_capacity=0.70,
            dispatch_status="Unassigned",
        )

    def test_zone_creation_and_string_representation(self):
        self.assertEqual(str(self.zone), "Dharampeth")
        self.assertEqual(self.zone.elevation_factor, 0.35)
        self.assertEqual(self.zone.drainage_capacity, 0.70)
        self.assertEqual(self.zone.dispatch_status, "Unassigned")

    def test_zone_centroid_calculation(self):
        lat, lng = get_zone_centroid(self.zone)
        self.assertAlmostEqual(lat, 21.1475, places=2)
        self.assertAlmostEqual(lng, 79.065, places=2)

    def test_zone_risk_list_public_access(self):
        response = self.client.get("/api/zones/risk/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Dharampeth")
        self.assertIn("boundary", response.data[0])
        self.assertIn("risk_category", response.data[0])

    def test_zone_dispatch_admin_only(self):
        # Unauthenticated attempt should be 401
        patch_res_unauth = self.client.patch(
            f"/api/zones/{self.zone.id}/dispatch/",
            {"dispatch_status": "Dispatched"},
            format="json"
        )
        self.assertIn(patch_res_unauth.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Regular citizen attempt should be 403
        self.client.force_authenticate(user=self.regular_user)
        patch_res_user = self.client.patch(
            f"/api/zones/{self.zone.id}/dispatch/",
            {"dispatch_status": "Dispatched"},
            format="json"
        )
        self.assertEqual(patch_res_user.status_code, status.HTTP_403_FORBIDDEN)

        # Admin attempt should succeed
        self.client.force_authenticate(user=self.admin_user)
        patch_res_admin = self.client.patch(
            f"/api/zones/{self.zone.id}/dispatch/",
            {"dispatch_status": "Dispatched"},
            format="json"
        )
        self.assertEqual(patch_res_admin.status_code, status.HTTP_200_OK)
        self.zone.refresh_from_db()
        self.assertEqual(self.zone.dispatch_status, "Dispatched")

    def test_zone_dispatch_invalid_status(self):
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.patch(
            f"/api/zones/{self.zone.id}/dispatch/",
            {"dispatch_status": "InvalidStatusChoice"},
            format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("requests.get")
    def test_weather_ingestion_live_feed(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "current": {"precipitation": 12.5, "rain": 12.5}
        }
        mock_get.return_value = mock_response

        reading = fetch_and_record_weather_for_zone(self.zone)
        self.assertEqual(reading.source, "imd_api")
        self.assertEqual(reading.rainfall_intensity_mm, 12.5)
        self.assertEqual(reading.zone, self.zone)
