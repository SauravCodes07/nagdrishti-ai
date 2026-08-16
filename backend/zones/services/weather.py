"""
Weather ingestion service for NagDrishti AI.
Fetches real precipitation/rainfall data from Open-Meteo for Nagpur zones.
Writes to WeatherReading with source="imd_api" for live feeds, or source="simulated" on fallback.
"""

import logging
import requests
from django.utils import timezone
from zones.models import Zone, WeatherReading

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_zone_centroid(zone: Zone) -> tuple:
    """Returns approximate (lat, lng) center for a given zone."""
    if isinstance(zone.boundary, dict) and "coordinates" in zone.boundary:
        coords = zone.boundary["coordinates"][0]
        lngs = [p[0] for p in coords]
        lats = [p[1] for p in coords]
        return sum(lats) / len(lats), sum(lngs) / len(lngs)
    # Default Nagpur city center
    return 21.1458, 79.0882


def fetch_and_record_weather_for_zone(zone: Zone) -> WeatherReading:
    """
    Fetches precipitation data from Open-Meteo API for a specific zone.
    Writes to WeatherReading with source="imd_api" on success, or source="simulated" on failure.
    """
    lat, lng = get_zone_centroid(zone)
    now = timezone.now()

    params = {
        "latitude": round(lat, 4),
        "longitude": round(lng, 4),
        "current": "precipitation,rain,showers",
        "timezone": "Asia/Kolkata",
    }

    try:
        response = requests.get(OPEN_METEO_URL, params=params, timeout=6.0)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})
            # Precipitation in mm
            precip = current.get("precipitation")
            if precip is None:
                precip = current.get("rain", 0.0)

            reading = WeatherReading.objects.create(
                zone=zone,
                rainfall_intensity_mm=float(precip),
                source="imd_api",
                recorded_at=now,
            )
            logger.info(f"Recorded live weather reading for {zone.name}: {precip}mm (source: imd_api)")
            return reading
        else:
            logger.warning(f"Open-Meteo returned status {response.status_code}, falling back to simulated reading.")
    except Exception as exc:
        logger.error(f"Error fetching Open-Meteo weather for zone {zone.name}: {exc}")

    # Fallback to simulated reading
    reading = WeatherReading.objects.create(
        zone=zone,
        rainfall_intensity_mm=0.0,
        source="simulated",
        recorded_at=now,
    )
    return reading


def ingest_weather_for_all_zones() -> list:
    """Ingests live weather data for all active zones."""
    readings = []
    for zone in Zone.objects.all():
        reading = fetch_and_record_weather_for_zone(zone)
        readings.append(reading)
    return readings
