"""
Health Dashboard API Routes - Endpoints for the health dashboard frontend
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from typing import List, Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel, Field

from config.database import get_db
from models.workout import (
    PersonalRecord, WorkoutNote, RestDay, Exercise, WorkoutTemplate,
    WorkoutPlan, WorkoutLog, WeightLog, UserGymProfile
)

router = APIRouter()


# ==================== Request/Response Models ====================

class PersonalRecordCreate(BaseModel):
    exercise_name: str
    max_weight: Optional[float] = None
    max_reps: int
    record_type: str  # "weight" or "reps"
    achieved_date: date


class WorkoutNoteCreate(BaseModel):
    workout_plan_id: Optional[int] = None
    workout_name: str
    note: str
    difficulty: int = Field(..., ge=1, le=5)
    energy: int = Field(..., ge=1, le=5)
    tags: Optional[List[str]] = []
    workout_date: date


class RestDayCreate(BaseModel):
    rest_date: date
    is_scheduled: bool = True
    recovery_activities: Optional[List[str]] = []
    notes: Optional[str] = None


class BodyMeasurementCreate(BaseModel):
    weight: float
    body_fat: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    arms: Optional[float] = None
    legs: Optional[float] = None
    weigh_in_date: date


class WorkoutStatsResponse(BaseModel):
    totalWorkouts: int
    currentStreak: int
    completedThisWeek: int
    totalThisWeek: int
    currentWeight: float
    weightChange: float


# ==================== Stats & Overview ====================

@router.get("/stats/{user_id}", response_model=WorkoutStatsResponse, tags=["dashboard"])
def get_workout_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user's workout statistics for dashboard overview"""

    # Total workouts
    total_workouts = db.query(WorkoutLog).filter(WorkoutLog.user_id == user_id).count()

    # Current streak (consecutive days with workouts)
    current_streak = calculate_workout_streak(user_id, db)

    # This week's workouts
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    completed_this_week = db.query(WorkoutPlan).filter(
        and_(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.completed == True,
            WorkoutPlan.completed_at >= week_start,
            WorkoutPlan.completed_at <= week_end
        )
    ).count()

    total_this_week = db.query(WorkoutPlan).filter(
        and_(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.created_at >= week_start,
            WorkoutPlan.created_at <= week_end
        )
    ).count()

    # Current weight and change
    latest_weight = db.query(WeightLog).filter(
        WeightLog.user_id == user_id
    ).order_by(desc(WeightLog.weigh_in_date)).first()

    first_weight = db.query(WeightLog).filter(
        WeightLog.user_id == user_id
    ).order_by(WeightLog.weigh_in_date).first()

    current_weight = latest_weight.weight if latest_weight else 0
    weight_change = (latest_weight.weight - first_weight.weight) if (latest_weight and first_weight) else 0

    return {
        "totalWorkouts": total_workouts,
        "currentStreak": current_streak,
        "completedThisWeek": completed_this_week,
        "totalThisWeek": total_this_week,
        "currentWeight": round(current_weight, 1),
        "weightChange": round(weight_change, 1)
    }


def calculate_workout_streak(user_id: int, db: Session) -> int:
    """Calculate consecutive days with workout logs"""
    logs = db.query(func.date(WorkoutLog.logged_at).label('workout_date')).filter(
        WorkoutLog.user_id == user_id
    ).distinct().order_by(desc('workout_date')).all()

    if not logs:
        return 0

    streak = 1
    current_date = logs[0].workout_date

    for log in logs[1:]:
        expected_date = current_date - timedelta(days=1)
        if log.workout_date == expected_date:
            streak += 1
            current_date = log.workout_date
        else:
            break

    return streak


# ==================== Personal Records ====================

@router.get("/records/{user_id}", tags=["dashboard"])
def get_personal_records(user_id: int, db: Session = Depends(get_db)):
    """Get all personal records for a user"""
    records = db.query(PersonalRecord).filter(
        PersonalRecord.user_id == user_id
    ).order_by(desc(PersonalRecord.achieved_date)).all()

    return [{
        "id": pr.id,
        "exercise": pr.exercise_name,
        "maxWeight": pr.max_weight,
        "maxReps": pr.max_reps,
        "type": pr.record_type,
        "date": pr.achieved_date.isoformat()
    } for pr in records]


@router.post("/records", tags=["dashboard"])
def add_personal_record(
    user_id: int,
    record: PersonalRecordCreate,
    db: Session = Depends(get_db)
):
    """Add a new personal record"""
    new_record = PersonalRecord(
        user_id=user_id,
        exercise_name=record.exercise_name,
        max_weight=record.max_weight,
        max_reps=record.max_reps,
        record_type=record.record_type,
        achieved_date=record.achieved_date
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {"id": new_record.id, "message": "Personal record added successfully"}


@router.delete("/records/{record_id}", tags=["dashboard"])
def delete_personal_record(record_id: int, user_id: int, db: Session = Depends(get_db)):
    """Delete a personal record"""
    record = db.query(PersonalRecord).filter(
        and_(PersonalRecord.id == record_id, PersonalRecord.user_id == user_id)
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Personal record not found")

    db.delete(record)
    db.commit()

    return {"message": "Personal record deleted successfully"}


# ==================== Body Measurements ====================

@router.get("/measurements/{user_id}", tags=["dashboard"])
def get_body_measurements(user_id: int, db: Session = Depends(get_db)):
    """Get all body measurements for a user"""
    measurements = db.query(WeightLog).filter(
        WeightLog.user_id == user_id
    ).order_by(WeightLog.weigh_in_date).all()

    return [{
        "id": m.id,
        "date": m.weigh_in_date.isoformat(),
        "weight": m.weight,
        "bodyFat": m.body_fat_percentage,
        "chest": m.measurements.get("chest") if m.measurements else None,
        "waist": m.measurements.get("waist") if m.measurements else None,
        "hips": m.measurements.get("hips") if m.measurements else None,
        "arms": m.measurements.get("arms") if m.measurements else None,
        "legs": m.measurements.get("legs") if m.measurements else None,
    } for m in measurements]


@router.post("/measurements", tags=["dashboard"])
def add_body_measurement(
    user_id: int,
    measurement: BodyMeasurementCreate,
    db: Session = Depends(get_db)
):
    """Add a new body measurement"""
    measurements_dict = {}
    if measurement.chest:
        measurements_dict["chest"] = measurement.chest
    if measurement.waist:
        measurements_dict["waist"] = measurement.waist
    if measurement.hips:
        measurements_dict["hips"] = measurement.hips
    if measurement.arms:
        measurements_dict["arms"] = measurement.arms
    if measurement.legs:
        measurements_dict["legs"] = measurement.legs

    new_measurement = WeightLog(
        user_id=user_id,
        weight=measurement.weight,
        body_fat_percentage=measurement.body_fat,
        measurements=measurements_dict if measurements_dict else None,
        weigh_in_date=measurement.weigh_in_date
    )
    db.add(new_measurement)
    db.commit()
    db.refresh(new_measurement)

    return {"id": new_measurement.id, "message": "Body measurement added successfully"}


@router.get("/measurements/latest/{user_id}", tags=["dashboard"])
def get_latest_measurement(user_id: int, db: Session = Depends(get_db)):
    """Get user's latest body measurement"""
    latest = db.query(WeightLog).filter(
        WeightLog.user_id == user_id
    ).order_by(desc(WeightLog.weigh_in_date)).first()

    if not latest:
        raise HTTPException(status_code=404, detail="No measurements found")

    return {
        "id": latest.id,
        "date": latest.weigh_in_date.isoformat(),
        "weight": latest.weight,
        "bodyFat": latest.body_fat_percentage,
        "chest": latest.measurements.get("chest") if latest.measurements else None,
        "waist": latest.measurements.get("waist") if latest.measurements else None,
        "hips": latest.measurements.get("hips") if latest.measurements else None,
        "arms": latest.measurements.get("arms") if latest.measurements else None,
        "legs": latest.measurements.get("legs") if latest.measurements else None,
    }


# ==================== Workout Notes ====================

@router.get("/notes/{user_id}", tags=["dashboard"])
def get_workout_notes(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """Get workout notes for a user"""
    notes = db.query(WorkoutNote).filter(
        WorkoutNote.user_id == user_id
    ).order_by(desc(WorkoutNote.workout_date)).limit(limit).all()

    return [{
        "id": note.id,
        "date": note.workout_date.isoformat(),
        "workoutName": note.workout_name,
        "note": note.note,
        "difficulty": note.difficulty,
        "energy": note.energy,
        "tags": note.tags or []
    } for note in notes]


@router.post("/notes", tags=["dashboard"])
def add_workout_note(
    user_id: int,
    note: WorkoutNoteCreate,
    db: Session = Depends(get_db)
):
    """Add a new workout note"""
    new_note = WorkoutNote(
        user_id=user_id,
        workout_plan_id=note.workout_plan_id,
        workout_name=note.workout_name,
        note=note.note,
        difficulty=note.difficulty,
        energy=note.energy,
        tags=note.tags,
        workout_date=note.workout_date
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return {"id": new_note.id, "message": "Workout note added successfully"}


@router.delete("/notes/{note_id}", tags=["dashboard"])
def delete_workout_note(note_id: int, user_id: int, db: Session = Depends(get_db)):
    """Delete a workout note"""
    note = db.query(WorkoutNote).filter(
        and_(WorkoutNote.id == note_id, WorkoutNote.user_id == user_id)
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Workout note not found")

    db.delete(note)
    db.commit()

    return {"message": "Workout note deleted successfully"}


# ==================== Rest Days ====================

@router.get("/rest-days/{user_id}", tags=["dashboard"])
def get_rest_days(user_id: int, db: Session = Depends(get_db)):
    """Get all rest days for a user"""
    rest_days = db.query(RestDay).filter(
        RestDay.user_id == user_id
    ).order_by(desc(RestDay.rest_date)).all()

    return [{
        "id": rd.id,
        "date": rd.rest_date.isoformat(),
        "isScheduled": rd.is_scheduled,
        "recoveryActivities": rd.recovery_activities or [],
        "notes": rd.notes
    } for rd in rest_days]


@router.post("/rest-days", tags=["dashboard"])
def add_rest_day(
    user_id: int,
    rest_day: RestDayCreate,
    db: Session = Depends(get_db)
):
    """Schedule a rest day"""
    # Check if rest day already exists
    existing = db.query(RestDay).filter(
        and_(RestDay.user_id == user_id, RestDay.rest_date == rest_day.rest_date)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Rest day already scheduled for this date")

    new_rest_day = RestDay(
        user_id=user_id,
        rest_date=rest_day.rest_date,
        is_scheduled=rest_day.is_scheduled,
        recovery_activities=rest_day.recovery_activities,
        notes=rest_day.notes
    )
    db.add(new_rest_day)
    db.commit()
    db.refresh(new_rest_day)

    return {"id": new_rest_day.id, "message": "Rest day scheduled successfully"}


@router.delete("/rest-days/{rest_day_id}", tags=["dashboard"])
def delete_rest_day(rest_day_id: int, user_id: int, db: Session = Depends(get_db)):
    """Remove a rest day"""
    rest_day = db.query(RestDay).filter(
        and_(RestDay.id == rest_day_id, RestDay.user_id == user_id)
    ).first()

    if not rest_day:
        raise HTTPException(status_code=404, detail="Rest day not found")

    db.delete(rest_day)
    db.commit()

    return {"message": "Rest day removed successfully"}


# ==================== Exercise Library ====================

@router.get("/exercises", tags=["dashboard"])
def get_exercises(
    category: Optional[str] = None,
    equipment: Optional[str] = None,
    difficulty: Optional[str] = None,
    muscle: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get exercises from library with optional filters"""
    query = db.query(Exercise)

    if category:
        query = query.filter(Exercise.category == category)
    if equipment:
        query = query.filter(Exercise.equipment == equipment)
    if difficulty:
        query = query.filter(Exercise.difficulty == difficulty)
    if muscle:
        # Search in primary_muscles JSON array
        query = query.filter(Exercise.primary_muscles.contains([muscle]))
    if search:
        query = query.filter(Exercise.name.ilike(f"%{search}%"))

    exercises = query.limit(limit).all()

    return [{
        "id": ex.id,
        "name": ex.name,
        "category": ex.category,
        "equipment": ex.equipment,
        "difficulty": ex.difficulty,
        "primaryMuscles": ex.primary_muscles or [],
        "secondaryMuscles": ex.secondary_muscles or [],
        "instructions": ex.instructions,
        "tips": ex.tips,
        "videoUrl": ex.video_url
    } for ex in exercises]


@router.get("/exercises/{exercise_id}", tags=["dashboard"])
def get_exercise_detail(exercise_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific exercise"""
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    return {
        "id": exercise.id,
        "name": exercise.name,
        "category": exercise.category,
        "equipment": exercise.equipment,
        "difficulty": exercise.difficulty,
        "primaryMuscles": exercise.primary_muscles or [],
        "secondaryMuscles": exercise.secondary_muscles or [],
        "instructions": exercise.instructions,
        "tips": exercise.tips,
        "videoUrl": exercise.video_url
    }


# ==================== Workout Templates ====================

@router.get("/templates", tags=["dashboard"])
def get_workout_templates(db: Session = Depends(get_db)):
    """Get all workout templates"""
    templates = db.query(WorkoutTemplate).filter(
        WorkoutTemplate.is_system == True
    ).all()

    return [{
        "id": t.id,
        "name": t.name,
        "description": t.description,
        "difficulty": t.difficulty,
        "frequency": t.frequency,
        "split": t.split,
        "duration": t.duration,
        "goal": t.goal,
        "workouts": t.workouts
    } for t in templates]


@router.get("/templates/{template_id}", tags=["dashboard"])
def get_template_detail(template_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a template"""
    template = db.query(WorkoutTemplate).filter(
        WorkoutTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "difficulty": template.difficulty,
        "frequency": template.frequency,
        "split": template.split,
        "duration": template.duration,
        "goal": template.goal,
        "workouts": template.workouts
    }


# ==================== Calendar ====================

@router.get("/calendar/{user_id}", tags=["dashboard"])
def get_calendar_data(
    user_id: int,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020),
    db: Session = Depends(get_db)
):
    """Get workout calendar data for a specific month"""
    # Get first and last day of month
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)

    # Get all workout plans for the month
    workouts = db.query(WorkoutPlan).filter(
        and_(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.created_at >= first_day,
            WorkoutPlan.created_at <= last_day
        )
    ).all()

    calendar_data = []
    for workout in workouts:
        calendar_data.append({
            "date": workout.created_at.date().isoformat(),
            "type": workout.muscle_group,
            "completed": workout.completed,
            "muscleGroup": workout.muscle_group
        })

    return calendar_data


# ==================== Workouts (Current Week) ====================

@router.get("/workouts/current-week/{user_id}", tags=["dashboard"])
def get_current_week_workouts(user_id: int, db: Session = Depends(get_db)):
    """Get this week's scheduled workouts"""
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    workouts = db.query(WorkoutPlan).filter(
        and_(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.created_at >= week_start,
            WorkoutPlan.created_at <= week_end
        )
    ).order_by(WorkoutPlan.created_at).all()

    return [{
        "id": w.id,
        "day": w.day_of_week,
        "muscleGroup": w.muscle_group,
        "exercises": w.exercises,
        "completed": w.completed,
        "completedAt": w.completed_at.isoformat() if w.completed_at else None
    } for w in workouts]


# ==================== Workout History ====================

@router.get("/history/{user_id}", tags=["dashboard"])
def get_workout_history(
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    date_filter: Optional[str] = None,  # "week", "month", "all"
    db: Session = Depends(get_db)
):
    """Get workout history with pagination and filters"""
    query = db.query(WorkoutLog).filter(WorkoutLog.user_id == user_id)

    # Date filter
    if date_filter == "week":
        week_ago = datetime.now() - timedelta(days=7)
        query = query.filter(WorkoutLog.logged_at >= week_ago)
    elif date_filter == "month":
        month_ago = datetime.now() - timedelta(days=30)
        query = query.filter(WorkoutLog.logged_at >= month_ago)

    # Search filter
    if search:
        query = query.filter(WorkoutLog.exercise_name.ilike(f"%{search}%"))

    total = query.count()
    logs = query.order_by(desc(WorkoutLog.logged_at)).offset(skip).limit(limit).all()

    return {
        "total": total,
        "logs": [{
            "id": log.id,
            "exerciseName": log.exercise_name,
            "sets": log.sets,
            "reps": log.reps,
            "weight": log.weight,
            "durationMinutes": log.duration_minutes,
            "notes": log.notes,
            "loggedAt": log.logged_at.isoformat()
        } for log in logs]
    }
