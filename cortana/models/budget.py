"""
Budget and Category Goals Models
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from config.database import Base
import enum


class BudgetPeriod(enum.Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Budget(Base):
    """
    Overall budget model - track total spending limits
    """
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)  # Budget amount
    period = Column(Enum(BudgetPeriod), default=BudgetPeriod.MONTHLY)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Budget(id={self.id}, user_id={self.user_id}, amount=${self.amount}, period={self.period.value})>"


class CategoryGoal(Base):
    """
    Category-specific spending goals
    Example: "I want to spend max $500 on food per month"
    """
    __tablename__ = "category_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False)  # food, transport, utilities, etc.
    goal_amount = Column(Float, nullable=False)  # Maximum amount to spend in this category
    period = Column(Enum(BudgetPeriod), default=BudgetPeriod.MONTHLY)
    alert_threshold = Column(Float, default=0.8)  # Alert when 80% of goal is reached

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<CategoryGoal(id={self.id}, category='{self.category}', goal=${self.goal_amount}, period={self.period.value})>"
