"""
Seed realistic health data for user 1 to test the dashboard
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from config.database import engine, get_db
from models.workout import (
    UserGymProfile, WorkoutLog, WeightLog, PersonalRecord,
    WorkoutNote, RestDay, Exercise,
    WorkoutGoal, ExperienceLevel, EquipmentAccess, TrainingSplit, PreferredTime
)
import random

def seed_user_health_data():
    db = next(get_db())
    user_id = 1

    try:
        print("Starting health data seeding for user 1...")

        # 1. Create Gym Profile
        print("\n[1] Creating gym profile...")
        existing_profile = db.query(UserGymProfile).filter(UserGymProfile.user_id == user_id).first()
        if existing_profile:
            print("   OK Profile already exists, skipping...")
        else:
            profile = UserGymProfile(
                user_id=user_id,
                weight=82.5,
                height=178.0,
                experience_level=ExperienceLevel.INTERMEDIATE,
                primary_goal=WorkoutGoal.MUSCLE_GAIN,
                training_days_per_week=5,
                equipment_access=EquipmentAccess.FULL_GYM,
                training_split=TrainingSplit.PUSH_PULL_LEGS,
                preferred_time=PreferredTime.EVENING,
                onboarding_completed=True
            )
            db.add(profile)
            db.commit()
            print(f"   OK Created profile: {profile.experience_level.value}, Goal: {profile.primary_goal.value}")

        # 2. Add Weight Logs with Body Measurements (last 60 days)
        print("\n[2] Adding weight logs with measurements...")
        existing_weights = db.query(WeightLog).filter(WeightLog.user_id == user_id).count()
        if existing_weights > 0:
            print(f"   OK {existing_weights} weight logs already exist, skipping...")
        else:
            start_weight = 79.5
            target_weight = 82.5
            days = 60

            # Base measurements that will progress
            base_measurements = {
                "chest": 98,
                "waist": 82,
                "arms": 37,
                "legs": 58,
                "shoulders": 118
            }

            for i in range(days):
                date = datetime.now() - timedelta(days=days-i)
                # Gradual weight gain with some fluctuation
                progress = i / days
                weight = start_weight + (target_weight - start_weight) * progress
                weight += random.uniform(-0.3, 0.3)  # Daily fluctuation

                # Body fat decreases as weight increases (muscle gain)
                body_fat = 16.5 - (progress * 2.5) + random.uniform(-0.2, 0.2)

                # Add measurements every 7 days
                measurements = None
                if i % 7 == 0:
                    measurements = {
                        "chest": round(base_measurements["chest"] + (progress * 4), 1),
                        "waist": round(base_measurements["waist"] - (progress * 2.5), 1),
                        "arms": round(base_measurements["arms"] + (progress * 2), 1),
                        "legs": round(base_measurements["legs"] + (progress * 3.5), 1),
                        "shoulders": round(base_measurements["shoulders"] + (progress * 4), 1)
                    }

                weight_log = WeightLog(
                    user_id=user_id,
                    weight=round(weight, 1),
                    body_fat_percentage=round(body_fat, 1) if i % 7 == 0 else None,
                    measurements=measurements,
                    weigh_in_date=date.date()
                )
                db.add(weight_log)

            db.commit()
            print(f"   OK Added {days} weight logs (from {start_weight}kg to {target_weight}kg)")
            print(f"   OK Included body measurements every 7 days")

        # 3. Add Personal Records
        print("\n[3] Adding personal records...")
        existing_prs = db.query(PersonalRecord).filter(PersonalRecord.user_id == user_id).count()
        if existing_prs > 0:
            print(f"   OK {existing_prs} PRs already exist, skipping...")
        else:
            # Get exercise IDs
            bench_press = db.query(Exercise).filter(Exercise.name == "Barbell Bench Press").first()
            squat = db.query(Exercise).filter(Exercise.name == "Barbell Back Squat").first()
            deadlift = db.query(Exercise).filter(Exercise.name == "Barbell Deadlift").first()
            ohp = db.query(Exercise).filter(Exercise.name == "Barbell Overhead Press").first()
            row = db.query(Exercise).filter(Exercise.name == "Barbell Bent Over Row").first()

            prs_data = []
            if bench_press:
                prs_data.append({"exercise": bench_press, "weight": 100, "reps": 1, "name": "Bench Press 1RM"})
                prs_data.append({"exercise": bench_press, "weight": 80, "reps": 5, "name": "Bench Press 5RM"})

            if squat:
                prs_data.append({"exercise": squat, "weight": 140, "reps": 1, "name": "Squat 1RM"})
                prs_data.append({"exercise": squat, "weight": 120, "reps": 5, "name": "Squat 5RM"})

            if deadlift:
                prs_data.append({"exercise": deadlift, "weight": 160, "reps": 1, "name": "Deadlift 1RM"})
                prs_data.append({"exercise": deadlift, "weight": 140, "reps": 5, "name": "Deadlift 5RM"})

            if ohp:
                prs_data.append({"exercise": ohp, "weight": 65, "reps": 1, "name": "OHP 1RM"})

            if row:
                prs_data.append({"exercise": row, "weight": 90, "reps": 5, "name": "Row 5RM"})

            for pr_data in prs_data:
                pr = PersonalRecord(
                    user_id=user_id,
                    exercise_name=pr_data["exercise"].name,
                    max_weight=pr_data["weight"],
                    max_reps=pr_data["reps"],
                    record_type="weight",
                    achieved_date=(datetime.now() - timedelta(days=random.randint(1, 30))).date()
                )
                db.add(pr)

            db.commit()
            print(f"   OK Added {len(prs_data)} personal records")

        # 4. Add Workout Logs (last 30 days)
        print("\n[4] Adding workout logs...")
        existing_logs = db.query(WorkoutLog).filter(WorkoutLog.user_id == user_id).count()
        if existing_logs > 0:
            print(f"   OK {existing_logs} workout logs already exist, skipping...")
        else:
            # Get all exercises
            all_exercises = db.query(Exercise).all()

            # Workout schedule: Push/Pull/Legs (6 days/week)
            workout_types = {
                0: "rest",  # Sunday
                1: "push",  # Monday
                2: "pull",  # Tuesday
                3: "legs",  # Wednesday
                4: "push",  # Thursday
                5: "pull",  # Friday
                6: "legs",  # Saturday
            }

            push_exercises = [e for e in all_exercises if e.category in ["chest", "shoulders", "arms"] and "tricep" in e.name.lower() or "press" in e.name.lower()]
            pull_exercises = [e for e in all_exercises if e.category in ["back", "arms"] and ("pull" in e.name.lower() or "row" in e.name.lower() or "curl" in e.name.lower())]
            leg_exercises = [e for e in all_exercises if e.category == "legs"]

            logs_added = 0
            for i in range(30):
                date = datetime.now() - timedelta(days=30-i)
                day_of_week = date.weekday()
                workout_type = workout_types.get((day_of_week + 1) % 7, "rest")  # Adjust for Sunday=0

                if workout_type == "rest":
                    continue

                # Select exercises based on workout type
                if workout_type == "push":
                    selected_exercises = random.sample(push_exercises, min(5, len(push_exercises)))
                elif workout_type == "pull":
                    selected_exercises = random.sample(pull_exercises, min(5, len(pull_exercises)))
                else:  # legs
                    selected_exercises = random.sample(leg_exercises, min(5, len(leg_exercises)))

                # Add 4-6 exercises per workout
                for exercise in selected_exercises[:random.randint(4, 6)]:
                    sets = random.randint(3, 4)
                    reps = random.randint(8, 12)

                    # Determine weight based on exercise category
                    if "press" in exercise.name.lower() or "squat" in exercise.name.lower():
                        base_weight = random.randint(60, 100)
                    elif "curl" in exercise.name.lower() or "raise" in exercise.name.lower():
                        base_weight = random.randint(10, 25)
                    else:
                        base_weight = random.randint(30, 70)

                    log = WorkoutLog(
                        user_id=user_id,
                        exercise_name=exercise.name,
                        sets=sets,
                        reps=reps,
                        weight=base_weight,
                        duration_minutes=random.randint(3, 8),
                        logged_at=date
                    )
                    db.add(log)
                    logs_added += 1

            db.commit()
            print(f"   OK Added {logs_added} workout logs across 30 days")

        # 5. Add Workout Notes
        print("\n[5] Adding workout notes...")
        existing_notes = db.query(WorkoutNote).filter(WorkoutNote.user_id == user_id).count()
        if existing_notes > 0:
            print(f"   OK {existing_notes} notes already exist, skipping...")
        else:
            notes_data = [
                {"days_ago": 25, "title": "Great Chest Day!", "content": "Hit a new PR on bench press! Form felt solid, going to keep pushing.", "difficulty": 4},
                {"days_ago": 20, "title": "Leg DOMS", "content": "Squats yesterday destroyed me. Can barely walk today but it's a good pain.", "difficulty": 5},
                {"days_ago": 15, "title": "Deload Week", "content": "Taking it easy this week. Reduced weights by 20% to let body recover.", "difficulty": 2},
                {"days_ago": 10, "title": "Form Check", "content": "Recorded my deadlift today. Need to work on keeping back straighter at the bottom.", "difficulty": 3},
                {"days_ago": 5, "title": "Nutrition Update", "content": "Increased daily calories to 3200. Aiming for 1g protein per lb bodyweight.", "difficulty": 4},
                {"days_ago": 2, "title": "Feeling Strong", "content": "Progressive overload is working! Adding 2.5kg each week to main lifts.", "difficulty": 4},
                {"days_ago": 0, "title": "New Split Starting", "content": "Switching to PPL 6 days/week. Excited to see the gains!", "difficulty": 3},
            ]

            for note_data in notes_data:
                workout_date = (datetime.now() - timedelta(days=note_data["days_ago"])).date()
                note = WorkoutNote(
                    user_id=user_id,
                    workout_name=note_data["title"],
                    note=note_data["content"],
                    workout_date=workout_date,
                    difficulty=note_data["difficulty"],
                    energy=4  # Default energy level
                )
                db.add(note)

            db.commit()
            print(f"   OK Added {len(notes_data)} workout notes")

        # 6. Add Rest Days
        print("\n[6] Adding rest days...")
        existing_rest = db.query(RestDay).filter(RestDay.user_id == user_id).count()
        if existing_rest > 0:
            print(f"   OK {existing_rest} rest days already exist, skipping...")
        else:
            # Past rest days (Sundays for last 4 weeks)
            for i in range(1, 5):
                date = datetime.now() - timedelta(weeks=i)
                # Find most recent Sunday
                days_to_sunday = (date.weekday() + 1) % 7
                sunday = date - timedelta(days=days_to_sunday)

                rest_day = RestDay(
                    user_id=user_id,
                    rest_date=sunday.date(),
                    is_scheduled=False,
                    recovery_activities=["Light Walk", "Stretching"],
                    notes="Weekly rest day"
                )
                db.add(rest_day)

            # Future scheduled rest days (next 2 Sundays)
            for i in range(1, 3):
                date = datetime.now() + timedelta(weeks=i)
                days_to_sunday = (6 - date.weekday()) % 7
                if days_to_sunday == 0:
                    days_to_sunday = 7
                sunday = date + timedelta(days=days_to_sunday)

                rest_day = RestDay(
                    user_id=user_id,
                    rest_date=sunday.date(),
                    is_scheduled=True,
                    recovery_activities=["Yoga Flow", "Foam Rolling"],
                    notes="Planned recovery day"
                )
                db.add(rest_day)

            db.commit()
            print(f"   OK Added 6 rest days (4 past, 2 future)")

        print("\nSUCCESS Health data seeding completed successfully!")
        print("\nStats: Summary:")
        print(f"   • Gym Profile: OK")
        print(f"   • Weight Logs: {db.query(WeightLog).filter(WeightLog.user_id == user_id).count()}")
        print(f"   • Personal Records: {db.query(PersonalRecord).filter(PersonalRecord.user_id == user_id).count()}")
        print(f"   • Workout Logs: {db.query(WorkoutLog).filter(WorkoutLog.user_id == user_id).count()}")
        print(f"   • Workout Notes: {db.query(WorkoutNote).filter(WorkoutNote.user_id == user_id).count()}")
        print(f"   • Rest Days: {db.query(RestDay).filter(RestDay.user_id == user_id).count()}")

    except Exception as e:
        print(f"\nERROR Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_user_health_data()
