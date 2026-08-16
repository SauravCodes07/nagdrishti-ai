"""
Hugging Face Serverless Inference service for NagDrishti AI.
Detects potholes and waterlogging from uploaded citizen photos.
Reads HF API token strictly from environment variables.
Sets detection fields to null and logs errors on failures (never fabricates results).
"""

import os
import base64
import logging
import requests
from reports.models import Report

logger = logging.getLogger(__name__)

# Default Hugging Face Vision Inference Model (CLIP zero-shot image classification)
HF_DEFAULT_MODEL = "openai/clip-vit-base-patch32"
HF_INFERENCE_BASE_URL = "https://api-inference.huggingface.co/models"


def get_hf_headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }


def run_huggingface_detection(report: Report) -> None:
    """
    Sends citizen report photo to Hugging Face Inference API for pothole and waterlogging detection.
    Updates report fields in-place:
      - pothole_detected (bool or None)
      - pothole_confidence (float 0.0-1.0 or None)
      - waterlogging_detected (bool or None)
      - waterlogging_confidence (float 0.0-1.0 or None)
    """
    hf_token = os.environ.get("HUGGINGFACE_API_TOKEN") or os.environ.get("HF_TOKEN")

    if not hf_token:
        logger.warning(
            f"Report #{report.id}: HUGGINGFACE_API_TOKEN is not configured in environment. "
            f"Marking detection fields as null (AI UNAVAILABLE)."
        )
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

    model_url = os.environ.get("HF_DETECTION_MODEL_URL")
    if not model_url:
        model_name = os.environ.get("HF_MODEL_NAME", HF_DEFAULT_MODEL)
        model_url = f"{HF_INFERENCE_BASE_URL}/{model_name}"

    try:
        report.photo.open("rb")
        image_bytes = report.photo.read()
        report.photo.close()

        headers = get_hf_headers(hf_token)
        
        # Try zero-shot image classification candidate labels first
        candidate_labels = [
            "road with potholes and asphalt cracks",
            "waterlogged flooded road with water accumulation",
            "normal clean road without damage or flooding",
        ]

        # Hugging Face Zero-shot Image Classification payload
        try:
            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            json_payload = {
                "inputs": b64_image,
                "parameters": {"candidate_labels": candidate_labels},
            }
            response = requests.post(
                model_url,
                headers=headers,
                json=json_payload,
                timeout=12.0
            )
        except Exception:
            response = None

        # Fallback to direct raw binary if JSON payload is not supported by endpoint
        if response is None or response.status_code not in [200, 201]:
            response = requests.post(
                model_url,
                headers=headers,
                data=image_bytes,
                timeout=12.0
            )

        if response.status_code == 200:
            result = response.json()
            pothole_detected = False
            pothole_conf = 0.0
            waterlogging_detected = False
            waterlogging_conf = 0.0

            if isinstance(result, list):
                for item in result:
                    label = str(item.get("label", "")).lower()
                    score = float(item.get("score", 0.0))

                    # Check pothole keywords
                    if any(k in label for k in ["pothole", "asphalt crack", "crater", "road damage", "crack"]):
                        if score > pothole_conf:
                            pothole_conf = score
                            pothole_detected = score >= 0.35

                    # Check waterlogging keywords
                    if any(k in label for k in ["waterlog", "flood", "water accumulation", "puddle", "rain", "submerged"]):
                        if score > waterlogging_conf:
                            waterlogging_conf = score
                            waterlogging_detected = score >= 0.35

            report.pothole_detected = pothole_detected
            report.pothole_confidence = round(pothole_conf, 3)
            report.waterlogging_detected = waterlogging_detected
            report.waterlogging_confidence = round(waterlogging_conf, 3)
            logger.info(
                f"Report #{report.id} HF Inference result: Pothole={pothole_detected} ({pothole_conf:.2f}), "
                f"Waterlogging={waterlogging_detected} ({waterlogging_conf:.2f})"
            )
        else:
            logger.error(
                f"Report #{report.id}: Hugging Face Inference API error {response.status_code}: {response.text[:120]}"
            )
            report.pothole_detected = None
            report.pothole_confidence = None
            report.waterlogging_detected = None
            report.waterlogging_confidence = None

    except requests.exceptions.Timeout:
        logger.error(f"Report #{report.id}: Hugging Face Inference API timed out.")
        report.pothole_detected = None
        report.pothole_confidence = None
        report.waterlogging_detected = None
        report.waterlogging_confidence = None
    except Exception as exc:
        logger.error(f"Report #{report.id}: Hugging Face detection failed: {exc}")
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
