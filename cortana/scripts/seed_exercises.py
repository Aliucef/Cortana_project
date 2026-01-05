"""
Seed Exercise Library
Populates the exercises table with comprehensive exercise database
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import engine
import json

exercises_data = [
    # CHEST EXERCISES (10)
    {
        "name": "Barbell Bench Press",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["chest", "triceps"],
        "secondary_muscles": ["shoulders"],
        "instructions": "Lie flat on bench. Grip bar slightly wider than shoulders. Lower bar to mid-chest with elbows at 45 degrees. Press bar back up to starting position.",
        "tips": "Keep feet flat on floor. Maintain slight arch in lower back. Control the descent. Touch chest lightly, don't bounce."
    },
    {
        "name": "Dumbbell Bench Press",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": ["chest", "triceps"],
        "secondary_muscles": ["shoulders"],
        "instructions": "Lie on bench with dumbbells at chest level. Press dumbbells up until arms are extended. Lower with control to starting position.",
        "tips": "Keep wrists straight. Dumbbells should follow slight arc. Greater range of motion than barbell. Lower until stretch is felt in chest."
    },
    {
        "name": "Incline Barbell Bench Press",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["upper chest", "shoulders"],
        "secondary_muscles": ["triceps"],
        "instructions": "Set bench to 30-45 degree incline. Grip bar slightly wider than shoulders. Lower to upper chest. Press back up.",
        "tips": "Don't set incline too steep (targets shoulders more). Keep shoulder blades retracted. Focus on upper chest contraction."
    },
    {
        "name": "Incline Dumbbell Press",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": ["upper chest", "shoulders"],
        "secondary_muscles": ["triceps"],
        "instructions": "Set bench to 30-45 degrees. Press dumbbells from chest level to full extension overhead.",
        "tips": "Rotate dumbbells slightly inward at top. Maintain control throughout. Great for upper chest development."
    },
    {
        "name": "Dumbbell Flyes",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": ["chest"],
        "secondary_muscles": [],
        "instructions": "Lie flat with dumbbells extended above chest, slight bend in elbows. Lower dumbbells out to sides in arc motion. Bring back together at top.",
        "tips": "Keep elbow angle constant throughout. Focus on chest stretch at bottom. Don't go too heavy - this is an isolation movement."
    },
    {
        "name": "Cable Flyes",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "intermediate",
        "primary_muscles": ["chest"],
        "secondary_muscles": [],
        "instructions": "Set cables to shoulder height. Step forward with staggered stance. Bring handles together in front of chest with slight bend in elbows.",
        "tips": "Maintain constant tension. Excellent for chest isolation. Can adjust cable height for upper/lower chest emphasis."
    },
    {
        "name": "Push-Ups",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["chest", "triceps"],
        "secondary_muscles": ["shoulders", "core"],
        "instructions": "Start in plank position, hands slightly wider than shoulders. Lower body until chest nearly touches ground. Push back up to starting position.",
        "tips": "Keep core tight and body straight. Don't let hips sag. Excellent for building foundational strength. Progress with variations."
    },
    {
        "name": "Decline Bench Press",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["lower chest", "triceps"],
        "secondary_muscles": ["shoulders"],
        "instructions": "Set bench to 15-30 degree decline. Lower bar to lower chest. Press back up.",
        "tips": "Secure feet properly. Great for lower chest development. Use spotter for safety."
    },
    {
        "name": "Chest Dips",
        "category": "strength",
        "equipment": "parallel bars",
        "difficulty": "intermediate",
        "primary_muscles": ["lower chest", "triceps"],
        "secondary_muscles": ["shoulders"],
        "instructions": "Grip parallel bars. Lean forward slightly. Lower body by bending elbows until stretch is felt. Push back up.",
        "tips": "Lean forward more to target chest. Keep elbows out. Control the negative. Add weight when bodyweight becomes easy."
    },
    {
        "name": "Machine Chest Press",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": ["chest", "triceps"],
        "secondary_muscles": ["shoulders"],
        "instructions": "Adjust seat height so handles are at chest level. Push handles forward until arms are extended.",
        "tips": "Great for beginners to learn pressing movement. Fixed path ensures safety. Good for drop sets and burnouts."
    },

    # BACK EXERCISES (10)
    {
        "name": "Barbell Deadlift",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "advanced",
        "primary_muscles": ["lower back", "glutes", "hamstrings"],
        "secondary_muscles": ["traps", "core", "forearms"],
        "instructions": "Stand with feet hip-width, bar over mid-foot. Hinge at hips, grip bar just outside knees. Drive through heels, extend hips and knees simultaneously.",
        "tips": "Keep back neutral, not rounded. Bar should travel in straight line close to body. Master form before adding weight. King of all exercises."
    },
    {
        "name": "Pull-Ups",
        "category": "strength",
        "equipment": "pull-up bar",
        "difficulty": "intermediate",
        "primary_muscles": ["lats", "biceps"],
        "secondary_muscles": ["rear delts", "traps"],
        "instructions": "Hang from bar with overhand grip, hands shoulder-width. Pull body up until chin clears bar. Lower with control.",
        "tips": "Lead with chest, not chin. Retract shoulder blades at top. If can't do bodyweight, use resistance band or assisted machine."
    },
    {
        "name": "Barbell Row",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["lats", "rhomboids"],
        "secondary_muscles": ["biceps", "lower back"],
        "instructions": "Hinge at hips with slight knee bend, back flat. Pull bar to lower chest/upper abs. Lower with control.",
        "tips": "Keep core tight. Pull elbows back, not up. Row to belly button. Don't use momentum."
    },
    {
        "name": "Dumbbell Row",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": ["lats", "rhomboids"],
        "secondary_muscles": ["biceps", "rear delts"],
        "instructions": "Place knee and hand on bench for support. Pull dumbbell to hip with opposite hand. Lower with control.",
        "tips": "Keep back flat. Pull elbow back, not up. Focus on squeezing lat. Great for unilateral development."
    },
    {
        "name": "Lat Pulldown",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": ["lats"],
        "secondary_muscles": ["biceps", "rear delts"],
        "instructions": "Sit with thighs secured under pad. Grip bar wider than shoulders. Pull bar to upper chest while leaning back slightly.",
        "tips": "Lead with elbows. Focus on lat contraction. Don't pull behind neck. Great alternative to pull-ups."
    },
    {
        "name": "Seated Cable Row",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": ["mid back", "lats"],
        "secondary_muscles": ["biceps", "rear delts"],
        "instructions": "Sit with feet on platform, slight knee bend. Pull handle to torso while keeping back straight. Squeeze shoulder blades together.",
        "tips": "Don't round back. Pull to lower chest/upper abs. Focus on rowing motion, not arm curl."
    },
    {
        "name": "T-Bar Row",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["mid back", "lats"],
        "secondary_muscles": ["biceps", "lower back"],
        "instructions": "Straddle bar with hinge position. Grip handle or bar. Pull to chest while keeping back flat.",
        "tips": "Great mass builder for back. Keep core tight. Pull elbows back. Excellent for thickness."
    },
    {
        "name": "Face Pulls",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": ["rear delts", "traps"],
        "secondary_muscles": ["rhomboids"],
        "instructions": "Set cable to face height. Pull rope towards face, separating hands at end. Focus on pulling elbows back.",
        "tips": "Essential for shoulder health. Pull to nose/forehead level. External rotation at end. High reps work well."
    },
    {
        "name": "Chin-Ups",
        "category": "strength",
        "equipment": "pull-up bar",
        "difficulty": "intermediate",
        "primary_muscles": ["lats", "biceps"],
        "secondary_muscles": ["rear delts"],
        "instructions": "Hang from bar with underhand grip. Pull up until chin clears bar. Lower with control.",
        "tips": "Underhand grip emphasizes biceps more than overhand. Great for building pulling strength."
    },
    {
        "name": "Hyperextensions",
        "category": "strength",
        "equipment": "hyperextension bench",
        "difficulty": "beginner",
        "primary_muscles": ["lower back", "glutes"],
        "secondary_muscles": ["hamstrings"],
        "instructions": "Position hips on pad. Lower upper body with control. Raise back to starting position by contracting lower back and glutes.",
        "tips": "Don't hyperextend at top. Focus on controlled movement. Excellent for lower back strength and injury prevention."
    },

    # LEG EXERCISES (12)
    {
        "name": "Barbell Back Squat",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["quads", "glutes"],
        "secondary_muscles": ["hamstrings", "core", "lower back"],
        "instructions": "Bar on upper back. Feet shoulder-width. Squat down by bending knees and hips. Drive through heels to stand.",
        "tips": "Keep chest up. Knees track over toes. Squat to at least parallel. Master form before adding weight."
    },
    {
        "name": "Front Squat",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "advanced",
        "primary_muscles": ["quads"],
        "secondary_muscles": ["glutes", "core"],
        "instructions": "Bar rests on front delts. Elbows high. Squat down keeping torso upright. Drive up through heels.",
        "tips": "More quad dominant than back squat. Requires good mobility. Keep elbows high throughout."
    },
    {
        "name": "Romanian Deadlift",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["hamstrings", "glutes"],
        "secondary_muscles": ["lower back"],
        "instructions": "Hold bar at hip level. Hinge at hips, pushing butt back. Lower bar down shins until hamstring stretch. Drive hips forward to return.",
        "tips": "Keep slight knee bend. Bar stays close to legs. Focus on hamstring stretch. Excellent for posterior chain."
    },
    {
        "name": "Leg Press",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": ["quads", "glutes"],
        "secondary_muscles": ["hamstrings"],
        "instructions": "Sit in machine, feet shoulder-width on platform. Push platform away by extending legs. Lower with control.",
        "tips": "Don't lock knees at top. Go deep for full range. Foot placement changes emphasis. Safe alternative to squats."
    },
    {
        "name": "Bulgarian Split Squat",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": ["quads", "glutes"],
        "secondary_muscles": ["hamstrings"],
        "instructions": "Rear foot elevated on bench. Front foot forward. Squat down on front leg. Drive up through front heel.",
        "tips": "Excellent unilateral exercise. Improves balance. Front shin should stay vertical. Great for glute development."
    },
    {
        "name": "Leg Curl",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": ["hamstrings"],
        "secondary_muscles": [],
        "instructions": "Lie face down on machine. Curl legs up by bending knees. Lower with control.",
        "tips": "Isolates hamstrings. Keep hips down. Control both up and down phases. Essential for hamstring development."
    },
    {
        "name": "Leg Extension",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": ["quads"],
        "secondary_muscles": [],
        "instructions": "Sit in machine with pad on lower shins. Extend legs until straight. Lower with control.",
        "tips": "Isolates quads. Don't use excessive weight. Great for pre-exhaust or burnout. Squeeze at top."
    },
    {
        "name": "Walking Lunges",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": ["quads", "glutes"],
        "secondary_muscles": ["hamstrings", "calves"],
        "instructions": "Step forward into lunge position. Back knee nearly touches ground. Push off front foot to step into next lunge.",
        "tips": "Keep torso upright. Front knee stays behind toes. Great for functional strength and conditioning."
    },
    {
        "name": "Calf Raise",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "beginner",
        "primary_muscles": ["calves"],
        "secondary_muscles": [],
        "instructions": "Stand on platform with toes, heels hanging off. Raise up onto toes. Lower heels below platform level.",
        "tips": "Full range of motion crucial. Pause at top. Can do seated or standing. High reps work well."
    },
    {
        "name": "Goblet Squat",
        "category": "strength",
        "equipment": "dumbbell",
        "difficulty": "beginner",
        "primary_muscles": ["quads", "glutes"],
        "secondary_muscles": ["core"],
        "instructions": "Hold dumbbell at chest level. Squat down, elbows between knees. Drive up through heels.",
        "tips": "Great for learning squat pattern. Keep chest up. Elbows push knees out. Excellent for beginners."
    },
    {
        "name": "Glute Bridge",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["glutes", "hamstrings"],
        "secondary_muscles": ["lower back"],
        "instructions": "Lie on back, knees bent, feet flat. Drive hips up by squeezing glutes. Lower with control.",
        "tips": "Squeeze glutes at top. Don't hyperextend lower back. Can add weight on hips. Great glute activation."
    },
    {
        "name": "Hack Squat",
        "category": "strength",
        "equipment": "machine",
        "difficulty": "intermediate",
        "primary_muscles": ["quads"],
        "secondary_muscles": ["glutes"],
        "instructions": "Back against pad, shoulders under pads. Squat down by bending knees. Drive up through heels.",
        "tips": "Very quad dominant. Safe machine for heavy weight. Foot placement changes emphasis."
    },

    # SHOULDER EXERCISES (8)
    {
        "name": "Overhead Press",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["shoulders", "triceps"],
        "secondary_muscles": ["upper chest", "core"],
        "instructions": "Bar at shoulder level. Press overhead until arms locked out. Lower with control.",
        "tips": "Keep core tight. Don't lean back excessively. Lock out overhead. Best overall shoulder builder."
    },
    {
        "name": "Dumbbell Shoulder Press",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": ["shoulders", "triceps"],
        "secondary_muscles": ["upper chest"],
        "instructions": "Dumbbells at shoulder level. Press up until arms extended. Lower with control.",
        "tips": "Can be done seated or standing. Greater range of motion than barbell. Keep core engaged."
    },
    {
        "name": "Lateral Raises",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": ["side delts"],
        "secondary_muscles": [],
        "instructions": "Arms at sides with dumbbells. Raise arms out to sides until shoulder level. Lower with control.",
        "tips": "Slight bend in elbows. Lead with elbows, not hands. Essential for shoulder width. Don't go too heavy."
    },
    {
        "name": "Front Raises",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": ["front delts"],
        "secondary_muscles": [],
        "instructions": "Arms in front of thighs. Raise dumbbells forward to shoulder level. Lower with control.",
        "tips": "Keep slight bend in elbows. Control the negative. Front delts get work from pressing, so lower priority."
    },
    {
        "name": "Reverse Flyes",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": ["rear delts"],
        "secondary_muscles": ["mid back"],
        "instructions": "Bend at hips, chest near parallel. Raise dumbbells out to sides. Squeeze shoulder blades.",
        "tips": "Essential for shoulder health and posture. Keep elbows slightly bent. Focus on rear delt contraction."
    },
    {
        "name": "Arnold Press",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "primary_muscles": ["shoulders"],
        "secondary_muscles": ["triceps"],
        "instructions": "Start with palms facing you, dumbbells at shoulder level. Rotate palms forward while pressing up. Reverse on way down.",
        "tips": "Hits all three delt heads. Rotation adds extra work. Named after Arnold Schwarzenegger."
    },
    {
        "name": "Upright Rows",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["traps", "side delts"],
        "secondary_muscles": ["biceps"],
        "instructions": "Bar at thigh level, hands close together. Pull bar up to chest by raising elbows. Lower with control.",
        "tips": "Keep bar close to body. Lead with elbows. Don't go too wide (shoulder issues). Can use dumbbells or cables."
    },
    {
        "name": "Shrugs",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": ["traps"],
        "secondary_muscles": [],
        "instructions": "Hold dumbbells at sides. Shrug shoulders up towards ears. Lower with control.",
        "tips": "Simple but effective for traps. Don't roll shoulders. Squeeze at top. Can go heavy."
    },

    # ARM EXERCISES (10)
    {
        "name": "Barbell Curl",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "beginner",
        "primary_muscles": ["biceps"],
        "secondary_muscles": ["forearms"],
        "instructions": "Bar at thigh level, underhand grip. Curl bar up by bending elbows. Lower with control.",
        "tips": "Keep elbows stationary. Don't swing body. Squeeze biceps at top. Classic bicep builder."
    },
    {
        "name": "Dumbbell Curl",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": ["biceps"],
        "secondary_muscles": ["forearms"],
        "instructions": "Dumbbells at sides. Curl up alternating arms or both together. Lower with control.",
        "tips": "Can rotate wrists (supination) for extra bicep work. Keep elbows tucked. Control the negative."
    },
    {
        "name": "Hammer Curl",
        "category": "strength",
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "primary_muscles": ["biceps", "forearms"],
        "secondary_muscles": ["brachialis"],
        "instructions": "Dumbbells at sides, palms facing each other. Curl up keeping palms facing in. Lower with control.",
        "tips": "Targets brachialis (under bicep) for arm thickness. Stronger grip than regular curls."
    },
    {
        "name": "Tricep Dips",
        "category": "strength",
        "equipment": "parallel bars",
        "difficulty": "intermediate",
        "primary_muscles": ["triceps"],
        "secondary_muscles": ["chest", "shoulders"],
        "instructions": "Grip bars, body upright. Lower by bending elbows. Push back up.",
        "tips": "Stay upright to target triceps (lean forward targets chest). Great mass builder. Add weight when bodyweight is easy."
    },
    {
        "name": "Overhead Tricep Extension",
        "category": "strength",
        "equipment": "dumbbell",
        "difficulty": "beginner",
        "primary_muscles": ["triceps"],
        "secondary_muscles": [],
        "instructions": "Hold dumbbell overhead with both hands. Lower behind head by bending elbows. Extend back up.",
        "tips": "Keep elbows pointed forward. Full stretch at bottom. Works long head of tricep."
    },
    {
        "name": "Tricep Pushdown",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": ["triceps"],
        "secondary_muscles": [],
        "instructions": "Grip rope or bar at chest level. Push down by extending elbows. Return with control.",
        "tips": "Keep elbows tucked. Lock out at bottom. Excellent isolation. Can use different attachments."
    },
    {
        "name": "Close-Grip Bench Press",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["triceps"],
        "secondary_muscles": ["chest", "shoulders"],
        "instructions": "Grip bar with hands shoulder-width or closer. Lower to chest. Press back up.",
        "tips": "Best compound movement for triceps. Keep elbows closer to body. Can go heavier than isolation exercises."
    },
    {
        "name": "Skull Crushers",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "primary_muscles": ["triceps"],
        "secondary_muscles": [],
        "instructions": "Lie on bench, bar at arm's length above face. Lower bar to forehead by bending elbows. Extend back up.",
        "tips": "Keep elbows stationary. Lower slowly. Great for tricep development. Can use EZ bar or dumbbells."
    },
    {
        "name": "Preacher Curl",
        "category": "strength",
        "equipment": "barbell",
        "difficulty": "beginner",
        "primary_muscles": ["biceps"],
        "secondary_muscles": [],
        "instructions": "Arms on preacher pad. Curl bar up. Lower with control.",
        "tips": "Eliminates momentum. Isolates biceps. Don't hyperextend at bottom."
    },
    {
        "name": "Concentration Curl",
        "category": "strength",
        "equipment": "dumbbell",
        "difficulty": "beginner",
        "primary_muscles": ["biceps"],
        "secondary_muscles": [],
        "instructions": "Sit with elbow braced on inner thigh. Curl dumbbell up. Lower with control.",
        "tips": "Great isolation. Focus on peak contraction. Popular finishing exercise."
    },

    # CORE EXERCISES (8)
    {
        "name": "Plank",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["core", "abs"],
        "secondary_muscles": ["shoulders"],
        "instructions": "Forearms on ground, body straight. Hold position without letting hips sag.",
        "tips": "Engage core actively. Breathe normally. Start with 30 seconds, progress to minutes. Foundation exercise."
    },
    {
        "name": "Crunches",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["abs"],
        "secondary_muscles": [],
        "instructions": "Lie on back, knees bent. Lift shoulders off ground by contracting abs. Lower with control.",
        "tips": "Don't pull on neck. Focus on ab contraction, not sit-up height. Exhale on way up."
    },
    {
        "name": "Russian Twists",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["obliques", "core"],
        "secondary_muscles": [],
        "instructions": "Sit with feet off ground, lean back slightly. Rotate torso side to side touching ground beside hips.",
        "tips": "Can hold weight for progression. Keep core engaged. Controlled rotations."
    },
    {
        "name": "Hanging Leg Raises",
        "category": "strength",
        "equipment": "pull-up bar",
        "difficulty": "intermediate",
        "primary_muscles": ["lower abs", "hip flexors"],
        "secondary_muscles": ["core"],
        "instructions": "Hang from bar. Raise legs up keeping them straight. Lower with control.",
        "tips": "Advanced ab exercise. Bend knees if too hard. Control the swing. Excellent for lower abs."
    },
    {
        "name": "Cable Crunches",
        "category": "strength",
        "equipment": "cable machine",
        "difficulty": "beginner",
        "primary_muscles": ["abs"],
        "secondary_muscles": [],
        "instructions": "Kneel below cable with rope. Crunch down by contracting abs. Return with control.",
        "tips": "Great for progressive overload. Keep hips stationary. Focus on ab contraction."
    },
    {
        "name": "Side Plank",
        "category": "strength",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["obliques", "core"],
        "secondary_muscles": [],
        "instructions": "Lie on side, prop up on forearm. Raise hips to create straight line. Hold.",
        "tips": "Essential for obliques and core stability. Do both sides. Keep hips up."
    },
    {
        "name": "Mountain Climbers",
        "category": "cardio",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["core", "abs"],
        "secondary_muscles": ["shoulders", "legs"],
        "instructions": "Start in plank position. Alternate bringing knees to chest in running motion.",
        "tips": "Great cardio and core combo. Keep hips down. Faster pace increases cardio."
    },
    {
        "name": "Ab Wheel Rollout",
        "category": "strength",
        "equipment": "ab wheel",
        "difficulty": "advanced",
        "primary_muscles": ["abs", "core"],
        "secondary_muscles": ["shoulders", "back"],
        "instructions": "Kneel holding ab wheel. Roll forward extending body. Pull back with core.",
        "tips": "Very challenging. Start from knees. Don't let back sag. One of the best ab exercises."
    },

    # CARDIO EXERCISES (6)
    {
        "name": "Running",
        "category": "cardio",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["legs", "cardiovascular"],
        "secondary_muscles": ["core"],
        "instructions": "Run at steady pace or intervals. Maintain good form with upright posture.",
        "tips": "Start slow, build up distance/speed. Great for fat loss and cardiovascular health."
    },
    {
        "name": "Jump Rope",
        "category": "cardio",
        "equipment": "jump rope",
        "difficulty": "beginner",
        "primary_muscles": ["calves", "cardiovascular"],
        "secondary_muscles": ["shoulders", "core"],
        "instructions": "Jump over rope as it passes under feet. Maintain steady rhythm.",
        "tips": "Excellent cardio in minimal space. Great for conditioning. Low impact on joints with proper form."
    },
    {
        "name": "Burpees",
        "category": "cardio",
        "equipment": "bodyweight",
        "difficulty": "intermediate",
        "primary_muscles": ["full body", "cardiovascular"],
        "secondary_muscles": [],
        "instructions": "From standing, drop to plank, do push-up, jump feet to hands, jump up with arms overhead.",
        "tips": "Brutal full-body cardio. Great for fat loss and conditioning. Modify by removing jump or push-up."
    },
    {
        "name": "Rowing Machine",
        "category": "cardio",
        "equipment": "rowing machine",
        "difficulty": "beginner",
        "primary_muscles": ["back", "legs", "cardiovascular"],
        "secondary_muscles": ["arms", "core"],
        "instructions": "Sit on rower. Push with legs first, then pull handle to chest. Reverse sequence to return.",
        "tips": "Excellent full-body cardio. Low impact. 60% legs, 40% upper body. Good rowing form is crucial."
    },
    {
        "name": "Cycling",
        "category": "cardio",
        "equipment": "bike",
        "difficulty": "beginner",
        "primary_muscles": ["legs", "cardiovascular"],
        "secondary_muscles": [],
        "instructions": "Pedal at steady pace or intervals. Adjust resistance for intensity.",
        "tips": "Low impact cardio. Great for active recovery. Can do HIIT or steady state."
    },
    {
        "name": "Battle Ropes",
        "category": "cardio",
        "equipment": "battle ropes",
        "difficulty": "intermediate",
        "primary_muscles": ["shoulders", "arms", "cardiovascular"],
        "secondary_muscles": ["core"],
        "instructions": "Hold rope ends. Create waves by alternating arm movements or doing slams.",
        "tips": "Intense cardio and upper body work. Great for conditioning. 20-30 second intervals work well."
    },

    # FLEXIBILITY/MOBILITY (6)
    {
        "name": "Yoga Flow",
        "category": "flexibility",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["full body"],
        "secondary_muscles": [],
        "instructions": "Follow sequence of yoga poses focusing on breath and flexibility.",
        "tips": "Excellent for mobility, flexibility, and recovery. Many styles available. Great for rest days."
    },
    {
        "name": "Static Stretching",
        "category": "flexibility",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["full body"],
        "secondary_muscles": [],
        "instructions": "Hold stretches for 20-30 seconds each. Focus on major muscle groups.",
        "tips": "Do after workouts when muscles are warm. Don't bounce. Breathe deeply."
    },
    {
        "name": "Foam Rolling",
        "category": "flexibility",
        "equipment": "foam roller",
        "difficulty": "beginner",
        "primary_muscles": ["full body"],
        "secondary_muscles": [],
        "instructions": "Roll slowly over muscle groups, pausing on tight spots for 20-30 seconds.",
        "tips": "Myofascial release. Can be uncomfortable but beneficial. Great for recovery."
    },
    {
        "name": "Hip Flexor Stretch",
        "category": "flexibility",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["hip flexors"],
        "secondary_muscles": [],
        "instructions": "Kneel on one knee, other foot forward. Push hips forward to feel stretch in front of hip.",
        "tips": "Essential for desk workers. Hold 30-60 seconds each side. Tight hip flexors affect many movements."
    },
    {
        "name": "Shoulder Dislocations",
        "category": "flexibility",
        "equipment": "resistance band",
        "difficulty": "beginner",
        "primary_muscles": ["shoulders"],
        "secondary_muscles": [],
        "instructions": "Hold band wide. Bring band over head and behind back with straight arms. Return.",
        "tips": "Great for shoulder mobility. Don't force it. Use wider grip if needed. Essential for overhead lifters."
    },
    {
        "name": "Cat-Cow Stretch",
        "category": "flexibility",
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "primary_muscles": ["spine", "core"],
        "secondary_muscles": [],
        "instructions": "On hands and knees. Arch back looking up (cow), then round back looking down (cat). Alternate.",
        "tips": "Excellent for spine mobility. Great warm-up. Helps with lower back issues."
    }
]

def seed_exercises():
    """Insert all exercises into database"""
    try:
        print("=" * 60)
        print("Seeding Exercise Library")
        print("=" * 60)
        print()

        with engine.connect() as conn:
            # Clear existing exercises (optional - comment out if you want to keep existing)
            conn.execute(text("DELETE FROM exercises WHERE is_system = TRUE"))
            print(f"Cleared existing system exercises")
            print()

            # Insert all exercises
            for i, ex in enumerate(exercises_data, 1):
                conn.execute(text("""
                    INSERT INTO exercises (
                        name, category, equipment, difficulty,
                        primary_muscles, secondary_muscles,
                        instructions, tips, is_system
                    ) VALUES (
                        :name, :category, :equipment, :difficulty,
                        :primary_muscles, :secondary_muscles,
                        :instructions, :tips, TRUE
                    )
                """), {
                    "name": ex["name"],
                    "category": ex["category"],
                    "equipment": ex["equipment"],
                    "difficulty": ex["difficulty"],
                    "primary_muscles": json.dumps(ex["primary_muscles"]),
                    "secondary_muscles": json.dumps(ex["secondary_muscles"]),
                    "instructions": ex["instructions"],
                    "tips": ex["tips"]
                })

                if i % 10 == 0:
                    print(f"   Inserted {i}/{len(exercises_data)} exercises...")

            conn.commit()

            print()
            print("=" * 60)
            print(f"SUCCESS! Inserted {len(exercises_data)} exercises")
            print("=" * 60)
            print()

            # Summary by category
            categories = {}
            for ex in exercises_data:
                cat = ex["category"]
                categories[cat] = categories.get(cat, 0) + 1

            print("Breakdown by category:")
            for cat, count in categories.items():
                print(f"  - {cat.title()}: {count} exercises")

            print()
            print("Breakdown by difficulty:")
            difficulties = {}
            for ex in exercises_data:
                diff = ex["difficulty"]
                difficulties[diff] = difficulties.get(diff, 0) + 1

            for diff, count in difficulties.items():
                print(f"  - {diff.title()}: {count} exercises")

            return True

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False


if __name__ == "__main__":
    success = seed_exercises()

    if success:
        print()
        print("Next steps:")
        print("1. Check exercises: SELECT COUNT(*) FROM exercises;")
        print("2. Test API: GET /health/exercises")
        print("3. Proceed to seed workout templates")
    else:
        print()
        print("Failed to seed exercises. Check errors above.")
