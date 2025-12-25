"""Test Gemini API and list available models"""
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key: {api_key[:10]}...")

genai.configure(api_key=api_key)

print("\n📋 Available Models:")
print("-" * 50)

try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✅ {model.name}")

    print("\n🧪 Testing with first available model...")

    # Try with gemini-pro (v1 API)
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say hello")
        print(f"\n✅ gemini-pro works!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ gemini-pro failed: {e}")

except Exception as e:
    print(f"❌ Error: {e}")
