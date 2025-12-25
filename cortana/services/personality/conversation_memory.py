"""
Conversation Memory Service - Tracks recent conversations for context-aware responses
"""
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from config.database import Base

logger = logging.getLogger(__name__)


class ConversationHistory(Base):
    """Store conversation history for context-aware responses"""
    __tablename__ = "conversation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    intent = Column(String(100))
    context_tags = Column(String(500))  # Comma-separated tags
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class ConversationMemory:
    """Manage conversation memory for contextual AI responses"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def add_conversation(
        self,
        user_message: str,
        bot_response: str,
        intent: Optional[str] = None,
        context_tags: Optional[List[str]] = None
    ):
        """
        Save a conversation to memory

        Args:
            user_message: What the user said
            bot_response: How Cortana responded
            intent: Detected intent (expense_logging, news, etc.)
            context_tags: Tags for context (e.g., ["spending", "overspent", "food"])
        """
        try:
            conversation = ConversationHistory(
                user_id=self.user_id,
                user_message=user_message,
                bot_response=bot_response,
                intent=intent,
                context_tags=",".join(context_tags) if context_tags else ""
            )
            self.db.add(conversation)
            self.db.commit()
            logger.info(f"Saved conversation for user {self.user_id}")

        except Exception as e:
            logger.error(f"Error saving conversation: {str(e)}")
            self.db.rollback()

    def get_recent_conversations(self, limit: int = 10) -> List[Dict]:
        """
        Get recent conversation history

        Args:
            limit: Number of recent conversations to retrieve

        Returns:
            List of conversation dictionaries
        """
        try:
            conversations = self.db.query(ConversationHistory).filter(
                ConversationHistory.user_id == self.user_id
            ).order_by(
                ConversationHistory.timestamp.desc()
            ).limit(limit).all()

            return [
                {
                    "user_message": conv.user_message,
                    "bot_response": conv.bot_response,
                    "intent": conv.intent,
                    "context_tags": conv.context_tags.split(",") if conv.context_tags else [],
                    "timestamp": conv.timestamp
                }
                for conv in reversed(conversations)  # Reverse to get chronological order
            ]

        except Exception as e:
            logger.error(f"Error fetching conversations: {str(e)}")
            return []

    def get_context_summary(self) -> str:
        """
        Generate a summary of recent conversations for AI context

        Returns:
            String summary of recent topics discussed
        """
        recent = self.get_recent_conversations(limit=5)

        if not recent:
            return "This is a new conversation."

        summary_parts = []
        for conv in recent:
            if conv["intent"]:
                summary_parts.append(f"User {conv['intent']}: {conv['user_message'][:50]}...")

        if summary_parts:
            return "Recent context: " + "; ".join(summary_parts)
        return "This is a new conversation."

    def find_related_topic(self, keywords: List[str]) -> Optional[Dict]:
        """
        Find if user mentioned a topic before

        Args:
            keywords: Keywords to search for

        Returns:
            Most recent related conversation or None
        """
        try:
            # Search in last 50 conversations
            recent = self.db.query(ConversationHistory).filter(
                ConversationHistory.user_id == self.user_id
            ).order_by(
                ConversationHistory.timestamp.desc()
            ).limit(50).all()

            for conv in recent:
                for keyword in keywords:
                    if keyword.lower() in conv.user_message.lower() or keyword.lower() in conv.bot_response.lower():
                        return {
                            "user_message": conv.user_message,
                            "bot_response": conv.bot_response,
                            "intent": conv.intent,
                            "timestamp": conv.timestamp
                        }

            return None

        except Exception as e:
            logger.error(f"Error finding related topic: {str(e)}")
            return None

    def cleanup_old_conversations(self, days_to_keep: int = 30):
        """
        Delete conversations older than specified days

        Args:
            days_to_keep: Number of days to keep conversations
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)

            self.db.query(ConversationHistory).filter(
                ConversationHistory.user_id == self.user_id,
                ConversationHistory.timestamp < cutoff_date
            ).delete()

            self.db.commit()
            logger.info(f"Cleaned up old conversations for user {self.user_id}")

        except Exception as e:
            logger.error(f"Error cleaning up conversations: {str(e)}")
            self.db.rollback()
