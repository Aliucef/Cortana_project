"""
Proactive Notifications Service
Detects patterns and anomalies to send proactive notifications to users
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from models.user import User
from models.finance import FinanceRecord, TransactionType, Budget
from models.health import WorkoutLog, WeightLog, UserGymProfile
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class ProactiveNotificationsService:
    """
    Detects patterns and sends proactive notifications

    Analyzes user behavior to send timely, relevant notifications:
    - Workout anomalies (missed usual workout days)
    - Spending anomalies (unusual spending patterns)
    - Goal milestones (on track to hit goals)
    - Logging consistency (days since last log)
    - Streak celebrations (consistent achievements)
    """

    def __init__(self, db: Session, telegram_service=None):
        self.db = db
        self.telegram_service = telegram_service

    def check_all_users(self):
        """
        Check all users for proactive notification opportunities
        """
        try:
            logger.info("Starting proactive notifications check for all users")

            # Get all users (in production, filter for active users only)
            users = self.db.query(User).all()

            total_notifications_sent = 0
            for user in users:
                try:
                    notifications = self.check_user(user.id)
                    total_notifications_sent += len(notifications)
                except Exception as e:
                    logger.error(f"Failed to check notifications for user {user.id}: {e}")
                    # Continue with next user

            logger.info(f"Proactive notifications check completed: {total_notifications_sent} notifications sent to {len(users)} users")

        except Exception as e:
            logger.error(f"Proactive notifications check failed: {e}")

    def check_user(self, user_id: int) -> List[str]:
        """
        Check all notification triggers for a specific user

        Args:
            user_id: User's ID

        Returns:
            List of notification messages sent
        """
        logger.info(f"Checking proactive notifications for user {user_id}")

        notifications = []

        # 1. Workout reminder anomalies
        workout_notification = self._check_workout_anomaly(user_id)
        if workout_notification:
            notifications.append(workout_notification)

        # 2. Spending anomalies
        spending_notification = self._check_spending_anomaly(user_id)
        if spending_notification:
            notifications.append(spending_notification)

        # 3. Goal milestones
        milestone_notification = self._check_goal_milestone(user_id)
        if milestone_notification:
            notifications.append(milestone_notification)

        # 4. Logging consistency reminders
        consistency_notification = self._check_logging_consistency(user_id)
        if consistency_notification:
            notifications.append(consistency_notification)

        # 5. Streak celebrations
        streak_notification = self._check_streak_celebration(user_id)
        if streak_notification:
            notifications.append(streak_notification)

        # Send all notifications via Telegram
        if notifications and self.telegram_service:
            for notification in notifications:
                try:
                    self.telegram_service.send_message(user_id, notification)
                    logger.info(f"Sent proactive notification to user {user_id}")
                except Exception as e:
                    logger.warning(f"Failed to send notification to user {user_id}: {e}")

        return notifications

    def _check_workout_anomaly(self, user_id: int) -> Optional[str]:
        """
        Detect if user missed their usual workout day

        Returns notification message if anomaly detected
        """
        try:
            gym_profile = self.db.query(UserGymProfile).filter(
                UserGymProfile.user_id == user_id
            ).first()

            if not gym_profile:
                return None

            today = datetime.now().date()

            # Get workout history for last 4 weeks
            four_weeks_ago = today - timedelta(days=28)
            workouts = self.db.query(WorkoutLog).filter(
                WorkoutLog.user_id == user_id,
                WorkoutLog.workout_date >= four_weeks_ago
            ).all()

            if len(workouts) < 5:
                # Not enough data to detect patterns
                return None

            # Analyze workout days (0=Monday, 6=Sunday)
            workout_days_count = {}
            for workout in workouts:
                day_of_week = workout.workout_date.weekday()
                workout_days_count[day_of_week] = workout_days_count.get(day_of_week, 0) + 1

            # Find most common workout days (at least 2 occurrences in 4 weeks)
            common_days = {day: count for day, count in workout_days_count.items() if count >= 2}

            if not common_days:
                return None

            # Check if today is a common workout day and user hasn't logged yet
            today_weekday = today.weekday()
            if today_weekday in common_days:
                # Check if workout logged today
                today_workout = self.db.query(WorkoutLog).filter(
                    WorkoutLog.user_id == user_id,
                    func.date(WorkoutLog.workout_date) == today
                ).first()

                if not today_workout:
                    day_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][today_weekday]
                    return (
                        f"💪 **WORKOUT REMINDER**\n\n"
                        f"Hey Chief! I noticed you usually work out on {day_name}s, but haven't logged a workout yet today.\n\n"
                        f"Just a friendly nudge - your consistency has been great! 💯"
                    )

            return None

        except Exception as e:
            logger.error(f"Error checking workout anomaly for user {user_id}: {e}")
            return None

    def _check_spending_anomaly(self, user_id: int) -> Optional[str]:
        """
        Detect unusual spending patterns

        Returns notification message if anomaly detected
        """
        try:
            today = datetime.now().date()
            week_start = today - timedelta(days=7)
            last_week_start = week_start - timedelta(days=7)
            last_week_end = week_start - timedelta(days=1)

            # Get this week's spending
            this_week_spending = self.db.query(func.sum(FinanceRecord.amount)).filter(
                FinanceRecord.user_id == user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= week_start
            ).scalar() or 0.0

            # Get last 3 weeks average
            last_three_weeks_spending = self.db.query(func.sum(FinanceRecord.amount)).filter(
                FinanceRecord.user_id == user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= (today - timedelta(days=28)),
                FinanceRecord.transaction_date < week_start
            ).scalar() or 0.0

            weekly_average = last_three_weeks_spending / 3 if last_three_weeks_spending > 0 else 0

            # Alert if spending is 30%+ above average
            if weekly_average > 0 and this_week_spending > (weekly_average * 1.3):
                increase_pct = ((this_week_spending - weekly_average) / weekly_average * 100)

                # Find top category this week
                top_category = self.db.query(
                    FinanceRecord.category,
                    func.sum(FinanceRecord.amount).label('total')
                ).filter(
                    FinanceRecord.user_id == user_id,
                    FinanceRecord.transaction_type == TransactionType.EXPENSE,
                    FinanceRecord.transaction_date >= week_start
                ).group_by(FinanceRecord.category).order_by(func.sum(FinanceRecord.amount).desc()).first()

                category_name = top_category.category.value if top_category else "Unknown"

                return (
                    f"💰 **SPENDING ALERT**\n\n"
                    f"Chief, I noticed your spending this week (${this_week_spending:.2f}) is {increase_pct:.0f}% higher than your recent average (${weekly_average:.2f}).\n\n"
                    f"Biggest category: {category_name}\n\n"
                    f"Just a heads up - you might want to review your expenses! 📊"
                )

            return None

        except Exception as e:
            logger.error(f"Error checking spending anomaly for user {user_id}: {e}")
            return None

    def _check_goal_milestone(self, user_id: int) -> Optional[str]:
        """
        Detect if user is on track to hit their goals

        Returns notification message if milestone detected
        """
        try:
            gym_profile = self.db.query(UserGymProfile).filter(
                UserGymProfile.user_id == user_id
            ).first()

            if not gym_profile:
                return None

            # Get weight logs
            recent_weight = self.db.query(WeightLog).filter(
                WeightLog.user_id == user_id
            ).order_by(WeightLog.log_date.desc()).first()

            month_ago = datetime.now().date() - timedelta(days=30)
            month_ago_weight = self.db.query(WeightLog).filter(
                WeightLog.user_id == user_id,
                WeightLog.log_date <= month_ago
            ).order_by(WeightLog.log_date.desc()).first()

            if not recent_weight or not month_ago_weight:
                return None

            weight_change = recent_weight.weight - month_ago_weight.weight

            # Fat loss goal - celebrate weight loss
            if gym_profile.primary_goal.value == 'fat_loss' and weight_change < -1.5:
                # Lost more than 1.5kg in a month - great progress!
                return (
                    f"🎯 **GOAL PROGRESS MILESTONE!**\n\n"
                    f"Incredible work, Chief! You've lost {abs(weight_change):.1f} kg this month! 🔥\n\n"
                    f"You're absolutely crushing your fat loss goal. Keep this momentum going! 💪"
                )

            # Muscle gain goal - celebrate weight gain
            if gym_profile.primary_goal.value == 'muscle_gain' and weight_change > 1.0:
                # Gained more than 1kg in a month - good progress!
                return (
                    f"🎯 **GOAL PROGRESS MILESTONE!**\n\n"
                    f"Great gains, Chief! You've gained {weight_change:.1f} kg this month! 💪\n\n"
                    f"Your muscle gain goal is progressing nicely. Stay consistent! 🔥"
                )

            # Check workout consistency milestone
            thirty_days_ago = datetime.now().date() - timedelta(days=30)
            monthly_workouts = self.db.query(func.count(WorkoutLog.id)).filter(
                WorkoutLog.user_id == user_id,
                WorkoutLog.workout_date >= thirty_days_ago
            ).scalar() or 0

            # If hit 16+ workouts in a month (4/week average)
            if monthly_workouts >= 16:
                return (
                    f"🎯 **CONSISTENCY MILESTONE!**\n\n"
                    f"Wow, Chief! {monthly_workouts} workouts this month! 🔥\n\n"
                    f"Your consistency is off the charts. This is how champions are made! 💪"
                )

            return None

        except Exception as e:
            logger.error(f"Error checking goal milestone for user {user_id}: {e}")
            return None

    def _check_logging_consistency(self, user_id: int) -> Optional[str]:
        """
        Remind user to log data if they haven't in a while

        Returns notification message if reminder needed
        """
        try:
            today = datetime.now().date()

            # Check last expense log
            last_expense = self.db.query(FinanceRecord).filter(
                FinanceRecord.user_id == user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE
            ).order_by(FinanceRecord.transaction_date.desc()).first()

            if last_expense:
                days_since_expense = (today - last_expense.transaction_date).days

                # Remind if 5+ days without logging
                if days_since_expense >= 5:
                    return (
                        f"📝 **LOGGING REMINDER**\n\n"
                        f"Hey Chief! It's been {days_since_expense} days since your last expense log.\n\n"
                        f"Don't forget to track your spending - consistency is key! 💯\n\n"
                        f"Just reply with your expenses and I'll log them for you. 👍"
                    )

            # Check last workout log
            last_workout = self.db.query(WorkoutLog).filter(
                WorkoutLog.user_id == user_id
            ).order_by(WorkoutLog.workout_date.desc()).first()

            if last_workout:
                days_since_workout = (today - last_workout.workout_date).days

                # Remind if 7+ days without logging
                if days_since_workout >= 7:
                    return (
                        f"💪 **WORKOUT REMINDER**\n\n"
                        f"Chief, it's been {days_since_workout} days since your last workout log.\n\n"
                        f"Time to get back in the gym! Your future self will thank you. 🔥"
                    )

            return None

        except Exception as e:
            logger.error(f"Error checking logging consistency for user {user_id}: {e}")
            return None

    def _check_streak_celebration(self, user_id: int) -> Optional[str]:
        """
        Celebrate user streaks (consistent achievements)

        Returns notification message if streak milestone reached
        """
        try:
            today = datetime.now().date()

            # Check workout streak
            streak_days = 0
            check_date = today - timedelta(days=1)  # Start from yesterday

            while True:
                workout_on_date = self.db.query(WorkoutLog).filter(
                    WorkoutLog.user_id == user_id,
                    func.date(WorkoutLog.workout_date) == check_date
                ).first()

                if not workout_on_date:
                    break

                streak_days += 1
                check_date -= timedelta(days=1)

                # Cap at 30 days to avoid infinite loop
                if streak_days >= 30:
                    break

            # Celebrate milestone streaks
            if streak_days == 7:
                return (
                    f"🔥 **7-DAY STREAK!**\n\n"
                    f"One full week of workouts, Chief! 💪\n\n"
                    f"You're building an unstoppable habit. Keep it going! 🚀"
                )

            if streak_days == 14:
                return (
                    f"🔥 **2-WEEK STREAK!**\n\n"
                    f"14 days straight, Chief! This is legendary! 👑\n\n"
                    f"Your dedication is inspiring. Don't break the chain! 💯"
                )

            if streak_days == 21:
                return (
                    f"🔥 **3-WEEK STREAK!**\n\n"
                    f"21 days! You've officially built a habit, Chief! 🏆\n\n"
                    f"Studies show it takes 21 days to form a habit - you've done it! 💪"
                )

            if streak_days == 30:
                return (
                    f"🔥 **30-DAY STREAK!**\n\n"
                    f"ONE MONTH STRAIGHT! Chief, you're a MACHINE! 🤖\n\n"
                    f"This level of consistency is rare. You're truly elite! 👑💯"
                )

            # Check budget adherence streak (weeks under budget)
            budget = self.db.query(Budget).filter(
                Budget.user_id == user_id
            ).first()

            if budget:
                weeks_under_budget = 0
                check_week_start = today - timedelta(days=7)

                for i in range(4):  # Check last 4 weeks
                    week_start = check_week_start - timedelta(days=i*7)
                    week_end = week_start + timedelta(days=7)

                    week_spending = self.db.query(func.sum(FinanceRecord.amount)).filter(
                        FinanceRecord.user_id == user_id,
                        FinanceRecord.transaction_type == TransactionType.EXPENSE,
                        FinanceRecord.transaction_date >= week_start,
                        FinanceRecord.transaction_date < week_end
                    ).scalar() or 0.0

                    if week_spending <= budget.amount:
                        weeks_under_budget += 1
                    else:
                        break

                # Celebrate 4 weeks of budget adherence
                if weeks_under_budget >= 4:
                    return (
                        f"💰 **BUDGET STREAK!**\n\n"
                        f"4 weeks under budget, Chief! 🎯\n\n"
                        f"Your financial discipline is on point. Keep crushing it! 💯"
                    )

            return None

        except Exception as e:
            logger.error(f"Error checking streak celebration for user {user_id}: {e}")
            return None

    def get_notification_summary(self, user_id: int) -> Dict:
        """
        Get a summary of all potential notifications for a user (for debugging)

        Returns:
            Dictionary with notification check results
        """
        try:
            summary = {
                "user_id": user_id,
                "check_time": datetime.now(),
                "notifications": {
                    "workout_anomaly": self._check_workout_anomaly(user_id),
                    "spending_anomaly": self._check_spending_anomaly(user_id),
                    "goal_milestone": self._check_goal_milestone(user_id),
                    "logging_consistency": self._check_logging_consistency(user_id),
                    "streak_celebration": self._check_streak_celebration(user_id)
                }
            }

            # Count active notifications
            active_count = sum(1 for v in summary["notifications"].values() if v is not None)
            summary["active_notifications"] = active_count

            return summary

        except Exception as e:
            logger.error(f"Failed to get notification summary for user {user_id}: {e}")
            return {
                "user_id": user_id,
                "error": str(e)
            }
