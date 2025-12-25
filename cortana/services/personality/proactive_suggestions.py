"""
Proactive Suggestions Engine - Makes Cortana suggest things without being asked
"""
from sqlalchemy.orm import Session
from models.finance import FinanceRecord, TransactionType
from models.budget import CategoryGoal, Budget
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import logging

logger = logging.getLogger(__name__)


class ProactiveSuggestions:
    """Generate smart, proactive suggestions based on user behavior"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def check_spending_anomaly(self) -> Optional[str]:
        """
        Detect if spending is unusually high

        Returns:
            Suggestion message or None
        """
        try:
            # Get this week's spending
            week_start = datetime.now() - timedelta(days=7)
            this_week = self.db.query(FinanceRecord).filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= week_start
            ).all()

            this_week_total = sum(t.amount for t in this_week)

            # Get last week's spending
            last_week_start = week_start - timedelta(days=7)
            last_week = self.db.query(FinanceRecord).filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= last_week_start,
                FinanceRecord.transaction_date < week_start
            ).all()

            last_week_total = sum(t.amount for t in last_week)

            # If spending increased by 50%+
            if last_week_total > 0 and this_week_total > last_week_total * 1.5:
                increase_pct = ((this_week_total - last_week_total) / last_week_total) * 100
                return f"⚠️ Heads up! You've spent ${this_week_total:.2f} this week - that's {increase_pct:.0f}% more than last week. Everything okay? Want to review your budget?"

            return None

        except Exception as e:
            logger.error(f"Error checking spending anomaly: {str(e)}")
            return None

    def suggest_based_on_pattern(self) -> Optional[str]:
        """
        Suggest actions based on spending patterns

        Returns:
            Suggestion message or None
        """
        try:
            # Check if user usually logs expenses on specific days
            now = datetime.now()
            today_name = now.strftime("%A")

            # Get expenses from same day last 4 weeks
            suggestions = []

            for weeks_ago in range(1, 5):
                check_date = now - timedelta(weeks=weeks_ago)
                day_expenses = self.db.query(FinanceRecord).filter(
                    FinanceRecord.user_id == self.user_id,
                    FinanceRecord.transaction_type == TransactionType.EXPENSE,
                    FinanceRecord.transaction_date >= check_date.replace(hour=0, minute=0, second=0),
                    FinanceRecord.transaction_date < check_date.replace(hour=23, minute=59, second=59)
                ).all()

                if len(day_expenses) >= 2:  # If they usually spend on this day
                    avg_amount = sum(e.amount for e in day_expenses) / len(day_expenses)
                    common_category = max(set([e.category for e in day_expenses]), key=[e.category for e in day_expenses].count)

                    suggestions.append({
                        "category": common_category,
                        "amount": avg_amount
                    })

            if len(suggestions) >= 2:  # Pattern detected
                avg_amt = sum(s["amount"] for s in suggestions) / len(suggestions)
                category = suggestions[0]["category"]

                return f"💡 Pattern detected: You usually spend around ${avg_amt:.2f} on {category} on {today_name}s. Need to log anything today?"

            return None

        except Exception as e:
            logger.error(f"Error suggesting based on pattern: {str(e)}")
            return None

    def warn_about_goal(self) -> Optional[str]:
        """
        Warn if approaching a spending goal

        Returns:
            Warning message or None
        """
        try:
            # Get active category goals
            goals = self.db.query(CategoryGoal).filter(
                CategoryGoal.user_id == self.user_id
            ).all()

            for goal in goals:
                # Calculate spending in this category this month
                month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                category_spending = self.db.query(FinanceRecord).filter(
                    FinanceRecord.user_id == self.user_id,
                    FinanceRecord.category == goal.category,
                    FinanceRecord.transaction_type == TransactionType.EXPENSE,
                    FinanceRecord.transaction_date >= month_start
                ).all()

                total_spent = sum(t.amount for t in category_spending)
                percentage = (total_spent / goal.goal_amount * 100) if goal.goal_amount > 0 else 0

                # Warning at 80%
                if 80 <= percentage < 90:
                    remaining = goal.goal_amount - total_spent
                    return f"⚠️ Budget check: You've spent ${total_spent:.2f} on {goal.category} this month - that's {percentage:.0f}% of your ${goal.goal_amount:.2f} goal. You have ${remaining:.2f} left."

                # Critical warning at 90%+
                elif percentage >= 90:
                    return f"🚨 Critical! You're at {percentage:.0f}% of your {goal.category} budget (${total_spent:.2f}/${goal.goal_amount:.2f}). Time to slow down!"

            return None

        except Exception as e:
            logger.error(f"Error warning about goal: {str(e)}")
            return None

    def suggest_missing_logs(self) -> Optional[str]:
        """
        Suggest if user hasn't logged expenses recently

        Returns:
            Reminder message or None
        """
        try:
            # Check last expense
            last_expense = self.db.query(FinanceRecord).filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE
            ).order_by(FinanceRecord.transaction_date.desc()).first()

            if not last_expense:
                return None

            hours_since = (datetime.now() - last_expense.transaction_date.replace(tzinfo=None)).total_seconds() / 3600

            # If 48+ hours since last expense
            if hours_since >= 48:
                return f"📊 Hey! You haven't logged any expenses in {int(hours_since/24)} days. Everything okay? Don't forget to track your spending!"

            return None

        except Exception as e:
            logger.error(f"Error checking missing logs: {str(e)}")
            return None

    def get_daily_insight(self) -> Optional[str]:
        """
        Generate a daily insight or tip

        Returns:
            Daily insight message or None
        """
        try:
            # Get spending data
            month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_expenses = self.db.query(FinanceRecord).filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= month_start
            ).all()

            if not month_expenses:
                return None

            total_spent = sum(e.amount for e in month_expenses)
            days_in_month = (datetime.now() - month_start).days + 1
            daily_avg = total_spent / days_in_month

            # Insight about daily average
            return f"📈 Monthly insight: You're averaging ${daily_avg:.2f} per day this month (${total_spent:.2f} total in {days_in_month} days)."

        except Exception as e:
            logger.error(f"Error generating daily insight: {str(e)}")
            return None

    def get_all_suggestions(self) -> List[str]:
        """
        Get all active suggestions (excludes daily insights - those are only for greetings)

        Returns:
            List of suggestion messages
        """
        suggestions = []

        # Check in priority order
        anomaly = self.check_spending_anomaly()
        if anomaly:
            suggestions.append(anomaly)

        goal_warning = self.warn_about_goal()
        if goal_warning:
            suggestions.append(goal_warning)

        pattern = self.suggest_based_on_pattern()
        if pattern:
            suggestions.append(pattern)

        missing = self.suggest_missing_logs()
        if missing:
            suggestions.append(missing)

        # ❌ Removed daily insight from here - it was spamming every message!
        # Daily insights should only show in greetings or when specifically requested

        return suggestions

    def get_smart_greeting(self) -> str:
        """
        Generate a smart greeting with context

        Returns:
            Personalized greeting message
        """
        import random

        # More varied, conversational greetings
        casual_greetings = [
            "Hey! What's up? 😊",
            "Cortana online. How's it going?",
            "Hey there! What can I do for you?",
            "*Boots up* Miss me? 😏",
            "Welcome back! What's on your mind?",
            "Hey! Ready to chat?",
            "Yo! What do you need?",
            "Cortana here. How can I help?",
            "Hey hey! What's happening?",
            "Greetings! How's your day going?"
        ]

        # Check for IMPORTANT context/suggestions (not just daily insights)
        # Only show critical warnings (anomalies, budget warnings, missing logs)
        suggestions = []

        anomaly = self.check_spending_anomaly()
        if anomaly:
            suggestions.append(anomaly)

        goal_warning = self.warn_about_goal()
        if goal_warning:
            suggestions.append(goal_warning)

        missing = self.suggest_missing_logs()
        if missing:
            suggestions.append(missing)

        # Only show suggestions 30% of the time, and only critical ones
        if suggestions and random.random() < 0.3:
            return f"{random.choice(casual_greetings)}\n\n{suggestions[0]}"

        return random.choice(casual_greetings)
