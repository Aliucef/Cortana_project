"""Quick script to update user phone number"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Get database URL
database_url = os.getenv('DATABASE_URL')

# Create engine and session
engine = create_engine(database_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Update user ID 1 with phone number
    result = db.execute(
        text("UPDATE users SET phone_number = '+96176017516' WHERE id = 1")
    )
    db.commit()

    print(f"✅ Updated user 1 with phone number +96176017516")
    print(f"Rows affected: {result.rowcount}")

    # Verify
    user = db.execute(text("SELECT id, username, phone_number FROM users WHERE id = 1")).fetchone()
    print(f"\nVerified:")
    print(f"  ID: {user[0]}")
    print(f"  Username: {user[1]}")
    print(f"  Phone: {user[2]}")

except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()

finally:
    db.close()
