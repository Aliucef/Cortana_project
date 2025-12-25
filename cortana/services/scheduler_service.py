"""
Scheduler Service - Handles automated scheduled tasks
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from services.notification_service import NotificationService
from services.finance_agent import FinanceAgent
from config.database import SessionLocal
from models.user import User
from models.user_preferences import UserSchedulePreference
from models.workout import GymSchedule, UserGymProfile, WorkoutPlan
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SchedulerService:
    """Background scheduler for automated tasks"""

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.notification_service = NotificationService()

    def daily_expense_reminder(self):
        """
        Send daily reminder to log expenses
        Runs every day at 8 PM
        """
        try:
            logger.info("Running daily expense reminder job")

            db = SessionLocal()
            try:
                # Get all users (or specific user)
                user = db.query(User).filter(User.id == 1).first()

                if user:
                    message = f"Hey {user.full_name or user.username}! 👋\n\n"
                    message += "How was your day? Ready to log today's expenses?\n\n"
                    message += "Just message me things like:\n"
                    message += "• 'I spent $25 on lunch'\n"
                    message += "• 'Got paid $3000 today'\n"
                    message += "• 'Spent 50 on groceries and 20 on gas'\n\n"
                    message += "I'll automatically track everything for you! 📊"

                    # Send via Telegram
                    from main import telegram_bot
                    from config.settings import get_settings
                    import asyncio

                    settings = get_settings()

                    try:
                        # Run coroutine in new event loop (scheduler runs in background thread)
                        asyncio.run(
                            telegram_bot.application.bot.send_message(
                                chat_id=int(settings.telegram_user_id),
                                text=message,
                                parse_mode='Markdown'
                            )
                        )
                        logger.info(f"Sent daily reminder to user {user.id} via Telegram")
                    except Exception as e:
                        logger.error(f"Error sending daily reminder: {str(e)}")
                else:
                    logger.warning("No users found for daily reminder")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in daily expense reminder: {str(e)}")

    def daily_news_briefing(self):
        """
        Send daily news briefing
        Runs every morning based on user preferences
        """
        try:
            logger.info("Running daily news briefing job")

            db = SessionLocal()
            try:
                # Get all users (or specific user)
                user = db.query(User).filter(User.id == 1).first()

                if user:
                    from services.news_aggregator_enhanced import NewsAggregatorEnhanced

                    agent = NewsAggregatorEnhanced(db, user.id)
                    news_message = agent.get_daily_briefing()

                    # Split message if needed
                    chunks = agent.split_message(news_message)
                    if not isinstance(chunks, list):
                        chunks = [chunks]

                    # Send via Telegram
                    logger.info(f"Sending daily Lebanese news briefing to user {user.id}")

                    # Send via Telegram bot
                    from main import telegram_bot
                    from config.settings import get_settings
                    import asyncio

                    settings = get_settings()

                    try:
                        # Send all chunks
                        for i, chunk in enumerate(chunks):
                            asyncio.run(
                                telegram_bot.application.bot.send_message(
                                    chat_id=int(settings.telegram_user_id),
                                    text=chunk,
                                    parse_mode='Markdown'
                                )
                            )
                            if i < len(chunks) - 1:
                                import time
                                time.sleep(0.5)  # Small delay between chunks
                        logger.info("Daily news briefing sent successfully")
                    except Exception as e:
                        logger.error(f"Error sending news briefing: {str(e)}")

                else:
                    logger.warning("No users found for news briefing")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in daily news briefing: {str(e)}")

    def weekly_financial_summary(self):
        """
        Send weekly financial summary
        Runs every Sunday at 6 PM
        """
        try:
            logger.info("Running weekly financial summary job")

            db = SessionLocal()
            try:
                # Get all users (or specific user)
                user = db.query(User).filter(User.id == 1).first()

                if user:
                    # Generate summary
                    agent = FinanceAgent(db, user.id)
                    summary_message = agent.format_summary_message(summary_type="weekly")

                    # Send via Telegram
                    from main import telegram_bot
                    from config.settings import get_settings
                    import asyncio

                    settings = get_settings()

                    try:
                        asyncio.run(
                            telegram_bot.application.bot.send_message(
                                chat_id=int(settings.telegram_user_id),
                                text=summary_message,
                                parse_mode='Markdown'
                            )
                        )
                        logger.info(f"Sent weekly summary to user {user.id} via Telegram")
                    except Exception as e:
                        logger.error(f"Error sending weekly summary: {str(e)}")
                else:
                    logger.warning("No users found for weekly summary")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in weekly financial summary: {str(e)}")

    def get_user_schedule_preferences(self, user_id: int):
        """Get user's schedule preferences or create default ones"""
        db = SessionLocal()
        try:
            prefs = db.query(UserSchedulePreference).filter(
                UserSchedulePreference.user_id == user_id
            ).first()

            if not prefs:
                # Create default preferences
                prefs = UserSchedulePreference(
                    user_id=user_id,
                    daily_reminder_hour=20,
                    daily_reminder_minute=0,
                    weekly_summary_day="sunday",
                    weekly_summary_hour=18,
                    weekly_summary_minute=0
                )
                db.add(prefs)
                db.commit()
                db.refresh(prefs)

            return prefs
        finally:
            db.close()

    def update_user_schedule(self, user_id: int, schedule_type: str, hour: int, minute: int, day_of_week: str = None):
        """Update user's schedule preferences and reschedule jobs"""
        db = SessionLocal()
        try:
            prefs = db.query(UserSchedulePreference).filter(
                UserSchedulePreference.user_id == user_id
            ).first()

            if not prefs:
                prefs = UserSchedulePreference(user_id=user_id)
                db.add(prefs)

            if schedule_type == "daily_reminder":
                prefs.daily_reminder_hour = hour
                prefs.daily_reminder_minute = minute
            elif schedule_type == "weekly_summary":
                prefs.weekly_summary_hour = hour
                prefs.weekly_summary_minute = minute
                if day_of_week:
                    prefs.weekly_summary_day = day_of_week.lower()

            db.commit()
            db.refresh(prefs)

            # Reschedule the job
            self.reschedule_jobs(user_id)

            return prefs
        finally:
            db.close()

    def reschedule_jobs(self, user_id: int):
        """Reschedule jobs based on user preferences"""
        prefs = self.get_user_schedule_preferences(user_id)

        # Reschedule daily reminder
        self.scheduler.add_job(
            self.daily_expense_reminder,
            CronTrigger(hour=prefs.daily_reminder_hour, minute=prefs.daily_reminder_minute),
            id='daily_expense_reminder',
            name='Daily Expense Reminder',
            replace_existing=True
        )

        # Reschedule weekly summary
        # Map day names to APScheduler format
        day_map = {
            'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed',
            'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat', 'sunday': 'sun'
        }
        day_abbr = day_map.get(prefs.weekly_summary_day.lower(), 'sun')

        self.scheduler.add_job(
            self.weekly_financial_summary,
            CronTrigger(
                day_of_week=day_abbr,
                hour=prefs.weekly_summary_hour,
                minute=prefs.weekly_summary_minute
            ),
            id='weekly_financial_summary',
            name='Weekly Financial Summary',
            replace_existing=True
        )

        logger.info(f"Rescheduled jobs for user {user_id}")
        logger.info(f"  - Daily reminder: Every day at {prefs.daily_reminder_hour}:{prefs.daily_reminder_minute:02d}")
        logger.info(f"  - Weekly summary: Every {prefs.weekly_summary_day} at {prefs.weekly_summary_hour}:{prefs.weekly_summary_minute:02d}")

    def gym_workout_reminder(self):
        """
        Send gym workout reminders based on user's preferred days and times
        Runs daily and checks if user should be reminded today
        """
        try:
            logger.info("Running gym workout reminder job")

            db = SessionLocal()
            try:
                # Get user (hardcoded to user 1 for now)
                user = db.query(User).filter(User.id == 1).first()

                if not user:
                    logger.warning("No users found for gym reminder")
                    return

                # Check if user has a gym profile
                gym_profile = db.query(UserGymProfile).filter(
                    UserGymProfile.user_id == user.id,
                    UserGymProfile.onboarding_completed == True
                ).first()

                if not gym_profile:
                    logger.info(f"User {user.id} has not completed gym onboarding")
                    return

                # Get gym schedule
                schedule = db.query(GymSchedule).filter(
                    GymSchedule.user_id == user.id
                ).first()

                if not schedule or not schedule.preferred_days:
                    logger.info(f"User {user.id} has no gym schedule set")
                    return

                # Check if today is a workout day
                today = datetime.now().strftime('%A').lower()  # e.g., "monday"

                if today not in [day.lower() for day in schedule.preferred_days]:
                    logger.info(f"Today ({today}) is not a workout day for user {user.id}")
                    return

                # Get today's workout plan
                from services.workout_program_generator import WorkoutProgramGenerator
                generator = WorkoutProgramGenerator(db)
                current_week_workouts = generator.get_current_week_workouts(user.id)

                today_workout = None
                for workout in current_week_workouts:
                    if workout.day_of_week.lower() == today and not workout.completed:
                        today_workout = workout
                        break

                # Build reminder message
                message = f"💪 **GYM TIME, CHIEF!**\n\n"
                message += f"Your workout starts in {schedule.reminder_minutes_before} minutes!\n\n"

                if today_workout:
                    message += f"🎯 **Today's Focus:** {today_workout.muscle_group}\n"
                    message += f"📅 Week {today_workout.week_number}\n\n"

                    # Show first 3 exercises as preview
                    if today_workout.exercises:
                        message += "**Workout Preview:**\n"
                        for i, exercise in enumerate(today_workout.exercises[:3]):
                            sets = exercise.get('sets', '?')
                            reps = exercise.get('reps', '?')
                            message += f"{i+1}. {exercise['name']} - {sets} × {reps}\n"

                        if len(today_workout.exercises) > 3:
                            message += f"...and {len(today_workout.exercises) - 3} more exercises\n"
                else:
                    message += f"Get ready for today's {today.capitalize()} workout!\n"

                message += f"\nLet's crush it! 🔥"

                # Send via Telegram
                from main import telegram_bot
                from config.settings import get_settings
                import asyncio

                settings = get_settings()

                try:
                    asyncio.run(
                        telegram_bot.application.bot.send_message(
                            chat_id=int(settings.telegram_user_id),
                            text=message,
                            parse_mode='Markdown'
                        )
                    )
                    logger.info(f"Sent gym workout reminder to user {user.id} via Telegram")
                except Exception as e:
                    logger.error(f"Error sending gym reminder: {str(e)}")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in gym workout reminder: {str(e)}")

    def weekly_weigh_in_reminder(self):
        """
        Send weekly weigh-in reminders
        Runs based on user's preferred weigh-in day
        """
        try:
            logger.info("Running weekly weigh-in reminder job")

            db = SessionLocal()
            try:
                # Get user (hardcoded to user 1 for now)
                user = db.query(User).filter(User.id == 1).first()

                if not user:
                    logger.warning("No users found for weigh-in reminder")
                    return

                # Check if user has a gym profile
                gym_profile = db.query(UserGymProfile).filter(
                    UserGymProfile.user_id == user.id,
                    UserGymProfile.onboarding_completed == True
                ).first()

                if not gym_profile:
                    logger.info(f"User {user.id} has not completed gym onboarding")
                    return

                # Get gym schedule
                schedule = db.query(GymSchedule).filter(
                    GymSchedule.user_id == user.id
                ).first()

                if not schedule:
                    logger.info(f"User {user.id} has no gym schedule set")
                    return

                # Build weigh-in reminder message
                message = f"⚖️ **WEEKLY WEIGH-IN TIME!**\n\n"
                message += f"Good morning, Chief! Time for your weekly check-in.\n\n"

                # Get last weight log
                from models.workout import WeightLog
                last_log = db.query(WeightLog).filter(
                    WeightLog.user_id == user.id
                ).order_by(WeightLog.weigh_in_date.desc()).first()

                if last_log:
                    days_since = (datetime.now().date() - last_log.weigh_in_date).days
                    message += f"📊 **Last weigh-in:** {days_since} days ago ({last_log.weight}kg)\n\n"

                message += "**Why weekly weigh-ins matter:**\n"
                message += "• Track your progress over time\n"
                message += "• Adjust your nutrition if needed\n"
                message += "• Stay accountable to your goals\n\n"
                message += "💡 *Tip: Weigh yourself first thing in the morning, after using the bathroom, before eating or drinking.*\n\n"
                message += "Reply with your weight when you're ready!\n"
                message += "Example: 'My weight is 75kg'"

                # Send via Telegram
                from main import telegram_bot
                from config.settings import get_settings
                import asyncio

                settings = get_settings()

                try:
                    asyncio.run(
                        telegram_bot.application.bot.send_message(
                            chat_id=int(settings.telegram_user_id),
                            text=message,
                            parse_mode='Markdown'
                        )
                    )
                    logger.info(f"Sent weekly weigh-in reminder to user {user.id} via Telegram")
                except Exception as e:
                    logger.error(f"Error sending weigh-in reminder: {str(e)}")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in weekly weigh-in reminder: {str(e)}")

    def weekly_progress_summary(self):
        """
        Send ENHANCED comprehensive weekly progress summary
        Includes: workout consistency trends, spending vs budget, goal progress,
        motivational messages, and actionable suggestions
        Runs every Sunday at 10 AM
        """
        try:
            logger.info("Running ENHANCED weekly progress summary job")

            db = SessionLocal()
            try:
                # Get user (hardcoded to user 1 for now)
                user = db.query(User).filter(User.id == 1).first()

                if not user:
                    logger.warning("No users found for progress summary")
                    return

                from models.finance import FinanceRecord, TransactionType
                from models.budget import Budget, CategoryGoal, BudgetPeriod
                from models.workout import UserGymProfile, WorkoutPlan, WorkoutLog, WeightLog
                from datetime import timedelta
                from sqlalchemy import func

                # Calculate date ranges
                today = datetime.now().date()
                week_start = today - timedelta(days=7)
                last_week_start = week_start - timedelta(days=7)
                last_week_end = week_start - timedelta(days=1)

                # ========== BUILD ENHANCED MESSAGE ==========
                message = f"📊 **WEEKLY PROGRESS SUMMARY**\n\n"
                message += f"Week: {week_start.strftime('%b %d')} - {today.strftime('%b %d, %Y')}\n\n"

                # ========== 1. FINANCIAL HEALTH ==========
                message += "💰 **FINANCIAL HEALTH**\n\n"

                # Get this week's spending
                this_week_spending = db.query(func.sum(FinanceRecord.amount)).filter(
                    FinanceRecord.user_id == user.id,
                    FinanceRecord.transaction_type == TransactionType.EXPENSE,
                    FinanceRecord.transaction_date >= week_start
                ).scalar() or 0.0

                # Get last week's spending
                last_week_spending = db.query(func.sum(FinanceRecord.amount)).filter(
                    FinanceRecord.user_id == user.id,
                    FinanceRecord.transaction_type == TransactionType.EXPENSE,
                    FinanceRecord.transaction_date >= last_week_start,
                    FinanceRecord.transaction_date <= last_week_end
                ).scalar() or 0.0

                # Get weekly budget
                weekly_budget = db.query(Budget).filter(
                    Budget.user_id == user.id,
                    Budget.period == BudgetPeriod.WEEKLY
                ).first()

                if weekly_budget:
                    budget_pct = (this_week_spending / weekly_budget.amount * 100) if weekly_budget.amount > 0 else 0
                    remaining = weekly_budget.amount - this_week_spending

                    if budget_pct <= 70:
                        status = "🟢 On track!"
                    elif budget_pct <= 90:
                        status = "🟡 Close to limit"
                    else:
                        status = "🔴 Over budget!"

                    message += f"Week spending: ${this_week_spending:.2f} / ${weekly_budget.amount:.2f} ({budget_pct:.0f}%)\n"
                    message += f"Status: {status}\n"
                    message += f"Remaining: ${remaining:.2f}\n"
                else:
                    message += f"Week spending: ${this_week_spending:.2f}\n"
                    message += f"*No weekly budget set*\n"

                # Week-over-week comparison
                if last_week_spending > 0:
                    change_pct = ((this_week_spending - last_week_spending) / last_week_spending * 100)
                    if change_pct > 0:
                        message += f"vs. Last week: +${abs(this_week_spending - last_week_spending):.2f} (+{change_pct:.0f}%) 📈\n"
                    else:
                        message += f"vs. Last week: -${abs(this_week_spending - last_week_spending):.2f} ({change_pct:.0f}%) 📉 Great job!\n"

                # Top spending category this week
                top_category = db.query(
                    FinanceRecord.category,
                    func.sum(FinanceRecord.amount).label('total')
                ).filter(
                    FinanceRecord.user_id == user.id,
                    FinanceRecord.transaction_type == TransactionType.EXPENSE,
                    FinanceRecord.transaction_date >= week_start
                ).group_by(FinanceRecord.category).order_by(func.sum(FinanceRecord.amount).desc()).first()

                if top_category:
                    message += f"Biggest category: {top_category[0].title()} (${top_category[1]:.2f})\n"

                message += "\n─────────────────────────\n\n"

                # ========== 2. WORKOUT CONSISTENCY ==========
                message += "💪 **WORKOUT CONSISTENCY**\n\n"

                # Get gym profile for target
                gym_profile = db.query(UserGymProfile).filter(
                    UserGymProfile.user_id == user.id
                ).first()

                # Count workouts this week
                this_week_workouts = db.query(func.count(WorkoutLog.id)).filter(
                    WorkoutLog.user_id == user.id,
                    WorkoutLog.workout_date >= week_start
                ).scalar() or 0

                # Count workouts last week
                last_week_workouts = db.query(func.count(WorkoutLog.id)).filter(
                    WorkoutLog.user_id == user.id,
                    WorkoutLog.workout_date >= last_week_start,
                    WorkoutLog.workout_date <= last_week_end
                ).scalar() or 0

                if gym_profile:
                    target = gym_profile.training_days_per_week
                    completion_pct = (this_week_workouts / target * 100) if target > 0 else 0

                    if completion_pct >= 100:
                        status = "🔥 Crushed it!"
                    elif completion_pct >= 75:
                        status = "💪 Great job!"
                    elif completion_pct >= 50:
                        status = "👍 Good effort"
                    else:
                        status = "🤔 Needs improvement"

                    message += f"This week: {this_week_workouts}/{target} workouts ({completion_pct:.0f}%)\n"
                    message += f"Status: {status}\n"
                else:
                    message += f"This week: {this_week_workouts} workouts logged\n"

                # Week-over-week trend
                if last_week_workouts > 0 or this_week_workouts > 0:
                    if this_week_workouts > last_week_workouts:
                        message += f"Trend: ↗️ +{this_week_workouts - last_week_workouts} from last week - Improving!\n"
                    elif this_week_workouts < last_week_workouts:
                        message += f"Trend: ↘️ -{last_week_workouts - this_week_workouts} from last week\n"
                    else:
                        message += f"Trend: → Same as last week - Stay consistent!\n"

                # Check for workout streak
                streak_days = 0
                check_date = today
                while True:
                    workout_on_date = db.query(WorkoutLog).filter(
                        WorkoutLog.user_id == user.id,
                        func.date(WorkoutLog.workout_date) == check_date
                    ).first()
                    if not workout_on_date:
                        break
                    streak_days += 1
                    check_date -= timedelta(days=1)
                    if streak_days >= 14:  # Cap at 2 weeks for display
                        break

                if streak_days >= 3:
                    message += f"Streak: 🔥 {streak_days} days in a row!\n"

                message += "\n─────────────────────────\n\n"

                # ========== 3. GOAL PROGRESS ==========
                message += "🎯 **GOAL PROGRESS**\n\n"

                if gym_profile and gym_profile.primary_goal:
                    # Get recent weight logs
                    recent_weight = db.query(WeightLog).filter(
                        WeightLog.user_id == user.id
                    ).order_by(WeightLog.weigh_in_date.desc()).first()

                    month_ago_weight = db.query(WeightLog).filter(
                        WeightLog.user_id == user.id,
                        WeightLog.weigh_in_date <= datetime.now() - timedelta(days=30)
                    ).order_by(WeightLog.weigh_in_date.desc()).first()

                    goal_name = gym_profile.primary_goal.value.replace('_', ' ').title()
                    message += f"Goal: {goal_name}\n"

                    if recent_weight and month_ago_weight:
                        weight_change = recent_weight.weight - month_ago_weight.weight
                        if gym_profile.primary_goal.value == 'fat_loss' and weight_change < 0:
                            message += f"Progress: {abs(weight_change):.1f} kg lost this month 📉\n"
                            # Estimate goal completion
                            if abs(weight_change) > 0:
                                weeks_to_goal = abs(gym_profile.weight - (gym_profile.weight - 10)) / (abs(weight_change) / 4)
                                message += f"Estimated: Reach goal in ~{int(weeks_to_goal)} weeks\n"
                        elif gym_profile.primary_goal.value == 'muscle_gain' and weight_change > 0:
                            message += f"Progress: {weight_change:.1f} kg gained this month 📈\n"
                        else:
                            message += f"Weight change: {weight_change:+.1f} kg this month\n"
                    else:
                        message += f"*Log weight regularly to track progress*\n"

                    # Monthly workout consistency
                    month_workouts = db.query(func.count(WorkoutLog.id)).filter(
                        WorkoutLog.user_id == user.id,
                        WorkoutLog.workout_date >= datetime.now() - timedelta(days=30)
                    ).scalar() or 0

                    if gym_profile.training_days_per_week:
                        expected_month = gym_profile.training_days_per_week * 4
                        message += f"30-day consistency: {month_workouts}/{expected_month} workouts\n"

                else:
                    message += "*Complete gym onboarding to track goals*\n"

                message += "\n─────────────────────────\n\n"

                # ========== 4. MOTIVATIONAL MESSAGE ==========
                # Determine overall performance
                finance_score = 100 if not weekly_budget else (100 - budget_pct if budget_pct <= 100 else 0)
                workout_score = completion_pct if gym_profile else (100 if this_week_workouts >= 3 else this_week_workouts * 25)
                overall_score = (finance_score + workout_score) / 2

                if overall_score >= 80:
                    motivation = "🌟 **OUTSTANDING WEEK!** You're absolutely crushing it, Chief! Your dedication is paying off. Keep this momentum going!"
                elif overall_score >= 60:
                    motivation = "💪 **SOLID WEEK!** Great progress on multiple fronts. A few tweaks and you'll be unstoppable!"
                elif overall_score >= 40:
                    motivation = "👍 **GOOD EFFORT!** You're making progress. Let's build on this momentum next week!"
                else:
                    motivation = "💪 **FRESH START!** Every week is a new opportunity. You've got this, Chief! Let's bounce back stronger!"

                message += f"{motivation}\n\n"

                # ========== 5. ACTIONABLE SUGGESTIONS ==========
                message += "💡 **SUGGESTIONS FOR NEXT WEEK**\n\n"

                suggestions = []

                # Budget-based suggestions
                if weekly_budget and budget_pct > 80:
                    suggestions.append("• Try meal prepping to reduce food spending")
                elif not weekly_budget:
                    suggestions.append("• Set a weekly budget to track spending better")

                if this_week_spending > last_week_spending * 1.2:
                    suggestions.append(f"• Spending up 20%+ - review your {top_category[0]} expenses")

                # Workout-based suggestions
                if gym_profile:
                    if this_week_workouts < gym_profile.training_days_per_week:
                        missed = gym_profile.training_days_per_week - this_week_workouts
                        suggestions.append(f"• Schedule your {missed} missed workout(s) for next week")

                    if streak_days == 0 and last_week_workouts > 0:
                        suggestions.append("• Start a new workout streak - consistency is key!")

                if not suggestions:
                    suggestions.append("• Keep doing what you're doing - you're on track!")

                message += "\n".join(suggestions)

                message += "\n\n💪 **Ready to dominate next week? Let's go! 🚀**"

                # Send via Telegram
                from main import telegram_bot
                from config.settings import get_settings
                import asyncio

                settings = get_settings()

                try:
                    asyncio.run(
                        telegram_bot.application.bot.send_message(
                            chat_id=int(settings.telegram_user_id),
                            text=message,
                            parse_mode='Markdown'
                        )
                    )
                    logger.info(f"Sent ENHANCED weekly progress summary to user {user.id} via Telegram")
                except Exception as e:
                    logger.error(f"Error sending progress summary: {str(e)}")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in weekly progress summary: {str(e)}")

    def daily_consolidation(self):
        """
        Daily consolidation of personal context
        Runs every day at midnight to regenerate all summaries
        """
        try:
            logger.info("Running daily consolidation job")

            from services.daily_consolidation_service import DailyConsolidationService

            db = SessionLocal()
            try:
                consolidation_service = DailyConsolidationService(db)
                consolidation_service.consolidate_all_users()
                logger.info("Daily consolidation completed successfully")
            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in daily consolidation: {str(e)}")

    def proactive_notifications_check(self):
        """
        Check for proactive notification opportunities
        Runs twice daily (10 AM and 6 PM) to detect patterns and anomalies
        """
        try:
            logger.info("Running proactive notifications check")

            from services.proactive_notifications_service import ProactiveNotificationsService
            from services.telegram_service import TelegramService

            db = SessionLocal()
            try:
                # Initialize Telegram service for sending notifications
                telegram_service = TelegramService()

                # Initialize proactive notifications service
                notifications_service = ProactiveNotificationsService(db, telegram_service)

                # Check all users for notification opportunities
                notifications_service.check_all_users()

                logger.info("Proactive notifications check completed successfully")
            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in proactive notifications check: {str(e)}")

    def weekly_workout_summary(self):
        """
        Send weekly workout completion summary
        Runs every Sunday evening
        """
        try:
            logger.info("Running weekly workout summary job")

            db = SessionLocal()
            try:
                # Get user (hardcoded to user 1 for now)
                user = db.query(User).filter(User.id == 1).first()

                if not user:
                    logger.warning("No users found for workout summary")
                    return

                # Check if user has a gym profile
                gym_profile = db.query(UserGymProfile).filter(
                    UserGymProfile.user_id == user.id,
                    UserGymProfile.onboarding_completed == True
                ).first()

                if not gym_profile:
                    return

                # Get this week's workouts
                from services.workout_program_generator import WorkoutProgramGenerator
                generator = WorkoutProgramGenerator(db)
                current_week_workouts = generator.get_current_week_workouts(user.id)

                if not current_week_workouts:
                    return

                # Calculate stats
                total_workouts = len(current_week_workouts)
                completed_workouts = sum(1 for w in current_week_workouts if w.completed)
                completion_rate = (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0

                # Build summary message
                message = f"📊 **WEEKLY WORKOUT SUMMARY**\n\n"
                message += f"Week {current_week_workouts[0].week_number} - {gym_profile.training_split.value.replace('_', ' ').title()}\n\n"

                message += f"**Completion Rate:** {completed_workouts}/{total_workouts} workouts ({completion_rate:.0f}%)\n\n"

                # Progress bar
                if completion_rate >= 80:
                    message += "🔥🔥🔥 CRUSHING IT! Keep up the amazing work!\n\n"
                elif completion_rate >= 60:
                    message += "💪 Great job! You're staying consistent!\n\n"
                elif completion_rate >= 40:
                    message += "👍 Good effort! Let's push for more next week!\n\n"
                else:
                    message += "🤔 Rough week? No worries, let's bounce back stronger!\n\n"

                # List workouts
                message += "**This Week's Sessions:**\n"
                for workout in current_week_workouts:
                    status = "✅" if workout.completed else "⬜"
                    message += f"{status} {workout.day_of_week.title()} - {workout.muscle_group}\n"

                message += f"\n💪 **{gym_profile.primary_goal.value.replace('_', ' ').title()} Goal**\n"
                message += f"Training {gym_profile.training_days_per_week} days/week\n\n"
                message += "Ready to dominate next week? Let's go! 🚀"

                # Send via Telegram
                from main import telegram_bot
                from config.settings import get_settings
                import asyncio

                settings = get_settings()

                try:
                    asyncio.run(
                        telegram_bot.application.bot.send_message(
                            chat_id=int(settings.telegram_user_id),
                            text=message,
                            parse_mode='Markdown'
                        )
                    )
                    logger.info(f"Sent weekly workout summary to user {user.id} via Telegram")
                except Exception as e:
                    logger.error(f"Error sending workout summary: {str(e)}")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in weekly workout summary: {str(e)}")

    def start(self):
        """Start the scheduler"""
        # Get user preferences (default to user 1)
        prefs = self.get_user_schedule_preferences(user_id=1)

        # Daily reminder
        self.scheduler.add_job(
            self.daily_expense_reminder,
            CronTrigger(hour=prefs.daily_reminder_hour, minute=prefs.daily_reminder_minute),
            id='daily_expense_reminder',
            name='Daily Expense Reminder',
            replace_existing=True
        )

        # Daily news briefing (8 AM by default)
        self.scheduler.add_job(
            self.daily_news_briefing,
            CronTrigger(hour=8, minute=0),
            id='daily_news_briefing',
            name='Daily News Briefing',
            replace_existing=True
        )

        # Weekly summary
        day_map = {
            'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed',
            'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat', 'sunday': 'sun'
        }
        day_abbr = day_map.get(prefs.weekly_summary_day.lower(), 'sun')

        self.scheduler.add_job(
            self.weekly_financial_summary,
            CronTrigger(
                day_of_week=day_abbr,
                hour=prefs.weekly_summary_hour,
                minute=prefs.weekly_summary_minute
            ),
            id='weekly_financial_summary',
            name='Weekly Financial Summary',
            replace_existing=True
        )

        # Gym reminder - check daily at configured time (default 6 PM)
        # This will check if today is a workout day and send reminder
        self.scheduler.add_job(
            self.gym_workout_reminder,
            CronTrigger(hour=18, minute=0),  # 6 PM by default
            id='gym_workout_reminder',
            name='Gym Workout Reminder',
            replace_existing=True
        )

        # Weekly weigh-in reminder - Sunday morning at 8 AM by default
        self.scheduler.add_job(
            self.weekly_weigh_in_reminder,
            CronTrigger(day_of_week='sun', hour=8, minute=0),
            id='weekly_weigh_in_reminder',
            name='Weekly Weigh-In Reminder',
            replace_existing=True
        )

        # Weekly workout summary - Sunday evening at 7 PM
        self.scheduler.add_job(
            self.weekly_workout_summary,
            CronTrigger(day_of_week='sun', hour=19, minute=0),
            id='weekly_workout_summary',
            name='Weekly Workout Summary',
            replace_existing=True
        )

        # Weekly progress summary (comprehensive) - Sunday morning at 10 AM
        self.scheduler.add_job(
            self.weekly_progress_summary,
            CronTrigger(day_of_week='sun', hour=10, minute=0),
            id='weekly_progress_summary',
            name='Weekly Progress Summary',
            replace_existing=True
        )

        # Daily consolidation - Midnight every day
        self.scheduler.add_job(
            self.daily_consolidation,
            CronTrigger(hour=0, minute=0),
            id='daily_consolidation',
            name='Daily Consolidation',
            replace_existing=True
        )

        # Proactive notifications - Twice daily at 10 AM and 6 PM
        self.scheduler.add_job(
            self.proactive_notifications_check,
            CronTrigger(hour=10, minute=0),
            id='proactive_notifications_morning',
            name='Proactive Notifications (Morning)',
            replace_existing=True
        )

        self.scheduler.add_job(
            self.proactive_notifications_check,
            CronTrigger(hour=18, minute=0),
            id='proactive_notifications_evening',
            name='Proactive Notifications (Evening)',
            replace_existing=True
        )

        self.scheduler.start()
        logger.info("Scheduler started successfully")
        logger.info("Jobs scheduled:")
        logger.info(f"  - Daily consolidation: Every day at 12:00 AM (midnight)")
        logger.info(f"  - Proactive notifications: Every day at 10:00 AM and 6:00 PM")
        logger.info(f"  - Daily news briefing: Every day at 8:00 AM")
        logger.info(f"  - Daily reminder: Every day at {prefs.daily_reminder_hour}:{prefs.daily_reminder_minute:02d}")
        logger.info(f"  - Weekly summary: Every {prefs.weekly_summary_day} at {prefs.weekly_summary_hour}:{prefs.weekly_summary_minute:02d}")
        logger.info(f"  - Gym workout reminder: Every day at 6:00 PM")
        logger.info(f"  - Weekly weigh-in: Every Sunday at 8:00 AM")
        logger.info(f"  - Weekly workout summary: Every Sunday at 7:00 PM")
        logger.info(f"  - Weekly progress summary: Every Sunday at 10:00 AM")

    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")

    def trigger_daily_reminder_now(self):
        """Manually trigger daily reminder (for testing)"""
        logger.info("Manually triggering daily reminder")
        self.daily_expense_reminder()

    def trigger_weekly_summary_now(self):
        """Manually trigger weekly summary (for testing)"""
        logger.info("Manually triggering weekly summary")
        self.weekly_financial_summary()

    def trigger_gym_reminder_now(self):
        """Manually trigger gym workout reminder (for testing)"""
        logger.info("Manually triggering gym workout reminder")
        self.gym_workout_reminder()

    def trigger_weigh_in_reminder_now(self):
        """Manually trigger weigh-in reminder (for testing)"""
        logger.info("Manually triggering weigh-in reminder")
        self.weekly_weigh_in_reminder()

    def trigger_workout_summary_now(self):
        """Manually trigger weekly workout summary (for testing)"""
        logger.info("Manually triggering weekly workout summary")
        self.weekly_workout_summary()
