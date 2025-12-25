"""
Personal Context Service - Vectorizes user's personal data for RAG
Auto-vectorizes workout logs, expense patterns, conversations, and progress
"""

from services.vector_store import VectorStore
from sqlalchemy.orm import Session
from models.workout import WorkoutLog, WeightLog, UserGymProfile
from models.finance import FinanceRecord
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class PersonalContextService:
    """
    Manages personal context vectorization for enhanced RAG

    Features:
    - Auto-vectorize workout logs
    - Auto-vectorize expense patterns
    - Generate and vectorize progress summaries
    - Keep personal context fresh and searchable
    """

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        # Use separate vector store for personal context
        self.vector_store = VectorStore(store_path=f"data/personal_context/user_{user_id}")

    def vectorize_workout_log(self, workout_log: WorkoutLog):
        """
        Vectorize a single workout log entry

        Args:
            workout_log: WorkoutLog object to vectorize
        """
        try:
            # Create searchable text from workout log
            text = f"""
**Workout Log Entry**
Date: {workout_log.logged_at.strftime('%Y-%m-%d %H:%M')}
Exercise: {workout_log.exercise_name}
Performance: {workout_log.sets} sets × {workout_log.reps} reps
Weight: {workout_log.weight}kg
Duration: {workout_log.duration_minutes} minutes
User Notes: {workout_log.notes or 'No notes'}

Context: This is a personal workout log showing actual performance and feelings about the exercise.
"""

            metadata = {
                "type": "workout_log",
                "user_id": self.user_id,
                "exercise": workout_log.exercise_name,
                "date": workout_log.logged_at.isoformat(),
                "weight": workout_log.weight,
                "sets": workout_log.sets,
                "reps": workout_log.reps
            }

            self.vector_store.add_documents([text], [metadata])
            logger.info(f"Vectorized workout log: {workout_log.exercise_name} on {workout_log.logged_at}")

        except Exception as e:
            logger.error(f"Error vectorizing workout log: {e}")

    def vectorize_weight_progress(self, weight_log: WeightLog):
        """Vectorize weight tracking entry"""
        try:
            text = f"""
**Weight Tracking Entry**
Date: {weight_log.weigh_in_date}
Weight: {weight_log.weight}kg
Body Fat: {weight_log.body_fat_percentage}%
Notes: {weight_log.notes or 'No notes'}

Context: This is a personal weight tracking entry showing progress over time.
"""

            metadata = {
                "type": "weight_log",
                "user_id": self.user_id,
                "date": weight_log.weigh_in_date.isoformat(),
                "weight": weight_log.weight
            }

            self.vector_store.add_documents([text], [metadata])
            logger.info(f"Vectorized weight log: {weight_log.weight}kg on {weight_log.weigh_in_date}")

        except Exception as e:
            logger.error(f"Error vectorizing weight log: {e}")

    def generate_weekly_workout_summary(self) -> str:
        """
        Generate and vectorize weekly workout summary

        Returns:
            Summary text
        """
        try:
            # Get last 7 days of workouts
            week_ago = datetime.now() - timedelta(days=7)
            workouts = self.db.query(WorkoutLog).filter(
                WorkoutLog.user_id == self.user_id,
                WorkoutLog.logged_at >= week_ago
            ).all()

            if not workouts:
                return "No workouts logged this week"

            # Analyze workout data
            total_workouts = len(workouts)
            exercises_done = list(set(w.exercise_name for w in workouts))
            total_volume = sum((w.sets or 0) * (w.reps or 0) * (w.weight or 0) for w in workouts)

            # Create summary
            summary = f"""
**Weekly Workout Summary**
Week of: {week_ago.strftime('%Y-%m-%d')} to {datetime.now().strftime('%Y-%m-%d')}
User ID: {self.user_id}

**Statistics:**
- Total Workouts: {total_workouts}
- Unique Exercises: {len(exercises_done)}
- Total Volume: {total_volume:.0f}kg lifted

**Exercises Performed:**
{', '.join(exercises_done)}

**Pattern Analysis:**
- Consistency: {'Excellent' if total_workouts >= 4 else 'Good' if total_workouts >= 3 else 'Needs improvement'}
- Variety: {'Good variety' if len(exercises_done) >= 5 else 'Limited variety'}

Context: This is a weekly summary of actual workout performance and patterns.
"""

            # Vectorize the summary
            metadata = {
                "type": "weekly_summary",
                "user_id": self.user_id,
                "week_start": week_ago.isoformat(),
                "workout_count": total_workouts
            }

            self.vector_store.add_documents([summary], [metadata])
            logger.info(f"Generated and vectorized weekly workout summary: {total_workouts} workouts")

            return summary

        except Exception as e:
            logger.error(f"Error generating weekly summary: {e}")
            return "Error generating summary"

    def generate_expense_insights(self, days: int = 30) -> str:
        """
        Generate and vectorize spending pattern insights

        Args:
            days: Number of days to analyze

        Returns:
            Insights text
        """
        try:
            # Get recent expenses
            cutoff_date = datetime.now() - timedelta(days=days)
            expenses = self.db.query(FinanceRecord).filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_type == "EXPENSE",
                FinanceRecord.transaction_date >= cutoff_date
            ).all()

            if not expenses:
                return "No expenses logged recently"

            # Analyze spending
            total_spent = sum(e.amount for e in expenses)
            categories = {}
            for expense in expenses:
                category = expense.category or "uncategorized"
                categories[category] = categories.get(category, 0) + expense.amount

            top_category = max(categories.items(), key=lambda x: x[1])

            # Create insights
            insights = f"""
**Spending Insights - Last {days} Days**
Period: {cutoff_date.strftime('%Y-%m-%d')} to {datetime.now().strftime('%Y-%m-%d')}
User ID: {self.user_id}

**Summary:**
- Total Spent: ${total_spent:.2f}
- Number of Transactions: {len(expenses)}
- Average per day: ${(total_spent/days):.2f}

**Top Spending Category:**
{top_category[0].title()}: ${top_category[1]:.2f} ({(top_category[1]/total_spent*100):.1f}%)

**Category Breakdown:**
"""
            for cat, amount in sorted(categories.items(), key=lambda x: x[1], reverse=True):
                insights += f"- {cat.title()}: ${amount:.2f}\n"

            insights += "\nContext: These are actual spending patterns and habits based on logged expenses."

            # Vectorize the insights
            metadata = {
                "type": "expense_insights",
                "user_id": self.user_id,
                "period_days": days,
                "total_spent": total_spent
            }

            self.vector_store.add_documents([insights], [metadata])
            logger.info(f"Generated and vectorized expense insights: ${total_spent:.2f} over {days} days")

            return insights

        except Exception as e:
            logger.error(f"Error generating expense insights: {e}")
            return "Error generating insights"

    def generate_progress_report(self) -> str:
        """
        Generate comprehensive progress report (workout + weight + expenses)

        Returns:
            Progress report text
        """
        try:
            # Get user profile
            profile = self.db.query(UserGymProfile).filter(
                UserGymProfile.user_id == self.user_id
            ).first()

            if not profile:
                return "No profile data available"

            # Get weight progress (last 4 weeks)
            month_ago = datetime.now() - timedelta(days=30)
            weight_logs = self.db.query(WeightLog).filter(
                WeightLog.user_id == self.user_id,
                WeightLog.weigh_in_date >= month_ago.date()
            ).order_by(WeightLog.weigh_in_date).all()

            # Get workout progress
            workouts = self.db.query(WorkoutLog).filter(
                WorkoutLog.user_id == self.user_id,
                WorkoutLog.logged_at >= month_ago
            ).all()

            # Build report
            report = f"""
**Monthly Progress Report**
Date: {datetime.now().strftime('%Y-%m-%d')}
User ID: {self.user_id}
Goal: {profile.primary_goal.value if profile.primary_goal else 'Not set'}

**Weight Progress:**
"""
            if len(weight_logs) >= 2:
                start_weight = weight_logs[0].weight
                current_weight = weight_logs[-1].weight
                change = current_weight - start_weight
                report += f"- Starting: {start_weight}kg\n"
                report += f"- Current: {current_weight}kg\n"
                report += f"- Change: {change:+.1f}kg\n"
            else:
                report += "- Not enough data to track progress\n"

            report += f"""
**Workout Consistency:**
- Total Workouts: {len(workouts)} in 30 days
- Average per week: {(len(workouts)/4):.1f}
- Goal: {profile.training_days_per_week if profile else 'Not set'} days/week
- Status: {'On Track' if len(workouts) >= profile.training_days_per_week * 3 else 'Below Target'}

**Overall Assessment:**
"""
            if profile.primary_goal.value == "fat_loss":
                if len(weight_logs) >= 2 and weight_logs[-1].weight < weight_logs[0].weight:
                    report += "✅ Making progress toward fat loss goal!\n"
                else:
                    report += "⚠️ Weight not decreasing - may need to adjust nutrition or increase activity\n"

            report += "\nContext: This is a comprehensive progress report based on actual logged data."

            # Vectorize the report
            metadata = {
                "type": "progress_report",
                "user_id": self.user_id,
                "date": datetime.now().isoformat()
            }

            self.vector_store.add_documents([report], [metadata])
            logger.info(f"Generated and vectorized progress report")

            return report

        except Exception as e:
            logger.error(f"Error generating progress report: {e}")
            return "Error generating report"

    def get_personal_context_stats(self) -> Dict:
        """Get statistics about personal context store"""
        return self.vector_store.get_stats()
