"""
Groq AI Service - Ultra-fast cloud LLM inference
"""
import logging
from typing import Dict, Optional
import json
from groq import Groq
from config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class GroqAIService:
    """Groq AI service - blazing fast cloud inference"""

    def __init__(self, model: str = "llama-3.1-8b-instant"):
        """
        Initialize Groq AI service

        Args:
            model: Groq model to use
                - llama-3.1-8b-instant (FASTEST, recommended)
                - mixtral-8x7b-32768 (Best quality)
                - gemma2-9b-it (Good balance)
        """
        self.model = model
        self.available = False

        try:
            self.client = Groq(api_key=settings.groq_api_key)
            # Test connection
            self.client.models.list()
            self.available = True
            logger.info(f"✅ Groq available with model: {self.model} (ultra-fast!)")
        except Exception as e:
            logger.warning(f"Groq not available: {str(e)}")
            self.available = False

    def generate(self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 1000) -> str:
        """
        Generate text using Groq

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            max_tokens: Maximum tokens to generate

        Returns:
            Generated text

        Raises:
            Exception if Groq not available
        """
        if not self.available:
            raise Exception("Groq not available")

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

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=max_tokens,
                top_p=0.9,
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Groq generation error: {str(e)}")
            raise

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict:
        """
        Generate JSON output using Groq

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt

        Returns:
            Parsed JSON dictionary

        Raises:
            Exception if Groq not available or JSON parsing fails
        """
        if not self.available:
            raise Exception("Groq not available")

        try:
            messages = []

            # Force JSON output in system prompt
            json_system = "You are a helpful assistant that ALWAYS responds with valid JSON. Never include markdown formatting or explanations, only return raw JSON."
            if system_prompt:
                json_system += f"\n\n{system_prompt}"

            messages.append({
                'role': 'system',
                'content': json_system
            })

            messages.append({
                'role': 'user',
                'content': prompt
            })

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3,  # Lower for more consistent JSON
                max_tokens=500,
                top_p=0.9,
                response_format={"type": "json_object"}  # Force JSON mode
            )

            result_text = response.choices[0].message.content.strip()

            # Clean JSON if needed (shouldn't be necessary with json_object mode)
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
            logger.error(f"Failed to parse JSON from Groq: {e}")
            logger.error(f"Response: {result_text}")
            raise

        except Exception as e:
            logger.error(f"Groq JSON generation error: {str(e)}")
            raise

    def is_available(self) -> bool:
        """Check if Groq is available"""
        return self.available
