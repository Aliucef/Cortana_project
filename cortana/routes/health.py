"""
Health & Gym Routes - API endpoints for gym onboarding, workouts, and tracking
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field

from config.database import get_db
from services.health_agent import HealthAgent
from services.workout_program_generator import WorkoutProgramGenerator
from models.workout import (
    UserGymProfile, WorkoutPlan, WorkoutLog, WeightLog, GymSchedule,
    WorkoutGoal, ExperienceLevel, EquipmentAccess, TrainingSplit, PreferredTime
)

router = APIRouter()


# ==================== Request/Response Models ====================

class GymProfileCreate(BaseModel):
    """Request model for creating a gym profile"""
    weight: float = Field(..., description="Weight in kg")
    height: float = Field(..., description="Height in cm")
    experience_level: str = Field(..., description="beginner, intermediate, or advanced")
    primary_goal: str = Field(..., description="muscle_gain, strength, fat_loss, or general_fitness")
    training_days_per_week: int = Field(..., ge=3, le=6, description="3-6 days per week")
    equipment_access: str = Field(..., description="full_gym, home_gym, or minimal")
    training_split: str = Field(..., description="full_body, upper_lower, push_pull_legs, or bro_split")
    preferred_time: str = Field(..., description="morning, afternoon, or evening")
    injuries_notes: Optional[str] = None


class WeightLogCreate(BaseModel):
    """Request model for logging weight"""
    weight: float = Field(..., description="Weight in kg")
    body_fat_percentage: Optional[float] = None
    measurements: Optional[dict] = None
    weigh_in_date: date
    notes: Optional[str] = None


class WorkoutLogCreate(BaseModel):
    """Request model for logging a workout"""
    workout_plan_id: Optional[int] = None
    exercise_name: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None


class GymScheduleUpdate(BaseModel):
    """Request model for updating gym schedule"""
    preferred_days: List[str] = Field(..., description="Days of the week, e.g., ['monday', 'wednesday', 'friday']")
    reminder_time_hour: int = Field(..., ge=0, le=23)
    reminder_time_minute: int = Field(default=0, ge=0, le=59)
    reminder_minutes_before: int = Field(default=30)
    weigh_in_day: str = Field(default="sunday")
    weigh_in_time_hour: int = Field(default=8, ge=0, le=23)


# ==================== Gym Profile Endpoints ====================

@router.post("/profile", tags=["gym"])
def create_gym_profile(
    user_id: int,
    profile_data: GymProfileCreate,
    db: Session = Depends(get_db)
):
    """
    Create or update a user's gym profile

    This is the manual API version - most users will use the interactive Telegram onboarding
    """
    # Check if profile exists
    existing_profile = db.query(UserGymProfile).filter(
        UserGymProfile.user_id == user_id
    ).first()

    # Calculate BMI
    height_m = profile_data.height / 100
    bmi = profile_data.weight / (height_m ** 2)

    if existing_profile:
        # Update existing profile
        existing_profile.weight = profile_data.weight
        existing_profile.height = profile_data.height
        existing_profile.bmi = round(bmi, 1)
        existing_profile.experience_level = ExperienceLevel(profile_data.experience_level)
        existing_profile.primary_goal = WorkoutGoal(profile_data.primary_goal)
        existing_profile.training_days_per_week = profile_data.training_days_per_week
        existing_profile.equipment_access = EquipmentAccess(profile_data.equipment_access)
        existing_profile.training_split = TrainingSplit(profile_data.training_split)
        existing_profile.preferred_time = PreferredTime(profile_data.preferred_time)
        existing_profile.injuries_notes = profile_data.injuries_notes
        existing_profile.onboarding_completed = True

        db.commit()
        db.refresh(existing_profile)

        return {
            "message": "Gym profile updated successfully",
            "profile": {
                "user_id": existing_profile.user_id,
                "weight": existing_profile.weight,
                "height": existing_profile.height,
                "bmi": existing_profile.bmi,
                "experience_level": existing_profile.experience_level.value,
                "primary_goal": existing_profile.primary_goal.value,
                "training_days_per_week": existing_profile.training_days_per_week,
                "equipment_access": existing_profile.equipment_access.value,
                "training_split": existing_profile.training_split.value,
                "preferred_time": existing_profile.preferred_time.value
            }
        }
    else:
        # Create new profile
        new_profile = UserGymProfile(
            user_id=user_id,
            weight=profile_data.weight,
            height=profile_data.height,
            bmi=round(bmi, 1),
            experience_level=ExperienceLevel(profile_data.experience_level),
            primary_goal=WorkoutGoal(profile_data.primary_goal),
            training_days_per_week=profile_data.training_days_per_week,
            equipment_access=EquipmentAccess(profile_data.equipment_access),
            training_split=TrainingSplit(profile_data.training_split),
            preferred_time=PreferredTime(profile_data.preferred_time),
            injuries_notes=profile_data.injuries_notes,
            onboarding_completed=True
        )

        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)

        # Generate workout program
        generator = WorkoutProgramGenerator(db)
        workout_plans = generator.generate_program(user_id, weeks=4)

        return {
            "message": "Gym profile created successfully",
            "profile": {
                "user_id": new_profile.user_id,
                "weight": new_profile.weight,
                "height": new_profile.height,
                "bmi": new_profile.bmi,
                "experience_level": new_profile.experience_level.value,
                "primary_goal": new_profile.primary_goal.value,
                "training_days_per_week": new_profile.training_days_per_week,
                "equipment_access": new_profile.equipment_access.value,
                "training_split": new_profile.training_split.value,
                "preferred_time": new_profile.preferred_time.value
            },
            "workout_plans_generated": len(workout_plans)
        }


@router.get("/profile/{user_id}", tags=["gym"])
def get_gym_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user's gym profile"""
    profile = db.query(UserGymProfile).filter(
        UserGymProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Gym profile not found. Start onboarding first!")

    return {
        "user_id": profile.user_id,
        "weight": profile.weight,
        "height": profile.height,
        "bmi": profile.bmi,
        "experience_level": profile.experience_level.value,
        "primary_goal": profile.primary_goal.value,
        "training_days_per_week": profile.training_days_per_week,
        "equipment_access": profile.equipment_access.value,
        "training_split": profile.training_split.value,
        "preferred_time": profile.preferred_time.value,
        "injuries_notes": profile.injuries_notes,
        "onboarding_completed": profile.onboarding_completed,
        "created_at": profile.created_at,
        "last_updated": profile.last_updated
    }


@router.delete("/profile/{user_id}", tags=["gym"])
def delete_gym_profile(user_id: int, db: Session = Depends(get_db)):
    """Delete user's gym profile (to restart onboarding)"""
    profile = db.query(UserGymProfile).filter(
        UserGymProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Gym profile not found")

    db.delete(profile)
    db.commit()

    return {"message": "Gym profile deleted successfully. You can now restart onboarding."}


# ==================== Workout Plan Endpoints ====================

@router.post("/workout-plan/generate/{user_id}", tags=["workout"])
def generate_workout_plan(
    user_id: int,
    weeks: int = Query(default=4, ge=1, le=12, description="Number of weeks to generate"),
    db: Session = Depends(get_db)
):
    """Generate a personalized workout plan"""
    # Check if user has a profile
    profile = db.query(UserGymProfile).filter(
        UserGymProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Gym profile not found. Complete onboarding first!"
        )

    # Delete old plans (optional - you might want to keep history)
    # db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).delete()
    # db.commit()

    # Generate new plans
    generator = WorkoutProgramGenerator(db)
    workout_plans = generator.generate_program(user_id, weeks=weeks)

    return {
        "message": f"Generated {len(workout_plans)} workout sessions",
        "weeks": weeks,
        "total_workouts": len(workout_plans)
    }


@router.get("/workout-plan/{user_id}", tags=["workout"])
def get_workout_plans(
    user_id: int,
    week_number: Optional[int] = Query(None, description="Specific week number (1-4)"),
    db: Session = Depends(get_db)
):
    """Get user's workout plans"""
    query = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id)

    if week_number:
        query = query.filter(WorkoutPlan.week_number == week_number)

    plans = query.all()

    if not plans:
        raise HTTPException(
            status_code=404,
            detail="No workout plans found. Generate a program first!"
        )

    return {
        "user_id": user_id,
        "week_number": week_number,
        "total_workouts": len(plans),
        "workouts": [
            {
                "id": plan.id,
                "week_number": plan.week_number,
                "day_of_week": plan.day_of_week,
                "muscle_group": plan.muscle_group,
                "exercises": plan.exercises,
                "completed": plan.completed,
                "completed_at": plan.completed_at
            }
            for plan in plans
        ]
    }


@router.get("/workout-plan/current/{user_id}", tags=["workout"])
def get_current_week_workouts(user_id: int, db: Session = Depends(get_db)):
    """Get this week's workout plans"""
    generator = WorkoutProgramGenerator(db)
    workouts = generator.get_current_week_workouts(user_id)

    if not workouts:
        raise HTTPException(
            status_code=404,
            detail="No workout plans found. Generate a program first!"
        )

    return {
        "user_id": user_id,
        "current_week": workouts[0].week_number if workouts else None,
        "total_workouts": len(workouts),
        "workouts": [
            {
                "id": plan.id,
                "day_of_week": plan.day_of_week,
                "muscle_group": plan.muscle_group,
                "exercises": plan.exercises,
                "completed": plan.completed
            }
            for plan in workouts
        ]
    }


@router.patch("/workout-plan/{plan_id}/complete", tags=["workout"])
def mark_workout_complete(plan_id: int, db: Session = Depends(get_db)):
    """Mark a workout plan as completed"""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    plan.completed = True
    plan.completed_at = datetime.now()
    db.commit()

    return {"message": "Workout marked as complete!", "plan_id": plan_id}


# ==================== Workout Logging Endpoints ====================

@router.post("/workout-log", tags=["workout"])
def log_workout(
    user_id: int,
    workout_data: WorkoutLogCreate,
    db: Session = Depends(get_db)
):
    """Log a completed workout"""
    workout_log = WorkoutLog(
        user_id=user_id,
        workout_plan_id=workout_data.workout_plan_id,
        exercise_name=workout_data.exercise_name,
        sets=workout_data.sets,
        reps=workout_data.reps,
        weight=workout_data.weight,
        duration_minutes=workout_data.duration_minutes,
        notes=workout_data.notes
    )

    db.add(workout_log)
    db.commit()
    db.refresh(workout_log)

    # Auto-vectorize: Update personal context after workout is logged
    try:
        from services.personal_context_service import PersonalContextService
        import logging
        logger = logging.getLogger(__name__)

        personal_context = PersonalContextService(db, user_id)
        # Vectorize this specific workout log
        personal_context.vectorize_workout_log(workout_log)
        # Also regenerate weekly summary
        personal_context.generate_weekly_workout_summary()
        logger.info(f"Auto-vectorized workout log for user {user_id}")
    except Exception as e:
        # Don't fail the request if vectorization fails
        import logging
        logging.warning(f"Failed to auto-vectorize workout: {e}")

    return {
        "message": "Workout logged successfully!",
        "log": {
            "id": workout_log.id,
            "exercise_name": workout_log.exercise_name,
            "sets": workout_log.sets,
            "reps": workout_log.reps,
            "weight": workout_log.weight,
            "logged_at": workout_log.logged_at
        }
    }


@router.get("/workout-log/{user_id}", tags=["workout"])
def get_workout_logs(
    user_id: int,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db)
):
    """Get user's workout logs"""
    logs = db.query(WorkoutLog).filter(
        WorkoutLog.user_id == user_id
    ).order_by(WorkoutLog.logged_at.desc()).limit(limit).all()

    return {
        "user_id": user_id,
        "total_logs": len(logs),
        "logs": [
            {
                "id": log.id,
                "exercise_name": log.exercise_name,
                "sets": log.sets,
                "reps": log.reps,
                "weight": log.weight,
                "duration_minutes": log.duration_minutes,
                "notes": log.notes,
                "logged_at": log.logged_at
            }
            for log in logs
        ]
    }


# ==================== Weight Tracking Endpoints ====================

@router.post("/weight-log", tags=["tracking"])
def log_weight(
    user_id: int,
    weight_data: WeightLogCreate,
    db: Session = Depends(get_db)
):
    """Log weight measurement"""
    weight_log = WeightLog(
        user_id=user_id,
        weight=weight_data.weight,
        body_fat_percentage=weight_data.body_fat_percentage,
        measurements=weight_data.measurements,
        weigh_in_date=weight_data.weigh_in_date,
        notes=weight_data.notes
    )

    db.add(weight_log)
    db.commit()
    db.refresh(weight_log)

    # Update profile weight if this is the most recent
    profile = db.query(UserGymProfile).filter(
        UserGymProfile.user_id == user_id
    ).first()

    if profile:
        # Check if this is the most recent weight
        latest_log = db.query(WeightLog).filter(
            WeightLog.user_id == user_id
        ).order_by(WeightLog.weigh_in_date.desc()).first()

        if latest_log and latest_log.id == weight_log.id:
            profile.weight = weight_data.weight
            # Recalculate BMI
            height_m = profile.height / 100
            profile.bmi = round(weight_data.weight / (height_m ** 2), 1)
            db.commit()

    # Auto-vectorize: Update personal context after weight is logged
    try:
        from services.personal_context_service import PersonalContextService
        import logging
        logger = logging.getLogger(__name__)

        personal_context = PersonalContextService(db, user_id)
        # Vectorize this specific weight log
        personal_context.vectorize_weight_log(weight_log)
        # Also regenerate progress report
        personal_context.generate_progress_report()
        logger.info(f"Auto-vectorized weight log for user {user_id}")
    except Exception as e:
        # Don't fail the request if vectorization fails
        import logging
        logging.warning(f"Failed to auto-vectorize weight log: {e}")

    return {
        "message": "Weight logged successfully!",
        "log": {
            "id": weight_log.id,
            "weight": weight_log.weight,
            "body_fat_percentage": weight_log.body_fat_percentage,
            "weigh_in_date": weight_log.weigh_in_date
        }
    }


@router.get("/weight-log/{user_id}", tags=["tracking"])
def get_weight_logs(
    user_id: int,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db)
):
    """Get user's weight tracking history"""
    logs = db.query(WeightLog).filter(
        WeightLog.user_id == user_id
    ).order_by(WeightLog.weigh_in_date.desc()).limit(limit).all()

    if not logs:
        return {
            "user_id": user_id,
            "total_logs": 0,
            "logs": []
        }

    # Calculate progress
    first_weight = logs[-1].weight
    current_weight = logs[0].weight
    change = current_weight - first_weight

    return {
        "user_id": user_id,
        "total_logs": len(logs),
        "first_weight": first_weight,
        "current_weight": current_weight,
        "total_change_kg": round(change, 1),
        "logs": [
            {
                "id": log.id,
                "weight": log.weight,
                "body_fat_percentage": log.body_fat_percentage,
                "measurements": log.measurements,
                "weigh_in_date": log.weigh_in_date,
                "notes": log.notes
            }
            for log in logs
        ]
    }


# ==================== Schedule Endpoints ====================

@router.post("/schedule", tags=["schedule"])
def update_gym_schedule(
    user_id: int,
    schedule_data: GymScheduleUpdate,
    db: Session = Depends(get_db)
):
    """Update user's gym schedule and reminder preferences"""
    # Check if schedule exists
    schedule = db.query(GymSchedule).filter(
        GymSchedule.user_id == user_id
    ).first()

    if schedule:
        # Update existing
        schedule.preferred_days = schedule_data.preferred_days
        schedule.reminder_time_hour = schedule_data.reminder_time_hour
        schedule.reminder_time_minute = schedule_data.reminder_time_minute
        schedule.reminder_minutes_before = schedule_data.reminder_minutes_before
        schedule.weigh_in_day = schedule_data.weigh_in_day
        schedule.weigh_in_time_hour = schedule_data.weigh_in_time_hour

        db.commit()
        db.refresh(schedule)

        return {"message": "Gym schedule updated successfully", "schedule_id": schedule.id}
    else:
        # Create new
        new_schedule = GymSchedule(
            user_id=user_id,
            preferred_days=schedule_data.preferred_days,
            reminder_time_hour=schedule_data.reminder_time_hour,
            reminder_time_minute=schedule_data.reminder_time_minute,
            reminder_minutes_before=schedule_data.reminder_minutes_before,
            weigh_in_day=schedule_data.weigh_in_day,
            weigh_in_time_hour=schedule_data.weigh_in_time_hour
        )

        db.add(new_schedule)
        db.commit()
        db.refresh(new_schedule)

        return {"message": "Gym schedule created successfully", "schedule_id": new_schedule.id}


@router.get("/schedule/{user_id}", tags=["schedule"])
def get_gym_schedule(user_id: int, db: Session = Depends(get_db)):
    """Get user's gym schedule"""
    schedule = db.query(GymSchedule).filter(
        GymSchedule.user_id == user_id
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Gym schedule not found")

    return {
        "user_id": schedule.user_id,
        "preferred_days": schedule.preferred_days,
        "reminder_time": f"{schedule.reminder_time_hour:02d}:{schedule.reminder_time_minute:02d}",
        "reminder_minutes_before": schedule.reminder_minutes_before,
        "weigh_in_day": schedule.weigh_in_day,
        "weigh_in_time": f"{schedule.weigh_in_time_hour:02d}:00"
    }
