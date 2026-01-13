"""
Migration: Add notifications table and last_login to users
Date: 2026-01-13
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import SessionLocal, engine


def upgrade():
    """Add notifications table and last_login column to users"""
    db = SessionLocal()

    try:
        print("Starting migration: add_notifications_and_last_login")

        # 1. Add last_login column to users table
        print("Adding last_login column to users table...")
        db.execute(text("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
        """))
        db.commit()
        print("[OK] Added last_login column")

        # 2. Create notifications table
        print("Creating notifications table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                notification_type VARCHAR(50) NOT NULL,
                is_read BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("[OK] Created notifications table")

        # 3. Create indexes for better performance
        print("Creating indexes...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id
            ON notifications(user_id);
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_notifications_is_read
            ON notifications(is_read);
        """))
        db.commit()
        print("[OK] Created indexes")

        print("[SUCCESS] Migration completed successfully!")

    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def downgrade():
    """Remove notifications table and last_login column"""
    db = SessionLocal()

    try:
        print("Rolling back migration...")

        db.execute(text("DROP TABLE IF EXISTS notifications CASCADE;"))
        db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS last_login;"))
        db.commit()

        print("[SUCCESS] Rollback completed!")

    except Exception as e:
        print(f"[ERROR] Rollback failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
