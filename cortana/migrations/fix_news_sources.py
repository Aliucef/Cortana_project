"""
Fix news sources - Update existing preferences to Al Jazeera only
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import get_settings
from models.news import NewsPreference

settings = get_settings()

def fix_news_sources():
    """Update all news preferences to use Al Jazeera only"""
    engine = create_engine(settings.database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    print("Fixing news sources to Al Jazeera only...")

    try:
        # Get all news preferences
        all_prefs = db.query(NewsPreference).all()

        for prefs in all_prefs:
            # Update sources to Al Jazeera only
            prefs.sources = "al-jazeera-english"
            prefs.language = "ar"  # Ensure Arabic
            print(f"Updated user {prefs.user_id}: sources = {prefs.sources}")

        db.commit()
        print(f"Successfully updated {len(all_prefs)} news preference records!")

    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_news_sources()
