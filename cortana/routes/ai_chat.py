"""
AI Chat endpoints - Handle conversational finance tracking
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from sqlalchemy.orm import Session
from config.database import get_db
from middleware.auth import get_current_user_id
from services.ai_service import AIService
from services.notification_service import NotificationService
from services.budget_monitor import BudgetMonitor
from models.user import User
from models.finance import FinanceRecord, TransactionType
from models.budget import Budget, CategoryGoal, BudgetPeriod
from datetime import datetime
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai-chat", tags=["ai-chat"])


class ChatMessage(BaseModel):
    message: str  # Removed user_id - will get from JWT


@router.post("/parse-expense")
def parse_expense_with_ai(chat: ChatMessage, db: Session = Depends(get_db)):
    """
    Parse a natural language message and extract financial transactions using AI

    Example messages:
    - "I spent $50 on groceries"
    - "Got paid $3000 today"
    - "Spent 20 on lunch and 10 on coffee"
    """
    # Check if user exists
    user = db.query(User).filter(User.id == chat.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Parse message with AI
    ai_service = AIService()
    parsed_result = ai_service.parse_expense_message(chat.message)

    # If clarification needed, return question
    if parsed_result.get("needs_clarification"):
        return {
            "status": "needs_clarification",
            "question": parsed_result.get("clarification_question"),
            "transactions_added": 0
        }

    # Add transactions to database
    transactions_added = []
    for transaction_data in parsed_result.get("transactions", []):
        # Create transaction record
        transaction = FinanceRecord(
            user_id=chat.user_id,
            amount=transaction_data["amount"],
            transaction_type=TransactionType.INCOME if transaction_data["type"] == "income" else TransactionType.EXPENSE,
            category=transaction_data["category"],
            description=transaction_data["description"],
            transaction_date=datetime.now()
        )

        db.add(transaction)
        transactions_added.append(transaction_data)

    db.commit()

    # Check for overspending after adding transactions
    budget_monitor = BudgetMonitor(db)
    for transaction_data in transactions_added:
        if transaction_data["type"] == "expense":
            budget_monitor.check_after_transaction(chat.user_id, transaction_data["category"])

    # Generate confirmation message
    confirmation = ai_service.generate_conversational_response(
        chat.message,
        context=f"Successfully added {len(transactions_added)} transactions"
    )

    return {
        "status": "success",
        "transactions_added": len(transactions_added),
        "transactions": transactions_added,
        "confirmation_message": confirmation
    }


@router.post("/webhook/whatsapp")
async def whatsapp_webhook(
    request: Request,
    From: str = Form(...),
    Body: str = Form(None),
    MediaUrl0: str = Form(None),
    MediaContentType0: str = Form(None),
    NumMedia: int = Form(0),
    db: Session = Depends(get_db)
):
    """
    Twilio WhatsApp webhook - receives incoming messages

    This endpoint needs to be set up in Twilio console as the webhook URL
    For local development, use ngrok to expose this endpoint
    """
    # Extract phone number (remove 'whatsapp:' prefix)
    phone_number = From.replace("whatsapp:", "")
    message_body = Body

    # Check if this is a voice message
    if NumMedia > 0 and MediaContentType0 and "audio" in MediaContentType0:
        # This is a voice message
        from services.audio_transcription import AudioTranscriptionService

        transcription_service = AudioTranscriptionService()
        transcription = transcription_service.process_voice_message(MediaUrl0)

        if not transcription:
            # Failed to transcribe
            notification_service = NotificationService()
            notification_service.send_whatsapp(
                "Sorry, I couldn't understand your voice message. Please try again or send a text message."
            )
            return {"status": "transcription_failed"}

        # Use transcription as the message body
        message_body = transcription
        logger.info(f"Transcribed voice message: {transcription}")

    # Find user by phone number
    user = db.query(User).filter(User.phone_number == phone_number).first()

    if not user:
        # If user not found, send help message
        notification_service = NotificationService()
        notification_service.send_whatsapp(
            "Hi! I couldn't find your account. Please register first at the Cortana dashboard."
        )
        return {"status": "user_not_found"}

    # Detect user intent first
    ai_service = AIService()
    intent_result = ai_service.detect_command_intent(message_body)

    notification_service = NotificationService()

    # Handle different intents
    if intent_result["intent"] == "weekly_summary":
        # User wants weekly summary
        from services.finance_agent import FinanceAgent
        agent = FinanceAgent(db, user.id)
        summary_message = agent.format_summary_message(summary_type="weekly")

        notification_service.send_finance_summary(
            summary_message,
            user_name=user.full_name or user.username
        )
        return {"status": "summary_sent", "type": "weekly"}

    elif intent_result["intent"] == "monthly_summary":
        # User wants monthly summary
        from services.finance_agent import FinanceAgent
        agent = FinanceAgent(db, user.id)
        summary_message = agent.format_summary_message(summary_type="monthly")

        notification_service.send_finance_summary(
            summary_message,
            user_name=user.full_name or user.username
        )
        return {"status": "summary_sent", "type": "monthly"}

    elif intent_result["intent"] == "detailed_report":
        # User wants detailed report
        from services.finance_agent import FinanceAgent
        agent = FinanceAgent(db, user.id)

        # Default to weekly, but could be enhanced to detect period
        report = agent.get_detailed_report(period="weekly")

        notification_service.send_whatsapp(report)
        return {"status": "detailed_report_sent"}

    elif intent_result["intent"] == "set_budget":
        # User wants to set a budget
        budget_info = ai_service.parse_budget_message(message_body)

        if not budget_info.get("success"):
            notification_service.send_whatsapp(budget_info.get("error_message"))
            return {"status": "error", "message": "Failed to parse budget"}

        # Create or update budget
        existing_budget = db.query(Budget).filter(
            Budget.user_id == user.id,
            Budget.period == BudgetPeriod(budget_info["period"])
        ).first()

        if existing_budget:
            existing_budget.amount = budget_info["amount"]
            db.commit()
            message = f"✅ Updated your {budget_info['period']} budget to ${budget_info['amount']:.2f}!"
        else:
            new_budget = Budget(
                user_id=user.id,
                amount=budget_info["amount"],
                period=BudgetPeriod(budget_info["period"])
            )
            db.add(new_budget)
            db.commit()
            message = f"✅ Set your {budget_info['period']} budget to ${budget_info['amount']:.2f}!"

        message += "\n\nI'll alert you if you're getting close to this limit! 💰"
        notification_service.send_whatsapp(message)
        return {"status": "budget_set"}

    elif intent_result["intent"] == "set_goal":
        # User wants to set a category goal
        goal_info = ai_service.parse_goal_message(message_body)

        if not goal_info.get("success"):
            notification_service.send_whatsapp(goal_info.get("error_message"))
            return {"status": "error", "message": "Failed to parse goal"}

        # Create or update category goal
        existing_goal = db.query(CategoryGoal).filter(
            CategoryGoal.user_id == user.id,
            CategoryGoal.category == goal_info["category"],
            CategoryGoal.period == BudgetPeriod(goal_info["period"])
        ).first()

        if existing_goal:
            existing_goal.goal_amount = goal_info["amount"]
            db.commit()
            message = f"✅ Updated your {goal_info['category']} goal to ${goal_info['amount']:.2f} per {goal_info['period']}!"
        else:
            new_goal = CategoryGoal(
                user_id=user.id,
                category=goal_info["category"],
                goal_amount=goal_info["amount"],
                period=BudgetPeriod(goal_info["period"]),
                alert_threshold=0.8  # Alert at 80%
            )
            db.add(new_goal)
            db.commit()
            message = f"✅ Set your {goal_info['category']} goal to ${goal_info['amount']:.2f} per {goal_info['period']}!"

        message += f"\n\nI'll alert you when you reach 80% of your {goal_info['category']} budget! 🎯"
        notification_service.send_whatsapp(message)
        return {"status": "goal_set"}

    elif intent_result["intent"] == "update_schedule":
        # User wants to update schedule
        schedule_info = ai_service.parse_schedule_message(message_body)

        if not schedule_info.get("success"):
            notification_service.send_whatsapp(schedule_info.get("error_message"))
            return {"status": "error", "message": "Failed to parse schedule"}

        # Get scheduler from main app
        from main import scheduler

        # Update schedule
        day_of_week = schedule_info.get("day_of_week")
        prefs = scheduler.update_user_schedule(
            user_id=user.id,
            schedule_type=schedule_info["schedule_type"],
            hour=schedule_info["hour"],
            minute=schedule_info["minute"],
            day_of_week=day_of_week
        )

        # Format confirmation message
        hour_12 = schedule_info["hour"] % 12 or 12
        am_pm = "AM" if schedule_info["hour"] < 12 else "PM"
        time_str = f"{hour_12}:{schedule_info['minute']:02d} {am_pm}"

        if schedule_info["schedule_type"] == "daily_reminder":
            message = f"✅ Updated your daily reminder to {time_str}!"
            message += f"\n\nI'll remind you every day at this time to log your expenses! ⏰"
        else:  # weekly_summary
            day_name = day_of_week.capitalize() if day_of_week else "Sunday"
            message = f"✅ Updated your weekly summary to {day_name} at {time_str}!"
            message += f"\n\nI'll send your financial summary every {day_name} at this time! 📊"

        notification_service.send_whatsapp(message)
        return {"status": "schedule_updated"}

    elif intent_result["intent"] == "delete_expense":
        # User wants to delete an expense
        # Get the last expense for this user
        last_expense = db.query(FinanceRecord).filter(
            FinanceRecord.user_id == user.id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        ).order_by(FinanceRecord.transaction_date.desc()).first()

        if not last_expense:
            notification_service.send_whatsapp("You don't have any expenses to delete!")
            return {"status": "no_expenses"}

        # Store details before deleting
        amount = last_expense.amount
        category = last_expense.category
        description = last_expense.description

        # Delete the expense
        db.delete(last_expense)
        db.commit()

        message = f"✅ Deleted your last expense:\n"
        message += f"${amount:.2f} - {category} ({description})"

        notification_service.send_whatsapp(message)
        return {"status": "expense_deleted"}

    elif intent_result["intent"] == "edit_expense":
        # User wants to edit an expense
        edit_info = ai_service.parse_expense_edit_message(message_body)

        if not edit_info.get("success"):
            notification_service.send_whatsapp(edit_info.get("error_message"))
            return {"status": "error", "message": "Failed to parse edit request"}

        # Find the expense to edit
        if edit_info["target"] == "last":
            # Get last expense
            expense = db.query(FinanceRecord).filter(
                FinanceRecord.user_id == user.id
            ).order_by(FinanceRecord.transaction_date.desc()).first()
        else:
            # Find expense with specific amount
            old_amount = edit_info.get("old_amount")
            expense = db.query(FinanceRecord).filter(
                FinanceRecord.user_id == user.id,
                FinanceRecord.amount == old_amount
            ).order_by(FinanceRecord.transaction_date.desc()).first()

        if not expense:
            notification_service.send_whatsapp("Couldn't find that expense. Try being more specific!")
            return {"status": "expense_not_found"}

        # Store old amount
        old_amount = expense.amount

        # Update the amount
        expense.amount = edit_info["new_amount"]
        db.commit()

        message = f"✅ Updated expense:\n"
        message += f"Changed from ${old_amount:.2f} to ${edit_info['new_amount']:.2f}\n"
        message += f"Category: {expense.category}"

        notification_service.send_whatsapp(message)
        return {"status": "expense_updated"}

    elif intent_result["intent"] == "greeting":
        # Just chatting
        response = ai_service.generate_conversational_response(message_body)
        notification_service.send_whatsapp(response)
        return {"status": "chat_response"}

    elif intent_result["intent"] == "expense_logging":
        # Parse expenses
        parsed_result = ai_service.parse_expense_message(message_body)

        # If clarification needed
        if parsed_result.get("needs_clarification"):
            notification_service.send_whatsapp(
                parsed_result.get("clarification_question")
            )
            return {"status": "clarification_sent"}

        # Add transactions
        transactions_added = []
        for transaction_data in parsed_result.get("transactions", []):
            transaction = FinanceRecord(
                user_id=user.id,
                amount=transaction_data["amount"],
                transaction_type=TransactionType.INCOME if transaction_data["type"] == "income" else TransactionType.EXPENSE,
                category=transaction_data["category"],
                description=transaction_data["description"],
                transaction_date=datetime.now()
            )

            db.add(transaction)
            transactions_added.append(transaction_data)

        db.commit()

        # Check for overspending after adding transactions
        budget_monitor = BudgetMonitor(db)
        for transaction_data in transactions_added:
            if transaction_data["type"] == "expense":
                budget_monitor.check_after_transaction(user.id, transaction_data["category"])

        # Send confirmation
        confirmation = ai_service.generate_conversational_response(
            message_body,
            context=f"Successfully added {len(transactions_added)} transactions"
        )

        notification_service.send_whatsapp(confirmation)
        return {"status": "success", "transactions_added": len(transactions_added)}

    else:
        # General query - provide helpful response
        response = ai_service.generate_conversational_response(
            message_body,
            context="User asked a general question about their finances"
        )
        notification_service.send_whatsapp(response)
        return {"status": "general_response"}


@router.post("/chat")
async def chat_with_ai(
    chat: ChatMessage,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    General chat endpoint - Uses THE EXACT SAME AI as Telegram
    Now properly authenticated with JWT - each user gets personalized AI responses
    """
    import asyncio
    from services.telegram_message_handler import process_telegram_message

    # Use the authenticated user ID from JWT token (not from request body)
    try:
        response = await process_telegram_message(
            user_id=current_user_id,  # ← From JWT, not request!
            message_text=chat.message,
            db=db,
            context_data={}
        )

        # Handle if response is a dict (export requests, etc.)
        if isinstance(response, dict):
            return {"response": str(response)}

        return {"response": response}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"response": "Sorry, I encountered an error. Please try again."}
