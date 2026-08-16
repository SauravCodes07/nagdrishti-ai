from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import Report
from .serializers import ReportSerializer, ReportCreateSerializer
from risk.scoring import compute_zone_risk


class ReportListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        """GET /api/reports/ (admin only)"""
        reports = Report.objects.all().order_by("-created_at")
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """POST /api/reports/ (public)"""
        serializer = ReportCreateSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save()
            # If a zone was assigned, update the zone risk score
            if report.zone:
                try:
                    compute_zone_risk(report.zone)
                except Exception:
                    pass
            response_serializer = ReportSerializer(report)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportVerifyView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        """PATCH /api/reports/{id}/verify/ (admin only)"""
        report = get_object_or_404(Report, pk=pk)
        new_status = request.data.get("verification_status")

        valid_statuses = ["Pending", "Verified", "Rejected"]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid verification_status. Must be one of: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.verification_status = new_status
        report.save(update_fields=["verification_status"])

        # Recompute zone risk upon verification status change
        if report.zone:
            try:
                compute_zone_risk(report.zone)
            except Exception:
                pass

        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)
