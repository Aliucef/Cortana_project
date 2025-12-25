"""
Update user's full name to first name only
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.settings import get_settings

settings = get_settings()

# Create engine and session
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Update user's full name to "Ali"
    query = text("UPDATE users SET full_name = :name WHERE id = :user_id")
    db.execute(query, {"name": "Ali", "user_id": 1})
    db.commit()

    print("Successfully updated full name to 'Ali'")

    # Verify the update
    verify_query = text("SELECT id, username, full_name, phone_number FROM users WHERE id = :user_id")
    result = db.execute(verify_query, {"user_id": 1})
    user = result.fetchone()

    print(f"\nUpdated user details:")
    print(f"  ID: {user[0]}")
    print(f"  Username: {user[1]}")
    print(f"  Full Name: {user[2]}")
    print(f"  Phone: {user[3]}")

except Exception as e:
    print(f"Error updating user: {str(e)}")
    db.rollback()

finally:
    db.close()
