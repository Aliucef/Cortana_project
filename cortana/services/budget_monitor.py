"""
Budget Monitoring Service - Check spending against budgets and goals
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from models.budget import Budget, CategoryGoal, BudgetPeriod
from models.finance import FinanceRecord, TransactionType
from models.user import User
# from services.notification_service import NotificationService  # Old Twilio service - not used
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class BudgetMonitor:
    """Monitor budgets and send alerts when overspending"""

    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService()

    def _get_period_dates(self, period: BudgetPeriod):
        """Get start and end dates for a budget period"""
        today = datetime.now()

        if period == BudgetPeriod.WEEKLY:
            # Start of current week (Monday)
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=7)
        elif period == BudgetPeriod.MONTHLY:
            # Start of current month
            start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            # Start of next month
            if today.month == 12:
                end_date = today.replace(year=today.year + 1, month=1, day=1)
            else:
                end_date = today.replace(month=today.month + 1, day=1)
        else:  # YEARLY
            start_date = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = today.replace(year=today.year + 1, month=1, day=1)

        return start_date, end_date

    def get_category_spending(self, user_id: int, category: str, period: BudgetPeriod) -> float:
        """
        Calculate total spending for a category in the given period
        """
        start_date, end_date = self._get_period_dates(period)

        total = self.db.query(func.sum(FinanceRecord.amount)).filter(
            and_(
                FinanceRecord.user_id == user_id,
                FinanceRecord.category == category,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= start_date,
                FinanceRecord.transaction_date < end_date
            )
        ).scalar()

        return total or 0.0

    def get_total_spending(self, user_id: int, period: BudgetPeriod) -> float:
        """
        Calculate total spending across all categories in the given period
        """
        start_date, end_date = self._get_period_dates(period)

        total = self.db.query(func.sum(FinanceRecord.amount)).filter(
            and_(
                FinanceRecord.user_id == user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= start_date,
                FinanceRecord.transaction_date < end_date
            )
        ).scalar()

        return total or 0.0

    def check_category_goal(self, user_id: int, category: str) -> dict:
        """
        Check if spending in a category has exceeded the goal
        Returns alert info if threshold is exceeded
        """
        # Get category goal
        goal = self.db.query(CategoryGoal).filter(
            CategoryGoal.user_id == user_id,
            CategoryGoal.category == category
        ).first()

        if not goal:
            return None

        # Calculate current spending
        current_spending = self.get_category_spending(user_id, category, goal.period)
        percentage = (current_spending / goal.goal_amount) * 100 if goal.goal_amount > 0 else 0
        threshold_percentage = goal.alert_threshold * 100

        # Check if threshold exceeded
        if percentage >= threshold_percentage:
            return {
                "category": category,
                "goal_amount": goal.goal_amount,
                "current_spending": current_spending,
                "percentage": percentage,
                "threshold": threshold_percentage,
                "exceeded": percentage >= 100,
                "period": goal.period.value
            }

        return None

    def check_overall_budget(self, user_id: int) -> dict:
        """
        Check if overall spending has exceeded the budget
        """
        # Get monthly budget (most common)
        budget = self.db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.period == BudgetPeriod.MONTHLY
        ).first()

        if not budget:
            return None

        # Calculate current spending
        current_spending = self.get_total_spending(user_id, budget.period)
        percentage = (current_spending / budget.amount) * 100 if budget.amount > 0 else 0

        # Alert at 80% threshold
        if percentage >= 80:
            return {
                "budget_amount": budget.amount,
                "current_spending": current_spending,
                "percentage": percentage,
                "exceeded": percentage >= 100,
                "period": budget.period.value
            }

        return None

    def send_overspending_alert(self, user_id: int, alert_info: dict):
        """
        Send WhatsApp alert about overspending
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return

        user_name = user.full_name or user.username

        if "category" in alert_info:
            # Category goal alert
            category = alert_info["category"]
            percentage = alert_info["percentage"]
            current = alert_info["current_spending"]
            goal = alert_info["goal_amount"]
            exceeded = alert_info["exceeded"]

            if exceeded:
                message = f"🚨 *Overspending Alert!* 🚨\n\n"
                message += f"Hey {user_name}, you've exceeded your {category} budget!\n\n"
                message += f"Goal: ${goal:.2f}\n"
                message += f"Spent: ${current:.2f} ({percentage:.1f}%)\n"
                message += f"Over by: ${current - goal:.2f}\n\n"
                message += f"Time to cut back on {category} spending! 💪"
            else:
                message = f"⚠️ *Budget Warning* ⚠️\n\n"
                message += f"Hey {user_name}, you're at {percentage:.1f}% of your {category} budget.\n\n"
                message += f"Goal: ${goal:.2f}\n"
                message += f"Spent: ${current:.2f}\n"
                message += f"Remaining: ${goal - current:.2f}\n\n"
                message += f"Watch your {category} spending! 👀"

        else:
            # Overall budget alert
            percentage = alert_info["percentage"]
            current = alert_info["current_spending"]
            budget = alert_info["budget_amount"]
            exceeded = alert_info["exceeded"]

            if exceeded:
                message = f"🚨 *BUDGET EXCEEDED!* 🚨\n\n"
                message += f"Hey {user_name}, you've exceeded your monthly budget!\n\n"
                message += f"Budget: ${budget:.2f}\n"
                message += f"Spent: ${current:.2f} ({percentage:.1f}%)\n"
                message += f"Over by: ${current - budget:.2f}\n\n"
                message += f"Time to tighten the belt! 💰"
            else:
                message = f"⚠️ *Budget Warning* ⚠️\n\n"
                message += f"Hey {user_name}, you're at {percentage:.1f}% of your monthly budget.\n\n"
                message += f"Budget: ${budget:.2f}\n"
                message += f"Spent: ${current:.2f}\n"
                message += f"Remaining: ${budget - current:.2f}\n\n"
                message += f"Careful with spending this month! 💸"

        self.notification_service.send_whatsapp(message)
        logger.info(f"Sent overspending alert to user {user_id}")

    def check_after_transaction(self, user_id: int, category: str):
        """
        Check budgets after a new transaction is added
        Call this after adding an expense
        """
        # Check category goal
        category_alert = self.check_category_goal(user_id, category)
        if category_alert:
            self.send_overspending_alert(user_id, category_alert)

        # Check overall budget
        budget_alert = self.check_overall_budget(user_id)
        if budget_alert:
            self.send_overspending_alert(user_id, budget_alert)
