from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from models.finance import TransactionType
from models.workout import WorkoutGoal


# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    phone_number: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Finance Schemas
class FinanceRecordCreate(BaseModel):
    amount: float
    transaction_type: TransactionType
    category: str
    description: Optional[str] = None
    transaction_date: datetime


class FinanceRecordResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    transaction_type: TransactionType
    category: str
    description: Optional[str]
    transaction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# News Preferences Schemas
class NewsPreferenceCreate(BaseModel):
    categories: str  # comma-separated
    keywords: Optional[str] = None
    country: str = "us"
    language: str = "en"
    morning_summary_enabled: bool = True
    preferred_time: str = "08:00"


class NewsPreferenceResponse(BaseModel):
    id: int
    user_id: int
    categories: str
    keywords: Optional[str]
    country: str
    language: str
    morning_summary_enabled: bool
    preferred_time: str
    created_at: datetime

    class Config:
        from_attributes = True


# Workout Plan Schemas
class WorkoutPlanCreate(BaseModel):
    goal: WorkoutGoal
    day_of_week: str
    routine: str


class WorkoutPlanResponse(BaseModel):
    id: int
    user_id: int
    goal: WorkoutGoal
    day_of_week: str
    routine: str
    completed: bool
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
