from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from config.database import get_db
from models.finance import FinanceRecord, TransactionType
from api.schemas import FinanceRecordCreate, FinanceRecordResponse
from typing import List
from services.report_export import ReportExporter
from datetime import datetime
from middleware.auth import get_current_user_id

router = APIRouter(prefix="/finance", tags=["finance"])


@router.post("/", response_model=FinanceRecordResponse, status_code=status.HTTP_201_CREATED)
def create_finance_record(
    record: FinanceRecordCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create a new finance record"""
    db_record = FinanceRecord(
        user_id=current_user_id,  # Use authenticated user ID from JWT
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
    # This helps the AI understand spending patterns
    if record.transaction_type == TransactionType.EXPENSE:
        try:
            from services.personal_context_service import PersonalContextService
            import logging
            logger = logging.getLogger(__name__)

            personal_context = PersonalContextService(db, current_user_id)
            # Regenerate expense insights with new data
            personal_context.generate_expense_insights(days=30)
            logger.info(f"Auto-vectorized expense for user {current_user_id}")
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
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get finance records for authenticated user"""
    # Ensure user can only access their own data
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's data"
        )
    """Get all finance records for a user"""
    records = (
        db.query(FinanceRecord)
        .filter(FinanceRecord.user_id == user_id)
        .order_by(FinanceRecord.transaction_date.desc(), FinanceRecord.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return records


@router.get("/summary/{user_id}")
def get_finance_summary(
    user_id: int,
    period: str = "monthly",
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    """Get financial summary for a user with optional custom date range"""
    from datetime import datetime, timedelta

    # Calculate date filter based on period or custom range
    now = datetime.now()

    # If custom date range is provided, use it
    if start_date and end_date:
        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    elif period == "weekly":
        start_date = now - timedelta(days=7)
        end_date = now
    elif period == "monthly":
        start_date = now - timedelta(days=30)
        end_date = now
    else:
        start_date = None  # All time
        end_date = None

    # Build base query filters
    income_filters = [
        FinanceRecord.user_id == user_id,
        FinanceRecord.transaction_type == TransactionType.INCOME
    ]
    expense_filters = [
        FinanceRecord.user_id == user_id,
        FinanceRecord.transaction_type == TransactionType.EXPENSE
    ]

    if start_date:
        income_filters.append(FinanceRecord.transaction_date >= start_date)
        expense_filters.append(FinanceRecord.transaction_date >= start_date)

    if end_date:
        income_filters.append(FinanceRecord.transaction_date <= end_date)
        expense_filters.append(FinanceRecord.transaction_date <= end_date)

    # Total income
    total_income = (
        db.query(func.sum(FinanceRecord.amount))
        .filter(*income_filters)
        .scalar() or 0.0
    )

    # Total expenses
    total_expenses = (
        db.query(func.sum(FinanceRecord.amount))
        .filter(*expense_filters)
        .scalar() or 0.0
    )

    # Expenses by category
    expenses_by_category = (
        db.query(
            FinanceRecord.category,
            func.sum(FinanceRecord.amount).label("total")
        )
        .filter(*expense_filters)
        .group_by(FinanceRecord.category)
        .all()
    )

    # Convert expenses_by_category to dict for frontend
    category_breakdown = {cat: amt for cat, amt in expenses_by_category}

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": total_income - total_expenses,
        "category_breakdown": category_breakdown,  # Frontend expects this
        "expenses_by_category": [  # Keep for backwards compatibility
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


@router.put("/{record_id}", response_model=FinanceRecordResponse)
def update_finance_record(
    record_id: int,
    record_update: FinanceRecordCreate,
    db: Session = Depends(get_db)
):
    """Update a finance record"""
    record = db.query(FinanceRecord).filter(FinanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance record not found"
        )

    # Update fields
    record.amount = record_update.amount
    record.transaction_type = record_update.transaction_type
    record.category = record_update.category
    record.description = record_update.description
    record.transaction_date = record_update.transaction_date

    db.commit()
    db.refresh(record)

    # Auto-vectorize: Update personal context after expense is edited
    # This helps the AI stay aware of current spending patterns
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"Transaction type after edit: {record.transaction_type}")

    if record.transaction_type == TransactionType.EXPENSE:
        logger.info(f"Starting auto-vectorization for edited expense (user {record.user_id})")
        try:
            from services.personal_context_service import PersonalContextService

            personal_context = PersonalContextService(db, record.user_id)
            # Regenerate expense insights with updated data
            personal_context.generate_expense_insights(days=30)
            logger.info(f"✅ Auto-vectorized after edit for user {record.user_id}")
        except Exception as e:
            # Don't fail the request if vectorization fails
            logger.warning(f"❌ Failed to auto-vectorize after edit: {e}")
    else:
        logger.info(f"Skipping vectorization - transaction is income, not expense")

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

    # Store user_id and type before deletion for AI update
    user_id = record.user_id
    transaction_type = record.transaction_type

    db.delete(record)
    db.commit()

    # Auto-vectorize: Update personal context after expense is deleted
    # This helps the AI stay aware of current spending patterns
    if transaction_type == TransactionType.EXPENSE:
        try:
            from services.personal_context_service import PersonalContextService
            import logging
            logger = logging.getLogger(__name__)

            personal_context = PersonalContextService(db, user_id)
            # Regenerate expense insights with updated data
            personal_context.generate_expense_insights(days=30)
            logger.info(f"Auto-vectorized after deletion for user {user_id}")
        except Exception as e:
            # Don't fail the request if vectorization fails
            import logging
            logging.warning(f"Failed to auto-vectorize after deletion: {e}")

    return None


@router.get("/export/{user_id}/pdf")
def export_pdf_report(
    user_id: int,
    period: str = "monthly",
    db: Session = Depends(get_db)
):
    """Export finance report as PDF"""
    import logging
    logger = logging.getLogger(__name__)

    try:
        # Get summary data
        from datetime import datetime, timedelta

        now = datetime.now()
        if period == "weekly":
            start_date = now - timedelta(days=7)
        elif period == "monthly":
            start_date = now - timedelta(days=30)
        else:
            start_date = None

        # Build filters
        income_filters = [
            FinanceRecord.user_id == user_id,
            FinanceRecord.transaction_type == TransactionType.INCOME
        ]
        expense_filters = [
            FinanceRecord.user_id == user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        ]

        if start_date:
            income_filters.append(FinanceRecord.transaction_date >= start_date)
            expense_filters.append(FinanceRecord.transaction_date >= start_date)

        # Get totals
        total_income = (
            db.query(func.sum(FinanceRecord.amount))
            .filter(*income_filters)
            .scalar() or 0.0
        )

        total_expenses = (
            db.query(func.sum(FinanceRecord.amount))
            .filter(*expense_filters)
            .scalar() or 0.0
        )

        # Get expenses by category
        expenses_by_category_raw = (
            db.query(
                FinanceRecord.category,
                func.sum(FinanceRecord.amount).label("total")
            )
            .filter(*expense_filters)
            .group_by(FinanceRecord.category)
            .all()
        )

        expenses_by_category = {cat: float(amt) for cat, amt in expenses_by_category_raw}

        # Get recent transactions
        recent_transactions_raw = (
            db.query(FinanceRecord)
            .filter(FinanceRecord.user_id == user_id)
            .order_by(FinanceRecord.transaction_date.desc())
            .limit(20)
            .all()
        )

        recent_transactions = [
            {
                "date": t.transaction_date,
                "description": t.description or f"{t.transaction_type.value} - {t.category}",
                "category": t.category,
                "amount": float(t.amount),
                "type": t.transaction_type.value
            }
            for t in recent_transactions_raw
        ]

        # Prepare summary data
        summary_data = {
            "total_income": float(total_income),
            "total_expenses": float(total_expenses),
            "net_balance": float(total_income - total_expenses),
            "expenses_by_category": expenses_by_category,
            "recent_transactions": recent_transactions
        }

        # Generate PDF
        exporter = ReportExporter()
        pdf_path = exporter.generate_pdf_report(
            summary_data=summary_data,
            user_name=f"User {user_id}",
            period=period
        )

        # Return file
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=f"finance_report_{period}_{datetime.now().strftime('%Y%m%d')}.pdf"
        )

    except Exception as e:
        logger.error(f"Failed to generate PDF report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(e)}"
        )


@router.get("/export/{user_id}/excel")
def export_excel_report(
    user_id: int,
    period: str = "monthly",
    db: Session = Depends(get_db)
):
    """Export finance report as Excel"""
    import logging
    logger = logging.getLogger(__name__)

    try:
        # Get summary data (same as PDF)
        from datetime import datetime, timedelta

        now = datetime.now()
        if period == "weekly":
            start_date = now - timedelta(days=7)
        elif period == "monthly":
            start_date = now - timedelta(days=30)
        else:
            start_date = None

        # Build filters
        income_filters = [
            FinanceRecord.user_id == user_id,
            FinanceRecord.transaction_type == TransactionType.INCOME
        ]
        expense_filters = [
            FinanceRecord.user_id == user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        ]

        if start_date:
            income_filters.append(FinanceRecord.transaction_date >= start_date)
            expense_filters.append(FinanceRecord.transaction_date >= start_date)

        # Get totals
        total_income = (
            db.query(func.sum(FinanceRecord.amount))
            .filter(*income_filters)
            .scalar() or 0.0
        )

        total_expenses = (
            db.query(func.sum(FinanceRecord.amount))
            .filter(*expense_filters)
            .scalar() or 0.0
        )

        # Get expenses by category
        expenses_by_category_raw = (
            db.query(
                FinanceRecord.category,
                func.sum(FinanceRecord.amount).label("total")
            )
            .filter(*expense_filters)
            .group_by(FinanceRecord.category)
            .all()
        )

        expenses_by_category = {cat: float(amt) for cat, amt in expenses_by_category_raw}

        # Get recent transactions
        recent_transactions_raw = (
            db.query(FinanceRecord)
            .filter(FinanceRecord.user_id == user_id)
            .order_by(FinanceRecord.transaction_date.desc())
            .limit(100)
            .all()
        )

        recent_transactions = [
            {
                "date": t.transaction_date,
                "description": t.description or f"{t.transaction_type.value} - {t.category}",
                "category": t.category,
                "amount": float(t.amount),
                "type": t.transaction_type.value
            }
            for t in recent_transactions_raw
        ]

        # Prepare summary data
        summary_data = {
            "total_income": float(total_income),
            "total_expenses": float(total_expenses),
            "net_balance": float(total_income - total_expenses),
            "expenses_by_category": expenses_by_category,
            "recent_transactions": recent_transactions
        }

        # Generate Excel
        exporter = ReportExporter()
        excel_path = exporter.generate_excel_report(
            summary_data=summary_data,
            user_name=f"User {user_id}",
            period=period
        )

        # Return file
        return FileResponse(
            path=excel_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=f"finance_report_{period}_{datetime.now().strftime('%Y%m%d')}.xlsx"
        )

    except Exception as e:
        logger.error(f"Failed to generate Excel report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Excel report: {str(e)}"
        )


@router.get("/admin/overview")
def get_admin_financial_overview(db: Session = Depends(get_db)):
    """
    Get financial overview across all users (admin only)
    Returns total income, expenses, transaction count, and top categories
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        # Get total income
        total_income = db.query(func.sum(FinanceRecord.amount)).filter(
            FinanceRecord.transaction_type == TransactionType.INCOME
        ).scalar() or 0

        # Get total expenses
        total_expenses = db.query(func.sum(FinanceRecord.amount)).filter(
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        ).scalar() or 0

        # Get total transaction count
        total_transactions = db.query(func.count(FinanceRecord.id)).scalar() or 0

        # Get top spending categories
        top_categories = db.query(
            FinanceRecord.category,
            func.sum(FinanceRecord.amount).label('total')
        ).filter(
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        ).group_by(
            FinanceRecord.category
        ).order_by(
            func.sum(FinanceRecord.amount).desc()
        ).limit(5).all()

        # Format top categories
        top_categories_list = [
            {
                "category": cat.category,
                "total": float(cat.total)
            }
            for cat in top_categories
        ]

        return {
            "total_income": float(total_income),
            "total_expenses": float(total_expenses),
            "net_balance": float(total_income - total_expenses),
            "total_transactions": total_transactions,
            "top_categories": top_categories_list
        }

    except Exception as e:
        logger.error(f"Failed to get admin financial overview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get admin financial overview: {str(e)}"
        )
