"""
Fitness Chat Assistant - Conversational AI for fitness questions
Uses Groq AI with context from user's workout history, profile, and PRs
"""

import logging
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from services.groq_ai_service import GroqAIService
from models.workout import (
    UserGymProfile, WorkoutLog, PersonalRecord, WeightLog,
    Exercise, RestDay
)

logger = logging.getLogger(__name__)


class FitnessChatAssistant:
    """
    AI-powered fitness chat assistant

    Features:
    - Context-aware responses using user's workout history
    - Exercise guidance and form tips
    - Goal setting advice based on current progress
    - Training plan suggestions
    - Nutrition and recovery advice
    """

    def __init__(self, db: Session):
        self.db = db
        self.ai = GroqAIService(model="llama-3.1-8b-instant")

    def chat(
        self,
        user_id: int,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Process user message and generate AI response with context

        Args:
            user_id: User ID
            message: User's question or message
            conversation_history: Optional previous messages [{"role": "user/assistant", "content": "..."}]

        Returns:
            {
                "message": "AI response",
                "sources": ["Data source 1", "Data source 2"],
                "suggestions": ["Follow-up suggestion 1", ...],
                "ai_powered": true
            }
        """
        logger.info(f"Chat request from user {user_id}: {message[:100]}")

        # Build context from user data
        context = self._build_user_context(user_id)

        # Build system prompt with context
        system_prompt = self._build_system_prompt(context)

        # Build user prompt
        user_prompt = message

        # Include conversation history if provided
        messages = []
        if conversation_history:
            messages.extend(conversation_history)
        messages.append({"role": "user", "content": user_prompt})

        try:
            # Generate AI response (text mode for conversational replies)
            ai_response = self.ai.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                max_tokens=500
            )

            # Extract sources from context
            sources = self._extract_sources(context)

            # Generate follow-up suggestions
            suggestions = self._generate_suggestions(message, context)

            response = {
                "message": ai_response,
                "sources": sources,
                "suggestions": suggestions,
                "ai_powered": True
            }

            logger.info(f"Chat response generated successfully")
            return response

        except Exception as e:
            logger.error(f"Chat failed: {e}")
            raise

    def _build_user_context(self, user_id: int) -> Dict[str, Any]:
        """Build context from user's data"""

        # Get user profile
        profile = self.db.query(UserGymProfile).filter(
            UserGymProfile.user_id == user_id
        ).first()

        # Get recent workouts (last 7 days)
        recent_cutoff = datetime.now() - timedelta(days=7)
        recent_workouts = self.db.query(WorkoutLog).filter(
            WorkoutLog.user_id == user_id,
            WorkoutLog.logged_at >= recent_cutoff
        ).order_by(desc(WorkoutLog.logged_at)).limit(10).all()

        # Get top 5 PRs
        prs = self.db.query(PersonalRecord).filter(
            PersonalRecord.user_id == user_id
        ).order_by(desc(PersonalRecord.achieved_date)).limit(5).all()

        # Get latest weight
        latest_weight = self.db.query(WeightLog).filter(
            WeightLog.user_id == user_id
        ).order_by(desc(WeightLog.weigh_in_date)).first()

        # Get days since last rest
        last_rest = self.db.query(RestDay).filter(
            RestDay.user_id == user_id
        ).order_by(desc(RestDay.rest_date)).first()

        days_since_rest = 0
        if last_rest:
            days_since_rest = (datetime.now().date() - last_rest.rest_date).days

        # Build context dictionary
        context = {
            "has_profile": profile is not None,
            "profile": {
                "goal": profile.primary_goal.value if profile else "unknown",
                "experience": profile.experience_level.value if profile else "unknown",
                "equipment": profile.equipment_access.value if profile else "unknown",
                "injuries": profile.injuries_notes if profile else None
            } if profile else None,

            "recent_workouts_count": len(recent_workouts),
            "recent_exercises": [
                f"{log.exercise_name} ({log.sets}x{log.reps} @ {log.weight}kg)"
                for log in recent_workouts[:5]
            ],

            "top_prs": [
                f"{pr.exercise_name}: {pr.max_weight}kg x {pr.max_reps} reps"
                for pr in prs
            ],

            "current_weight": latest_weight.weight if latest_weight else None,
            "days_since_rest": days_since_rest
        }

        return context

    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build system prompt with user context"""

        base_prompt = """You are a knowledgeable fitness coach and personal trainer with expertise in:
- Strength training and hypertrophy
- Exercise form and technique
- Program design and periodization
- Nutrition for performance and body composition
- Recovery and injury prevention

Your role is to answer fitness questions with personalized advice based on the user's data."""

        # Add user context
        if context["has_profile"]:
            profile = context["profile"]
            base_prompt += f"""

USER PROFILE:
- Goal: {profile['goal']}
- Experience Level: {profile['experience']}
- Equipment Access: {profile['equipment']}"""

            if profile['injuries']:
                base_prompt += f"\n- Injuries/Limitations: {profile['injuries']}"

        # Add recent activity
        if context["recent_workouts_count"] > 0:
            base_prompt += f"""

RECENT TRAINING (last 7 days):
- Workouts completed: {context['recent_workouts_count']}
- Recent exercises: {', '.join(context['recent_exercises'][:3])}"""

        # Add PRs
        if context["top_prs"]:
            base_prompt += f"""

PERSONAL RECORDS:
{chr(10).join(f"- {pr}" for pr in context['top_prs'][:3])}"""

        # Add current stats
        if context["current_weight"]:
            base_prompt += f"""

CURRENT STATS:
- Weight: {context['current_weight']}kg
- Days since last rest: {context['days_since_rest']}"""

        base_prompt += """

INSTRUCTIONS:
- Provide specific, actionable advice
- Reference user's data when relevant
- Be encouraging but honest
- Suggest modifications based on equipment/injuries
- Keep responses concise (2-3 paragraphs max)
- Use clear, simple language"""

        return base_prompt

    def _extract_sources(self, context: Dict[str, Any]) -> List[str]:
        """Extract data sources used for response"""
        sources = []

        if context["has_profile"]:
            sources.append("Your gym profile")

        if context["recent_workouts_count"] > 0:
            sources.append(f"Your last {context['recent_workouts_count']} workouts")

        if context["top_prs"]:
            sources.append(f"{len(context['top_prs'])} personal records")

        if context["current_weight"]:
            sources.append("Current weight data")

        return sources if sources else ["General fitness knowledge"]

    def _generate_suggestions(self, message: str, context: Dict[str, Any]) -> List[str]:
        """Generate follow-up suggestions based on message"""

        suggestions = []

        # Analyze message keywords
        message_lower = message.lower()

        if any(word in message_lower for word in ['bench', 'squat', 'deadlift', 'press']):
            suggestions.append("Show me exercise variations")
            suggestions.append("How can I improve my form?")

        if any(word in message_lower for word in ['gain', 'lose', 'weight', 'muscle']):
            suggestions.append("What should my calorie intake be?")
            suggestions.append("How long will it take?")

        if any(word in message_lower for word in ['program', 'routine', 'plan', 'workout']):
            suggestions.append("Generate a workout plan for me")
            suggestions.append("How often should I train?")

        if 'plateau' in message_lower or 'stuck' in message_lower:
            suggestions.append("Analyze my progress")
            suggestions.append("What exercises should I add?")

        # Default suggestions if none matched
        if not suggestions:
            suggestions = [
                "Analyze my progress",
                "What exercises should I do today?",
                "How can I improve my strength?"
            ]

        return suggestions[:3]  # Return max 3 suggestions

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.ai.is_available()
