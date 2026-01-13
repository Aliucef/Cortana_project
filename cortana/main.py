from fastapi import FastAPI
# Force reload after workout.py changes
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine, Base
from config.settings import get_settings
from routes import users, finance, news, workout, finance_agent, ai_chat, budget, health, recurring_expenses, health_dashboard, auth, notifications
from routes import scheduler as scheduler_routes
from services.scheduler_service import SchedulerService
from services.telegram_service import TelegramService
import asyncio
import threading

# Import models to ensure they're registered
from models.budget import Budget, CategoryGoal
from models.user_preferences import UserSchedulePreference
from models.telegram_link import TelegramLink
from models.notification import Notification
from models.workout import (
    UserGymProfile, WorkoutPlan, WorkoutLog, WeightLog, GymSchedule,
    PersonalRecord, WorkoutNote, RestDay, Exercise, WorkoutTemplate
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize settings
settings = get_settings()

# Initialize scheduler
scheduler = SchedulerService()

# Initialize Telegram bot
telegram_bot = TelegramService()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Personal AI Assistant - Multi-agent system for managing your daily life"
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Start scheduler and Telegram bot when app starts"""
    scheduler.start()

    # Start Telegram bot in background
    if settings.telegram_bot_token:
        asyncio.create_task(telegram_bot.start_polling())
        print("✅ Telegram bot started!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Stop scheduler and Telegram bot when app shuts down"""
    scheduler.stop()

    # Stop Telegram bot
    if telegram_bot.application:
        await telegram_bot.stop_polling()
        print("Telegram bot stopped!")

# CORS middleware (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(finance.router)
app.include_router(news.router)
app.include_router(workout.router)
app.include_router(finance_agent.router)
app.include_router(ai_chat.router)
app.include_router(budget.router)
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(health_dashboard.router, prefix="/health", tags=["health-dashboard"])
app.include_router(scheduler_routes.router)
app.include_router(recurring_expenses.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Cortana AI Assistant API",
        "version": settings.app_version,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8888,
        reload=settings.debug
    )
