"""
NagDrishti AI — Google Earth Engine Client Initialization Module
Secure server-side authentication for Copernicus Sentinel-1 & Sentinel-2 ingestion.
"""

import os
from typing import Optional

def initialize_earth_engine(service_account: Optional[str] = None, private_key_file: Optional[str] = None) -> bool:
    """
    Initializes Earth Engine using service account credentials from environment variables.
    Returns True if initialized successfully, False if using simulated/offline fallback.
    """
    ee_project = os.getenv("EARTH_ENGINE_PROJECT", "nagdrishti-ai-geospatial")
    sa = service_account or os.getenv("EARTH_ENGINE_SERVICE_ACCOUNT")
    key = private_key_file or os.getenv("EARTH_ENGINE_KEY_FILE")

    try:
        import ee
        if sa and key and os.path.exists(key):
            credentials = ee.ServiceAccountCredentials(sa, key)
            ee.Initialize(credentials, project=ee_project)
            print(f"[EarthEngine] Initialized successfully with project: {ee_project}")
            return True
        else:
            # Attempt default application credentials
            ee.Initialize(project=ee_project)
            print(f"[EarthEngine] Initialized via ADC with project: {ee_project}")
            return True
    except Exception as e:
        print(f"[EarthEngine] Authentication skipped or unavailable ({e}). Using modular satellite provider fallback.")
        return False
