"""
Workout Program Generator - Maps user profiles to personalized workout plans

Decision Engine Logic:
- Goal → Sets/Reps/Rest times
- Experience → Exercise complexity & volume
- Equipment → Exercise selection
- Training days → Split recommendation
- Progressive overload built-in (week-by-week progression)
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any
from models.workout import (
    UserGymProfile, WorkoutPlan,
    WorkoutGoal, ExperienceLevel, EquipmentAccess, TrainingSplit
)
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class WorkoutProgramGenerator:
    """Generates personalized workout programs based on user profiles"""

    def __init__(self, db: Session):
        self.db = db

    def generate_program(self, user_id: int, weeks: int = 4) -> List[WorkoutPlan]:
        """
        Generate a complete workout program for the user

        Args:
            user_id: User's ID
            weeks: Number of weeks to generate (default 4 for progressive overload cycle)

        Returns:
            List of WorkoutPlan objects
        """
        # Get user's profile
        profile = self.db.query(UserGymProfile).filter(
            UserGymProfile.user_id == user_id
        ).first()

        if not profile:
            raise ValueError("User has not completed gym onboarding")

        logger.info(f"Generating {weeks}-week program for user {user_id} - "
                   f"Goal: {profile.primary_goal.value}, Split: {profile.training_split.value}")

        # Generate program based on training split
        if profile.training_split == TrainingSplit.FULL_BODY:
            workout_plans = self._generate_full_body_program(profile, weeks)
        elif profile.training_split == TrainingSplit.UPPER_LOWER:
            workout_plans = self._generate_upper_lower_program(profile, weeks)
        elif profile.training_split == TrainingSplit.PUSH_PULL_LEGS:
            workout_plans = self._generate_ppl_program(profile, weeks)
        elif profile.training_split == TrainingSplit.BRO_SPLIT:
            workout_plans = self._generate_bro_split_program(profile, weeks)
        else:
            raise ValueError(f"Unknown training split: {profile.training_split}")

        # Save to database
        for plan in workout_plans:
            self.db.add(plan)

        self.db.commit()

        logger.info(f"Generated {len(workout_plans)} workout plans for user {user_id}")

        # Auto-vectorize: Update personal context after workout plan is generated
        try:
            from services.personal_context_service import PersonalContextService

            personal_context = PersonalContextService(self.db, user_id)
            # Vectorize the workout plan
            personal_context.vectorize_workout_plan(workout_plans)
            logger.info(f"Auto-vectorized workout plan for user {user_id}")
        except Exception as e:
            # Don't fail the request if vectorization fails
            logger.warning(f"Failed to auto-vectorize workout plan: {e}")

        return workout_plans

    def _get_set_rep_scheme(self, goal: WorkoutGoal, experience: ExperienceLevel) -> Dict[str, Any]:
        """
        Determine sets, reps, and rest times based on goal and experience

        Goal-based programming:
        - Muscle Gain: 3-4 sets x 8-12 reps (hypertrophy range)
        - Strength: 4-5 sets x 3-6 reps (strength range)
        - Fat Loss: 3-4 sets x 12-15 reps (metabolic range)
        - General Fitness: 3 sets x 10-12 reps (balanced)
        """
        schemes = {
            WorkoutGoal.MUSCLE_GAIN: {
                ExperienceLevel.BEGINNER: {"sets": 3, "reps": "10-12", "rest": 90},
                ExperienceLevel.INTERMEDIATE: {"sets": 4, "reps": "8-12", "rest": 90},
                ExperienceLevel.ADVANCED: {"sets": 4, "reps": "8-12", "rest": 60}
            },
            WorkoutGoal.STRENGTH: {
                ExperienceLevel.BEGINNER: {"sets": 4, "reps": "5-6", "rest": 180},
                ExperienceLevel.INTERMEDIATE: {"sets": 5, "reps": "4-6", "rest": 180},
                ExperienceLevel.ADVANCED: {"sets": 5, "reps": "3-5", "rest": 180}
            },
            WorkoutGoal.FAT_LOSS: {
                ExperienceLevel.BEGINNER: {"sets": 3, "reps": "12-15", "rest": 60},
                ExperienceLevel.INTERMEDIATE: {"sets": 3, "reps": "12-15", "rest": 45},
                ExperienceLevel.ADVANCED: {"sets": 4, "reps": "12-15", "rest": 45}
            },
            WorkoutGoal.GENERAL_FITNESS: {
                ExperienceLevel.BEGINNER: {"sets": 3, "reps": "10-12", "rest": 90},
                ExperienceLevel.INTERMEDIATE: {"sets": 3, "reps": "10-12", "rest": 75},
                ExperienceLevel.ADVANCED: {"sets": 3, "reps": "10-12", "rest": 60}
            }
        }

        return schemes[goal][experience]

    def _select_exercises(self, muscle_group: str, equipment: EquipmentAccess,
                         experience: ExperienceLevel, count: int = 5) -> List[str]:
        """
        Select appropriate exercises based on muscle group, equipment, and experience

        Args:
            muscle_group: Target muscle group
            equipment: Available equipment
            experience: User's experience level
            count: Number of exercises to return

        Returns:
            List of exercise names
        """
        # Exercise database organized by muscle group and equipment
        exercises = {
            "chest": {
                EquipmentAccess.FULL_GYM: {
                    ExperienceLevel.BEGINNER: ["Flat Barbell Bench Press", "Incline Dumbbell Press",
                                              "Chest Fly Machine", "Cable Crossovers", "Push-ups"],
                    ExperienceLevel.INTERMEDIATE: ["Flat Barbell Bench Press", "Incline Dumbbell Press",
                                                  "Decline Barbell Press", "Cable Crossovers", "Dips"],
                    ExperienceLevel.ADVANCED: ["Flat Barbell Bench Press", "Incline Dumbbell Press",
                                              "Weighted Dips", "Cable Flys", "Decline Dumbbell Press"]
                },
                EquipmentAccess.HOME_GYM: {
                    ExperienceLevel.BEGINNER: ["Flat Dumbbell Bench Press", "Incline Dumbbell Press",
                                              "Dumbbell Flys", "Push-ups", "Decline Push-ups"],
                    ExperienceLevel.INTERMEDIATE: ["Flat Dumbbell Bench Press", "Incline Dumbbell Press",
                                                  "Decline Dumbbell Press", "Dumbbell Flys", "Dips"],
                    ExperienceLevel.ADVANCED: ["Flat Dumbbell Bench Press", "Incline Dumbbell Press",
                                              "Weighted Dips", "Dumbbell Flys", "Decline Dumbbell Press"]
                },
                EquipmentAccess.MINIMAL: {
                    ExperienceLevel.BEGINNER: ["Push-ups", "Incline Push-ups", "Wide Push-ups",
                                              "Diamond Push-ups", "Decline Push-ups"],
                    ExperienceLevel.INTERMEDIATE: ["Push-ups", "Decline Push-ups", "Diamond Push-ups",
                                                  "Archer Push-ups", "Explosive Push-ups"],
                    ExperienceLevel.ADVANCED: ["One-Arm Push-ups", "Planche Push-ups", "Explosive Push-ups",
                                              "Archer Push-ups", "Pseudo Planche Push-ups"]
                }
            },
            "back": {
                EquipmentAccess.FULL_GYM: {
                    ExperienceLevel.BEGINNER: ["Lat Pulldown", "Seated Cable Row", "Dumbbell Row",
                                              "Face Pulls", "Back Extensions"],
                    ExperienceLevel.INTERMEDIATE: ["Pull-ups", "Barbell Row", "T-Bar Row",
                                                  "Lat Pulldown", "Face Pulls"],
                    ExperienceLevel.ADVANCED: ["Weighted Pull-ups", "Barbell Row", "T-Bar Row",
                                              "Deadlifts", "Face Pulls"]
                },
                EquipmentAccess.HOME_GYM: {
                    ExperienceLevel.BEGINNER: ["Dumbbell Row", "Reverse Flys", "Superman Holds",
                                              "Inverted Rows", "Band Pull-aparts"],
                    ExperienceLevel.INTERMEDIATE: ["Dumbbell Row", "Inverted Rows", "Pull-ups (if bar available)",
                                                  "Reverse Flys", "Band Pull-aparts"],
                    ExperienceLevel.ADVANCED: ["Weighted Pull-ups", "Dumbbell Row", "Inverted Rows",
                                              "One-Arm Dumbbell Row", "Band Pull-aparts"]
                },
                EquipmentAccess.MINIMAL: {
                    ExperienceLevel.BEGINNER: ["Superman Holds", "Inverted Rows", "Band Rows",
                                              "Band Pull-aparts", "Scapular Shrugs"],
                    ExperienceLevel.INTERMEDIATE: ["Pull-ups (if bar available)", "Inverted Rows",
                                                  "Band Rows", "Band Pull-aparts", "Archer Rows"],
                    ExperienceLevel.ADVANCED: ["One-Arm Pull-ups", "Inverted Rows", "Front Lever Progression",
                                              "Band Pull-aparts", "Archer Rows"]
                }
            },
            "legs": {
                EquipmentAccess.FULL_GYM: {
                    ExperienceLevel.BEGINNER: ["Leg Press", "Leg Extensions", "Leg Curls",
                                              "Goblet Squats", "Calf Raises"],
                    ExperienceLevel.INTERMEDIATE: ["Barbell Squats", "Romanian Deadlifts", "Leg Press",
                                                  "Leg Curls", "Calf Raises"],
                    ExperienceLevel.ADVANCED: ["Barbell Squats", "Front Squats", "Romanian Deadlifts",
                                              "Bulgarian Split Squats", "Calf Raises"]
                },
                EquipmentAccess.HOME_GYM: {
                    ExperienceLevel.BEGINNER: ["Goblet Squats", "Dumbbell Lunges", "Romanian Deadlifts",
                                              "Calf Raises", "Glute Bridges"],
                    ExperienceLevel.INTERMEDIATE: ["Dumbbell Squats", "Bulgarian Split Squats",
                                                  "Romanian Deadlifts", "Lunges", "Calf Raises"],
                    ExperienceLevel.ADVANCED: ["Single-Leg Squats", "Bulgarian Split Squats",
                                              "Single-Leg Romanian Deadlifts", "Weighted Lunges", "Calf Raises"]
                },
                EquipmentAccess.MINIMAL: {
                    ExperienceLevel.BEGINNER: ["Bodyweight Squats", "Lunges", "Glute Bridges",
                                              "Calf Raises", "Wall Sits"],
                    ExperienceLevel.INTERMEDIATE: ["Jump Squats", "Bulgarian Split Squats",
                                                  "Single-Leg Glute Bridges", "Pistol Squat Progression", "Calf Raises"],
                    ExperienceLevel.ADVANCED: ["Pistol Squats", "Shrimp Squats", "Jump Lunges",
                                              "Single-Leg Romanian Deadlifts", "Calf Raises"]
                }
            },
            "shoulders": {
                EquipmentAccess.FULL_GYM: {
                    ExperienceLevel.BEGINNER: ["Seated Dumbbell Press", "Lateral Raises", "Front Raises",
                                              "Reverse Flys", "Shrugs"],
                    ExperienceLevel.INTERMEDIATE: ["Overhead Press", "Arnold Press", "Lateral Raises",
                                                  "Face Pulls", "Shrugs"],
                    ExperienceLevel.ADVANCED: ["Overhead Press", "Push Press", "Lateral Raises",
                                              "Face Pulls", "Upright Rows"]
                },
                EquipmentAccess.HOME_GYM: {
                    ExperienceLevel.BEGINNER: ["Dumbbell Shoulder Press", "Lateral Raises", "Front Raises",
                                              "Reverse Flys", "Pike Push-ups"],
                    ExperienceLevel.INTERMEDIATE: ["Dumbbell Shoulder Press", "Arnold Press", "Lateral Raises",
                                                  "Reverse Flys", "Pike Push-ups"],
                    ExperienceLevel.ADVANCED: ["Handstand Push-ups", "Dumbbell Shoulder Press", "Lateral Raises",
                                              "Reverse Flys", "Pike Push-ups"]
                },
                EquipmentAccess.MINIMAL: {
                    ExperienceLevel.BEGINNER: ["Pike Push-ups", "Lateral Band Raises", "Front Band Raises",
                                              "Reverse Flys", "Handstand Holds"],
                    ExperienceLevel.INTERMEDIATE: ["Pike Push-ups", "Handstand Push-ups (wall-assisted)",
                                                  "Lateral Band Raises", "Band Pull-aparts", "Handstand Holds"],
                    ExperienceLevel.ADVANCED: ["Freestanding Handstand Push-ups", "Pike Push-ups",
                                              "Band Lateral Raises", "Band Pull-aparts", "Handstand Holds"]
                }
            },
            "arms": {
                EquipmentAccess.FULL_GYM: {
                    ExperienceLevel.BEGINNER: ["Barbell Curls", "Tricep Pushdowns", "Hammer Curls",
                                              "Overhead Tricep Extensions", "Cable Curls"],
                    ExperienceLevel.INTERMEDIATE: ["Barbell Curls", "Dips", "Preacher Curls",
                                                  "Skull Crushers", "Cable Curls"],
                    ExperienceLevel.ADVANCED: ["Weighted Dips", "Barbell Curls", "Close-Grip Bench Press",
                                              "Preacher Curls", "Overhead Extensions"]
                },
                EquipmentAccess.HOME_GYM: {
                    ExperienceLevel.BEGINNER: ["Dumbbell Curls", "Overhead Tricep Extensions", "Hammer Curls",
                                              "Tricep Kickbacks", "Concentration Curls"],
                    ExperienceLevel.INTERMEDIATE: ["Dumbbell Curls", "Dips", "Hammer Curls",
                                                  "Overhead Tricep Extensions", "Concentration Curls"],
                    ExperienceLevel.ADVANCED: ["Weighted Dips", "Dumbbell Curls", "Close-Grip Push-ups",
                                              "Hammer Curls", "Overhead Extensions"]
                },
                EquipmentAccess.MINIMAL: {
                    ExperienceLevel.BEGINNER: ["Diamond Push-ups", "Band Curls", "Dips (if bars available)",
                                              "Close-Grip Push-ups", "Band Tricep Extensions"],
                    ExperienceLevel.INTERMEDIATE: ["Diamond Push-ups", "Dips", "Band Curls",
                                                  "Close-Grip Push-ups", "Band Tricep Extensions"],
                    ExperienceLevel.ADVANCED: ["One-Arm Dips", "Diamond Push-ups", "Band Curls",
                                              "Pseudo Planche Push-ups", "Band Tricep Extensions"]
                }
            },
            "full_body": {
                EquipmentAccess.FULL_GYM: {
                    ExperienceLevel.BEGINNER: ["Squats", "Bench Press", "Lat Pulldown", "Overhead Press",
                                              "Leg Curls", "Planks"],
                    ExperienceLevel.INTERMEDIATE: ["Squats", "Bench Press", "Deadlifts", "Overhead Press",
                                                  "Pull-ups", "Romanian Deadlifts"],
                    ExperienceLevel.ADVANCED: ["Squats", "Bench Press", "Deadlifts", "Overhead Press",
                                              "Weighted Pull-ups", "Bulgarian Split Squats"]
                },
                EquipmentAccess.HOME_GYM: {
                    ExperienceLevel.BEGINNER: ["Goblet Squats", "Dumbbell Bench Press", "Dumbbell Rows",
                                              "Dumbbell Shoulder Press", "Lunges", "Planks"],
                    ExperienceLevel.INTERMEDIATE: ["Dumbbell Squats", "Dumbbell Bench Press", "Dumbbell Rows",
                                                  "Dumbbell Shoulder Press", "Romanian Deadlifts", "Pull-ups"],
                    ExperienceLevel.ADVANCED: ["Single-Leg Squats", "Dumbbell Bench Press", "Dumbbell Rows",
                                              "Dumbbell Shoulder Press", "Bulgarian Split Squats", "Weighted Pull-ups"]
                },
                EquipmentAccess.MINIMAL: {
                    ExperienceLevel.BEGINNER: ["Squats", "Push-ups", "Inverted Rows", "Pike Push-ups",
                                              "Lunges", "Planks"],
                    ExperienceLevel.INTERMEDIATE: ["Jump Squats", "Push-ups", "Pull-ups", "Pike Push-ups",
                                                  "Bulgarian Split Squats", "Planks"],
                    ExperienceLevel.ADVANCED: ["Pistol Squats", "One-Arm Push-ups", "Pull-ups",
                                              "Handstand Push-ups", "Shrimp Squats", "L-Sit Holds"]
                }
            },
            "upper_body": {
                EquipmentAccess.FULL_GYM: {
                    ExperienceLevel.BEGINNER: ["Bench Press", "Lat Pulldown", "Overhead Press", "Cable Rows",
                                              "Tricep Pushdowns", "Barbell Curls"],
                    ExperienceLevel.INTERMEDIATE: ["Bench Press", "Pull-ups", "Overhead Press", "Barbell Rows",
                                                  "Dips", "Barbell Curls"],
                    ExperienceLevel.ADVANCED: ["Bench Press", "Weighted Pull-ups", "Overhead Press", "Barbell Rows",
                                              "Weighted Dips", "Close-Grip Bench Press"]
                },
                EquipmentAccess.HOME_GYM: {
                    ExperienceLevel.BEGINNER: ["Dumbbell Bench Press", "Dumbbell Rows", "Dumbbell Shoulder Press",
                                              "Dumbbell Flys", "Overhead Tricep Extensions", "Dumbbell Curls"],
                    ExperienceLevel.INTERMEDIATE: ["Dumbbell Bench Press", "Dumbbell Rows", "Dumbbell Shoulder Press",
                                                  "Dips", "Pull-ups", "Dumbbell Curls"],
                    ExperienceLevel.ADVANCED: ["Dumbbell Bench Press", "Dumbbell Rows", "Dumbbell Shoulder Press",
                                              "Weighted Dips", "Weighted Pull-ups", "Close-Grip Push-ups"]
                },
                EquipmentAccess.MINIMAL: {
                    ExperienceLevel.BEGINNER: ["Push-ups", "Inverted Rows", "Pike Push-ups", "Diamond Push-ups",
                                              "Band Pull-aparts", "Band Curls"],
                    ExperienceLevel.INTERMEDIATE: ["Push-ups", "Pull-ups", "Pike Push-ups", "Dips",
                                                  "Inverted Rows", "Band Curls"],
                    ExperienceLevel.ADVANCED: ["One-Arm Push-ups", "Pull-ups", "Handstand Push-ups", "Dips",
                                              "Archer Rows", "Band Curls"]
                }
            },
            "lower_body": {
                EquipmentAccess.FULL_GYM: {
                    ExperienceLevel.BEGINNER: ["Leg Press", "Leg Extensions", "Leg Curls", "Calf Raises",
                                              "Glute Bridges", "Planks"],
                    ExperienceLevel.INTERMEDIATE: ["Squats", "Romanian Deadlifts", "Leg Press", "Leg Curls",
                                                  "Bulgarian Split Squats", "Calf Raises"],
                    ExperienceLevel.ADVANCED: ["Squats", "Deadlifts", "Front Squats", "Bulgarian Split Squats",
                                              "Nordic Curls", "Calf Raises"]
                },
                EquipmentAccess.HOME_GYM: {
                    ExperienceLevel.BEGINNER: ["Goblet Squats", "Lunges", "Romanian Deadlifts", "Calf Raises",
                                              "Glute Bridges", "Planks"],
                    ExperienceLevel.INTERMEDIATE: ["Dumbbell Squats", "Bulgarian Split Squats", "Romanian Deadlifts",
                                                  "Lunges", "Single-Leg Glute Bridges", "Calf Raises"],
                    ExperienceLevel.ADVANCED: ["Single-Leg Squats", "Bulgarian Split Squats",
                                              "Single-Leg Romanian Deadlifts", "Weighted Lunges",
                                              "Nordic Curls", "Calf Raises"]
                },
                EquipmentAccess.MINIMAL: {
                    ExperienceLevel.BEGINNER: ["Bodyweight Squats", "Lunges", "Glute Bridges", "Calf Raises",
                                              "Wall Sits", "Planks"],
                    ExperienceLevel.INTERMEDIATE: ["Jump Squats", "Bulgarian Split Squats", "Single-Leg Glute Bridges",
                                                  "Pistol Squat Progression", "Calf Raises", "Jump Lunges"],
                    ExperienceLevel.ADVANCED: ["Pistol Squats", "Shrimp Squats", "Single-Leg Romanian Deadlifts",
                                              "Jump Lunges", "Nordic Curls", "Calf Raises"]
                }
            }
        }

        # Get exercises for this muscle group, equipment, and experience
        try:
            exercise_list = exercises[muscle_group][equipment][experience]
            return exercise_list[:count]
        except KeyError:
            logger.warning(f"No exercises found for {muscle_group}/{equipment}/{experience}")
            return []

    def _build_workout_day(self, profile: UserGymProfile, week_number: int,
                          day_of_week: str, muscle_group: str) -> WorkoutPlan:
        """Build a single workout day"""
        scheme = self._get_set_rep_scheme(profile.primary_goal, profile.experience_level)
        exercises_list = self._select_exercises(
            muscle_group.lower().replace(" ", "_"),
            profile.equipment_access,
            profile.experience_level,
            count=5 if muscle_group == "full_body" else 4
        )

        # Build exercise objects with progressive overload
        exercises = []
        for exercise_name in exercises_list:
            exercises.append({
                "name": exercise_name,
                "sets": scheme["sets"] + (1 if week_number > 2 else 0),  # Add set after week 2
                "reps": scheme["reps"],
                "rest_seconds": scheme["rest"],
                "notes": self._get_exercise_notes(exercise_name, profile.injuries_notes)
            })

        return WorkoutPlan(
            user_id=profile.user_id,
            week_number=week_number,
            day_of_week=day_of_week,
            muscle_group=muscle_group,
            exercises=exercises
        )

    def _get_exercise_notes(self, exercise_name: str, injuries_notes: str) -> str:
        """Add notes for exercises based on injuries"""
        if not injuries_notes:
            return ""

        notes = []
        injuries_lower = injuries_notes.lower()

        # Knee-related warnings
        if "knee" in injuries_lower:
            if any(ex in exercise_name.lower() for ex in ["squat", "lunge", "leg press"]):
                notes.append("⚠️ Be careful with depth - stop if knee hurts")

        # Shoulder-related warnings
        if "shoulder" in injuries_lower:
            if any(ex in exercise_name.lower() for ex in ["press", "dips", "overhead"]):
                notes.append("⚠️ Reduce ROM if shoulder bothers you")

        # Back-related warnings
        if "back" in injuries_lower:
            if any(ex in exercise_name.lower() for ex in ["deadlift", "row", "squat"]):
                notes.append("⚠️ Focus on form - keep back neutral")

        return " | ".join(notes)

    def _generate_full_body_program(self, profile: UserGymProfile, weeks: int) -> List[WorkoutPlan]:
        """Generate Full Body split (3x per week)"""
        plans = []
        days = ["monday", "wednesday", "friday"][:profile.training_days_per_week]

        for week in range(1, weeks + 1):
            for day in days:
                plans.append(self._build_workout_day(profile, week, day, "Full Body"))

        return plans

    def _generate_upper_lower_program(self, profile: UserGymProfile, weeks: int) -> List[WorkoutPlan]:
        """Generate Upper/Lower split (4x per week)"""
        plans = []
        schedule = ["monday", "tuesday", "thursday", "friday"][:profile.training_days_per_week]
        pattern = ["Upper Body", "Lower Body", "Upper Body", "Lower Body"]

        for week in range(1, weeks + 1):
            for i, day in enumerate(schedule):
                muscle_group = pattern[i % len(pattern)]
                plans.append(self._build_workout_day(profile, week, day, muscle_group))

        return plans

    def _generate_ppl_program(self, profile: UserGymProfile, weeks: int) -> List[WorkoutPlan]:
        """Generate Push/Pull/Legs split (6x per week)"""
        plans = []
        schedule = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][:profile.training_days_per_week]
        pattern = ["Push (Chest/Shoulders/Triceps)", "Pull (Back/Biceps)", "Legs"]

        for week in range(1, weeks + 1):
            for i, day in enumerate(schedule):
                muscle_group = pattern[i % len(pattern)]
                plans.append(self._build_workout_day(profile, week, day, muscle_group))

        return plans

    def _generate_bro_split_program(self, profile: UserGymProfile, weeks: int) -> List[WorkoutPlan]:
        """Generate Bro Split (5-6x per week, one muscle per day)"""
        plans = []
        schedule = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][:profile.training_days_per_week]
        pattern = ["Chest", "Back", "Shoulders", "Legs", "Arms"]

        for week in range(1, weeks + 1):
            for i, day in enumerate(schedule):
                muscle_group = pattern[i % len(pattern)]
                plans.append(self._build_workout_day(profile, week, day, muscle_group))

        return plans

    def get_current_week_workouts(self, user_id: int) -> List[WorkoutPlan]:
        """Get this week's workout plans for a user"""
        from datetime import datetime, timedelta

        # Calculate current week number since program start
        first_plan = self.db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id == user_id
        ).order_by(WorkoutPlan.created_at).first()

        if not first_plan:
            return []

        # Calculate week number
        weeks_since_start = (datetime.now() - first_plan.created_at).days // 7
        current_week = (weeks_since_start % 4) + 1  # Cycle through 4 weeks

        # Get workouts for current week
        workouts = self.db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.week_number == current_week
        ).all()

        return workouts
