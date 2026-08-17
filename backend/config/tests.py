from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from zones.models import Zone
from reports.models import Report


class AuthAndGatingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create an admin user
        self.admin_user = User.objects.create_superuser(
            username="officer_sharma",
            password="SecureAdminPassword123!",
            email="sharma@nmc.gov.in",
        )
        # Create sample zone and report
        self.zone = Zone.objects.create(
            name="Sitabuldi",
            boundary={"type": "Polygon", "coordinates": [[[79.075, 21.14], [79.09, 21.14], [79.09, 21.152], [79.075, 21.152], [79.075, 21.14]]]},
            elevation_factor=0.4,
            drainage_capacity=0.6,
        )
        self.report = Report.objects.create(
            zone=self.zone,
            reporter_location={"type": "Point", "coordinates": [79.0882, 21.1458]},
            description="Severe waterlogging near metro station",
            verification_status="Pending",
        )

    def test_01_citizen_signup_and_login(self):
        # 1. Signup
        signup_res = self.client.post("/api/auth/signup/", {
            "username": "citizen_rahul",
            "password": "CitizenSecretPass456!",
            "email": "rahul@nagpur.in",
            "name": "Rahul Deshmukh",
        }, format="json")
        self.assertEqual(signup_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(signup_res.data["user"]["role"], "citizen")
        self.assertFalse(signup_res.data["user"]["is_staff"])
        self.assertIn("token", signup_res.data)

        # 2. Session check for logged-in citizen
        me_res = self.client.get("/api/auth/me/")
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertTrue(me_res.data["authenticated"])
        self.assertEqual(me_res.data["user"]["username"], "citizen_rahul")
        self.assertEqual(me_res.data["user"]["role"], "citizen")

        # 3. Logout
        logout_res = self.client.post("/api/auth/logout/")
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

        # 4. Session check after logout
        me_after = self.client.get("/api/auth/me/")
        self.assertFalse(me_after.data["authenticated"])

        # 5. Login as citizen
        login_res = self.client.post("/api/auth/login/", {
            "username": "citizen_rahul",
            "password": "CitizenSecretPass456!",
        }, format="json")
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertEqual(login_res.data["user"]["role"], "citizen")

    def test_02_server_side_admin_gating_for_citizens(self):
        # Signup and login as citizen
        self.client.post("/api/auth/signup/", {
            "username": "citizen_priya",
            "password": "PriyaPassword789!",
            "email": "priya@nagpur.in",
        }, format="json")

        # Attempt to access admin endpoints as citizen -> Must return 403 Forbidden!
        reports_get = self.client.get("/api/reports/")
        self.assertEqual(reports_get.status_code, status.HTTP_403_FORBIDDEN)

        queue_get = self.client.get("/api/priority-queue/")
        self.assertEqual(queue_get.status_code, status.HTTP_403_FORBIDDEN)

        verify_patch = self.client.patch(f"/api/reports/{self.report.id}/verify/", {
            "verification_status": "Verified"
        }, format="json")
        self.assertEqual(verify_patch.status_code, status.HTTP_403_FORBIDDEN)

        dispatch_patch = self.client.patch(f"/api/zones/{self.zone.id}/dispatch/", {
            "dispatch_status": "Dispatched"
        }, format="json")
        self.assertEqual(dispatch_patch.status_code, status.HTTP_403_FORBIDDEN)

        simulate_post = self.client.post("/api/simulate-rainfall/", {
            "stage": "onset"
        }, format="json")
        self.assertEqual(simulate_post.status_code, status.HTTP_403_FORBIDDEN)

    def test_03_server_side_admin_access_for_officers(self):
        # Login as admin officer
        login_res = self.client.post("/api/auth/login/", {
            "username": "officer_sharma",
            "password": "SecureAdminPassword123!",
        }, format="json")
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertEqual(login_res.data["user"]["role"], "admin")
        self.assertTrue(login_res.data["user"]["is_staff"])

        # Access admin endpoints as officer -> Must succeed with 200 OK!
        reports_get = self.client.get("/api/reports/")
        self.assertEqual(reports_get.status_code, status.HTTP_200_OK)

        queue_get = self.client.get("/api/priority-queue/")
        self.assertEqual(queue_get.status_code, status.HTTP_200_OK)

        verify_patch = self.client.patch(f"/api/reports/{self.report.id}/verify/", {
            "verification_status": "Verified"
        }, format="json")
        self.assertEqual(verify_patch.status_code, status.HTTP_200_OK)

        dispatch_patch = self.client.patch(f"/api/zones/{self.zone.id}/dispatch/", {
            "dispatch_status": "Dispatched"
        }, format="json")
        self.assertEqual(dispatch_patch.status_code, status.HTTP_200_OK)

    def test_04_csrf_endpoint(self):
        res = self.client.get("/api/auth/csrf/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("csrftoken", res.data)

    def test_05_google_auth_missing_token(self):
        res = self.client.post("/api/auth/google/", {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", res.data)

    def test_06_google_auth_invalid_token(self):
        from unittest.mock import patch
        with patch("google.oauth2.id_token.verify_oauth2_token", side_effect=ValueError("Token expired")):
            res = self.client.post("/api/auth/google/", {"credential": "invalid_token_123"}, format="json")
            self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
            self.assertIn("error", res.data)

    def test_07_google_auth_success_creates_user_and_session(self):
        from unittest.mock import patch
        mock_payload = {
            "iss": "accounts.google.com",
            "email": "amit.patil@gmail.com",
            "email_verified": True,
            "name": "Amit Patil",
            "picture": "https://lh3.googleusercontent.com/a/mock-pic",
        }
        with patch("google.oauth2.id_token.verify_oauth2_token", return_value=mock_payload):
            res = self.client.post("/api/auth/google/", {"credential": "valid_mock_google_id_token"}, format="json")
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(res.data["user"]["email"], "amit.patil@gmail.com")
            self.assertEqual(res.data["user"]["name"], "Amit Patil")
            self.assertEqual(res.data["user"]["role"], "citizen")
            self.assertIn("token", res.data)

            # Verify session is established
            me_res = self.client.get("/api/auth/me/")
            self.assertTrue(me_res.data["authenticated"])
            self.assertEqual(me_res.data["user"]["email"], "amit.patil@gmail.com")

    def test_08_google_auth_admin_requirement_denied_for_citizen(self):
        from unittest.mock import patch
        mock_payload = {
            "iss": "accounts.google.com",
            "email": "regular.citizen@gmail.com",
            "email_verified": True,
            "name": "Regular Citizen",
        }
        with patch("google.oauth2.id_token.verify_oauth2_token", return_value=mock_payload):
            res = self.client.post(
                "/api/auth/google/",
                {"credential": "valid_token", "require_admin": True},
                format="json"
            )
            self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

