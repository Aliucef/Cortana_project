"""
Populate Workout Templates
Run this script once to add system workout templates
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import engine
import json

templates = [
    {
        "name": "Push/Pull/Legs Split",
        "description": "Classic 6-day split focusing on pushing muscles, pulling muscles, and legs on separate days. Perfect for intermediate to advanced lifters seeking muscle growth and strength.",
        "difficulty": "intermediate",
        "frequency": "6 days/week",
        "split": "Push/Pull/Legs",
        "duration": "60-75 min",
        "goal": "Muscle Gain & Strength",
        "workouts": json.dumps([
            {
                "day": "Day 1",
                "name": "Push - Chest, Shoulders, Triceps",
                "muscle_group": "Chest, Shoulders, Triceps",
                "exercises": [
                    {"name": "Barbell Bench Press", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Overhead Press (OHP)", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Lateral Raises", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Tricep Pushdown", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Overhead Tricep Extension", "sets": 3, "reps": "12-15", "rest": 60}
                ]
            },
            {
                "day": "Day 2",
                "name": "Pull - Back, Biceps",
                "muscle_group": "Back, Biceps",
                "exercises": [
                    {"name": "Deadlift", "sets": 4, "reps": "5-6", "rest": 180},
                    {"name": "Pull-Ups", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Barbell Row", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Seated Cable Row", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Barbell Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Hammer Curls", "sets": 3, "reps": "12-15", "rest": 60}
                ]
            },
            {
                "day": "Day 3",
                "name": "Legs - Quads, Hamstrings, Glutes, Calves",
                "muscle_group": "Legs",
                "exercises": [
                    {"name": "Barbell Squat", "sets": 4, "reps": "6-8", "rest": 180},
                    {"name": "Romanian Deadlift", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Leg Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Leg Curl", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Leg Extension", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Calf Raises", "sets": 4, "reps": "15-20", "rest": 60}
                ]
            },
            {
                "day": "Day 4",
                "name": "Push - Chest, Shoulders, Triceps (Volume)",
                "muscle_group": "Chest, Shoulders, Triceps",
                "exercises": [
                    {"name": "Dumbbell Bench Press", "sets": 4, "reps": "8-10", "rest": 120},
                    {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Cable Flyes", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Front Raises", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Tricep Dips", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Tricep Pushdown", "sets": 3, "reps": "15-20", "rest": 60}
                ]
            },
            {
                "day": "Day 5",
                "name": "Pull - Back, Biceps (Volume)",
                "muscle_group": "Back, Biceps",
                "exercises": [
                    {"name": "Lat Pulldown", "sets": 4, "reps": "10-12", "rest": 90},
                    {"name": "T-Bar Row", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Seated Cable Row", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Face Pulls", "sets": 3, "reps": "15-20", "rest": 60},
                    {"name": "Preacher Curl", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Hammer Curls", "sets": 3, "reps": "12-15", "rest": 60}
                ]
            },
            {
                "day": "Day 6",
                "name": "Legs - Quads, Hamstrings, Glutes (Volume)",
                "muscle_group": "Legs",
                "exercises": [
                    {"name": "Leg Press", "sets": 4, "reps": "12-15", "rest": 90},
                    {"name": "Romanian Deadlift", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Lunges", "sets": 3, "reps": "12-15", "rest": 90},
                    {"name": "Leg Curl", "sets": 3, "reps": "15-20", "rest": 60},
                    {"name": "Leg Extension", "sets": 3, "reps": "15-20", "rest": 60},
                    {"name": "Calf Raises", "sets": 4, "reps": "20-25", "rest": 60}
                ]
            }
        ])
    },
    {
        "name": "Upper/Lower Split",
        "description": "4-day split alternating between upper body and lower body workouts. Great balance of frequency and recovery for intermediate lifters.",
        "difficulty": "intermediate",
        "frequency": "4 days/week",
        "split": "Upper/Lower",
        "duration": "60-75 min",
        "goal": "Muscle Gain & Strength",
        "workouts": json.dumps([
            {
                "day": "Day 1",
                "name": "Upper Body - Power",
                "muscle_group": "Chest, Back, Shoulders, Arms",
                "exercises": [
                    {"name": "Barbell Bench Press", "sets": 4, "reps": "5-6", "rest": 180},
                    {"name": "Barbell Row", "sets": 4, "reps": "5-6", "rest": 180},
                    {"name": "Overhead Press (OHP)", "sets": 3, "reps": "6-8", "rest": 120},
                    {"name": "Pull-Ups", "sets": 3, "reps": "6-8", "rest": 120},
                    {"name": "Barbell Curl", "sets": 3, "reps": "8-10", "rest": 90},
                    {"name": "Tricep Dips", "sets": 3, "reps": "8-10", "rest": 90}
                ]
            },
            {
                "day": "Day 2",
                "name": "Lower Body - Power",
                "muscle_group": "Quads, Hamstrings, Glutes",
                "exercises": [
                    {"name": "Barbell Squat", "sets": 4, "reps": "5-6", "rest": 180},
                    {"name": "Deadlift", "sets": 3, "reps": "5-6", "rest": 180},
                    {"name": "Leg Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Leg Curl", "sets": 3, "reps": "10-12", "rest": 60},
                    {"name": "Calf Raises", "sets": 4, "reps": "12-15", "rest": 60},
                    {"name": "Plank", "sets": 3, "reps": "60 sec", "rest": 60}
                ]
            },
            {
                "day": "Day 3",
                "name": "Upper Body - Hypertrophy",
                "muscle_group": "Chest, Back, Shoulders, Arms",
                "exercises": [
                    {"name": "Incline Dumbbell Press", "sets": 4, "reps": "10-12", "rest": 90},
                    {"name": "Lat Pulldown", "sets": 4, "reps": "10-12", "rest": 90},
                    {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Seated Cable Row", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Lateral Raises", "sets": 3, "reps": "15-20", "rest": 60},
                    {"name": "Cable Flyes", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Preacher Curl", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Tricep Pushdown", "sets": 3, "reps": "15-20", "rest": 60}
                ]
            },
            {
                "day": "Day 4",
                "name": "Lower Body - Hypertrophy",
                "muscle_group": "Quads, Hamstrings, Glutes",
                "exercises": [
                    {"name": "Leg Press", "sets": 4, "reps": "12-15", "rest": 90},
                    {"name": "Romanian Deadlift", "sets": 4, "reps": "10-12", "rest": 90},
                    {"name": "Lunges", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Leg Extension", "sets": 3, "reps": "15-20", "rest": 60},
                    {"name": "Leg Curl", "sets": 3, "reps": "15-20", "rest": 60},
                    {"name": "Calf Raises", "sets": 4, "reps": "20-25", "rest": 60},
                    {"name": "Russian Twists", "sets": 3, "reps": "20", "rest": 60}
                ]
            }
        ])
    },
    {
        "name": "Full Body Strength",
        "description": "3-day full body routine hitting all major muscle groups each session. Ideal for beginners or those with limited training time.",
        "difficulty": "beginner",
        "frequency": "3 days/week",
        "split": "Full Body",
        "duration": "45-60 min",
        "goal": "Overall Strength & Fitness",
        "workouts": json.dumps([
            {
                "day": "Day 1",
                "name": "Full Body A",
                "muscle_group": "All Major Muscles",
                "exercises": [
                    {"name": "Barbell Squat", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Barbell Bench Press", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Barbell Row", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Overhead Press (OHP)", "sets": 3, "reps": "8-10", "rest": 90},
                    {"name": "Barbell Curl", "sets": 2, "reps": "10-12", "rest": 60},
                    {"name": "Tricep Pushdown", "sets": 2, "reps": "10-12", "rest": 60},
                    {"name": "Plank", "sets": 3, "reps": "45 sec", "rest": 60}
                ]
            },
            {
                "day": "Day 2",
                "name": "Full Body B",
                "muscle_group": "All Major Muscles",
                "exercises": [
                    {"name": "Deadlift", "sets": 3, "reps": "6-8", "rest": 150},
                    {"name": "Pull-Ups", "sets": 3, "reps": "6-10", "rest": 120},
                    {"name": "Dumbbell Bench Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Leg Press", "sets": 3, "reps": "12-15", "rest": 90},
                    {"name": "Lateral Raises", "sets": 3, "reps": "12-15", "rest": 60},
                    {"name": "Hammer Curls", "sets": 2, "reps": "12-15", "rest": 60},
                    {"name": "Russian Twists", "sets": 3, "reps": "15", "rest": 60}
                ]
            },
            {
                "day": "Day 3",
                "name": "Full Body C",
                "muscle_group": "All Major Muscles",
                "exercises": [
                    {"name": "Romanian Deadlift", "sets": 3, "reps": "8-10", "rest": 120},
                    {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Lunges", "sets": 3, "reps": "12-15", "rest": 90},
                    {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest": 90},
                    {"name": "Cable Flyes", "sets": 2, "reps": "12-15", "rest": 60},
                    {"name": "Preacher Curl", "sets": 2, "reps": "12-15", "rest": 60},
                    {"name": "Calf Raises", "sets": 3, "reps": "15-20", "rest": 60}
                ]
            }
        ])
    }
]


def populate_templates():
    """Insert workout templates into the database"""
    print("=" * 60)
    print("Populating Workout Templates")
    print("=" * 60)
    print()

    try:
        with engine.connect() as conn:
            # Check if templates already exist
            result = conn.execute(text("SELECT COUNT(*) FROM workout_templates WHERE is_system = TRUE"))
            count = result.scalar()

            if count > 0:
                print(f"[WARNING] Found {count} existing system templates.")
                response = input("Do you want to delete and re-populate? (yes/no): ")
                if response.lower() != 'yes':
                    print("Cancelled.")
                    return

                conn.execute(text("DELETE FROM workout_templates WHERE is_system = TRUE"))
                conn.commit()
                print(f"[OK] Deleted {count} existing templates")
                print()

            # Insert templates
            print(f"Adding {len(templates)} workout templates...")
            print()

            for i, template in enumerate(templates, 1):
                conn.execute(text("""
                    INSERT INTO workout_templates
                    (name, description, difficulty, frequency, split, duration, goal, workouts, is_system)
                    VALUES
                    (:name, :description, :difficulty, :frequency, :split, :duration, :goal, :workouts, TRUE)
                """), template)

                print(f"  [{i}/{len(templates)}] [OK] {template['name']}")
                print(f"      - {template['split']} | {template['frequency']} | {template['difficulty']}")

            conn.commit()

        print()
        print("=" * 60)
        print(f"[SUCCESS] Added {len(templates)} workout templates!")
        print("=" * 60)
        print()
        print("Templates added:")
        for temp in templates:
            workouts = json.loads(temp['workouts'])
            print(f"  - {temp['name']}: {len(workouts)} workouts")

        print()
        print("Next step: Test API endpoints")

    except Exception as e:
        print()
        print("=" * 60)
        print(f"[ERROR] {str(e)}")
        print("=" * 60)


if __name__ == "__main__":
    populate_templates()
