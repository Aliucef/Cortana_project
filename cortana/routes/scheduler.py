"""
Scheduler management endpoints
"""
from fastapi import APIRouter, Depends
from services.scheduler_service import SchedulerService

router = APIRouter(prefix="/scheduler", tags=["scheduler"])

# Get scheduler instance from app state
def get_scheduler() -> SchedulerService:
    from main import scheduler
    return scheduler


@router.post("/trigger/daily-reminder")
def trigger_daily_reminder(scheduler: SchedulerService = Depends(get_scheduler)):
    """Manually trigger the daily expense reminder (for testing)"""
    scheduler.trigger_daily_reminder_now()
    return {"message": "Daily reminder triggered successfully"}


@router.post("/trigger/weekly-summary")
def trigger_weekly_summary(scheduler: SchedulerService = Depends(get_scheduler)):
    """Manually trigger the weekly financial summary (for testing)"""
    scheduler.trigger_weekly_summary_now()
    return {"message": "Weekly summary triggered successfully"}


@router.get("/status")
def get_scheduler_status(scheduler: SchedulerService = Depends(get_scheduler)):
    """Get scheduler status and list of jobs"""
    jobs = []
    for job in scheduler.scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": str(job.next_run_time) if job.next_run_time else None
        })

    return {
        "running": scheduler.scheduler.running,
        "jobs": jobs
    }
