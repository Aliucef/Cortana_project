"""
Initialize Personal Context - Create sample personal data for RAG testing
This script creates sample workout logs and generates summaries for testing
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.database import get_db
from services.personal_context_service import PersonalContextService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def initialize_personal_context(user_id: int = 1):
    """Initialize personal context for a user"""

    logger.info("=" * 60)
    logger.info("🧠 Initializing Personal Context RAG")
    logger.info("=" * 60)

    db = next(get_db())
    personal_context = PersonalContextService(db, user_id)

    # Generate weekly workout summary
    logger.info("\n📊 Generating weekly workout summary...")
    summary = personal_context.generate_weekly_workout_summary()
    print(f"\n{summary}\n")

    # Generate expense insights
    logger.info("\n💰 Generating expense insights...")
    insights = personal_context.generate_expense_insights(days=30)
    print(f"\n{insights}\n")

    # Generate progress report
    logger.info("\n📈 Generating progress report...")
    report = personal_context.generate_progress_report()
    print(f"\n{report}\n")

    # Show stats
    stats = personal_context.get_personal_context_stats()
    logger.info("\n" + "=" * 60)
    logger.info("✅ Personal Context Initialized!")
    logger.info("=" * 60)
    logger.info(f"📊 Stats:")
    logger.info(f"  • Total documents: {stats['total_documents']}")
    logger.info(f"  • Embedding model: {stats['model']}")
    logger.info(f"  • Categories: {', '.join(stats['categories'])}")

    logger.info("\n🎉 Personal context is ready for enhanced RAG!")
    logger.info("\nNow restart your server and ask questions like:")
    logger.info("  • 'How's my workout progress?'")
    logger.info("  • 'What did I spend on food?'")
    logger.info("  • 'Am I making progress?'")


if __name__ == "__main__":
    try:
        # Initialize for default user (ID = 1)
        initialize_personal_context(user_id=1)

    except Exception as e:
        logger.error(f"\n❌ Error: {e}", exc_info=True)
        sys.exit(1)
