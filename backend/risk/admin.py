from django.contrib import admin
from .models import RiskScore


@admin.register(RiskScore)
class RiskScoreAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'score', 'category', 'computed_at')
    list_filter = ('category', 'zone')
