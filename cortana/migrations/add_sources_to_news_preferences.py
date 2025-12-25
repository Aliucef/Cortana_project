"""
Add sources column to news_preferences table
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from config.settings import get_settings

settings = get_settings()

def add_sources_column():
    """Add sources column to news_preferences table"""
    engine = create_engine(settings.database_url)

    print("Adding sources column to news_preferences...")

    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='news_preferences'
            AND column_name='sources'
        """))

        if result.fetchone():
            print("sources column already exists!")
            return

        # Add the column
        conn.execute(text("""
            ALTER TABLE news_preferences
            ADD COLUMN sources VARCHAR(255) DEFAULT 'al-jazeera-english,bbc-news,reuters,associated-press'
        """))

        conn.commit()
        print("sources column added successfully!")

if __name__ == "__main__":
    add_sources_column()
