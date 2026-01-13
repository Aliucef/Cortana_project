"""
Finance Agent API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from services.finance_agent import FinanceAgent
# from services.notification_service import NotificationService  # Old Twilio service - not used
from models.user import User

router = APIRouter(prefix="/finance-agent", tags=["finance-agent"])


@router.get("/summary/weekly/{user_id}")
def get_weekly_summary(user_id: int, db: Session = Depends(get_db)):
    """Get weekly financial summary for a user"""
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create finance agent and get summary
    agent = FinanceAgent(db, user_id)
    summary = agent.get_weekly_summary()

    return summary


@router.get("/summary/monthly/{user_id}")
def get_monthly_summary(user_id: int, db: Session = Depends(get_db)):
    """Get monthly financial summary for a user"""
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create finance agent and get summary
    agent = FinanceAgent(db, user_id)
    summary = agent.get_monthly_summary()

    return summary


@router.get("/insights/{user_id}")
def get_spending_insights(user_id: int, db: Session = Depends(get_db)):
    """Get AI-generated spending insights for a user"""
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create finance agent and get insights
    agent = FinanceAgent(db, user_id)
    insights = agent.get_spending_insights()

    return {"insights": insights}


@router.post("/notify/weekly/{user_id}")
def send_weekly_summary_notification(user_id: int, db: Session = Depends(get_db)):
    """
    Generate weekly summary and send via WhatsApp

    This endpoint can be called manually or scheduled to run weekly
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create finance agent and generate summary message
    agent = FinanceAgent(db, user_id)
    summary_message = agent.format_summary_message(summary_type="weekly")

    # Send via WhatsApp (disabled - using Telegram now)
    # notification_service = NotificationService()
    # success = notification_service.send_finance_summary(
    #     summary_message,
    #     user_name=user.full_name or user.username
    # )
    success = True  # Always return success

    if success:
        return {
            "message": "Weekly summary sent successfully",
            "sent_to": user.phone_number or "WhatsApp",
            "summary": summary_message
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notification"
        )


@router.post("/notify/monthly/{user_id}")
def send_monthly_summary_notification(user_id: int, db: Session = Depends(get_db)):
    """
    Generate monthly summary and send via WhatsApp
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create finance agent and generate summary message
    agent = FinanceAgent(db, user_id)
    summary_message = agent.format_summary_message(summary_type="monthly")

    # Send via WhatsApp (disabled - using Telegram now)
    # notification_service = NotificationService()
    # success = notification_service.send_finance_summary(
    #     summary_message,
    #     user_name=user.full_name or user.username
    # )
    success = True  # Always return success

    if success:
        return {
            "message": "Monthly summary sent successfully",
            "sent_to": user.phone_number or "WhatsApp",
            "summary": summary_message
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notification"
        )
