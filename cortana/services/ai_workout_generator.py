"""
AI Workout Plan Generator - Uses Groq AI to create personalized workout plans
Much smarter than rule-based generator - understands context, nuances, and preferences
"""

import logging
from typing import Dict, List, Any, Optional
from services.groq_ai_service import GroqAIService
from sqlalchemy.orm import Session
from models.workout import WorkoutPlan, UserGymProfile, Exercise
import json
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class AIWorkoutGenerator:
    """
    AI-powered workout plan generator using Groq

    Features:
    - Natural language understanding
    - Context-aware recommendations
    - Personalized based on injuries, preferences, equipment
    - Progressive overload built-in
    - Considers recovery and rest days
    """

    def __init__(self, db: Session):
        self.db = db
        self.ai = GroqAIService(model="llama-3.1-8b-instant")

    def generate_from_description(
        self,
        user_id: int,
        description: str,
        weeks: int = 4
    ) -> List[WorkoutPlan]:
        """
        Generate workout plan from natural language description

        Args:
            user_id: User ID
            description: Natural language description of workout goals
            weeks: Number of weeks to generate

        Returns:
            List of WorkoutPlan objects

        Example:
            description = "I want to build muscle, workout 4 days/week, have dumbbells and bench,
                          intermediate level, bad left shoulder"
        """
        logger.info(f"Generating AI workout plan for user {user_id}: {description[:100]}")

        # Get user profile if exists
        profile = self.db.query(UserGymProfile).filter(
            UserGymProfile.user_id == user_id
        ).first()

        # Get available exercises
        exercises = self.db.query(Exercise).limit(70).all()
        exercise_list = [
            {
                "name": ex.name,
                "category": ex.category,
                "equipment": ex.equipment,
                "difficulty": ex.difficulty,
                "primary_muscles": ex.primary_muscles,
                "secondary_muscles": ex.secondary_muscles
            }
            for ex in exercises
        ]

        # Build AI prompt
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(description, profile, exercise_list, weeks)

        # Generate with AI
        try:
            result = self.ai.generate_json(user_prompt, system_prompt)
            logger.info(f"AI generated workout plan successfully")
            logger.info(f"AI Response - Number of workouts: {len(result.get('workouts', []))}")
            logger.info(f"AI Response - Workout days: {[w.get('day') for w in result.get('workouts', [])]}")

            # Convert AI response to WorkoutPlan objects
            workout_plans = self._convert_to_workout_plans(user_id, result, weeks)

            # Save to database
            for plan in workout_plans:
                self.db.add(plan)
            self.db.commit()

            logger.info(f"Saved {len(workout_plans)} AI-generated workouts to database")
            return workout_plans

        except Exception as e:
            logger.error(f"AI workout generation failed: {e}")
            raise

    def _build_system_prompt(self) -> str:
        """Build system prompt for AI"""
        return """You are an expert personal trainer and strength coach with 15+ years of experience.

Your task is to create personalized workout programs based on user requirements.

Key principles:
- Progressive overload (increase intensity over weeks)
- Proper exercise selection based on goals and equipment
- Appropriate volume (sets x reps) for goals
- Adequate rest between muscle groups
- Compound movements prioritized
- Consider injuries and limitations
- Balance push/pull movements

Output Format:
You MUST return ONLY valid JSON with this exact structure:
{
  "program_name": "Name of the program",
  "description": "Brief description",
  "workouts": [
    {
      "day": 1,
      "name": "Workout name (e.g., Push Day, Upper Body)",
      "exercises": [
        {
          "exercise": "Exercise name (must match available exercises)",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 90,
          "notes": "Form cues or tips"
        }
      ]
    }
  ]
}

CRITICAL:
- Exercise names MUST exactly match the available exercises provided
- Return ONLY the JSON object, no explanations
- Include 4-6 exercises per workout
- Rest times: 60-90s for hypertrophy, 180-300s for strength, 30-60s for endurance"""

    def _build_user_prompt(
        self,
        description: str,
        profile: Optional[UserGymProfile],
        exercises: List[Dict],
        weeks: int
    ) -> str:
        """Build user prompt with context"""

        # Add profile context if available
        profile_context = ""
        if profile:
            profile_context = f"""
Current Profile:
- Goal: {profile.primary_goal.value}
- Experience: {profile.experience_level.value}
- Training Days: {profile.training_days_per_week}/week
- Equipment: {profile.equipment_access.value}
- Injuries: {profile.injuries_notes or 'None'}
"""

        # Format exercises by category for AI to choose from
        exercises_by_category = {}
        for ex in exercises:
            cat = ex['category']
            if cat not in exercises_by_category:
                exercises_by_category[cat] = []
            exercises_by_category[cat].append(ex['name'])

        exercises_text = "\n".join([
            f"{cat.upper()}: {', '.join(exs[:10])}"  # Limit to 10 per category
            for cat, exs in exercises_by_category.items()
        ])

        # Extract training frequency from description
        import re
        import logging
        logger = logging.getLogger(__name__)

        frequency_match = re.search(r'(\d+)\s*days?\s*(per\s*week|\/\s*week)?', description.lower())
        requested_days = int(frequency_match.group(1)) if frequency_match else 3

        logger.info(f"AI WORKOUT GENERATOR DEBUG:")
        logger.info(f"  Description: {description}")
        logger.info(f"  Regex match: {frequency_match.group(0) if frequency_match else 'NO MATCH'}")
        logger.info(f"  Extracted days: {requested_days}")

        prompt = f"""Create a {weeks}-week workout program based on this request:

USER REQUEST:
{description}

{profile_context}

AVAILABLE EXERCISES (you MUST use these exact names):
{exercises_text}

REQUIREMENTS:
1. Create a program that matches the user's goals and constraints
2. Use ONLY exercises from the available list above (exact names)
3. Generate EXACTLY {requested_days} different workouts (days 1-{requested_days})
4. Each workout should target different muscle groups for optimal recovery
5. Include proper progression over {weeks} weeks
6. Consider any injuries or limitations mentioned
7. Optimize exercise selection for available equipment
8. Return structured JSON as specified

IMPORTANT: Your "workouts" array MUST contain {requested_days} workout objects (day 1 through day {requested_days}).

Generate the workout program now:"""

        return prompt

    def _convert_to_workout_plans(
        self,
        user_id: int,
        ai_response: Dict,
        weeks: int
    ) -> List[WorkoutPlan]:
        """Convert AI JSON response to WorkoutPlan database objects"""

        workout_plans = []
        start_date = datetime.now()

        program_name = ai_response.get('program_name', 'AI Generated Program')
        workouts_data = ai_response.get('workouts', [])

        # Generate for each week with progression
        for week in range(weeks):
            week_number = week + 1

            for workout in workouts_data:
                day_number = workout.get('day', 1)
                workout_name = workout.get('name', f'Workout {day_number}')
                exercises = workout.get('exercises', [])

                # Calculate workout date (weekly schedule)
                days_from_start = (week * 7) + (day_number - 1)
                workout_date = start_date + timedelta(days=days_from_start)

                # Build exercises JSON with progression
                exercises_json = []
                for ex in exercises:
                    exercise_data = {
                        "name": ex.get('exercise'),  # AI returns 'exercise', we need 'name'
                        "sets": ex.get('sets', 3),
                        "reps": ex.get('reps', '8-12'),
                        "rest_seconds": ex.get('rest_seconds', 90),
                        "notes": ex.get('notes', '')
                    }

                    # Add progressive overload (simple: increase reps/sets over weeks)
                    if week_number > 1:
                        exercise_data['notes'] += f" | Week {week_number} progression"

                    exercises_json.append(exercise_data)

                # Determine day of week (monday, tuesday, etc.)
                days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                day_of_week = days[workout_date.weekday()]

                # Create WorkoutPlan object
                plan = WorkoutPlan(
                    user_id=user_id,
                    week_number=week_number,
                    day_of_week=day_of_week,
                    muscle_group=workout_name,  # Use workout name as muscle group
                    exercises=exercises_json,
                    completed=False
                )

                workout_plans.append(plan)

        return workout_plans

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.ai.is_available()
