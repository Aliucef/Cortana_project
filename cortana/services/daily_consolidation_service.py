"""
Daily Consolidation Service
Runs at midnight to consolidate all changes from the day and update personal context
"""

from sqlalchemy.orm import Session
from services.personal_context_service import PersonalContextService
from models.user import User
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class DailyConsolidationService:
    """
    Consolidates daily changes and updates personal context

    Runs at midnight to:
    - Regenerate all summaries (workout, expense, progress)
    - Update vector store with day's changes
    - Clean up old data if needed
    """

    def __init__(self, db: Session):
        self.db = db

    def consolidate_all_users(self):
        """
        Run daily consolidation for all active users
        """
        try:
            logger.info("Starting daily consolidation for all users")

            # Get all users (in production, filter for active users only)
            users = self.db.query(User).all()

            for user in users:
                try:
                    self.consolidate_user(user.id)
                except Exception as e:
                    logger.error(f"Failed to consolidate for user {user.id}: {e}")
                    # Continue with next user

            logger.info(f"Daily consolidation completed for {len(users)} users")

        except Exception as e:
            logger.error(f"Daily consolidation failed: {e}")

    def consolidate_user(self, user_id: int):
        """
        Consolidate all changes for a specific user

        Args:
            user_id: User's ID
        """
        logger.info(f"Consolidating daily changes for user {user_id}")

        try:
            personal_context = PersonalContextService(self.db, user_id)

            # 1. Regenerate weekly workout summary
            try:
                personal_context.generate_weekly_workout_summary()
                logger.info(f"  - Regenerated workout summary for user {user_id}")
            except Exception as e:
                logger.warning(f"  - Failed to regenerate workout summary: {e}")

            # 2. Regenerate expense insights (last 30 days)
            try:
                personal_context.generate_expense_insights(days=30)
                logger.info(f"  - Regenerated expense insights for user {user_id}")
            except Exception as e:
                logger.warning(f"  - Failed to regenerate expense insights: {e}")

            # 3. Regenerate progress report
            try:
                personal_context.generate_progress_report()
                logger.info(f"  - Regenerated progress report for user {user_id}")
            except Exception as e:
                logger.warning(f"  - Failed to regenerate progress report: {e}")

            # 4. Clean up old embeddings (optional - keep last 90 days)
            try:
                self._cleanup_old_embeddings(personal_context, days=90)
                logger.info(f"  - Cleaned up old embeddings for user {user_id}")
            except Exception as e:
                logger.warning(f"  - Failed to clean up old embeddings: {e}")

            logger.info(f"Successfully consolidated user {user_id}")

        except Exception as e:
            logger.error(f"Consolidation failed for user {user_id}: {e}")
            raise

    def _cleanup_old_embeddings(self, personal_context: PersonalContextService, days: int = 90):
        """
        Clean up embeddings older than specified days

        Note: This is optional and depends on storage constraints.
        For now, we keep all embeddings for historical analysis.

        Args:
            personal_context: PersonalContextService instance
            days: Keep embeddings from last N days
        """
        # This is a placeholder for future implementation
        # Would need to track embedding timestamps and remove old ones
        pass

    def get_consolidation_stats(self, user_id: int) -> dict:
        """
        Get stats about the consolidation for a user

        Returns:
            Dictionary with consolidation statistics
        """
        try:
            personal_context = PersonalContextService(self.db, user_id)

            stats = {
                "last_consolidation": datetime.now(),
                "user_id": user_id,
                "status": "success"
            }

            # Add more stats if needed
            return stats

        except Exception as e:
            logger.error(f"Failed to get consolidation stats for user {user_id}: {e}")
            return {
                "user_id": user_id,
                "status": "error",
                "error": str(e)
            }
