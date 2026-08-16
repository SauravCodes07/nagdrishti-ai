import io
from PIL import Image
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from zones.models import Zone
from reports.models import Report


def generate_test_image():
    file = io.BytesIO()
    image = Image.new("RGBA", size=(100, 100), color=(255, 0, 0))
    image.save(file, "png")
    file.name = "test_hazard.png"
    file.seek(0)
    return SimpleUploadedFile("test_hazard.png", file.read(), content_type="image/png")


class ReportModelAndAPITests(TestCase):
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

    def test_report_creation_and_spatial_zone_assignment(self):
        # Point inside Dharampeth ward (21.1472, 79.0664)
        report = Report.objects.create(
            reporter_location={"type": "Point", "coordinates": [79.0664, 21.1472]},
            description="Knee deep water accumulated near Dharampeth Square",
            zone=self.zone,
            pothole_detected=True,
            pothole_confidence=0.85,
            waterlogging_detected=True,
            waterlogging_confidence=0.92,
            verification_status="Pending",
        )
        self.assertEqual(report.zone, self.zone)
        self.assertEqual(report.verification_status, "Pending")
        self.assertTrue(report.waterlogging_detected)

    @patch("reports.services.detection.run_huggingface_detection")
    def test_report_public_submission(self, mock_detection):
        test_img = generate_test_image()
        response = self.client.post(
            "/api/reports/",
            {
                "lat": 21.1472,
                "lng": 79.0664,
                "description": "Flooded street after heavy rain",
                "photo": test_img,
            },
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertEqual(response.data["zone_name"], "Dharampeth")

    def test_report_list_admin_only(self):
        # Unauthenticated request should fail
        unauth_res = self.client.get("/api/reports/")
        self.assertIn(unauth_res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Regular user should fail
        self.client.force_authenticate(user=self.regular_user)
        user_res = self.client.get("/api/reports/")
        self.assertEqual(user_res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin user should succeed
        self.client.force_authenticate(user=self.admin_user)
        admin_res = self.client.get("/api/reports/")
        self.assertEqual(admin_res.status_code, status.HTTP_200_OK)

    def test_report_verification_workflow(self):
        report = Report.objects.create(
            reporter_location={"type": "Point", "coordinates": [79.0664, 21.1472]},
            description="Testing verification",
            zone=self.zone,
            verification_status="Pending",
        )

        self.client.force_authenticate(user=self.admin_user)
        verify_res = self.client.patch(
            f"/api/reports/{report.id}/verify/",
            {"verification_status": "Verified"},
            format="json"
        )
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.verification_status, "Verified")
