"""
AI Progress Analyzer - Analyzes workout history and provides intelligent insights
Uses Groq AI to generate personalized progress reports and recommendations
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from services.groq_ai_service import GroqAIService
from models.workout import (
    WorkoutLog, WeightLog, PersonalRecord, WorkoutNote,
    RestDay, UserGymProfile
)

logger = logging.getLogger(__name__)


class AIProgressAnalyzer:
    """
    AI-powered progress analyzer

    Analyzes:
    - Weight trends (gain/loss, body composition)
    - Strength progression (PRs, volume)
    - Training consistency (frequency, rest days)
    - Plateau detection
    - Recovery patterns
    """

    def __init__(self, db: Session):
        self.db = db
        self.ai = GroqAIService(model="llama-3.1-8b-instant")

    def analyze_progress(
        self,
        user_id: int,
        period_days: int = 30
    ) -> Dict[str, Any]:
        """
        Generate comprehensive progress analysis

        Args:
            user_id: User ID
            period_days: Analysis period (default 30 days)

        Returns:
            Dict with summary, insights, recommendations, score
        """
        logger.info(f"Analyzing progress for user {user_id} over {period_days} days")

        # Gather all user data
        data = self._gather_user_data(user_id, period_days)

        # Build AI prompt with data
        prompt = self._build_analysis_prompt(data, period_days)

        try:
            # Generate AI analysis
            ai_response = self.ai.generate_json(
                prompt=prompt,
                system_prompt=self._get_system_prompt()
            )

            # Add metadata
            analysis = {
                "user_id": user_id,
                "period_days": period_days,
                "analyzed_at": datetime.now().isoformat(),
                "summary": ai_response.get("summary", ""),
                "insights": ai_response.get("insights", []),
                "recommendations": ai_response.get("recommendations", []),
                "progress_score": ai_response.get("progress_score", 0),
                "warnings": ai_response.get("warnings", []),
                "ai_powered": True,
                "data_points": {
                    "workouts": data["workout_count"],
                    "weight_logs": data["weight_log_count"],
                    "prs": data["pr_count"],
                    "rest_days": data["rest_day_count"]
                }
            }

            logger.info(f"Progress analysis complete - Score: {analysis['progress_score']}/100")
            return analysis

        except Exception as e:
            logger.error(f"AI progress analysis failed: {e}")
            raise

    def _gather_user_data(self, user_id: int, period_days: int) -> Dict[str, Any]:
        """Gather all relevant user data for analysis"""

        cutoff_date = datetime.now() - timedelta(days=period_days)

        # Get user profile
        profile = self.db.query(UserGymProfile).filter(
            UserGymProfile.user_id == user_id
        ).first()

        # Get workout logs
        workout_logs = self.db.query(WorkoutLog).filter(
            WorkoutLog.user_id == user_id,
            WorkoutLog.logged_at >= cutoff_date
        ).order_by(desc(WorkoutLog.logged_at)).all()

        # Get weight logs
        weight_logs = self.db.query(WeightLog).filter(
            WeightLog.user_id == user_id,
            WeightLog.weigh_in_date >= cutoff_date.date()
        ).order_by(desc(WeightLog.weigh_in_date)).all()

        # Get personal records
        personal_records = self.db.query(PersonalRecord).filter(
            PersonalRecord.user_id == user_id,
            PersonalRecord.achieved_date >= cutoff_date.date()
        ).order_by(desc(PersonalRecord.achieved_date)).all()

        # Get rest days
        rest_days = self.db.query(RestDay).filter(
            RestDay.user_id == user_id,
            RestDay.rest_date >= cutoff_date.date()
        ).all()

        # Get workout notes
        notes = self.db.query(WorkoutNote).filter(
            WorkoutNote.user_id == user_id,
            WorkoutNote.workout_date >= cutoff_date.date()
        ).order_by(desc(WorkoutNote.workout_date)).limit(5).all()

        # Calculate statistics
        data = {
            # Profile
            "profile": {
                "goal": profile.primary_goal.value if profile else "unknown",
                "experience": profile.experience_level.value if profile else "unknown",
                "training_days_per_week": profile.training_days_per_week if profile else 0
            },

            # Workout stats
            "workout_count": len(workout_logs),
            "workout_frequency": len(workout_logs) / (period_days / 7),  # per week
            "total_exercises": sum(1 for log in workout_logs),
            "exercise_variety": len(set(log.exercise_name for log in workout_logs)),

            # Recent workouts summary
            "recent_workouts": [
                {
                    "exercise": log.exercise_name,
                    "sets": log.sets,
                    "reps": log.reps,
                    "weight": log.weight,
                    "date": log.logged_at.strftime("%Y-%m-%d")
                }
                for log in workout_logs[:10]  # Last 10
            ],

            # Weight progress
            "weight_log_count": len(weight_logs),
            "starting_weight": weight_logs[-1].weight if weight_logs else None,
            "current_weight": weight_logs[0].weight if weight_logs else None,
            "weight_change": (weight_logs[0].weight - weight_logs[-1].weight) if len(weight_logs) >= 2 else 0,
            "body_fat_change": self._calculate_body_fat_change(weight_logs),

            # Strength progress
            "pr_count": len(personal_records),
            "recent_prs": [
                {
                    "exercise": pr.exercise_name,
                    "weight": pr.max_weight,
                    "reps": pr.max_reps,
                    "date": pr.achieved_date.strftime("%Y-%m-%d")
                }
                for pr in personal_records
            ],

            # Recovery
            "rest_day_count": len(rest_days),
            "days_since_last_rest": self._days_since_last_rest(user_id),

            # Volume analysis
            "total_volume": self._calculate_total_volume(workout_logs),
            "volume_by_muscle": self._calculate_volume_by_muscle(workout_logs),

            # Notes/feedback
            "recent_notes": [
                {
                    "title": note.workout_name,
                    "content": note.note,
                    "difficulty": note.difficulty
                }
                for note in notes
            ]
        }

        return data

    def _calculate_body_fat_change(self, weight_logs: List[WeightLog]) -> Optional[float]:
        """Calculate body fat percentage change"""
        logs_with_bf = [log for log in weight_logs if log.body_fat_percentage]
        if len(logs_with_bf) >= 2:
            return logs_with_bf[0].body_fat_percentage - logs_with_bf[-1].body_fat_percentage
        return None

    def _days_since_last_rest(self, user_id: int) -> int:
        """Calculate days since last rest day"""
        last_rest = self.db.query(RestDay).filter(
            RestDay.user_id == user_id,
            RestDay.rest_date <= datetime.now().date()
        ).order_by(desc(RestDay.rest_date)).first()

        if last_rest:
            return (datetime.now().date() - last_rest.rest_date).days
        return 999  # No rest day found

    def _calculate_total_volume(self, workout_logs: List[WorkoutLog]) -> float:
        """Calculate total training volume (sets × reps × weight)"""
        total = 0
        for log in workout_logs:
            if log.sets and log.reps and log.weight:
                total += log.sets * log.reps * log.weight
        return total

    def _calculate_volume_by_muscle(self, workout_logs: List[WorkoutLog]) -> Dict[str, int]:
        """Calculate sets per muscle group"""
        # Simple categorization based on exercise name
        muscle_sets = {}

        for log in workout_logs:
            if not log.sets:
                continue

            exercise = log.exercise_name.lower()

            # Categorize exercise
            if any(word in exercise for word in ['bench', 'press', 'fly', 'chest']):
                muscle = 'chest'
            elif any(word in exercise for word in ['squat', 'leg press', 'lunge', 'legs']):
                muscle = 'legs'
            elif any(word in exercise for word in ['row', 'pull', 'lat', 'back']):
                muscle = 'back'
            elif any(word in exercise for word in ['shoulder', 'lateral', 'overhead']):
                muscle = 'shoulders'
            elif any(word in exercise for word in ['curl', 'tricep', 'arms']):
                muscle = 'arms'
            else:
                muscle = 'other'

            muscle_sets[muscle] = muscle_sets.get(muscle, 0) + log.sets

        return muscle_sets

    def _get_system_prompt(self) -> str:
        """System prompt for AI analyzer"""
        return """You are an expert personal trainer and exercise scientist analyzing workout progress.

Your task is to analyze user workout data and provide intelligent, actionable insights.

Analysis Guidelines:
- Be honest and objective about progress
- Identify both strengths and areas for improvement
- Detect plateaus and overtraining
- Recommend specific, actionable changes
- Consider the user's goals and experience level
- Use fitness science principles

Output Format (JSON):
{
  "summary": "2-3 sentence overall assessment of progress",
  "insights": [
    {"type": "positive", "message": "What's going well"},
    {"type": "warning", "message": "Concerns or plateaus"},
    {"type": "neutral", "message": "Observations"}
  ],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ],
  "warnings": [
    "Important warnings (overtraining, injury risk, etc.)"
  ],
  "progress_score": 85  // 0-100 based on progress toward goals
}

Important:
- Limit to 3-5 insights
- Limit to 3-4 recommendations
- Warnings only if serious concerns
- Progress score should be realistic"""

    def _build_analysis_prompt(self, data: Dict[str, Any], period_days: int) -> str:
        """Build detailed analysis prompt with user data"""

        prompt = f"""Analyze this user's {period_days}-day workout progress:

USER PROFILE:
- Goal: {data['profile']['goal']}
- Experience: {data['profile']['experience']}
- Target training: {data['profile']['training_days_per_week']} days/week

WORKOUT DATA ({period_days} days):
- Total workouts: {data['workout_count']}
- Frequency: {data['workout_frequency']:.1f} workouts/week
- Exercise variety: {data['exercise_variety']} different exercises
- Total volume: {data['total_volume']:,.0f} kg

WEIGHT PROGRESS:
- Starting: {data['starting_weight']}kg → Current: {data['current_weight']}kg
- Change: {data['weight_change']:+.1f}kg"""

        if data['body_fat_change']:
            prompt += f"\n- Body fat change: {data['body_fat_change']:+.1f}%"

        prompt += f"""

STRENGTH PROGRESS:
- New PRs: {data['pr_count']}"""

        if data['recent_prs']:
            prompt += "\n- Recent PRs:"
            for pr in data['recent_prs'][:3]:
                prompt += f"\n  • {pr['exercise']}: {pr['weight']}kg x {pr['reps']} ({pr['date']})"

        prompt += f"""

VOLUME BY MUSCLE GROUP (sets):"""
        for muscle, sets in data['volume_by_muscle'].items():
            prompt += f"\n- {muscle.title()}: {sets} sets"

        prompt += f"""

RECOVERY:
- Rest days: {data['rest_day_count']}
- Days since last rest: {data['days_since_last_rest']}"""

        if data['recent_notes']:
            prompt += "\n\nRECENT WORKOUT NOTES:"
            for note in data['recent_notes'][:3]:
                prompt += f"\n- {note['title']}: {note['content'][:100]}"

        prompt += """

Analyze this data and provide:
1. Overall progress assessment
2. Key insights (positive and concerns)
3. Specific recommendations
4. Progress score (0-100)

Generate the analysis now:"""

        return prompt

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.ai.is_available()
