"""
Local AI Service - Uses Ollama for local LLM inference
"""
import logging
from typing import Dict, Optional
import json

logger = logging.getLogger(__name__)

# Try to import ollama, gracefully handle if not installed
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    logger.warning("Ollama not installed. Install with: pip install ollama")


class LocalAIService:
    """Local AI service using Ollama"""

    def __init__(self, model: str = "phi3.5:3.8b"):
        """
        Initialize local AI service

        Args:
            model: Ollama model to use (default: llama3:latest)
        """
        self.model = model
        self.available = OLLAMA_AVAILABLE

        if self.available:
            try:
                # Test if Ollama is running
                ollama.list()
                logger.info(f"Ollama available with model: {self.model}")
            except Exception as e:
                logger.warning(f"Ollama not running: {str(e)}")
                self.available = False

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generate text using local LLM

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt

        Returns:
            Generated text

        Raises:
            Exception if Ollama not available
        """
        if not self.available:
            raise Exception("Ollama not available")

        try:
            messages = []

            if system_prompt:
                messages.append({
                    'role': 'system',
                    'content': system_prompt
                })

            messages.append({
                'role': 'user',
                'content': prompt
            })

            response = ollama.chat(
                model=self.model,
                messages=messages,
                options={
                    'num_predict': 100,  # Limit response length for speed
                    'temperature': 0.7,  # Slightly lower = faster
                }
            )

            return response['message']['content']

        except Exception as e:
            logger.error(f"Ollama generation error: {str(e)}")
            raise

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict:
        """
        Generate JSON output using local LLM

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt

        Returns:
            Parsed JSON dictionary

        Raises:
            Exception if Ollama not available or JSON parsing fails
        """
        if not self.available:
            raise Exception("Ollama not available")

        try:
            messages = []

            if system_prompt:
                messages.append({
                    'role': 'system',
                    'content': system_prompt
                })

            messages.append({
                'role': 'user',
                'content': prompt
            })

            response = ollama.chat(
                model=self.model,
                messages=messages,
                format='json',  # Request JSON format
                options={
                    'num_predict': 200,  # JSON might need more tokens
                    'temperature': 0.3,  # Lower for more consistent JSON
                }
            )

            result_text = response['message']['content'].strip()

            # Clean JSON if needed
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result_text = result_text.strip()

            # Parse JSON
            parsed = json.loads(result_text)
            return parsed

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from Ollama: {e}")
            logger.error(f"Response: {result_text}")
            raise

        except Exception as e:
            logger.error(f"Ollama JSON generation error: {str(e)}")
            raise

    def is_available(self) -> bool:
        """Check if Ollama is available"""
        return self.available
