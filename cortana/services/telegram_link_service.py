"""
Service for managing Telegram account linking
"""
import secrets
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from models.telegram_link import TelegramLink
from models.user import User


def generate_linking_code(user_id: int, db: Session, expires_hours: int = 24) -> str:
    """
    Generate a unique linking code for a user

    Args:
        user_id: Database user ID
        db: Database session
        expires_hours: Hours until code expires (default 24)

    Returns:
        Linking code string (e.g., "TG-ABC123XYZ")
    """
    # Generate random code
    code_length = 8
    characters = string.ascii_uppercase + string.digits
    random_code = ''.join(secrets.choice(characters) for _ in range(code_length))
    linking_code = f"TG-{random_code}"

    # Calculate expiration time
    expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_hours)

    # Create linking record
    link = TelegramLink(
        user_id=user_id,
        linking_code=linking_code,
        is_used=False,
        expires_at=expires_at
    )

    db.add(link)
    db.commit()
    db.refresh(link)

    return linking_code


def verify_and_link_telegram(linking_code: str, telegram_user_id: str, db: Session) -> dict:
    """
    Verify a linking code and link the Telegram account

    Args:
        linking_code: The linking code from user
        telegram_user_id: Telegram user ID to link
        db: Database session

    Returns:
        dict with success status and message
    """
    # Find the linking code
    link = db.query(TelegramLink).filter(
        TelegramLink.linking_code == linking_code
    ).first()

    if not link:
        return {"success": False, "message": "Invalid linking code"}

    # Check if already used
    if link.is_used:
        return {"success": False, "message": "This code has already been used"}

    # Check if expired
    if datetime.now(timezone.utc) > link.expires_at:
        return {"success": False, "message": "This code has expired. Please generate a new one from your profile."}

    # Check if this Telegram ID is already linked to another account
    existing_user = db.query(User).filter(
        User.telegram_user_id == telegram_user_id
    ).first()

    if existing_user:
        return {
            "success": False,
            "message": f"Your Telegram account is already linked to {existing_user.email}"
        }

    # Get the user for this linking code
    user = db.query(User).filter(User.id == link.user_id).first()

    if not user:
        return {"success": False, "message": "User not found"}

    # Link the account
    user.telegram_user_id = telegram_user_id
    link.is_used = True

    db.commit()

    return {
        "success": True,
        "message": f"Successfully linked to {user.email}",
        "user": user
    }


def get_user_by_telegram_id(telegram_user_id: str, db: Session) -> User:
    """
    Get a user by their Telegram ID

    Args:
        telegram_user_id: Telegram user ID
        db: Database session

    Returns:
        User object or None
    """
    return db.query(User).filter(
        User.telegram_user_id == telegram_user_id
    ).first()


def unlink_telegram(user_id: int, db: Session) -> bool:
    """
    Unlink Telegram account from user

    Args:
        user_id: Database user ID
        db: Database session

    Returns:
        True if successful
    """
    user = db.query(User).filter(User.id == user_id).first()

    if user:
        user.telegram_user_id = None
        db.commit()
        return True

    return False
