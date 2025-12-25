from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from config.database import Base


class TransactionType(enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class FinanceRecord(Base):
    __tablename__ = "finance_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount = Column(Float, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    category = Column(String(50), nullable=False)  # e.g., "food", "transport", "salary"
    description = Column(String(255))
    transaction_date = Column(DateTime(timezone=True), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<FinanceRecord(id={self.id}, type={self.transaction_type.value}, amount={self.amount}, category='{self.category}')>"
