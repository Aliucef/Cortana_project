"""
Migration: Add Telegram support
- Add telegram_user_id to users table
- Create telegram_links table for linking codes
"""
import sys
import os

# Add parent directory to path so we can import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import get_db

def run_migration():
    """Run the migration"""
    db = next(get_db())

    try:
        # Add telegram_user_id column to users table
        print("Adding telegram_user_id column to users table...")
        db.execute(text("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS telegram_user_id VARCHAR(50) UNIQUE;
        """))

        print("Creating index on telegram_user_id...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_telegram_user_id
            ON users(telegram_user_id);
        """))

        # Create telegram_links table
        print("Creating telegram_links table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS telegram_links (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                linking_code VARCHAR(20) UNIQUE NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))

        print("Creating indexes on telegram_links table...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_telegram_links_code
            ON telegram_links(linking_code);
        """))

        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_telegram_links_user_id
            ON telegram_links(user_id);
        """))

        db.commit()
        print("✅ Migration completed successfully!")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
