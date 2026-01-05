"""
Seed Workout Templates
Adds 5 system workout templates (PPL, Upper/Lower, Full Body, Bro Split, HIIT)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import engine
import json

templates_data = [
    # 1. PUSH/PULL/LEGS (6 days, intermediate-advanced)
    {
        "name": "Push/Pull/Legs Split",
        "description": "Classic 6-day split focusing on push movements, pull movements, and legs separately. Excellent for intermediate to advanced lifters looking for high volume and muscle gain.",
        "difficulty": "intermediate",
        "frequency": "6 days/week",
        "split": "Push/Pull/Legs",
        "duration": "60-75 min",
        "goal": "Muscle Gain & Strength",
        "workouts": [
            {
                "day": 1,
                "name": "Push Day (Chest, Shoulders, Triceps)",
                "muscle_group": "Chest, Shoulders, Triceps",
                "exercises": [
                    {"name": "Barbell Bench Press", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Incline Dumbbell Press", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "8-12", "rest": 90},
                    {"name": "Lateral Raises", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Tricep Pushdown", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Overhead Tricep Extension", "sets": 3, "reps": "10-12", "rest": 60}
                ]
            },
            {
                "day": 2,
                "name": "Pull Day (Back, Biceps)",
                "muscle_group": "Back, Biceps",
                "exercises": [
                    {"name": "Barbell Deadlift", "sets": 4, "reps": "5-6", "rest": 180},
                    {"name": "Pull-Ups", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Barbell Row", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Face Pulls", "sets": 3, "reps": "15-20", "rest": 60},
                    {"name": "Barbell Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Hammer Curl", "sets": 3, "reps": "10-12", "rest": 60}
                ]
            },
            {
                "day": 3,
                "name": "Leg Day (Quads, Hamstrings, Glutes, Calves)",
                "muscle_group": "Legs",
                "exercises": [
                    {"name": "Barbell Back Squat", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Romanian Deadlift", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Leg Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Leg Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Walking Lunges", "sets": 3, "reps": "12-15 each leg", "rest": 60},
                    {"name": "Calf Raise", "sets": 4, "reps": "15-20", "rest": 60}
                ]
            },
            {
                "day": 4,
                "name": "Push Day (Repeat, Different Exercise Order)",
                "muscle_group": "Chest, Shoulders, Triceps",
                "exercises": [
                    {"name": "Incline Barbell Bench Press", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Dumbbell Bench Press", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Overhead Press", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Cable Flyes", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Close-Grip Bench Press", "sets": 3, "reps": "8-10", "rest": 90},
                    {"name": "Lateral Raises", "sets": 3, "reps": "12-15", "rest": 60}
                ]
            },
            {
                "day": 5,
                "name": "Pull Day (Repeat, Different Exercise Order)",
                "muscle_group": "Back, Biceps",
                "exercises": [
                    {"name": "Barbell Row", "sets": 4, "reps": "6-8", "rest": 120},
                    {"name": "Lat Pulldown", "sets": 4, "reps": "8-10", "rest": 90},
                    {"name": "Dumbbell Row", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Seated Cable Row", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Dumbbell Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Preacher Curl", "sets": 3, "reps": "10-12", "rest": 60}
                ]
            },
            {
                "day": 6,
                "name": "Leg Day (Repeat, Different Exercise Order)",
                "muscle_group": "Legs",
                "exercises": [
                    {"name": "Front Squat", "sets": 4, "reps": "8-10", "rest": 150},
                    {"name": "Leg Press", "sets": 4, "reps": "10-12", "rest": 90},
                    {"name": "Bulgarian Split Squat", "sets": 3, "reps": "10-12 each leg", "rest": 90},
                    {"name": "Leg Curl", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Leg Extension", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Calf Raise", "sets": 4, "reps": "15-20", "rest": 60}
                ]
            }
        ]
    },

    # 2. UPPER/LOWER SPLIT (4 days, intermediate)
    {
        "name": "Upper/Lower Split",
        "description": "4-day split alternating upper and lower body. Great balance of frequency and recovery. Perfect for intermediate lifters.",
        "difficulty": "intermediate",
        "frequency": "4 days/week",
        "split": "Upper/Lower",
        "duration": "60-75 min",
        "goal": "Muscle Gain & Strength",
        "workouts": [
            {
                "day": 1,
                "name": "Upper Body A (Chest, Back, Shoulders, Arms)",
                "muscle_group": "Upper Body",
                "exercises": [
                    {"name": "Barbell Bench Press", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Barbell Row", "sets": 4, "reps": "6-8", "rest": 150},
                    {"name": "Overhead Press", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Barbell Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Tricep Pushdown", "sets": 3, "reps": "10-12", "rest": 60}
                ]
            },
            {
                "day": 2,
                "name": "Lower Body A (Quads, Hamstrings, Glutes)",
                "muscle_group": "Lower Body",
                "exercises": [
                    {"name": "Barbell Back Squat", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Romanian Deadlift", "sets": 4, "reps": "8-10", "rest": 150},
                    {"name": "Leg Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Leg Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Walking Lunges", "sets": 3, "reps": "12-15 each leg", "rest": 60},
                    {"name": "Plank", "sets": 3, "reps": "60 seconds", "rest": 60}
                ]
            },
            {
                "day": 3,
                "name": "Upper Body B (Chest, Back, Shoulders, Arms)",
                "muscle_group": "Upper Body",
                "exercises": [
                    {"name": "Incline Dumbbell Press", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Pull-Ups", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Seated Cable Row", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Dumbbell Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Overhead Tricep Extension", "sets": 3, "reps": "10-12", "rest": 60}
                ]
            },
            {
                "day": 4,
                "name": "Lower Body B (Quads, Hamstrings, Glutes)",
                "muscle_group": "Lower Body",
                "exercises": [
                    {"name": "Front Squat", "sets": 4, "reps": "8-10", "rest": 150},
                    {"name": "Barbell Deadlift", "sets": 3, "reps": "5-6", "rest": 180},
                    {"name": "Bulgarian Split Squat", "sets": 3, "reps": "10-12 each leg", "rest": 90},
                    {"name": "Leg Extension", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Calf Raise", "sets": 4, "reps": "15-20", "rest": 60},
                    {"name": "Russian Twists", "sets": 3, "reps": "20 each side", "rest": 60}
                ]
            }
        ]
    },

    # 3. FULL BODY (3 days, beginner)
    {
        "name": "Full Body 3x Week",
        "description": "Full body workout 3 times per week. Perfect for beginners or those with limited time. Focuses on compound movements and building a solid foundation.",
        "difficulty": "beginner",
        "frequency": "3 days/week",
        "split": "Full Body",
        "duration": "45-60 min",
        "goal": "General Fitness & Strength",
        "workouts": [
            {
                "day": 1,
                "name": "Full Body A",
                "muscle_group": "Full Body",
                "exercises": [
                    {"name": "Barbell Back Squat", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Barbell Bench Press", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Barbell Row", "sets": 3, "reps": "8-10", "rest": 90},
                    {"name": "Overhead Press", "sets": 3, "reps": "8-10", "rest": 90},
                    {"name": "Romanian Deadlift", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Plank", "sets": 3, "reps": "45 seconds", "rest": 60}
                ]
            },
            {
                "day": 2,
                "name": "Full Body B",
                "muscle_group": "Full Body",
                "exercises": [
                    {"name": "Barbell Deadlift", "sets": 3, "reps": "6-8", "rest": 150},
                    {"name": "Dumbbell Bench Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Leg Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Crunches", "sets": 3, "reps": "15-20", "rest": 60}
                ]
            },
            {
                "day": 3,
                "name": "Full Body C",
                "muscle_group": "Full Body",
                "exercises": [
                    {"name": "Front Squat", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Pull-Ups", "sets": 3, "reps": "as many as possible", "rest": 120},
                    {"name": "Walking Lunges", "sets": 3, "reps": "12 each leg", "rest": 90},
                    {"name": "Face Pulls", "sets": 3, "reps": "15-20", "rest": 60},
                    {"name": "Russian Twists", "sets": 3, "reps": "20 each side", "rest": 60}
                ]
            }
        ]
    },

    # 4. BRO SPLIT (5 days, intermediate)
    {
        "name": "Bro Split (5 Days)",
        "description": "Traditional bodybuilding split with one muscle group per day. High volume for each muscle. Popular for muscle hypertrophy.",
        "difficulty": "intermediate",
        "frequency": "5 days/week",
        "split": "Bro Split",
        "duration": "60-75 min",
        "goal": "Muscle Gain",
        "workouts": [
            {
                "day": 1,
                "name": "Chest Day",
                "muscle_group": "Chest",
                "exercises": [
                    {"name": "Barbell Bench Press", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Incline Dumbbell Press", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Decline Bench Press", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Dumbbell Flyes", "sets": 3, "reps": "12-15", "rest": 90},
                    {"name": "Cable Flyes", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Push-Ups", "sets": 3, "reps": "to failure", "rest": 60}
                ]
            },
            {
                "day": 2,
                "name": "Back Day",
                "muscle_group": "Back",
                "exercises": [
                    {"name": "Barbell Deadlift", "sets": 4, "reps": "5-6", "rest": 180},
                    {"name": "Pull-Ups", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Barbell Row", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Seated Cable Row", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Face Pulls", "sets": 3, "reps": "15-20", "rest": 60}
                ]
            },
            {
                "day": 3,
                "name": "Shoulder Day",
                "muscle_group": "Shoulders",
                "exercises": [
                    {"name": "Overhead Press", "sets": 4, "reps": "6-8", "rest": 150},
                    {"name": "Dumbbell Shoulder Press", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Lateral Raises", "sets": 4, "reps": "12-15", "rest": 60},
                    {"name": "Front Raises", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Reverse Flyes", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Shrugs", "sets": 3, "reps": "12-15", "rest": 60}
                ]
            },
            {
                "day": 4,
                "name": "Arm Day (Biceps & Triceps)",
                "muscle_group": "Arms",
                "exercises": [
                    {"name": "Barbell Curl", "sets": 4, "reps": "8-10", "rest": 90},
                    {"name": "Close-Grip Bench Press", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Hammer Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Tricep Dips", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Preacher Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Overhead Tricep Extension", "sets": 3, "reps": "10-12", "rest": 60}
                ]
            },
            {
                "day": 5,
                "name": "Leg Day",
                "muscle_group": "Legs",
                "exercises": [
                    {"name": "Barbell Back Squat", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Romanian Deadlift", "sets": 4, "reps": "8-10", "rest": 150},
                    {"name": "Leg Press", "sets": 4, "reps": "10-12", "rest": 120},
                    {"name": "Leg Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Leg Extension", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Calf Raise", "sets": 4, "reps": "15-20", "rest": 60}
                ]
            }
        ]
    },

    # 5. HIIT PROGRAM (4 days, fat loss)
    {
        "name": "HIIT Fat Loss Program",
        "description": "High-intensity interval training combined with compound lifts. Designed for fat loss while maintaining muscle. Fast-paced, metabolically demanding workouts.",
        "difficulty": "intermediate",
        "frequency": "4 days/week",
        "split": "Full Body HIIT",
        "duration": "30-45 min",
        "goal": "Fat Loss & Conditioning",
        "workouts": [
            {
                "day": 1,
                "name": "HIIT Upper Body",
                "muscle_group": "Upper Body",
                "exercises": [
                    {"name": "Push-Ups", "sets": 4, "reps": "20", "rest": 30},
                    {"name": "Dumbbell Row", "sets": 4, "reps": "15 each arm", "rest": 30},
                    {"name": "Dumbbell Shoulder Press", "sets": 4, "reps": "12", "rest": 30},
                    {"name": "Mountain Climbers", "sets": 4, "reps": "30 seconds", "rest": 30},
                    {"name": "Burpees", "sets": 3, "reps": "10", "rest": 60},
                    {"name": "Battle Ropes", "sets": 3, "reps": "30 seconds", "rest": 60}
                ]
            },
            {
                "day": 2,
                "name": "HIIT Lower Body",
                "muscle_group": "Lower Body",
                "exercises": [
                    {"name": "Goblet Squat", "sets": 4, "reps": "15", "rest": 30},
                    {"name": "Jump Rope", "sets": 4, "reps": "60 seconds", "rest": 30},
                    {"name": "Walking Lunges", "sets": 4, "reps": "12 each leg", "rest": 30},
                    {"name": "Burpees", "sets": 4, "reps": "12", "rest": 45},
                    {"name": "Glute Bridge", "sets": 3, "reps": "20", "rest": 30},
                    {"name": "Mountain Climbers", "sets": 3, "reps": "45 seconds", "rest": 60}
                ]
            },
            {
                "day": 3,
                "name": "HIIT Full Body Circuit",
                "muscle_group": "Full Body",
                "exercises": [
                    {"name": "Barbell Deadlift", "sets": 4, "reps": "10", "rest": 45},
                    {"name": "Push-Ups", "sets": 4, "reps": "15", "rest": 30},
                    {"name": "Jump Rope", "sets": 4, "reps": "90 seconds", "rest": 45},
                    {"name": "Dumbbell Row", "sets": 3, "reps": "12 each arm", "rest": 30},
                    {"name": "Burpees", "sets": 3, "reps": "15", "rest": 60},
                    {"name": "Running", "sets": 1, "reps": "10 min steady pace", "rest": 0}
                ]
            },
            {
                "day": 4,
                "name": "HIIT Cardio & Core",
                "muscle_group": "Cardio & Core",
                "exercises": [
                    {"name": "Running", "sets": 6, "reps": "2 min sprint / 1 min walk", "rest": 0},
                    {"name": "Burpees", "sets": 4, "reps": "15", "rest": 45},
                    {"name": "Mountain Climbers", "sets": 4, "reps": "60 seconds", "rest": 30},
                    {"name": "Plank", "sets": 3, "reps": "60 seconds", "rest": 30},
                    {"name": "Russian Twists", "sets": 3, "reps": "30 each side", "rest": 30},
                    {"name": "Jump Rope", "sets": 3, "reps": "2 minutes", "rest": 60}
                ]
            }
        ]
    }
]

def seed_templates():
    """Insert all workout templates into database"""
    try:
        print("=" * 60)
        print("Seeding Workout Templates")
        print("=" * 60)
        print()

        with engine.connect() as conn:
            # Clear existing templates (optional)
            conn.execute(text("DELETE FROM workout_templates WHERE is_system = TRUE"))
            print(f"Cleared existing system templates")
            print()

            # Insert all templates
            for i, template in enumerate(templates_data, 1):
                conn.execute(text("""
                    INSERT INTO workout_templates (
                        name, description, difficulty, frequency,
                        split, duration, goal, workouts, is_system
                    ) VALUES (
                        :name, :description, :difficulty, :frequency,
                        :split, :duration, :goal, :workouts, TRUE
                    )
                """), {
                    "name": template["name"],
                    "description": template["description"],
                    "difficulty": template["difficulty"],
                    "frequency": template["frequency"],
                    "split": template["split"],
                    "duration": template["duration"],
                    "goal": template["goal"],
                    "workouts": json.dumps(template["workouts"])
                })

                print(f"   [{i}/5] {template['name']}")
                print(f"       - {template['frequency']}, {template['difficulty']}, {template['goal']}")
                print(f"       - {len(template['workouts'])} workouts")
                print()

            conn.commit()

            print("=" * 60)
            print(f"SUCCESS! Inserted {len(templates_data)} workout templates")
            print("=" * 60)
            print()

            return True

    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = seed_templates()

    if success:
        print()
        print("Templates added:")
        print("1. Push/Pull/Legs Split (6 days)")
        print("2. Upper/Lower Split (4 days)")
        print("3. Full Body 3x Week (3 days)")
        print("4. Bro Split (5 days)")
        print("5. HIIT Fat Loss Program (4 days)")
        print()
        print("Next steps:")
        print("1. Check templates: SELECT COUNT(*) FROM workout_templates;")
        print("2. Test API: GET /health/templates")
        print("3. Proceed to test API endpoints")
    else:
        print()
        print("Failed to seed templates. Check errors above.")
