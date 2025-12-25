"""
Audio Transcription Service - Convert voice messages to text using Gemini
"""
import google.generativeai as genai
from config.settings import get_settings
import requests
import tempfile
import os
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


class AudioTranscriptionService:
    """Transcribe audio messages using Gemini AI"""

    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')

    def download_audio(self, media_url: str, auth: tuple) -> str:
        """
        Download audio file from Twilio

        Args:
            media_url: Twilio media URL
            auth: (account_sid, auth_token) tuple for authentication

        Returns:
            Path to downloaded file
        """
        try:
            # Download the audio file
            response = requests.get(media_url, auth=auth, timeout=30)
            response.raise_for_status()

            # Save to temporary file
            # Twilio sends audio as OGG format for WhatsApp voice messages
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.ogg')
            temp_file.write(response.content)
            temp_file.close()

            logger.info(f"Downloaded audio file to {temp_file.name}")
            return temp_file.name

        except Exception as e:
            logger.error(f"Failed to download audio: {str(e)}")
            raise

    def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribe audio file to text using Gemini

        Args:
            audio_path: Path to audio file

        Returns:
            Transcribed text
        """
        try:
            # Upload audio file to Gemini
            audio_file = genai.upload_file(audio_path)
            logger.info(f"Uploaded audio file: {audio_file.name}")

            # Generate transcription
            prompt = """
            Transcribe this audio message to text.
            Return ONLY the transcribed text, nothing else.
            If the audio is about expenses or finances, be sure to capture numbers and amounts accurately.
            """

            response = self.model.generate_content([prompt, audio_file])
            transcription = response.text.strip()

            logger.info(f"Transcription: {transcription}")

            # Clean up uploaded file from Gemini
            audio_file.delete()

            return transcription

        except Exception as e:
            logger.error(f"Failed to transcribe audio: {str(e)}")
            raise

    def process_voice_message(self, media_url: str) -> str:
        """
        Download and transcribe a voice message

        Args:
            media_url: Twilio media URL

        Returns:
            Transcribed text
        """
        audio_path = None
        try:
            # Download audio
            auth = (settings.twilio_account_sid, settings.twilio_auth_token)
            audio_path = self.download_audio(media_url, auth)

            # Transcribe
            transcription = self.transcribe_audio(audio_path)

            return transcription

        except Exception as e:
            logger.error(f"Error processing voice message: {str(e)}")
            return None

        finally:
            # Clean up temporary file
            if audio_path and os.path.exists(audio_path):
                try:
                    os.unlink(audio_path)
                    logger.info(f"Deleted temporary file: {audio_path}")
                except Exception as e:
                    logger.error(f"Failed to delete temp file: {str(e)}")
