"""
Clear Telegram webhook to fix conflicts
Run this if you're getting "Conflict: terminated by other getUpdates" errors
"""
import requests
from config.settings import get_settings

settings = get_settings()
bot_token = settings.telegram_bot_token

if not bot_token:
    print("❌ No Telegram bot token found in .env")
    exit(1)

# Delete webhook
url = f"https://api.telegram.org/bot{bot_token}/deleteWebhook"
response = requests.get(url)

print(f"Response: {response.json()}")

if response.json().get("ok"):
    print("✅ Webhook cleared successfully!")
    print("You can now start your bot with polling.")
else:
    print("❌ Failed to clear webhook")
