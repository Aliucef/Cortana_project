"""
Debug script to check Ollama model list structure
"""
import sys
import json

print("=" * 50)
print("Debugging Ollama Model List")
print("=" * 50)

try:
    import ollama
    print("[OK] ollama package imported")
except ImportError as e:
    print(f"[FAIL] Cannot import ollama: {e}")
    sys.exit(1)

try:
    models = ollama.list()
    print("[OK] ollama.list() called successfully")
    print(f"\nFull response type: {type(models)}")
    print(f"\nFull response:\n{json.dumps(models, indent=2, default=str)}")
except Exception as e:
    print(f"[FAIL] Error calling ollama.list(): {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("=" * 50)
