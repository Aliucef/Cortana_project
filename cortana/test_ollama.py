"""
Test script to check Ollama availability
"""
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("=" * 50)
print("Testing Ollama Integration")
print("=" * 50)

# Test 1: Import ollama
try:
    import ollama
    print("✅ Step 1: ollama package imported successfully")
except ImportError as e:
    print(f"❌ Step 1 FAILED: Cannot import ollama: {e}")
    exit(1)

# Test 2: Check if Ollama service is running
try:
    models = ollama.list()
    print(f"✅ Step 2: Ollama service is running")
    print(f"   Available models: {[m['name'] for m in models['models']]}")
except Exception as e:
    print(f"❌ Step 2 FAILED: Ollama service not accessible: {e}")
    print("   Make sure Ollama is running (check Task Manager for 'ollama.exe')")
    exit(1)

# Test 3: Try to use llama3:latest
try:
    response = ollama.chat(
        model='llama3:latest',
        messages=[
            {'role': 'user', 'content': 'Say "Hello from Llama!" and nothing else.'}
        ]
    )
    print(f"✅ Step 3: Successfully generated response from llama3:latest")
    print(f"   Response: {response['message']['content']}")
except Exception as e:
    print(f"❌ Step 3 FAILED: Cannot use llama3:latest: {e}")
    exit(1)

# Test 4: Try JSON format
try:
    response = ollama.chat(
        model='llama3:latest',
        messages=[
            {'role': 'user', 'content': 'Return JSON: {"status": "working", "test": true}'}
        ],
        format='json'
    )
    print(f"✅ Step 4: JSON format working")
    print(f"   Response: {response['message']['content']}")
except Exception as e:
    print(f"❌ Step 4 FAILED: JSON format error: {e}")
    exit(1)

print("=" * 50)
print("🎉 ALL TESTS PASSED!")
print("Ollama is ready to use with Cortana")
print("=" * 50)
