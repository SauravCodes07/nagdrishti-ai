from django.contrib import admin
from .models import Report

try:
    from django.contrib.gis.admin import GISModelAdmin
    class ReportAdminBase(GISModelAdmin):
        pass
except Exception:
    class ReportAdminBase(admin.ModelAdmin):
        pass


@admin.register(Report)
class ReportAdmin(ReportAdminBase):
    list_display = ('id', 'zone', 'verification_status', 'pothole_detected', 'waterlogging_detected', 'created_at')
    list_filter = ('verification_status', 'zone', 'pothole_detected', 'waterlogging_detected')
    search_fields = ('description',)
