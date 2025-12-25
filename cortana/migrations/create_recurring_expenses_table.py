"""
Database migration script to create recurring_expenses table
Run this manually with: python -m migrations.create_recurring_expenses_table
Or just run it from Python:
>>> from migrations.create_recurring_expenses_table import create_table
>>> create_table()
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Enum, ForeignKey
from config.settings import get_settings
from config.database import Base
from models.user import User  # Import to register the table with Base metadata
from datetime import datetime
import enum

settings = get_settings()


class RecurrenceFrequency(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class RecurringExpense(Base):
    """Model for recurring expenses"""
    __tablename__ = "recurring_expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    frequency = Column(Enum(RecurrenceFrequency), nullable=False)
    next_due_date = Column(DateTime, nullable=False)
    reminder_days_before = Column(Integer, default=1)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


def create_table():
    """Create the recurring_expenses table"""
    engine = create_engine(settings.database_url)

    print("Creating recurring_expenses table...")
    Base.metadata.create_all(bind=engine, tables=[RecurringExpense.__table__])
    print("recurring_expenses table created successfully!")


if __name__ == "__main__":
    create_table()
