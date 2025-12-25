from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from config.database import Base


class NewsPreference(Base):
    __tablename__ = "news_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # News categories of interest
    categories = Column(String(255))  # Comma-separated: "technology,business,health"
    keywords = Column(String(255))  # Comma-separated keywords to track
    sources = Column(String(255), default="al-jazeera-english,bbc-news,reuters,associated-press")  # Comma-separated source IDs

    # Location preferences
    country = Column(String(50), default="us")
    language = Column(String(10), default="en")

    # Delivery preferences
    morning_summary_enabled = Column(Boolean, default=True)
    preferred_time = Column(String(10), default="08:00")  # HH:MM format

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<NewsPreference(id={self.id}, user_id={self.user_id}, categories='{self.categories}')>"
