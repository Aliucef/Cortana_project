"""
Notification Service - Handles sending notifications via WhatsApp, SMS, etc.
"""
from twilio.rest import Client
from config.settings import get_settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class NotificationService:
    """Service for sending notifications to users"""

    def __init__(self):
        self.client = Client(
            settings.twilio_account_sid,
            settings.twilio_auth_token
        )
        self.from_whatsapp = f"whatsapp:{settings.twilio_phone_number}"
        self.to_whatsapp = f"whatsapp:{settings.user_phone_number}"

    def send_whatsapp(self, message: str) -> bool:
        """
        Send a WhatsApp message

        Args:
            message: Message text to send

        Returns:
            True if successful, False otherwise
        """
        try:
            result = self.client.messages.create(
                body=message,
                from_=self.from_whatsapp,
                to=self.to_whatsapp
            )

            logger.info(f"WhatsApp message sent successfully. SID: {result.sid}")
            return True

        except Exception as e:
            logger.error(f"Failed to send WhatsApp message: {str(e)}")
            return False

    def send_finance_summary(
        self,
        summary_message: str,
        user_name: Optional[str] = None
    ) -> bool:
        """
        Send a formatted finance summary via WhatsApp

        Args:
            summary_message: Pre-formatted summary message
            user_name: Optional user name for personalization

        Returns:
            True if successful, False otherwise
        """
        greeting = f"Hello {user_name}! 👋\n\n" if user_name else "Hello! 👋\n\n"
        full_message = greeting + summary_message

        return self.send_whatsapp(full_message)
