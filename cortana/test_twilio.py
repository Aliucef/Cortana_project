"""Quick test script to verify Twilio SMS is working"""
from twilio.rest import Client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get Twilio credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_PHONE_NUMBER')
user_number = os.getenv('USER_PHONE_NUMBER')

print(f"Testing Twilio SMS...")
print(f"From: {twilio_number}")
print(f"To: {user_number}")
print("-" * 50)

try:
    # Create Twilio client
    client = Client(account_sid, auth_token)

    # Send test message
    message = client.messages.create(
        body="Hello from Cortana! Twilio SMS is working perfectly. Your Finance Agent is ready!",
        from_=twilio_number,
        to=user_number
    )

    print(f"✅ Message Created!")
    print(f"Message SID: {message.sid}")
    print(f"Status: {message.status}")
    print(f"From: {message.from_}")
    print(f"To: {message.to}")
    print(f"Error Code: {message.error_code}")
    print(f"Error Message: {message.error_message}")

    # Fetch latest status
    import time
    time.sleep(2)
    message = client.messages(message.sid).fetch()
    print(f"\nUpdated Status: {message.status}")
    print(f"\nCheck your phone ({user_number}) for the test message!")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\nCommon issues:")
    print("1. Make sure you've verified your phone number in Twilio (for trial accounts)")
    print("2. Check that your credentials are correct in .env file")
    print("3. Ensure your phone number includes country code (e.g., +96176017516)")
