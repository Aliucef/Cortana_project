"""
User Preferences Model - Store scheduling preferences
"""
from sqlalchemy import Column, Integer, String, Time, ForeignKey
from config.database import Base


class UserSchedulePreference(Base):
    """
    Store user's preferred schedule times for notifications
    """
    __tablename__ = "user_schedule_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Daily reminder time (default: 20:00 / 8 PM)
    daily_reminder_hour = Column(Integer, default=20)
    daily_reminder_minute = Column(Integer, default=0)

    # Weekly summary settings
    weekly_summary_day = Column(String(10), default="sunday")  # monday, tuesday, etc.
    weekly_summary_hour = Column(Integer, default=18)  # 6 PM
    weekly_summary_minute = Column(Integer, default=0)

    def __repr__(self):
        return f"<UserSchedulePreference(user_id={self.user_id}, daily={self.daily_reminder_hour}:{self.daily_reminder_minute:02d})>"
