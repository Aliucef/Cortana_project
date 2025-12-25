"""Test script to verify Twilio WhatsApp is working"""
from twilio.rest import Client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get Twilio credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_whatsapp = f"whatsapp:{os.getenv('TWILIO_PHONE_NUMBER')}"
user_whatsapp = f"whatsapp:{os.getenv('USER_PHONE_NUMBER')}"

print(f"Testing Twilio WhatsApp...")
print(f"From: {twilio_whatsapp}")
print(f"To: {user_whatsapp}")
print("-" * 50)

try:
    # Create Twilio client
    client = Client(account_sid, auth_token)

    # Send test WhatsApp message
    message = client.messages.create(
        body="🤖 Hello from Cortana! WhatsApp is working perfectly. Your Finance Agent is ready!",
        from_=twilio_whatsapp,
        to=user_whatsapp
    )

    print(f"✅ Message Created!")
    print(f"Message SID: {message.sid}")
    print(f"Status: {message.status}")

    # Wait and check status
    import time
    time.sleep(2)
    message = client.messages(message.sid).fetch()
    print(f"Updated Status: {message.status}")

    if message.error_code:
        print(f"Error Code: {message.error_code}")
        print(f"Error Message: {message.error_message}")
    else:
        print(f"\n✅ Success! Check WhatsApp on {user_whatsapp} for the message!")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\nMake sure you:")
    print("1. Joined the WhatsApp sandbox (send 'join [code]' to the Twilio WhatsApp number)")
    print("2. Your credentials are correct in .env file")
