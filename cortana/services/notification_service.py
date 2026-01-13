"""
Notification Service
Handles creating and managing notifications for users
"""
from sqlalchemy.orm import Session
from models.notification import Notification
from datetime import datetime


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "system"
) -> Notification:
    """
    Create a new notification for a user

    Args:
        db: Database session
        user_id: User ID to send notification to
        title: Notification title
        message: Notification message body
        notification_type: Type of notification (finance, news, health, system)

    Returns:
        Created Notification object
    """
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def create_finance_notification(db: Session, user_id: int, title: str, message: str):
    """Create a finance-related notification"""
    return create_notification(db, user_id, title, message, "finance")


def create_news_notification(db: Session, user_id: int, title: str, message: str):
    """Create a news-related notification"""
    return create_notification(db, user_id, title, message, "news")


def create_health_notification(db: Session, user_id: int, title: str, message: str):
    """Create a health-related notification"""
    return create_notification(db, user_id, title, message, "health")


def create_system_notification(db: Session, user_id: int, title: str, message: str):
    """Create a system notification"""
    return create_notification(db, user_id, title, message, "system")


def get_unread_count(db: Session, user_id: int) -> int:
    """Get count of unread notifications for a user"""
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()


def mark_all_read(db: Session, user_id: int):
    """Mark all notifications as read for a user"""
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
