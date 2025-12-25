"""
Migration: Fix gym enum types to match Python enum values
Issue: PostgreSQL enums were created with uppercase names (MUSCLE_GAIN)
       but Python enums use lowercase values (muscle_gain)
"""

import sys
import os

# Add parent directory to path so we can import config
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from config.database import engine


def run_migration():
    """Fix all gym-related enum types"""

    with engine.connect() as conn:
        print("🔧 Fixing gym enum types...")

        # Drop the table first (if exists) to allow enum recreation
        print("  → Dropping user_gym_profiles table (will recreate)...")
        conn.execute(text("""
            DROP TABLE IF EXISTS user_gym_profiles CASCADE;
        """))
        conn.commit()

        # Drop all existing enum types
        print("  → Dropping old enum types...")
        enums_to_drop = [
            'workoutgoal',
            'experiencelevel',
            'equipmentaccess',
            'trainingsplit',
            'preferredtime'
        ]

        for enum_name in enums_to_drop:
            try:
                conn.execute(text(f"DROP TYPE IF EXISTS {enum_name} CASCADE;"))
                conn.commit()
                print(f"    ✓ Dropped {enum_name}")
            except Exception as e:
                print(f"    ⚠ Could not drop {enum_name}: {e}")
                conn.rollback()

        # Create new enum types with correct lowercase values
        print("  → Creating new enum types with correct values...")

        # WorkoutGoal enum
        conn.execute(text("""
            CREATE TYPE workoutgoal AS ENUM (
                'muscle_gain',
                'strength',
                'fat_loss',
                'general_fitness'
            );
        """))
        conn.commit()
        print("    ✓ Created workoutgoal enum")

        # ExperienceLevel enum
        conn.execute(text("""
            CREATE TYPE experiencelevel AS ENUM (
                'beginner',
                'intermediate',
                'advanced'
            );
        """))
        conn.commit()
        print("    ✓ Created experiencelevel enum")

        # EquipmentAccess enum
        conn.execute(text("""
            CREATE TYPE equipmentaccess AS ENUM (
                'full_gym',
                'home_gym',
                'minimal'
            );
        """))
        conn.commit()
        print("    ✓ Created equipmentaccess enum")

        # TrainingSplit enum
        conn.execute(text("""
            CREATE TYPE trainingsplit AS ENUM (
                'full_body',
                'upper_lower',
                'push_pull_legs',
                'bro_split'
            );
        """))
        conn.commit()
        print("    ✓ Created trainingsplit enum")

        # PreferredTime enum
        conn.execute(text("""
            CREATE TYPE preferredtime AS ENUM (
                'morning',
                'afternoon',
                'evening'
            );
        """))
        conn.commit()
        print("    ✓ Created preferredtime enum")

        # Recreate the user_gym_profiles table
        print("  → Recreating user_gym_profiles table...")
        conn.execute(text("""
            CREATE TABLE user_gym_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),

                -- Physical stats
                weight FLOAT NOT NULL,
                height FLOAT NOT NULL,
                bmi FLOAT,

                -- Training profile
                experience_level experiencelevel NOT NULL,
                primary_goal workoutgoal NOT NULL,
                training_days_per_week INTEGER NOT NULL,
                equipment_access equipmentaccess NOT NULL,
                training_split trainingsplit NOT NULL,

                -- Preferences & constraints
                preferred_time preferredtime NOT NULL,
                injuries_notes TEXT,

                -- Metadata
                onboarding_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP WITH TIME ZONE
            );
        """))
        conn.commit()
        print("    ✓ Created user_gym_profiles table")

        print("✅ Migration completed successfully!")


if __name__ == "__main__":
    run_migration()
