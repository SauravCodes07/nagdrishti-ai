from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AlertLog
from .serializers import AlertLogSerializer


class AlertLogListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        """
        GET /api/alerts/ (admin only)
        Returns audit trail of automated emergency alerts sent.
        """
        logs = AlertLog.objects.all().order_by("-sent_at")[:50]
        serializer = AlertLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
