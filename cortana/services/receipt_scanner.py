"""
Receipt Scanner Service - Extract transaction data from receipt images using Gemini Vision
"""
import google.generativeai as genai
from config.settings import get_settings
import json
import logging
from typing import Dict, List
from PIL import Image
import io

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


class ReceiptScanner:
    """Scan receipts and extract transaction data using Gemini Vision"""

    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')

    def scan_receipt(self, image_path: str) -> Dict:
        """
        Scan a receipt image and extract transaction details

        Args:
            image_path: Path to receipt image

        Returns:
            Dictionary with extracted transaction data
        """
        try:
            # Load image
            img = Image.open(image_path)

            prompt = """
Analyze this receipt image and extract ALL transaction information.

Return ONLY valid JSON with this EXACT structure:
{
    "success": true/false,
    "total_amount": <number>,
    "merchant": "<store/restaurant name>",
    "date": "<YYYY-MM-DD if visible, else null>",
    "items": [
        {
            "description": "<item name>",
            "amount": <number>,
            "category": "<category>"
        }
    ],
    "suggested_category": "<overall category>",
    "currency": "<currency symbol or code>",
    "error_message": "<error if failed>"
}

CATEGORIES (choose most appropriate):
- food: Groceries, restaurants, coffee, snacks
- transport: Gas, parking, uber, public transit
- utilities: Electric, water, internet, phone
- entertainment: Movies, games, subscriptions, hobbies
- shopping: Clothing, electronics, household items
- health: Pharmacy, medical, gym, wellness
- other: Anything else

IMPORTANT:
- If you can see the total amount, extract it
- If multiple items visible, extract them
- Suggest the most appropriate category based on merchant/items
- If receipt is unclear/unreadable, set success to false
- Return ONLY JSON, no markdown, no explanation

Examples:
Starbucks receipt for $15.50 → {"success": true, "total_amount": 15.50, "merchant": "Starbucks", "suggested_category": "food", ...}
Gas station receipt for $45 → {"success": true, "total_amount": 45.00, "merchant": "Shell", "suggested_category": "transport", ...}
Blurry image → {"success": false, "error_message": "Receipt image is too blurry to read"}
"""

            # Generate content with image
            response = self.model.generate_content([prompt, img])
            result_text = response.text.strip()

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            # Parse JSON
            parsed = json.loads(result_text)
            logger.info(f"Successfully scanned receipt: {parsed}")

            return parsed

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from receipt scan: {e}")
            logger.error(f"AI Response: {result_text}")
            return {
                "success": False,
                "error_message": "Failed to parse receipt data. Please try again with a clearer image."
            }

        except Exception as e:
            logger.error(f"Receipt scanning error: {str(e)}")
            return {
                "success": False,
                "error_message": f"Error scanning receipt: {str(e)}"
            }

    def scan_receipt_from_bytes(self, image_bytes: bytes) -> Dict:
        """
        Scan a receipt from image bytes (useful for direct upload)

        Args:
            image_bytes: Image data as bytes

        Returns:
            Dictionary with extracted transaction data
        """
        try:
            # Convert bytes to PIL Image
            img = Image.open(io.BytesIO(image_bytes))

            # Use the same prompt
            prompt = """
Analyze this receipt image and extract ALL transaction information.

Return ONLY valid JSON with this EXACT structure:
{
    "success": true/false,
    "total_amount": <number>,
    "merchant": "<store/restaurant name>",
    "date": "<YYYY-MM-DD if visible, else null>",
    "items": [
        {
            "description": "<item name>",
            "amount": <number>,
            "category": "<category>"
        }
    ],
    "suggested_category": "<overall category>",
    "currency": "<currency symbol or code>",
    "error_message": "<error if failed>"
}

CATEGORIES: food, transport, utilities, entertainment, shopping, health, other

IMPORTANT:
- Extract total amount if visible
- Extract individual items if visible
- Suggest appropriate category based on merchant/items
- If unclear, set success to false
- Return ONLY JSON, no markdown
"""

            response = self.model.generate_content([prompt, img])
            result_text = response.text.strip()

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            parsed = json.loads(result_text)
            logger.info(f"Successfully scanned receipt from bytes: {parsed}")

            return parsed

        except Exception as e:
            logger.error(f"Receipt scanning error: {str(e)}")
            return {
                "success": False,
                "error_message": f"Error scanning receipt: {str(e)}"
            }
