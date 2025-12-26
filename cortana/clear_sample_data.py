"""
Clear all sample/test data from the database
"""
from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.finance import FinanceRecord
from models.budget import Budget

def clear_sample_data():
    db = SessionLocal()

    try:
        print("Clearing sample data for user_id = 1...")

        # Delete all finance records
        deleted_finance = db.query(FinanceRecord).filter(FinanceRecord.user_id == 1).delete()
        print(f"Deleted {deleted_finance} finance records")

        # Delete all budgets
        deleted_budgets = db.query(Budget).filter(Budget.user_id == 1).delete()
        print(f"Deleted {deleted_budgets} budgets")

        db.commit()
        print("\nAll sample data cleared successfully!")
        print("Your dashboard will now show empty/zero values.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("CLEAR SAMPLE DATA")
    print("=" * 50)
    print("\nThis will delete ALL finance records and budgets for user_id = 1")
    confirm = input("\nAre you sure? (yes/no): ")

    if confirm.lower() == "yes":
        clear_sample_data()
    else:
        print("Cancelled.")
