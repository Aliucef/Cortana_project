"""
Recurring Expenses endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from models.recurring_expense import RecurringExpense, RecurrenceFrequency
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/recurring-expenses", tags=["recurring-expenses"])


class RecurringExpenseCreate(BaseModel):
    user_id: int
    name: str
    amount: float
    category: str
    frequency: str  # "daily", "weekly", "monthly", "yearly"
    next_due_date: str
    reminder_days_before: int = 1


class RecurringExpenseResponse(BaseModel):
    id: int
    user_id: int
    name: str
    amount: float
    category: str
    frequency: str
    next_due_date: datetime
    reminder_days_before: int
    is_active: int
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=RecurringExpenseResponse)
def create_recurring_expense(
    expense: RecurringExpenseCreate,
    db: Session = Depends(get_db)
):
    """Create a new recurring expense"""
    new_expense = RecurringExpense(
        user_id=expense.user_id,
        name=expense.name,
        amount=expense.amount,
        category=expense.category,
        frequency=RecurrenceFrequency(expense.frequency),
        next_due_date=datetime.fromisoformat(expense.next_due_date.replace('Z', '+00:00')),
        reminder_days_before=expense.reminder_days_before,
        is_active=1
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.get("/user/{user_id}", response_model=List[RecurringExpenseResponse])
def get_user_recurring_expenses(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all recurring expenses for a user"""
    expenses = db.query(RecurringExpense).filter(
        RecurringExpense.user_id == user_id,
        RecurringExpense.is_active == 1
    ).all()
    return expenses


@router.put("/{expense_id}", response_model=RecurringExpenseResponse)
def update_recurring_expense(
    expense_id: int,
    expense_update: RecurringExpenseCreate,
    db: Session = Depends(get_db)
):
    """Update a recurring expense"""
    expense = db.query(RecurringExpense).filter(
        RecurringExpense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring expense not found"
        )

    expense.name = expense_update.name
    expense.amount = expense_update.amount
    expense.category = expense_update.category
    expense.frequency = RecurrenceFrequency(expense_update.frequency)
    expense.next_due_date = datetime.fromisoformat(expense_update.next_due_date.replace('Z', '+00:00'))
    expense.reminder_days_before = expense_update.reminder_days_before

    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_recurring_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    """Delete (deactivate) a recurring expense"""
    expense = db.query(RecurringExpense).filter(
        RecurringExpense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring expense not found"
        )

    # Soft delete by setting is_active to 0
    expense.is_active = 0
    db.commit()
    return {"message": "Recurring expense deleted successfully"}


@router.post("/{expense_id}/process")
def process_recurring_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    """Manually process a recurring expense (create transaction and update next due date)"""
    from models.finance import FinanceRecord, TransactionType

    expense = db.query(RecurringExpense).filter(
        RecurringExpense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring expense not found"
        )

    # Create finance record
    new_record = FinanceRecord(
        user_id=expense.user_id,
        amount=expense.amount,
        transaction_type=TransactionType.EXPENSE,
        category=expense.category,
        description=f"{expense.name} (Recurring)",
        transaction_date=datetime.now()
    )
    db.add(new_record)

    # Update next due date based on frequency
    if expense.frequency == RecurrenceFrequency.DAILY:
        expense.next_due_date = expense.next_due_date + timedelta(days=1)
    elif expense.frequency == RecurrenceFrequency.WEEKLY:
        expense.next_due_date = expense.next_due_date + timedelta(weeks=1)
    elif expense.frequency == RecurrenceFrequency.MONTHLY:
        # Add one month (approximate)
        expense.next_due_date = expense.next_due_date + timedelta(days=30)
    elif expense.frequency == RecurrenceFrequency.YEARLY:
        expense.next_due_date = expense.next_due_date + timedelta(days=365)

    db.commit()
    db.refresh(expense)
    db.refresh(new_record)

    return {
        "message": "Recurring expense processed successfully",
        "transaction_id": new_record.id,
        "next_due_date": expense.next_due_date
    }
