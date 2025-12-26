"""
Add sample financial data to the database for testing the dashboard
"""
import sys
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.finance import FinanceRecord, TransactionType
from models.budget import Budget, BudgetPeriod
from models.user import User

def add_sample_data():
    db = SessionLocal()

    try:
        # Check if user exists, create if not
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(
                id=1,
                name="Ali",
                email="ali@example.com",
                phone="+1234567890"
            )
            db.add(user)
            db.commit()
            print("Created user")

        # Clear existing finance records for clean slate
        db.query(FinanceRecord).filter(FinanceRecord.user_id == 1).delete()
        db.query(Budget).filter(Budget.user_id == 1).delete()
        db.commit()
        print("Cleared existing finance data")

        # Add budget
        from models.budget import BudgetPeriod
        budget = Budget(
            user_id=1,
            amount=3000.00,
            period=BudgetPeriod.MONTHLY
        )
        db.add(budget)
        db.commit()
        print("Added monthly budget: $3000")

        # Sample categories
        expense_categories = [
            ("Food", 15, 80),
            ("Transportation", 10, 50),
            ("Entertainment", 20, 100),
            ("Shopping", 30, 150),
            ("Utilities", 50, 200),
            ("Healthcare", 20, 100),
            ("Groceries", 40, 150),
        ]

        income_sources = [
            ("Salary", 2000, 3000),
            ("Freelance", 200, 800),
            ("Investment", 50, 300),
        ]

        # Generate expenses for last 30 days
        expenses_added = 0
        for days_ago in range(30):
            date = datetime.now() - timedelta(days=days_ago)

            # Add 2-4 random expenses per day
            num_expenses = random.randint(2, 4)
            for _ in range(num_expenses):
                category, min_amt, max_amt = random.choice(expense_categories)
                amount = round(random.uniform(min_amt, max_amt), 2)

                expense = FinanceRecord(
                    user_id=1,
                    transaction_type=TransactionType.EXPENSE,
                    amount=amount,
                    category=category,
                    description=f"{category} purchase",
                    transaction_date=date
                )
                db.add(expense)
                expenses_added += 1

        # Generate income (2-3 times in the month)
        income_added = 0
        for i in range(3):
            date = datetime.now() - timedelta(days=i * 10)
            source, min_amt, max_amt = random.choice(income_sources)
            amount = round(random.uniform(min_amt, max_amt), 2)

            income = FinanceRecord(
                user_id=1,
                transaction_type=TransactionType.INCOME,
                amount=amount,
                category=source,
                description=f"{source} payment",
                transaction_date=date
            )
            db.add(income)
            income_added += 1

        db.commit()
        print(f"Added {expenses_added} expense records")
        print(f"Added {income_added} income records")

        # Calculate totals
        total_income = db.query(FinanceRecord).filter(
            FinanceRecord.user_id == 1,
            FinanceRecord.transaction_type == TransactionType.INCOME
        ).count()

        total_expenses = db.query(FinanceRecord).filter(
            FinanceRecord.user_id == 1,
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        ).count()

        print(f"\nSummary:")
        print(f"   Total Income Records: {total_income}")
        print(f"   Total Expense Records: {total_expenses}")
        print(f"   Budget: $3000/month")
        print(f"\nSample data added successfully!")
        print(f"   Refresh your dashboard to see the data!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Adding sample financial data...\n")
    add_sample_data()
