"""
Migration: Create workout-related tables
Tables: workout_plans, workout_logs, weight_logs, gym_schedules
"""

import sys
import os

# Add parent directory to path so we can import config
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from config.database import engine


def run_migration():
    """Create all workout-related tables"""

    with engine.connect() as conn:
        print("🏋️ Creating workout tables...")

        # Drop old tables if they exist (to ensure proper schema)
        print("  → Dropping old workout tables (if they exist)...")
        conn.execute(text("DROP TABLE IF EXISTS workout_logs CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS weight_logs CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS gym_schedules CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS workout_plans CASCADE;"))
        conn.commit()
        print("    ✓ Dropped old tables")

        # Create workout_plans table
        print("  → Creating workout_plans table...")
        conn.execute(text("""
            CREATE TABLE workout_plans (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),

                -- Plan details
                week_number INTEGER NOT NULL,
                day_of_week VARCHAR(20) NOT NULL,
                muscle_group VARCHAR(50),
                exercises JSON,

                -- Tracking
                completed BOOLEAN DEFAULT FALSE,
                completed_at TIMESTAMP WITH TIME ZONE,

                -- Metadata
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """))
        conn.commit()
        print("    ✓ Created workout_plans table")

        # Create workout_logs table
        print("  → Creating workout_logs table...")
        conn.execute(text("""
            CREATE TABLE workout_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                workout_plan_id INTEGER REFERENCES workout_plans(id),

                -- Exercise details
                exercise_name VARCHAR(100) NOT NULL,
                sets INTEGER,
                reps INTEGER,
                weight FLOAT,
                duration_minutes INTEGER,
                notes TEXT,

                -- Metadata
                logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        conn.commit()
        print("    ✓ Created workout_logs table")

        # Create weight_logs table
        print("  → Creating weight_logs table...")
        conn.execute(text("""
            CREATE TABLE weight_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),

                -- Weight data
                weight FLOAT NOT NULL,
                body_fat_percentage FLOAT,
                measurements JSON,

                -- Metadata
                weigh_in_date DATE NOT NULL,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        conn.commit()
        print("    ✓ Created weight_logs table")

        # Create gym_schedules table
        print("  → Creating gym_schedules table...")
        conn.execute(text("""
            CREATE TABLE gym_schedules (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),

                -- Schedule preferences
                preferred_days TEXT[],
                reminder_time_hour INTEGER,
                reminder_time_minute INTEGER DEFAULT 0,
                reminder_minutes_before INTEGER DEFAULT 30,

                -- Weekly check-in
                weigh_in_day VARCHAR(20) DEFAULT 'sunday',
                weigh_in_time_hour INTEGER DEFAULT 8,

                -- Metadata
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """))
        conn.commit()
        print("    ✓ Created gym_schedules table")

        # Create indexes for performance
        print("  → Creating indexes...")
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_workout_plans_user_week
            ON workout_plans(user_id, week_number);
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_workout_logs_user
            ON workout_logs(user_id, logged_at DESC);
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_weight_logs_user
            ON weight_logs(user_id, weigh_in_date DESC);
        """))
        conn.commit()
        print("    ✓ Created indexes")

        print("✅ Migration completed successfully!")


if __name__ == "__main__":
    run_migration()
