"""
Hugging Face Inference service for NagDrishti AI.
Detects potholes and waterlogging from uploaded citizen photos.
Reads HF API token strictly from environment variables.
Sets detection fields to null and logs errors on failures (never fabricates results).
"""

import os
import logging
import requests
from reports.models import Report

logger = logging.getLogger(__name__)

# Hugging Face Computer Vision model endpoint for road hazard/waterlogging detection
HF_API_URL = os.environ.get(
    "HF_DETECTION_MODEL_URL",
    "https://api-inference.huggingface.co/models/google/vit-base-patch16-224"
)


def run_huggingface_detection(report: Report) -> None:
    """
    Sends the report photo to Hugging Face Inference API.
    Updates the Report instance in-place and saves to DB.
    """
    hf_token = os.environ.get("HUGGINGFACE_API_TOKEN") or os.environ.get("HF_TOKEN")
    
    if not hf_token:
        logger.warning(f"Report #{report.id}: HUGGINGFACE_API_TOKEN is not set. Marking detection fields as null.")
        report.pothole_detected = None
        report.pothole_confidence = None
        report.waterlogging_detected = None
        report.waterlogging_confidence = None
        report.save(update_fields=[
            "pothole_detected",
            "pothole_confidence",
            "waterlogging_detected",
            "waterlogging_confidence"
        ])
        return

    if not report.photo:
        logger.info(f"Report #{report.id}: No photo attached. Detection fields set to null.")
        report.pothole_detected = None
        report.pothole_confidence = None
        report.waterlogging_detected = None
        report.waterlogging_confidence = None
        report.save(update_fields=[
            "pothole_detected",
            "pothole_confidence",
            "waterlogging_detected",
            "waterlogging_confidence"
        ])
        return

    headers = {
        "Authorization": f"Bearer {hf_token}",
    }

    try:
        # Read image bytes
        report.photo.open("rb")
        image_data = report.photo.read()
        report.photo.close()

        response = requests.post(
            HF_API_URL,
            headers=headers,
            data=image_data,
            timeout=10.0
        )

        if response.status_code == 200:
            result = response.json()
            # Parse classification/detection scores
            # Expecting list of {label, score}
            pothole_detected = False
            pothole_conf = 0.0
            waterlogging_detected = False
            waterlogging_conf = 0.0

            if isinstance(result, list):
                for item in result:
                    label = str(item.get("label", "")).lower()
                    score = float(item.get("score", 0.0))
                    if any(term in label for term in ["pothole", "crater", "hole", "damage", "crack", "rough"]):
                        if score > pothole_conf:
                            pothole_conf = score
                            pothole_detected = score >= 0.40
                    if any(term in label for term in ["water", "flood", "lake", "puddle", "rain", "stream", "wet"]):
                        if score > waterlogging_conf:
                            waterlogging_conf = score
                            waterlogging_detected = score >= 0.40

            report.pothole_detected = pothole_detected
            report.pothole_confidence = round(pothole_conf, 3)
            report.waterlogging_detected = waterlogging_detected
            report.waterlogging_confidence = round(waterlogging_conf, 3)
            logger.info(
                f"Report #{report.id} detection successful: pothole={pothole_detected} ({pothole_conf}), "
                f"waterlogging={waterlogging_detected} ({waterlogging_conf})"
            )
        else:
            logger.error(
                f"Report #{report.id}: Hugging Face API returned error status {response.status_code}: {response.text}"
            )
            report.pothole_detected = None
            report.pothole_confidence = None
            report.waterlogging_detected = None
            report.waterlogging_confidence = None

    except requests.exceptions.Timeout:
        logger.error(f"Report #{report.id}: Hugging Face API request timed out.")
        report.pothole_detected = None
        report.pothole_confidence = None
        report.waterlogging_detected = None
        report.waterlogging_confidence = None
    except Exception as exc:
        logger.error(f"Report #{report.id}: Hugging Face detection failed with error: {exc}")
        report.pothole_detected = None
        report.pothole_confidence = None
        report.waterlogging_detected = None
        report.waterlogging_confidence = None

    report.save(update_fields=[
        "pothole_detected",
        "pothole_confidence",
        "waterlogging_detected",
        "waterlogging_confidence"
    ])
