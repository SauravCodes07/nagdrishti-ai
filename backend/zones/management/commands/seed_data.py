import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from zones.models import Zone, TrafficReading

# Real Nagpur wards with approximate polygon boundaries (Lon, Lat)
NAGPUR_WARDS = [
    {
        "name": "Dharampeth",
        "elevation_factor": 0.35,
        "drainage_capacity": 0.70,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.055, 21.140],
                [79.075, 21.140],
                [79.075, 21.155],
                [79.055, 21.155],
                [79.055, 21.140],
            ]]
        }
    },
    {
        "name": "Sitabuldi",
        "elevation_factor": 0.40,
        "drainage_capacity": 0.60,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.075, 21.140],
                [79.090, 21.140],
                [79.090, 21.152],
                [79.075, 21.152],
                [79.075, 21.140],
            ]]
        }
    },
    {
        "name": "Sadar",
        "elevation_factor": 0.30,
        "drainage_capacity": 0.65,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.070, 21.152],
                [79.090, 21.152],
                [79.090, 21.170],
                [79.070, 21.170],
                [79.070, 21.152],
            ]]
        }
    },
    {
        "name": "Mahal",
        "elevation_factor": 0.50,
        "drainage_capacity": 0.45,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.090, 21.140],
                [79.115, 21.140],
                [79.115, 21.155],
                [79.090, 21.155],
                [79.090, 21.140],
            ]]
        }
    },
    {
        "name": "Gandhibagh",
        "elevation_factor": 0.55,
        "drainage_capacity": 0.40,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.090, 21.150],
                [79.110, 21.150],
                [79.110, 21.165],
                [79.090, 21.165],
                [79.090, 21.150],
            ]]
        }
    },
    {
        "name": "Dhantoli",
        "elevation_factor": 0.45,
        "drainage_capacity": 0.55,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.070, 21.125],
                [79.090, 21.125],
                [79.090, 21.140],
                [79.070, 21.140],
                [79.070, 21.125],
            ]]
        }
    },
    {
        "name": "Hanuman Nagar",
        "elevation_factor": 0.40,
        "drainage_capacity": 0.50,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.090, 21.115],
                [79.120, 21.115],
                [79.120, 21.135],
                [79.090, 21.135],
                [79.090, 21.115],
            ]]
        }
    },
    {
        "name": "Nehru Nagar",
        "elevation_factor": 0.60,
        "drainage_capacity": 0.35,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.120, 21.110],
                [79.150, 21.110],
                [79.150, 21.130],
                [79.120, 21.130],
                [79.120, 21.110],
            ]]
        }
    },
    {
        "name": "Mangalwari",
        "elevation_factor": 0.35,
        "drainage_capacity": 0.60,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.060, 21.165],
                [79.090, 21.165],
                [79.090, 21.185],
                [79.060, 21.185],
                [79.060, 21.165],
            ]]
        }
    },
    {
        "name": "Lakadganj",
        "elevation_factor": 0.50,
        "drainage_capacity": 0.45,
        "dispatch_status": "Unassigned",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [79.115, 21.145],
                [79.145, 21.145],
                [79.145, 21.165],
                [79.115, 21.165],
                [79.115, 21.145],
            ]]
        }
    }
]


class Command(BaseCommand):
    help = "Seed Nagpur ward zones and simulated traffic readings"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting database seed for Nagpur wards..."))

        created_zones_count = 0
        traffic_readings_count = 0
        now = timezone.now()

        for ward_data in NAGPUR_WARDS:
            zone, created = Zone.objects.update_or_create(
                name=ward_data["name"],
                defaults={
                    "boundary": ward_data["boundary"],
                    "elevation_factor": ward_data["elevation_factor"],
                    "drainage_capacity": ward_data["drainage_capacity"],
                    "dispatch_status": ward_data["dispatch_status"],
                }
            )
            if created:
                created_zones_count += 1

            # Seed past 3 days of TrafficReading rows (4 readings per day: morning, noon, evening, night)
            # WeatherReading is intentionally left empty for Step 3 live ingestion
            TrafficReading.objects.filter(zone=zone).delete()
            for day_offset in range(3, 0, -1):
                day_base = now - timedelta(days=day_offset)
                hours = [8, 12, 18, 22]
                for h in hours:
                    rec_time = day_base.replace(hour=h, minute=random.randint(0, 59), second=0, microsecond=0)
                    # Congestion peak at 8-10 AM and 6-8 PM
                    if h in [8, 18]:
                        congestion = random.randint(55, 90)
                    else:
                        congestion = random.randint(15, 50)

                    TrafficReading.objects.create(
                        zone=zone,
                        congestion_level=congestion,
                        recorded_at=rec_time
                    )
                    traffic_readings_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(NAGPUR_WARDS)} Nagpur ward zones and {traffic_readings_count} traffic readings."
            )
        )
        self.stdout.write(
            self.style.SUCCESS("WeatherReading left empty as required for Step 3 live ingestion.")
        )
