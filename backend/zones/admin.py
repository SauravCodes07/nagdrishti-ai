from django.contrib import admin
from .models import Zone, WeatherReading, TrafficReading

try:
    from django.contrib.gis.admin import GISModelAdmin
    class ZoneAdminBase(GISModelAdmin):
        pass
except Exception:
    class ZoneAdminBase(admin.ModelAdmin):
        pass


@admin.register(Zone)
class ZoneAdmin(ZoneAdminBase):
    list_display = ('id', 'name', 'elevation_factor', 'drainage_capacity', 'dispatch_status')
    search_fields = ('name',)
    list_filter = ('dispatch_status',)


@admin.register(WeatherReading)
class WeatherReadingAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'rainfall_intensity_mm', 'source', 'recorded_at')
    list_filter = ('source', 'zone')


@admin.register(TrafficReading)
class TrafficReadingAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'congestion_level', 'recorded_at')
    list_filter = ('zone',)
