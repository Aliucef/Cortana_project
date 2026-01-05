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


class PersonalRecord(Base):
    """Personal records (PRs) for exercises"""
    __tablename__ = "personal_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Exercise details
    exercise_name = Column(String(100), nullable=False)
    max_weight = Column(Float)  # kg - for weight-based PRs
    max_reps = Column(Integer)  # for rep-based PRs
    record_type = Column(String(20), nullable=False)  # "weight" or "reps"

    # Metadata
    achieved_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        if self.record_type == "weight":
            return f"<PersonalRecord(exercise='{self.exercise_name}', {self.max_weight}kg × {self.max_reps} reps)>"
        return f"<PersonalRecord(exercise='{self.exercise_name}', {self.max_reps} reps)>"


class WorkoutNote(Base):
    """Notes and reflections on workouts"""
    __tablename__ = "workout_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_plan_id = Column(Integer, ForeignKey("workout_plans.id"))  # Optional link to plan

    # Note details
    workout_name = Column(String(200), nullable=False)
    note = Column(Text, nullable=False)
    difficulty = Column(Integer)  # 1-5 rating
    energy = Column(Integer)  # 1-5 rating
    tags = Column(JSON)  # ["great workout", "PR", "struggled"]

    # Metadata
    workout_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<WorkoutNote(workout='{self.workout_name}', date={self.workout_date}, difficulty={self.difficulty}/5)>"


class RestDay(Base):
    """Scheduled rest days"""
    __tablename__ = "rest_days"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Rest day details
    rest_date = Column(Date, nullable=False)
    is_scheduled = Column(Boolean, default=True)  # Planned vs unplanned
    recovery_activities = Column(JSON)  # ["yoga", "walking", "stretching"]
    notes = Column(Text)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<RestDay(user_id={self.user_id}, date={self.rest_date}, scheduled={self.is_scheduled})>"


class Exercise(Base):
    """Exercise library - comprehensive database of exercises"""
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)

    # Basic details
    name = Column(String(200), nullable=False, unique=True)
    category = Column(String(50), nullable=False)  # "strength", "cardio", "flexibility"
    equipment = Column(String(100))  # "barbell", "dumbbells", "bodyweight", "machine"
    difficulty = Column(String(20))  # "beginner", "intermediate", "advanced"

    # Muscle targeting
    primary_muscles = Column(JSON)  # ["chest", "triceps"]
    secondary_muscles = Column(JSON)  # ["shoulders"]

    # Instructions
    instructions = Column(Text)  # Step-by-step instructions
    tips = Column(Text)  # Form tips and common mistakes
    video_url = Column(String(500))  # YouTube link or similar

    # Metadata
    is_system = Column(Boolean, default=True)  # System vs user-created
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Exercise(name='{self.name}', category='{self.category}', difficulty='{self.difficulty}')>"


class WorkoutTemplate(Base):
    """Pre-built workout templates (PPL, Upper/Lower, etc.)"""
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, index=True)

    # Template details
    name = Column(String(200), nullable=False)
    description = Column(Text)
    difficulty = Column(String(20))  # "beginner", "intermediate", "advanced"
    frequency = Column(String(50))  # "6 days/week", "4 days/week"
    split = Column(String(50))  # "Push/Pull/Legs", "Upper/Lower", "Full Body"
    duration = Column(String(50))  # "60-75 min", "45-60 min"
    goal = Column(String(100))  # "Muscle Gain & Strength", "Fat Loss"

    # Workout structure
    workouts = Column(JSON)  # Full template data: [{day, name, muscle_group, exercises: [...]}]

    # Metadata
    is_system = Column(Boolean, default=True)  # System vs user-created
    created_by_user_id = Column(Integer, ForeignKey("users.id"))  # For custom templates
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<WorkoutTemplate(name='{self.name}', split='{self.split}', difficulty='{self.difficulty}')>"
