from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Enum, Float, Date, JSON, ARRAY
from sqlalchemy.sql import func
import enum
from config.database import Base


class WorkoutGoal(enum.Enum):
    MUSCLE_GAIN = "muscle_gain"
    STRENGTH = "strength"
    FAT_LOSS = "fat_loss"
    GENERAL_FITNESS = "general_fitness"


class ExperienceLevel(enum.Enum):
    BEGINNER = "beginner"  # 0-6 months
    INTERMEDIATE = "intermediate"  # 6 months - 2 years
    ADVANCED = "advanced"  # 2+ years


class EquipmentAccess(enum.Enum):
    FULL_GYM = "full_gym"
    HOME_GYM = "home_gym"
    MINIMAL = "minimal"


class TrainingSplit(enum.Enum):
    FULL_BODY = "full_body"
    UPPER_LOWER = "upper_lower"
    PUSH_PULL_LEGS = "push_pull_legs"
    BRO_SPLIT = "bro_split"


class PreferredTime(enum.Enum):
    MORNING = "morning"  # 6am-10am
    AFTERNOON = "afternoon"  # 12pm-4pm
    EVENING = "evening"  # 5pm-9pm


class UserGymProfile(Base):
    """User's gym profile from onboarding - determines their personalized program"""
    __tablename__ = "user_gym_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # Physical stats
    weight = Column(Float, nullable=False)  # kg
    height = Column(Float, nullable=False)  # cm
    bmi = Column(Float)  # calculated automatically

    # Training profile
    experience_level = Column(Enum(ExperienceLevel, values_callable=lambda x: [e.value for e in x]), nullable=False)
    primary_goal = Column(Enum(WorkoutGoal, values_callable=lambda x: [e.value for e in x]), nullable=False)
    training_days_per_week = Column(Integer, nullable=False)  # 3-6
    equipment_access = Column(Enum(EquipmentAccess, values_callable=lambda x: [e.value for e in x]), nullable=False)
    training_split = Column(Enum(TrainingSplit, values_callable=lambda x: [e.value for e in x]), nullable=False)

    # Preferences & constraints
    preferred_time = Column(Enum(PreferredTime, values_callable=lambda x: [e.value for e in x]), nullable=False)
    injuries_notes = Column(Text)  # "bad knee", "shoulder issues", etc.

    # Metadata
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<UserGymProfile(user_id={self.user_id}, goal={self.primary_goal.value}, days={self.training_days_per_week})>"


class WorkoutPlan(Base):
    """Generated workout plans based on user's profile"""
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Plan details
    week_number = Column(Integer, nullable=False)  # Progressive weeks (1, 2, 3, 4...)
    day_of_week = Column(String(20), nullable=False)  # "monday", "tuesday", etc.
    muscle_group = Column(String(50))  # "Upper Body", "Lower Body", "Push", "Pull", "Legs"
    exercises = Column(JSON)  # [{name, sets, reps, rest_seconds, notes}, ...]

    # Tracking
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<WorkoutPlan(id={self.id}, week={self.week_number}, day='{self.day_of_week}', muscle='{self.muscle_group}')>"


class WorkoutLog(Base):
    """Individual exercise logs - tracks actual performance"""
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_plan_id = Column(Integer, ForeignKey("workout_plans.id"))  # Optional link to plan

    # Exercise details
    exercise_name = Column(String(100), nullable=False)
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Float)  # kg
    duration_minutes = Column(Integer)  # for cardio
    notes = Column(Text)  # "felt easy", "struggled", etc.

    # Metadata
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<WorkoutLog(exercise='{self.exercise_name}', sets={self.sets}, reps={self.reps}, weight={self.weight}kg)>"


class WeightLog(Base):
    """Weight tracking over time"""
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Weight data
    weight = Column(Float, nullable=False)  # kg
    body_fat_percentage = Column(Float)  # optional
    measurements = Column(JSON)  # optional: {chest, waist, arms, legs, etc.}

    # Metadata
    weigh_in_date = Column(Date, nullable=False)
    notes = Column(Text)  # "feeling bloated", "after cheat day", etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<WeightLog(user_id={self.user_id}, weight={self.weight}kg, date={self.weigh_in_date})>"


class GymSchedule(Base):
    """User's gym schedule preferences - for smart reminders"""
    __tablename__ = "gym_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # Schedule preferences
    preferred_days = Column(ARRAY(String))  # ["monday", "tuesday", "thursday", "friday"]
    reminder_time_hour = Column(Integer)  # 18 for 6pm
    reminder_time_minute = Column(Integer, default=0)
    reminder_minutes_before = Column(Integer, default=30)  # Remind 30 min before

    # Weekly check-in
    weigh_in_day = Column(String(20), default="sunday")  # Weekly weigh-in day
    weigh_in_time_hour = Column(Integer, default=8)  # 8am

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<GymSchedule(user_id={self.user_id}, days={self.preferred_days})>"
