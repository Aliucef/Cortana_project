from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
from config.database import get_db
from models.workout import WorkoutPlan
from api.schemas import WorkoutPlanCreate, WorkoutPlanResponse
from typing import List

router = APIRouter(prefix="/workout", tags=["workout"])


@router.delete("/bulk-delete/{user_id}")
def delete_all_workouts(user_id: int, db: Session = Depends(get_db)):
    """Delete all workout plans for a user"""
    deleted_count = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).delete()
    db.commit()
    return JSONResponse(
        status_code=200,
        content={"message": f"Deleted {deleted_count} workout plans", "count": deleted_count}
    )


@router.post("/", response_model=WorkoutPlanResponse, status_code=status.HTTP_201_CREATED)
def create_workout_plan(
    plan: WorkoutPlanCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Create a new workout plan"""
    db_plan = WorkoutPlan(
        user_id=user_id,
        goal=plan.goal,
        day_of_week=plan.day_of_week,
        routine=plan.routine
    )

    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    return db_plan


@router.get("/user/{user_id}", response_model=List[WorkoutPlanResponse])
def get_user_workout_plans(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all workout plans for a user"""
    plans = (
        db.query(WorkoutPlan)
        .filter(WorkoutPlan.user_id == user_id)
        .order_by(WorkoutPlan.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return plans


@router.get("/{plan_id}", response_model=WorkoutPlanResponse)
def get_workout_plan(plan_id: int, db: Session = Depends(get_db)):
    """Get a specific workout plan"""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )
    return plan


@router.patch("/{plan_id}/complete", response_model=WorkoutPlanResponse)
def mark_workout_complete(plan_id: int, db: Session = Depends(get_db)):
    """Mark a workout plan as completed"""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )

    plan.completed = True
    plan.completed_at = datetime.now()

    db.commit()
    db.refresh(plan)

    return plan


@router.put("/{plan_id}", response_model=WorkoutPlanResponse)
def update_workout_plan(
    plan_id: int,
    plan_update: dict,
    db: Session = Depends(get_db)
):
    """Update a workout plan"""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )

    # Update fields if provided
    for key, value in plan_update.items():
        if hasattr(plan, key):
            setattr(plan, key, value)

    db.commit()
    db.refresh(plan)

    return plan


@router.delete("/{plan_id}")
def delete_workout_plan(plan_id: int, db: Session = Depends(get_db)):
    """Delete a workout plan"""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )

    db.delete(plan)
    db.commit()
    return JSONResponse(
        status_code=200,
        content={"message": "Workout plan deleted successfully", "plan_id": plan_id}
    )
