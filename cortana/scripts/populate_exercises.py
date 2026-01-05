"""
Populate Exercise Library with Essential Exercises
Run this script once to add common exercises to the database
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import engine
import json

exercises = [
    # CHEST EXERCISES
    {
        "name": "Barbell Bench Press",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["chest", "triceps"]),
        "secondary_muscles": json.dumps(["shoulders"]),
        "instructions": "Lie on bench, grip barbell slightly wider than shoulder width. Lower to chest, press up explosively. Keep feet flat, back arched.",
        "tips": "Don't bounce bar off chest. Keep elbows at 45° angle. Full range of motion.",
    },
    {
        "name": "Dumbbell Bench Press",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["chest", "triceps"]),
        "secondary_muscles": json.dumps(["shoulders"]),
        "instructions": "Lie on bench with dumbbells at chest level. Press up until arms fully extended. Lower with control.",
        "tips": "Dumbbells allow greater range of motion than barbell. Keep core tight.",
    },
    {
        "name": "Push-Ups",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["chest", "triceps"]),
        "secondary_muscles": json.dumps(["shoulders", "core"]),
        "instructions": "Start in plank position. Lower body until chest nearly touches floor. Push back up.",
        "tips": "Keep body straight, core engaged. Don't let hips sag. Full range of motion.",
    },
    {
        "name": "Incline Dumbbell Press",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["upper chest", "shoulders"]),
        "secondary_muscles": json.dumps(["triceps"]),
        "instructions": "Set bench to 30-45° incline. Press dumbbells from chest level to arms extended overhead.",
        "tips": "Targets upper chest. Don't set incline too steep (becomes shoulder press).",
    },
    {
        "name": "Cable Flyes",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["chest"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Stand centered between cables set at shoulder height. Bring handles together in front of chest with slight bend in elbows.",
        "tips": "Squeeze chest at peak contraction. Slow, controlled movement. Great for chest isolation.",
    },
    {
        "name": "Dips (Chest)",
        "category": "strength",
        "equipment": "dip bar",
        "difficulty": "advanced",
        "primary_muscles": json.dumps(["lower chest", "triceps"]),
        "secondary_muscles": json.dumps(["shoulders"]),
        "instructions": "Lean forward slightly, lower until elbows at 90°. Push back up. For chest emphasis, lean forward more.",
        "tips": "Great for lower chest. Add weight when bodyweight becomes easy.",
    },

    # BACK EXERCISES
    {
        "name": "Deadlift",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "advanced",
        "primary_muscles": json.dumps(["lower back", "hamstrings", "glutes"]),
        "secondary_muscles": json.dumps(["traps", "forearms", "core"]),
        "instructions": "Stand with feet hip-width, grip bar. Keep back straight, drive through heels to stand up. Lower with control.",
        "tips": "King of exercises. Perfect form essential. Keep bar close to body. Don't round back.",
    },
    {
        "name": "Pull-Ups",
        "category": "strength",
        "equipment": "pull-up bar",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["lats", "upper back"]),
        "secondary_muscles": json.dumps(["biceps", "forearms"]),
        "instructions": "Hang from bar with overhand grip. Pull up until chin over bar. Lower with control.",
        "tips": "Best back builder. Start with assisted if needed. Full range of motion crucial.",
    },
    {
        "name": "Barbell Row",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["mid back", "lats"]),
        "secondary_muscles": json.dumps(["biceps", "lower back"]),
        "instructions": "Bend at hips, grip bar. Pull to lower chest, squeeze shoulder blades. Lower with control.",
        "tips": "Keep back flat. Don't use momentum. Pull to belly button for thickness.",
    },
    {
        "name": "Lat Pulldown",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["lats", "upper back"]),
        "secondary_muscles": json.dumps(["biceps"]),
        "instructions": "Sit at machine, grip bar wider than shoulders. Pull down to upper chest. Control the release.",
        "tips": "Great alternative to pull-ups. Focus on pulling with back, not arms.",
    },
    {
        "name": "Seated Cable Row",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["mid back", "lats"]),
        "secondary_muscles": json.dumps(["biceps", "rear delts"]),
        "instructions": "Sit at cable row, grip handle. Pull to torso, squeeze shoulder blades. Return with control.",
        "tips": "Keep torso upright. Don't rock back and forth. Squeeze at peak contraction.",
    },
    {
        "name": "T-Bar Row",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["mid back", "lats"]),
        "secondary_muscles": json.dumps(["biceps", "traps"]),
        "instructions": "Straddle bar, grip handles. Pull to chest while keeping back flat. Lower with control.",
        "tips": "Excellent for back thickness. Keep core tight. Don't jerk the weight.",
    },

    # SHOULDER EXERCISES
    {
        "name": "Overhead Press (OHP)",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["shoulders"]),
        "secondary_muscles": json.dumps(["triceps", "upper chest", "core"]),
        "instructions": "Stand with barbell at shoulder height. Press overhead until arms locked out. Lower to shoulders.",
        "tips": "Best overall shoulder builder. Keep core tight. Don't arch back excessively.",
    },
    {
        "name": "Dumbbell Shoulder Press",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["shoulders"]),
        "secondary_muscles": json.dumps(["triceps"]),
        "instructions": "Sit on bench, dumbbells at shoulder height. Press up until arms extended. Lower with control.",
        "tips": "Can be done seated or standing. Full range of motion. Don't lock out elbows completely.",
    },
    {
        "name": "Lateral Raises",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["side delts"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Stand with dumbbells at sides. Raise arms out to sides until parallel to floor. Lower slowly.",
        "tips": "Best for shoulder width. Don't swing. Slight bend in elbows. Lead with elbows.",
    },
    {
        "name": "Front Raises",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["front delts"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Hold dumbbells in front of thighs. Raise forward to shoulder height. Lower with control.",
        "tips": "Targets front delts. Don't use momentum. Alternating or together.",
    },
    {
        "name": "Face Pulls",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["rear delts", "upper back"]),
        "secondary_muscles": json.dumps(["traps"]),
        "instructions": "Set cable at face height with rope. Pull towards face, separate hands. Squeeze shoulder blades.",
        "tips": "Essential for shoulder health. High reps. Focus on rear delts and upper back.",
    },

    # LEG EXERCISES
    {
        "name": "Barbell Squat",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["quads", "glutes"]),
        "secondary_muscles": json.dumps(["hamstrings", "core", "lower back"]),
        "instructions": "Bar on upper back, feet shoulder-width. Descend until thighs parallel. Drive up through heels.",
        "tips": "King of leg exercises. Depth is key. Keep chest up, knees tracking over toes.",
    },
    {
        "name": "Romanian Deadlift",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["hamstrings", "glutes"]),
        "secondary_muscles": json.dumps(["lower back"]),
        "instructions": "Hold bar at hip level. Hinge at hips, lower bar to mid-shin. Feel hamstring stretch. Return to standing.",
        "tips": "Best hamstring exercise. Keep back flat. Don't round. Slight knee bend.",
    },
    {
        "name": "Leg Press",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["quads", "glutes"]),
        "secondary_muscles": json.dumps(["hamstrings"]),
        "instructions": "Sit in machine, feet shoulder-width on platform. Lower until knees at 90°. Press up.",
        "tips": "Safer alternative to squats for heavy weight. Don't lock out knees. Full ROM.",
    },
    {
        "name": "Lunges",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["quads", "glutes"]),
        "secondary_muscles": json.dumps(["hamstrings", "core"]),
        "instructions": "Step forward into lunge until front knee at 90°. Push back to standing. Alternate legs.",
        "tips": "Great for balance and unilateral strength. Keep torso upright. Various variations.",
    },
    {
        "name": "Leg Curl",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["hamstrings"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Lie face down, pad on lower calves. Curl heels towards glutes. Lower with control.",
        "tips": "Hamstring isolation. Don't use momentum. Squeeze at top. Full stretch at bottom.",
    },
    {
        "name": "Leg Extension",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["quads"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Sit in machine, pad on lower shins. Extend legs until straight. Lower with control.",
        "tips": "Quad isolation. Don't lock out hard. Can be hard on knees for some.",
    },
    {
        "name": "Calf Raises",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["calves"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Stand on edge of platform. Lower heels below platform level. Press up onto toes. Squeeze at top.",
        "tips": "High reps needed (15-20). Full range crucial. Pause at top. Standing or seated.",
    },

    # ARM EXERCISES
    {
        "name": "Barbell Curl",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["biceps"]),
        "secondary_muscles": json.dumps(["forearms"]),
        "instructions": "Stand with barbell, arms extended. Curl bar to shoulders. Lower with control.",
        "tips": "Classic bicep builder. Don't swing. Keep elbows stationary. Full range.",
    },
    {
        "name": "Hammer Curls",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["biceps", "brachialis"]),
        "secondary_muscles": json.dumps(["forearms"]),
        "instructions": "Hold dumbbells with neutral grip (palms facing each other). Curl up. Lower slowly.",
        "tips": "Targets brachialis for arm thickness. Keep wrists neutral. No swinging.",
    },
    {
        "name": "Tricep Dips",
        "category": "strength",
        "equipment": "dip bar",
        "difficulty": "intermediate",
        "primary_muscles": json.dumps(["triceps"]),
        "secondary_muscles": json.dumps(["chest", "shoulders"]),
        "instructions": "Keep body upright, lower until elbows at 90°. Press back up. For tricep focus, stay upright.",
        "tips": "Excellent tricep mass builder. Add weight when ready. Keep elbows close.",
    },
    {
        "name": "Tricep Pushdown",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["triceps"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Stand at cable with bar at chest height. Push down until arms straight. Return with control.",
        "tips": "Keep elbows pinned to sides. Don't lean forward. Squeeze at bottom.",
    },
    {
        "name": "Overhead Tricep Extension",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["triceps"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Hold dumbbell overhead with both hands. Lower behind head. Extend arms back up.",
        "tips": "Targets long head of triceps. Keep elbows close to head. Full stretch important.",
    },
    {
        "name": "Preacher Curl",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["biceps"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Sit at preacher bench, arms on pad. Curl bar to shoulders. Lower until arms almost straight.",
        "tips": "Eliminates momentum. Strict form. Great for bicep peak. Don't hyperextend at bottom.",
    },

    # CORE EXERCISES
    {
        "name": "Plank",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["core", "abs"]),
        "secondary_muscles": json.dumps(["shoulders", "glutes"]),
        "instructions": "Hold push-up position on forearms. Keep body straight from head to heels. Hold for time.",
        "tips": "Foundation core exercise. Don't let hips sag. Engage everything. Build up to 60+ seconds.",
    },
    {
        "name": "Cable Crunches",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["abs"]),
        "secondary_muscles": json.dumps([]),
        "instructions": "Kneel facing cable, rope at head level. Crunch down, bringing elbows to knees. Control the return.",
        "tips": "Best weighted ab exercise. Focus on contraction, not weight. Crunch, don't bend.",
    },
    {
        "name": "Hanging Leg Raises",
        "category": "strength",
        "equipment": "pull-up bar",
        "difficulty": "advanced",
        "primary_muscles": json.dumps(["lower abs", "hip flexors"]),
        "secondary_muscles": json.dumps(["core"]),
        "instructions": "Hang from bar. Raise legs until hips flexed 90°. Lower with control.",
        "tips": "Advanced ab exercise. Don't swing. Bend knees if too hard. Great for lower abs.",
    },
    {
        "name": "Russian Twists",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": json.dumps(["obliques", "core"]),
        "secondary_muscles": json.dumps(["abs"]),
        "instructions": "Sit with feet elevated, lean back slightly. Rotate torso side to side, touching ground beside hips.",
        "tips": "Great for obliques. Add weight for progression. Control the rotation.",
    },
]


def populate_exercises():
    """Insert all exercises into the database"""
    print("=" * 60)
    print("Populating Exercise Library")
    print("=" * 60)
    print()

    try:
        with engine.connect() as conn:
            # Check if exercises already exist
            result = conn.execute(text("SELECT COUNT(*) FROM exercises WHERE is_system = TRUE"))
            count = result.scalar()

            if count > 0:
                print(f"⚠️  Found {count} existing system exercises.")
                response = input("Do you want to delete and re-populate? (yes/no): ")
                if response.lower() != 'yes':
                    print("Cancelled.")
                    return

                conn.execute(text("DELETE FROM exercises WHERE is_system = TRUE"))
                conn.commit()
                print(f"✓ Deleted {count} existing exercises")
                print()

            # Insert exercises
            print(f"Adding {len(exercises)} exercises...")
            print()

            for i, exercise in enumerate(exercises, 1):
                conn.execute(text("""
                    INSERT INTO exercises
                    (name, category, equipment, difficulty, primary_muscles, secondary_muscles, instructions, tips, is_system)
                    VALUES
                    (:name, :category, :equipment, :difficulty, :primary_muscles, :secondary_muscles, :instructions, :tips, TRUE)
                """), exercise)

                print(f"  [{i:2d}/{len(exercises)}] ✓ {exercise['name']}")

            conn.commit()

        print()
        print("=" * 60)
        print(f"✅ SUCCESS! Added {len(exercises)} exercises to the library")
        print("=" * 60)
        print()
        print("Breakdown by category:")
        categories = {}
        for ex in exercises:
            cat = ex['category']
            categories[cat] = categories.get(cat, 0) + 1

        for cat, count in categories.items():
            print(f"  - {cat.title()}: {count} exercises")

        print()
        print("Next step: Populate workout templates")

    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ ERROR: {str(e)}")
        print("=" * 60)


if __name__ == "__main__":
    populate_exercises()
