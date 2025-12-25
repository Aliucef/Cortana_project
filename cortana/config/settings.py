from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Cortana AI Assistant"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database
    database_url: str

    # Security (for Stage 1.5)
    secret_key: str = "CHANGE_THIS_IN_PRODUCTION"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Twilio (for Stage 2)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    user_phone_number: str = ""

    # AI Configuration
    gemini_api_key: str = ""
    groq_api_key: str = ""

    # News API Configuration
    news_api_key: str = ""

    # Telegram Configuration
    telegram_bot_token: str = ""
    telegram_user_id: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()
