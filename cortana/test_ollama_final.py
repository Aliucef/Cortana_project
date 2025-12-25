"""
Test script to check Ollama availability
"""
import sys

print("=" * 50)
print("Testing Ollama Integration")
print("=" * 50)

# Test 1: Import ollama
try:
    import ollama
    print("[OK] Step 1: ollama package imported successfully")
except ImportError as e:
    print(f"[FAIL] Step 1: Cannot import ollama: {e}")
    sys.exit(1)

# Test 2: Check if Ollama service is running
try:
    models_response = ollama.list()
    print("[OK] Step 2: Ollama service is running")
    model_names = [m.model for m in models_response.models]
    print(f"     Available models: {model_names}")
except Exception as e:
    print(f"[FAIL] Step 2: Ollama service not accessible: {e}")
    print("     Make sure Ollama is running")
    sys.exit(1)

# Test 3: Try to use llama3:latest
try:
    print("[...] Step 3: Testing llama3:latest (this may take a moment)...")
    response = ollama.chat(
        model='llama3:latest',
        messages=[
            {'role': 'user', 'content': 'Say "Hello from Llama!" and nothing else.'}
        ]
    )
    print("[OK] Step 3: Successfully generated response from llama3:latest")
    print(f"     Response: {response['message']['content']}")
except Exception as e:
    print(f"[FAIL] Step 3: Cannot use llama3:latest: {e}")
    sys.exit(1)

# Test 4: Try JSON format
try:
    print("[...] Step 4: Testing JSON format...")
    response = ollama.chat(
        model='llama3:latest',
        messages=[
            {'role': 'user', 'content': 'Return JSON: {"status": "working", "test": true}'}
        ],
        format='json'
    )
    print("[OK] Step 4: JSON format working")
    print(f"     Response: {response['message']['content']}")
except Exception as e:
    print(f"[FAIL] Step 4: JSON format error: {e}")
    sys.exit(1)

print("=" * 50)
print("ALL TESTS PASSED!")
print("Ollama is ready to use with Cortana")
print("=" * 50)
