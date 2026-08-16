"""
Standalone risk scoring module for NagDrishti AI.
Calculates risk scores based on weighted factors and maps them to categories.
"""

from typing import Tuple
from django.utils import timezone
from datetime import timedelta

# Named constants for risk factor weights (easily tunable)
WEIGHT_RAINFALL = 0.35
WEIGHT_DRAINAGE_DEFICIT = 0.25
WEIGHT_ELEVATION_FACTOR = 0.15
WEIGHT_HISTORICAL_INCIDENTS = 0.15
WEIGHT_REPORT_DENSITY = 0.10

# Category thresholds
# Low (0-25), Medium (26-50), High (51-75), Severe (76-100)
THRESHOLD_LOW_MAX = 25.0
THRESHOLD_MEDIUM_MAX = 50.0
THRESHOLD_HIGH_MAX = 75.0


def classify_category(score: float) -> str:
    """Maps a risk score (0-100) to its category."""
    if score <= THRESHOLD_LOW_MAX:
        return "Low"
    elif score <= THRESHOLD_MEDIUM_MAX:
        return "Medium"
    elif score <= THRESHOLD_HIGH_MAX:
        return "High"
    else:
        return "Severe"


def calculate_risk_score(
    rainfall: float,
    drainage_deficit: float,
    elevation_factor: float,
    historical_incidents: float,
    report_density: float,
) -> Tuple[float, str]:
    """
    Computes weighted risk score and returns (score, category).
    score = 0.35*rainfall + 0.25*drainage_deficit + 0.15*elevation_factor + 0.15*historical_incidents + 0.10*report_density
    """
    # Clamp factor inputs between 0 and 100
    r = max(0.0, min(100.0, float(rainfall)))
    dd = max(0.0, min(100.0, float(drainage_deficit)))
    ef = max(0.0, min(100.0, float(elevation_factor)))
    hi = max(0.0, min(100.0, float(historical_incidents)))
    rd = max(0.0, min(100.0, float(report_density)))

    score = (
        (WEIGHT_RAINFALL * r)
        + (WEIGHT_DRAINAGE_DEFICIT * dd)
        + (WEIGHT_ELEVATION_FACTOR * ef)
        + (WEIGHT_HISTORICAL_INCIDENTS * hi)
        + (WEIGHT_REPORT_DENSITY * rd)
    )

    # Clamp overall score to 0 - 100
    score = round(max(0.0, min(100.0, score)), 2)
    category = classify_category(score)
    return score, category


def compute_zone_risk(zone) -> Tuple[float, str]:
    """
    Evaluates current risk score for a Zone instance and records/returns the result.
    """
    from zones.models import WeatherReading
    from reports.models import Report
    from risk.models import RiskScore

    # 1. Latest rainfall intensity in zone
    latest_weather = WeatherReading.objects.filter(zone=zone).order_by("-recorded_at").first()
    rainfall_val = latest_weather.rainfall_intensity_mm if latest_weather else 0.0
    # Normalize rainfall (e.g. 50mm/hr = 100% severity)
    rainfall_score = min(100.0, rainfall_val * 2.0)

    # 2. Drainage deficit = (1.0 - drainage_capacity) * 100
    drainage_deficit = max(0.0, (1.0 - float(zone.drainage_capacity)) * 100.0)

    # 3. Elevation factor (0.0 - 1.0 -> 0 - 100)
    elevation_score = float(zone.elevation_factor) * 100.0

    # 4. Historical incidents (based on existing verified reports or past severe risk counts)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    historical_count = Report.objects.filter(
        zone=zone,
        verification_status="Verified",
        created_at__gte=thirty_days_ago
    ).count()
    historical_score = min(100.0, historical_count * 10.0)

    # 5. Active recent report density (past 24h)
    one_day_ago = timezone.now() - timedelta(days=1)
    recent_reports = Report.objects.filter(
        zone=zone,
        created_at__gte=one_day_ago
    ).count()
    report_density = min(100.0, recent_reports * 20.0)

    score, category = calculate_risk_score(
        rainfall=rainfall_score,
        drainage_deficit=drainage_deficit,
        elevation_factor=elevation_score,
        historical_incidents=historical_score,
        report_density=report_density,
    )

    # Save to RiskScore model
    risk_record = RiskScore.objects.create(
        zone=zone,
        score=score,
        category=category,
    )

    # Trigger Twilio alert check if High or Severe
    try:
        from alerts.services.notify import check_and_send_zone_alert
        check_and_send_zone_alert(zone, score, category)
    except Exception as exc:
        pass

    return score, category
