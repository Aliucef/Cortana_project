"""
Migration Runner - Easily run database migrations
"""
from config.database import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_migration():
    """Run the conversation history migration"""

    migration_sql = """
    -- Migration: Add conversation history table for memory system
    -- Created: 2025-10-11
    -- Purpose: Enable context-aware responses and conversation tracking

    CREATE TABLE IF NOT EXISTS conversation_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        intent VARCHAR(100),
        context_tags VARCHAR(500),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversation_history_timestamp ON conversation_history(user_id, timestamp DESC);
    """

    try:
        logger.info("Running conversation_history migration...")

        with engine.connect() as conn:
            # Execute the migration
            conn.execute(text(migration_sql))
            conn.commit()

        logger.info("✅ Migration completed successfully!")
        logger.info("   - Created table: conversation_history")
        logger.info("   - Created indexes for performance")
        logger.info("")
        logger.info("Cortana's memory system is now ready! 🧠")

    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        logger.error("Please check your database connection and try again.")
        return False

    return True


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Cortana Database Migration Runner")
    print("=" * 60)
    print()

    success = run_migration()

    if success:
        print()
        print("=" * 60)
        print("✅ SUCCESS! Cortana is now smarter with memory!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Restart your bot: python main.py")
        print("2. Test conversation memory")
        print("3. Enjoy smarter responses!")
    else:
        print()
        print("=" * 60)
        print("❌ Migration failed - please check the logs above")
        print("=" * 60)
