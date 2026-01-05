"""
Migration: Add Health Dashboard Models
Date: 2024-01-XX
Description: Adds PersonalRecord, WorkoutNote, RestDay, Exercise, and WorkoutTemplate tables
"""

import sys
import os
# Add parent directory to path so we can import from cortana modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def upgrade():
    """Create new tables for health dashboard"""
    try:
        logger.info("Running health dashboard models migration...")

        with engine.connect() as conn:
            # Personal Records table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS personal_records (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    exercise_name VARCHAR(100) NOT NULL,
                    max_weight FLOAT,
                    max_reps INTEGER,
                    record_type VARCHAR(20) NOT NULL,
                    achieved_date DATE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pr_user_id ON personal_records(user_id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pr_exercise ON personal_records(exercise_name);"))
            logger.info("   [OK] Created personal_records table")

            # Workout Notes table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workout_notes (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    workout_plan_id INTEGER REFERENCES workout_plans(id) ON DELETE SET NULL,
                    workout_name VARCHAR(200) NOT NULL,
                    note TEXT NOT NULL,
                    difficulty INTEGER,
                    energy INTEGER,
                    tags JSONB,
                    workout_date DATE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_note_user_id ON workout_notes(user_id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_note_date ON workout_notes(workout_date);"))
            logger.info("   [OK] Created workout_notes table")

            # Rest Days table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS rest_days (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    rest_date DATE NOT NULL,
                    is_scheduled BOOLEAN DEFAULT TRUE,
                    recovery_activities JSONB,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE (user_id, rest_date)
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rest_user_id ON rest_days(user_id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rest_date ON rest_days(rest_date);"))
            logger.info("   [OK] Created rest_days table")

            # Exercises library table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS exercises (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(200) NOT NULL UNIQUE,
                    category VARCHAR(50) NOT NULL,
                    equipment VARCHAR(100),
                    difficulty VARCHAR(20),
                    primary_muscles JSONB,
                    secondary_muscles JSONB,
                    instructions TEXT,
                    tips TEXT,
                    video_url VARCHAR(500),
                    is_system BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_exercise_category ON exercises(category);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_exercise_equipment ON exercises(equipment);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_exercise_difficulty ON exercises(difficulty);"))
            logger.info("   [OK] Created exercises table")

            # Workout Templates table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workout_templates (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    difficulty VARCHAR(20),
                    frequency VARCHAR(50),
                    split VARCHAR(50),
                    duration VARCHAR(50),
                    goal VARCHAR(100),
                    workouts JSONB NOT NULL,
                    is_system BOOLEAN DEFAULT TRUE,
                    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_template_difficulty ON workout_templates(difficulty);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_template_split ON workout_templates(split);"))
            logger.info("   [OK] Created workout_templates table")

            conn.commit()

        logger.info("")
        logger.info("[SUCCESS] All health dashboard tables created successfully!")
        logger.info("   - Created 5 tables with indexes")
        logger.info("   - personal_records, workout_notes, rest_days, exercises, workout_templates")
        return True

    except Exception as e:
        logger.error(f"[ERROR] Migration failed: {str(e)}")
        logger.error("Please check your database connection and try again.")
        return False


def downgrade():
    """Drop tables if needed"""
    try:
        logger.info("Running downgrade migration...")

        with engine.connect() as conn:
            tables = [
                'workout_templates',
                'exercises',
                'rest_days',
                'workout_notes',
                'personal_records'
            ]

            for table in tables:
                conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE;"))
                logger.info(f"   [OK] Dropped {table} table")

            conn.commit()

        logger.info("")
        logger.info("[SUCCESS] All health dashboard tables dropped successfully!")
        return True

    except Exception as e:
        logger.error(f"[ERROR] Downgrade failed: {str(e)}")
        return False


if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("Health Dashboard Migration Runner")
    print("=" * 60)
    print()

    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        success = downgrade()
    else:
        success = upgrade()

    if success:
        print()
        print("=" * 60)
        print("[SUCCESS] Migration completed!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Register router in main.py")
        print("2. Populate exercise library")
        print("3. Add workout templates")
        print("4. Test API endpoints")
    else:
        print()
        print("=" * 60)
        print("[ERROR] Migration failed - please check the logs above")
        print("=" * 60)
