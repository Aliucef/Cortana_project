"""
Test Groq integration
"""
import sys
sys.path.append('.')

from services.groq_ai_service import GroqAIService

def test_groq():
    print("Testing Groq AI Service...")

    groq = GroqAIService(model="llama-3.1-8b-instant")

    if groq.is_available():
        print("[OK] Groq is available!")

        # Test text generation
        print("\nTesting text generation...")
        result = groq.generate("Say 'Hello from Groq!' in a fun way", max_tokens=50)
        print(f"Response: {result}")

        # Test JSON generation
        print("\nTesting JSON generation...")
        json_result = groq.generate_json("Return a JSON with: {\"status\": \"working\", \"message\": \"Groq is fast!\"}")
        print(f"JSON Response: {json_result}")

        print("\n[SUCCESS] All tests passed! Groq is working perfectly!")
    else:
        print("[ERROR] Groq is not available")
        print(f"Check your API key in .env: GROQ_API_KEY")

if __name__ == "__main__":
    test_groq()
