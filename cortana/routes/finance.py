from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from config.database import get_db
from models.finance import FinanceRecord, TransactionType
from api.schemas import FinanceRecordCreate, FinanceRecordResponse
from typing import List

router = APIRouter(prefix="/finance", tags=["finance"])


@router.post("/", response_model=FinanceRecordResponse, status_code=status.HTTP_201_CREATED)
def create_finance_record(
    record: FinanceRecordCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Create a new finance record"""
    db_record = FinanceRecord(
        user_id=user_id,
        amount=record.amount,
        transaction_type=record.transaction_type,
        category=record.category,
        description=record.description,
        transaction_date=record.transaction_date
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    # Auto-vectorize: Update personal context after expense is logged
    if record.transaction_type == TransactionType.EXPENSE:
        try:
            from services.personal_context_service import PersonalContextService
            import logging
            logger = logging.getLogger(__name__)

            personal_context = PersonalContextService(db, user_id)
            # Regenerate expense insights with new data
            personal_context.generate_expense_insights(days=30)
            logger.info(f"Auto-vectorized expense for user {user_id}")
        except Exception as e:
            # Don't fail the request if vectorization fails
            import logging
            logging.warning(f"Failed to auto-vectorize expense: {e}")

    return db_record


@router.get("/user/{user_id}", response_model=List[FinanceRecordResponse])
def get_user_finance_records(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all finance records for a user"""
    records = (
        db.query(FinanceRecord)
        .filter(FinanceRecord.user_id == user_id)
        .order_by(FinanceRecord.transaction_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return records


@router.get("/summary/{user_id}")
def get_finance_summary(user_id: int, db: Session = Depends(get_db)):
    """Get financial summary for a user"""
    # Total income
    total_income = (
        db.query(func.sum(FinanceRecord.amount))
        .filter(
            FinanceRecord.user_id == user_id,
            FinanceRecord.transaction_type == TransactionType.INCOME
        )
        .scalar() or 0.0
    )

    # Total expenses
    total_expenses = (
        db.query(func.sum(FinanceRecord.amount))
        .filter(
            FinanceRecord.user_id == user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        )
        .scalar() or 0.0
    )

    # Expenses by category
    expenses_by_category = (
        db.query(
            FinanceRecord.category,
            func.sum(FinanceRecord.amount).label("total")
        )
        .filter(
            FinanceRecord.user_id == user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        )
        .group_by(FinanceRecord.category)
        .all()
    )

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": total_income - total_expenses,
        "expenses_by_category": [
            {"category": cat, "amount": amt} for cat, amt in expenses_by_category
        ]
    }


@router.get("/{record_id}", response_model=FinanceRecordResponse)
def get_finance_record(record_id: int, db: Session = Depends(get_db)):
    """Get a specific finance record"""
    record = db.query(FinanceRecord).filter(FinanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance record not found"
        )
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_finance_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a finance record"""
    record = db.query(FinanceRecord).filter(FinanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance record not found"
        )

    db.delete(record)
    db.commit()
    return None
