"""Test script to verify Twilio voice calls are working"""
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get Twilio credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_VOICE_NUMBER')  # Use voice number for calls
user_number = os.getenv('USER_PHONE_NUMBER')

print(f"Testing Twilio Voice Call...")
print(f"From: {twilio_number}")
print(f"To: {user_number}")
print("-" * 50)

# Create the voice message using TwiML
response = VoiceResponse()
response.say(
    "Hello! This is Cortana, your personal AI assistant. "
    "I am calling to confirm that voice notifications are working perfectly. "
    "Your Finance Agent is now ready to analyze your spending and send you weekly updates. "
    "Have a great day!",
    voice='alice',  # Natural-sounding voice
    language='en-US'
)

# Convert TwiML to URL (we'll use Twilio's bin service)
twiml_instructions = str(response)

try:
    # Create Twilio client
    client = Client(account_sid, auth_token)

    # Make the call
    call = client.calls.create(
        twiml=twiml_instructions,
        to=user_number,
        from_=twilio_number
    )

    print(f"✅ Call initiated!")
    print(f"Call SID: {call.sid}")
    print(f"Status: {call.status}")
    print(f"\n📞 Your phone ({user_number}) should be ringing now!")
    print(f"Note: Trial accounts will play a short notice before the message.")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\nCommon issues:")
    print("1. Make sure you've verified your phone number in Twilio (for trial accounts)")
    print("2. Check that your credentials are correct in .env file")
    print("3. For trial accounts, you need to use the old US number, not WhatsApp number")
