"""
Recurring Expense Service - Manage subscriptions and recurring bills
"""
from sqlalchemy.orm import Session
from models.recurring_expense import RecurringExpense, RecurrenceFrequency
from models.finance import FinanceRecord, TransactionType
from datetime import datetime, timedelta
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class RecurringExpenseService:
    """Service to manage recurring expenses"""

    def __init__(self, db: Session):
        self.db = db

    def add_recurring_expense(
        self,
        user_id: int,
        name: str,
        amount: float,
        category: str,
        frequency: str,
        start_date: datetime = None
    ) -> RecurringExpense:
        """
        Add a new recurring expense

        Args:
            user_id: User ID
            name: Name of recurring expense (e.g., "Netflix")
            amount: Amount to charge
            category: Category (e.g., "entertainment")
            frequency: "daily", "weekly", "monthly", "yearly"
            start_date: First due date (defaults to today)

        Returns:
            Created RecurringExpense object
        """
        if start_date is None:
            start_date = datetime.now()

        recurring_expense = RecurringExpense(
            user_id=user_id,
            name=name,
            amount=amount,
            category=category,
            frequency=RecurrenceFrequency(frequency),
            next_due_date=start_date,
            is_active=1
        )

        self.db.add(recurring_expense)
        self.db.commit()
        self.db.refresh(recurring_expense)

        logger.info(f"Added recurring expense: {name} - ${amount} {frequency}")
        return recurring_expense

    def get_user_recurring_expenses(self, user_id: int, active_only: bool = True) -> List[RecurringExpense]:
        """Get all recurring expenses for a user"""
        query = self.db.query(RecurringExpense).filter(
            RecurringExpense.user_id == user_id
        )

        if active_only:
            query = query.filter(RecurringExpense.is_active == 1)

        return query.all()

    def get_upcoming_recurring_expenses(self, user_id: int, days: int = 7) -> List[Dict]:
        """
        Get recurring expenses due within the next N days

        Args:
            user_id: User ID
            days: Number of days to look ahead

        Returns:
            List of upcoming recurring expenses
        """
        end_date = datetime.now() + timedelta(days=days)

        upcoming = self.db.query(RecurringExpense).filter(
            RecurringExpense.user_id == user_id,
            RecurringExpense.is_active == 1,
            RecurringExpense.next_due_date <= end_date
        ).all()

        results = []
        for expense in upcoming:
            days_until_due = (expense.next_due_date - datetime.now()).days

            results.append({
                "id": expense.id,
                "name": expense.name,
                "amount": expense.amount,
                "category": expense.category,
                "frequency": expense.frequency.value,
                "next_due_date": expense.next_due_date,
                "days_until_due": days_until_due
            })

        return results

    def process_due_recurring_expenses(self, user_id: int):
        """
        Check for and process any recurring expenses that are due

        This should be called daily by the scheduler
        """
        now = datetime.now()

        due_expenses = self.db.query(RecurringExpense).filter(
            RecurringExpense.user_id == user_id,
            RecurringExpense.is_active == 1,
            RecurringExpense.next_due_date <= now
        ).all()

        processed = []

        for expense in due_expenses:
            # Create a transaction
            transaction = FinanceRecord(
                user_id=user_id,
                amount=expense.amount,
                transaction_type=TransactionType.EXPENSE,
                category=expense.category,
                description=f"{expense.name} (recurring)",
                transaction_date=expense.next_due_date
            )

            self.db.add(transaction)

            # Update next due date
            if expense.frequency == RecurrenceFrequency.DAILY:
                expense.next_due_date += timedelta(days=1)
            elif expense.frequency == RecurrenceFrequency.WEEKLY:
                expense.next_due_date += timedelta(weeks=1)
            elif expense.frequency == RecurrenceFrequency.MONTHLY:
                # Add one month
                month = expense.next_due_date.month
                year = expense.next_due_date.year
                if month == 12:
                    month = 1
                    year += 1
                else:
                    month += 1
                expense.next_due_date = expense.next_due_date.replace(month=month, year=year)
            elif expense.frequency == RecurrenceFrequency.YEARLY:
                expense.next_due_date = expense.next_due_date.replace(year=expense.next_due_date.year + 1)

            processed.append({
                "name": expense.name,
                "amount": expense.amount,
                "next_due_date": expense.next_due_date
            })

        self.db.commit()

        logger.info(f"Processed {len(processed)} recurring expenses for user {user_id}")
        return processed

    def delete_recurring_expense(self, user_id: int, expense_id: int) -> bool:
        """Delete (deactivate) a recurring expense"""
        expense = self.db.query(RecurringExpense).filter(
            RecurringExpense.id == expense_id,
            RecurringExpense.user_id == user_id
        ).first()

        if expense:
            expense.is_active = 0
            self.db.commit()
            logger.info(f"Deactivated recurring expense: {expense.name}")
            return True

        return False

    def format_recurring_expenses_message(self, user_id: int) -> str:
        """Format a message showing all recurring expenses"""
        expenses = self.get_user_recurring_expenses(user_id)

        if not expenses:
            return "You don't have any recurring expenses set up yet.\n\nAdd one by saying: 'Add Netflix subscription for $15 monthly'"

        message = "💳 *Your Recurring Expenses*\n\n"

        # Group by frequency
        by_frequency = {
            "monthly": [],
            "weekly": [],
            "yearly": [],
            "daily": []
        }

        for expense in expenses:
            by_frequency[expense.frequency.value].append(expense)

        total_monthly = 0

        for freq in ["monthly", "weekly", "yearly", "daily"]:
            if by_frequency[freq]:
                message += f"*{freq.capitalize()}:*\n"

                for expense in by_frequency[freq]:
                    days_until = (expense.next_due_date - datetime.now()).days

                    if days_until <= 0:
                        due_str = "⚠️ DUE NOW"
                    elif days_until == 1:
                        due_str = "⏰ Due tomorrow"
                    else:
                        due_str = f"Due in {days_until} days"

                    message += f"• {expense.name}: ${expense.amount:.2f} - {due_str}\n"

                    # Calculate monthly equivalent
                    if freq == "monthly":
                        total_monthly += expense.amount
                    elif freq == "weekly":
                        total_monthly += expense.amount * 4.33
                    elif freq == "yearly":
                        total_monthly += expense.amount / 12
                    elif freq == "daily":
                        total_monthly += expense.amount * 30

                message += "\n"

        message += f"📊 *Total Monthly Cost:* ${total_monthly:.2f}\n"
        message += f"📅 *Total Yearly Cost:* ${total_monthly * 12:.2f}\n\n"

        message += "To remove a subscription, say: 'Cancel my Netflix subscription'"

        return message
