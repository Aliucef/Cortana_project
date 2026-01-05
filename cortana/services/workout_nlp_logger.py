"""
Workout NLP Logger - Parse natural language workout descriptions and log them
Uses Groq AI to extract structured workout data from conversational text
"""

import logging
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from datetime import datetime
from services.groq_ai_service import GroqAIService
from models.workout import WorkoutLog, Exercise
import re

logger = logging.getLogger(__name__)


class WorkoutNLPLogger:
    """
    Natural Language Processing Workout Logger

    Features:
    - Parse conversational workout descriptions
    - Extract exercises, sets, reps, weight
    - Fuzzy match exercise names to database
    - Handle multiple exercises in one message
    - Voice-ready (handles casual language)
    """

    def __init__(self, db: Session):
        self.db = db
        self.ai = GroqAIService(model="llama-3.1-8b-instant")

    def log_workout(
        self,
        user_id: int,
        message: str
    ) -> Dict[str, Any]:
        """
        Parse workout description and log to database

        Args:
            user_id: User ID
            message: Natural language workout description
                    Examples:
                    - "I did 3 sets of 10 bench press at 80kg"
                    - "Just finished squats: 5x5 at 120kg"
                    - "Leg day: squats 100kg 5x5, leg press 150kg 4x12"

        Returns:
            {
                "message": "Logged 2 exercises",
                "logged_exercises": [
                    {"exercise": "Bench Press", "sets": 3, "reps": 10, "weight": 80},
                    ...
                ],
                "ai_powered": true
            }
        """
        logger.info(f"Parsing workout for user {user_id}: {message[:100]}")

        try:
            # Get available exercises for context
            exercises = self.db.query(Exercise).limit(100).all()
            exercise_names = [ex.name for ex in exercises]

            # Parse with AI
            parsed_data = self._parse_with_ai(message, exercise_names)

            # Log each exercise
            logged_exercises = []
            for exercise_data in parsed_data.get("exercises", []):
                # Fuzzy match exercise name
                matched_name = self._match_exercise_name(
                    exercise_data.get("exercise", ""),
                    exercise_names
                )

                if not matched_name:
                    logger.warning(f"Could not match exercise: {exercise_data.get('exercise')}")
                    continue

                # Create workout log
                workout_log = WorkoutLog(
                    user_id=user_id,
                    exercise_name=matched_name,
                    sets=exercise_data.get("sets"),
                    reps=exercise_data.get("reps"),
                    weight=exercise_data.get("weight"),
                    duration_minutes=exercise_data.get("duration_minutes"),
                    notes=exercise_data.get("notes", ""),
                    logged_at=datetime.now()
                )

                self.db.add(workout_log)
                logged_exercises.append({
                    "exercise": matched_name,
                    "sets": exercise_data.get("sets"),
                    "reps": exercise_data.get("reps"),
                    "weight": exercise_data.get("weight"),
                    "duration_minutes": exercise_data.get("duration_minutes")
                })

            # Commit all logs
            self.db.commit()

            logger.info(f"Logged {len(logged_exercises)} exercises")

            return {
                "message": f"Logged {len(logged_exercises)} exercise{'s' if len(logged_exercises) != 1 else ''}",
                "logged_exercises": logged_exercises,
                "ai_powered": True
            }

        except Exception as e:
            self.db.rollback()
            logger.error(f"Workout logging failed: {e}")
            raise

    def _parse_with_ai(self, message: str, exercise_names: List[str]) -> Dict[str, Any]:
        """Use AI to parse workout description"""

        system_prompt = """You are a workout logging assistant. Parse natural language workout descriptions into structured data.

Available exercises (use these exact names):
{exercises}

Output Format (JSON):
{{
  "exercises": [
    {{
      "exercise": "Exact exercise name from list",
      "sets": 3,
      "reps": 10,
      "weight": 80.0,
      "duration_minutes": null,
      "notes": "Any additional notes"
    }}
  ]
}}

Parsing Rules:
- Match exercise names to the available exercises list (use closest match)
- Handle variations: "3x10", "3 sets of 10", "10 reps x 3 sets"
- Recognize weights: "80kg", "80 kilos", "80 kgs", "176 lbs" (convert lbs to kg)
- If multiple exercises, include all in the array
- If duration mentioned instead of sets/reps, use duration_minutes
- For cardio (running, cycling), use duration_minutes instead of sets/reps

Return ONLY valid JSON, no explanations.""".format(
            exercises=", ".join(exercise_names[:50])  # Limit to prevent token overflow
        )

        user_prompt = f"""Parse this workout description:

"{message}"

Extract all exercises with their sets, reps, and weights."""

        # Generate structured JSON
        parsed = self.ai.generate_json(
            prompt=user_prompt,
            system_prompt=system_prompt
        )

        return parsed

    def _match_exercise_name(self, input_name: str, available_names: List[str]) -> str:
        """Fuzzy match input exercise name to database exercises"""

        if not input_name:
            return None

        input_lower = input_name.lower().strip()

        # Exact match
        for name in available_names:
            if name.lower() == input_lower:
                return name

        # Contains match
        for name in available_names:
            if input_lower in name.lower() or name.lower() in input_lower:
                return name

        # Word match (any word in common)
        input_words = set(input_lower.split())
        best_match = None
        best_score = 0

        for name in available_names:
            name_words = set(name.lower().split())
            common_words = input_words & name_words
            score = len(common_words)

            if score > best_score:
                best_score = score
                best_match = name

        if best_score > 0:
            return best_match

        # No match found
        return None

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.ai.is_available()
