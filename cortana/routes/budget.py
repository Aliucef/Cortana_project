"""
Budget and Category Goals endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from models.budget import Budget, CategoryGoal, BudgetPeriod
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/budget", tags=["budget"])


class BudgetCreate(BaseModel):
    user_id: int
    amount: float
    period: str = "monthly"  # weekly, monthly, yearly


class CategoryGoalCreate(BaseModel):
    user_id: int
    category: str
    goal_amount: float
    period: str = "monthly"
    alert_threshold: float = 0.8  # Alert at 80% by default


class BudgetResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    period: str

    class Config:
        from_attributes = True


class CategoryGoalResponse(BaseModel):
    id: int
    user_id: int
    category: str
    goal_amount: float
    period: str
    alert_threshold: float

    class Config:
        from_attributes = True


@router.post("/", response_model=BudgetResponse)
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    """
    Create or update overall budget
    """
    # Check if budget already exists for this user
    existing = db.query(Budget).filter(
        Budget.user_id == budget.user_id,
        Budget.period == BudgetPeriod(budget.period)
    ).first()

    if existing:
        # Update existing budget
        existing.amount = budget.amount
        db.commit()
        db.refresh(existing)

        # Auto-vectorize: Update personal context after budget is updated
        try:
            from services.personal_context_service import PersonalContextService
            import logging
            logger = logging.getLogger(__name__)

            personal_context = PersonalContextService(db, budget.user_id)
            personal_context.vectorize_budget_context(existing)
            logger.info(f"Auto-vectorized budget update for user {budget.user_id}")
        except Exception as e:
            import logging
            logging.warning(f"Failed to auto-vectorize budget: {e}")

        return existing
    else:
        # Create new budget
        new_budget = Budget(
            user_id=budget.user_id,
            amount=budget.amount,
            period=BudgetPeriod(budget.period)
        )
        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)

        # Auto-vectorize: Update personal context after budget is created
        try:
            from services.personal_context_service import PersonalContextService
            import logging
            logger = logging.getLogger(__name__)

            personal_context = PersonalContextService(db, budget.user_id)
            personal_context.vectorize_budget_context(new_budget)
            logger.info(f"Auto-vectorized new budget for user {budget.user_id}")
        except Exception as e:
            import logging
            logging.warning(f"Failed to auto-vectorize budget: {e}")

        return new_budget


@router.get("/{user_id}", response_model=List[BudgetResponse])
def get_user_budgets(user_id: int, db: Session = Depends(get_db)):
    """
    Get all budgets for a user
    """
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    return budgets


@router.post("/category-goal", response_model=CategoryGoalResponse)
def create_category_goal(goal: CategoryGoalCreate, db: Session = Depends(get_db)):
    """
    Create or update category spending goal
    """
    # Check if goal already exists for this category
    existing = db.query(CategoryGoal).filter(
        CategoryGoal.user_id == goal.user_id,
        CategoryGoal.category == goal.category,
        CategoryGoal.period == BudgetPeriod(goal.period)
    ).first()

    if existing:
        # Update existing goal
        existing.goal_amount = goal.goal_amount
        existing.alert_threshold = goal.alert_threshold
        db.commit()
        db.refresh(existing)

        # Auto-vectorize: Update personal context after category goal is updated
        try:
            from services.personal_context_service import PersonalContextService
            import logging
            logger = logging.getLogger(__name__)

            personal_context = PersonalContextService(db, goal.user_id)
            personal_context.vectorize_budget_context(existing)
            logger.info(f"Auto-vectorized category goal update for user {goal.user_id}")
        except Exception as e:
            import logging
            logging.warning(f"Failed to auto-vectorize category goal: {e}")

        return existing
    else:
        # Create new goal
        new_goal = CategoryGoal(
            user_id=goal.user_id,
            category=goal.category,
            goal_amount=goal.goal_amount,
            period=BudgetPeriod(goal.period),
            alert_threshold=goal.alert_threshold
        )
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)

        # Auto-vectorize: Update personal context after category goal is created
        try:
            from services.personal_context_service import PersonalContextService
            import logging
            logger = logging.getLogger(__name__)

            personal_context = PersonalContextService(db, goal.user_id)
            personal_context.vectorize_budget_context(new_goal)
            logger.info(f"Auto-vectorized new category goal for user {goal.user_id}")
        except Exception as e:
            import logging
            logging.warning(f"Failed to auto-vectorize category goal: {e}")

        return new_goal


@router.get("/category-goal/{user_id}", response_model=List[CategoryGoalResponse])
def get_user_category_goals(user_id: int, db: Session = Depends(get_db)):
    """
    Get all category goals for a user
    """
    goals = db.query(CategoryGoal).filter(CategoryGoal.user_id == user_id).all()
    return goals


@router.delete("/category-goal/{goal_id}")
def delete_category_goal(goal_id: int, db: Session = Depends(get_db)):
    """
    Delete a category goal
    """
    goal = db.query(CategoryGoal).filter(CategoryGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category goal not found"
        )

    db.delete(goal)
    db.commit()
    return {"message": "Category goal deleted successfully"}


@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    """
    Delete a budget
    """
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}
