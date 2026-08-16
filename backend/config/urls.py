from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
from django.conf.urls.static import static

from reports.views import ReportListCreateView, ReportVerifyView
from zones.views import ZoneRiskListView, ZoneDispatchView
from routing.views import RoutePathfindView
from risk.views import PriorityQueueView, SimulateRainfallView


def health(request):
    """Proves the app is running AND can reach the configured database."""
    db_ok = False
    db_engine = connection.settings_dict.get("ENGINE", "unknown")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_ok = cursor.fetchone() == (1,)
    except Exception as exc:
        return JsonResponse(
            {"status": "error", "database_engine": db_engine, "detail": str(exc)},
            status=500,
        )
    return JsonResponse({
        "status": "ok",
        "database_engine": db_engine,
        "database_reachable": db_ok,
        "apps": ["zones", "reports", "risk", "routing", "alerts"],
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),

    # Exact DRF endpoints specified in project specification:
    # 1. POST /api/reports/ (public) & GET /api/reports/ (admin only)
    path('api/reports/', ReportListCreateView.as_view(), name='reports-list-create'),

    # 2. PATCH /api/reports/{id}/verify/ (admin only)
    path('api/reports/<int:pk>/verify/', ReportVerifyView.as_view(), name='report-verify'),

    # 3. GET /api/zones/risk/ (public)
    path('api/zones/risk/', ZoneRiskListView.as_view(), name='zones-risk'),

    # 4. PATCH /api/zones/{id}/dispatch/ (admin only)
    path('api/zones/<int:pk>/dispatch/', ZoneDispatchView.as_view(), name='zone-dispatch'),

    # 5. GET /api/route/?from=lat,lng&to=lat,lng (public)
    path('api/route/', RoutePathfindView.as_view(), name='route-pathfind'),

    # 6. GET /api/priority-queue/ (admin only)
    path('api/priority-queue/', PriorityQueueView.as_view(), name='priority-queue'),

    # 7. POST /api/simulate-rainfall/ (admin only)
    path('api/simulate-rainfall/', SimulateRainfallView.as_view(), name='simulate-rainfall'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL if hasattr(settings, 'MEDIA_URL') else '/media/', document_root=settings.MEDIA_ROOT if hasattr(settings, 'MEDIA_ROOT') else settings.BASE_DIR / 'media')
