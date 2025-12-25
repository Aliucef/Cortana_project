"""
Recurring Expense Model - Track subscriptions and recurring bills
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from config.database import Base
from datetime import datetime
import enum


class RecurrenceFrequency(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class RecurringExpense(Base):
    """Model for recurring expenses like subscriptions"""

    __tablename__ = "recurring_expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)  # e.g., "Netflix", "Rent"
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    frequency = Column(Enum(RecurrenceFrequency), nullable=False)
    next_due_date = Column(DateTime, nullable=False)
    reminder_days_before = Column(Integer, default=1)  # Remind 1 day before
    is_active = Column(Integer, default=1)  # Active/Inactive
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = relationship("User", back_populates="recurring_expenses")

    def __repr__(self):
        return f"<RecurringExpense {self.name} - ${self.amount} {self.frequency.value}>"
