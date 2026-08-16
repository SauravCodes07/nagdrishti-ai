"""
Twilio alerting service for NagDrishti AI.
Sends SMS/WhatsApp alerts whenever a zone's risk score crosses into High or Severe.
Logs every dispatch attempt to AlertLog.
Reads credentials strictly from environment variables.
"""

import os
import logging
from datetime import timedelta
from django.utils import timezone
from alerts.models import AlertLog

logger = logging.getLogger(__name__)


def check_and_send_zone_alert(zone, score: float, category: str, channel: str = "SMS") -> AlertLog:
    """
    Sends an alert via Twilio if risk category is High or Severe, with deduplication.
    Logs to AlertLog table.
    """
    if category not in ["High", "Severe"]:
        return None

    # Deduplication check: Avoid sending identical alerts if one was sent for this zone/category in the past 60 mins
    recent_cutoff = timezone.now() - timedelta(minutes=60)
    recent_duplicate = AlertLog.objects.filter(
        zone=zone,
        risk_category_at_send=category,
        sent_at__gte=recent_cutoff
    ).first()

    if recent_duplicate:
        logger.info(
            f"Alert suppressed for {zone.name} ({category}): recent alert already logged at {recent_duplicate.sent_at}."
        )
        return None

    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    from_number = os.environ.get("TWILIO_FROM_NUMBER")
    to_number = os.environ.get("TWILIO_TO_NUMBER", "+919876543210")

    alert_message = (
        f"[NAGDRISHTI ALERT] Zone '{zone.name}' has entered {category.upper()} risk "
        f"(Crisis Index: {score:.1f}/100). Emergency civic protocols active."
    )

    if not account_sid or not auth_token or not from_number:
        logger.warning(
            f"Twilio credentials not configured in environment. Logging alert without dispatch for zone {zone.name}."
        )
        return AlertLog.objects.create(
            zone=zone,
            risk_category_at_send=category,
            channel=channel,
            status="simulated_logged (Twilio credentials not set)",
        )

    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)

        # Handle WhatsApp formatting if specified
        msg_from = from_number
        msg_to = to_number
        if channel == "WhatsApp":
            if not msg_from.startswith("whatsapp:"):
                msg_from = f"whatsapp:{msg_from}"
            if not msg_to.startswith("whatsapp:"):
                msg_to = f"whatsapp:{msg_to}"

        message = client.messages.create(
            body=alert_message,
            from_=msg_from,
            to=msg_to,
        )

        status_str = f"Sent (SID: {message.sid})"
        logger.info(f"Twilio alert sent for {zone.name}: {status_str}")

        return AlertLog.objects.create(
            zone=zone,
            risk_category_at_send=category,
            channel=channel,
            status=status_str,
        )

    except Exception as exc:
        err_msg = f"Failed: {str(exc)[:60]}"
        logger.error(f"Failed to send Twilio alert for zone {zone.name}: {exc}")
        return AlertLog.objects.create(
            zone=zone,
            risk_category_at_send=category,
            channel=channel,
            status=err_msg,
        )
