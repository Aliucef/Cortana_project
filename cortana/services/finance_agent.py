"""
Finance Agent - Analyzes spending patterns and generates summaries
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.finance import FinanceRecord, TransactionType
from models.budget import Budget, CategoryGoal, BudgetPeriod
from datetime import datetime, timedelta
import pandas as pd
from typing import Dict, List, Optional


class FinanceAgent:
    """Intelligent finance tracking and analysis agent"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def get_weekly_summary(self, weeks_back: int = 0) -> Dict:
        """
        Generate weekly financial summary

        Args:
            weeks_back: Number of weeks to look back (0 = current week, 1 = last week, etc.)

        Returns:
            Dictionary with weekly summary data
        """
        # Calculate date range for the week
        today = datetime.now()
        week_start = today - timedelta(days=today.weekday() + (weeks_back * 7))
        week_end = week_start + timedelta(days=7)

        # Get all transactions for the week
        transactions = (
            self.db.query(FinanceRecord)
            .filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_date >= week_start,
                FinanceRecord.transaction_date < week_end
            )
            .all()
        )

        # Calculate totals
        total_income = sum(
            t.amount for t in transactions
            if t.transaction_type == TransactionType.INCOME
        )
        total_expenses = sum(
            t.amount for t in transactions
            if t.transaction_type == TransactionType.EXPENSE
        )

        # Group expenses by category
        expenses_by_category = {}
        for t in transactions:
            if t.transaction_type == TransactionType.EXPENSE:
                if t.category not in expenses_by_category:
                    expenses_by_category[t.category] = 0
                expenses_by_category[t.category] += t.amount

        # Sort categories by amount
        expenses_by_category = dict(
            sorted(expenses_by_category.items(), key=lambda x: x[1], reverse=True)
        )

        # Get previous week's expenses for comparison
        prev_week_start = week_start - timedelta(days=7)
        prev_week_expenses = (
            self.db.query(func.sum(FinanceRecord.amount))
            .filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= prev_week_start,
                FinanceRecord.transaction_date < week_start
            )
            .scalar() or 0.0
        )

        # Calculate percentage change
        if prev_week_expenses > 0:
            percent_change = ((total_expenses - prev_week_expenses) / prev_week_expenses) * 100
        else:
            percent_change = 0.0

        return {
            "week_start": week_start.strftime("%Y-%m-%d"),
            "week_end": week_end.strftime("%Y-%m-%d"),
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_balance": round(total_income - total_expenses, 2),
            "expenses_by_category": expenses_by_category,
            "transaction_count": len(transactions),
            "percent_change_from_last_week": round(percent_change, 2),
            "prev_week_expenses": round(prev_week_expenses, 2)
        }

    def get_monthly_summary(self) -> Dict:
        """Generate monthly financial summary"""
        # Calculate date range for current month
        today = datetime.now()
        month_start = today.replace(day=1)
        if today.month == 12:
            month_end = today.replace(year=today.year + 1, month=1, day=1)
        else:
            month_end = today.replace(month=today.month + 1, day=1)

        # Get all transactions for the month
        transactions = (
            self.db.query(FinanceRecord)
            .filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_date >= month_start,
                FinanceRecord.transaction_date < month_end
            )
            .all()
        )

        # Calculate totals
        total_income = sum(
            t.amount for t in transactions
            if t.transaction_type == TransactionType.INCOME
        )
        total_expenses = sum(
            t.amount for t in transactions
            if t.transaction_type == TransactionType.EXPENSE
        )

        # Group expenses by category
        expenses_by_category = {}
        for t in transactions:
            if t.transaction_type == TransactionType.EXPENSE:
                if t.category not in expenses_by_category:
                    expenses_by_category[t.category] = 0
                expenses_by_category[t.category] += t.amount

        return {
            "month": month_start.strftime("%B %Y"),
            "month_start": month_start.strftime("%Y-%m-%d"),
            "month_end": month_end.strftime("%Y-%m-%d"),
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_balance": round(total_income - total_expenses, 2),
            "expenses_by_category": expenses_by_category,
            "transaction_count": len(transactions)
        }

    def get_spending_insights(self) -> List[str]:
        """
        Generate intelligent insights about spending patterns

        Returns:
            List of insight strings
        """
        insights = []
        weekly_summary = self.get_weekly_summary()

        # Insight 1: Week-over-week comparison
        percent_change = weekly_summary["percent_change_from_last_week"]
        if percent_change > 20:
            insights.append(
                f"⚠️ Your spending increased by {abs(percent_change):.1f}% compared to last week."
            )
        elif percent_change < -20:
            insights.append(
                f"✅ Great job! Your spending decreased by {abs(percent_change):.1f}% compared to last week."
            )

        # Insight 2: Top spending category
        if weekly_summary["expenses_by_category"]:
            top_category = list(weekly_summary["expenses_by_category"].keys())[0]
            top_amount = weekly_summary["expenses_by_category"][top_category]
            percentage = (top_amount / weekly_summary["total_expenses"]) * 100
            insights.append(
                f"💰 Your top spending category this week: {top_category} "
                f"(${top_amount:.2f}, {percentage:.1f}% of total)"
            )

        # Insight 3: Net balance status
        net_balance = weekly_summary["net_balance"]
        if net_balance < 0:
            insights.append(
                f"⚠️ You spent ${abs(net_balance):.2f} more than you earned this week."
            )
        elif net_balance > 0:
            insights.append(
                f"✅ You saved ${net_balance:.2f} this week!"
            )

        return insights

    def create_text_bar_chart(self, data: Dict[str, float], max_width: int = 20) -> str:
        """
        Create a simple text-based bar chart

        Args:
            data: Dictionary of category: amount
            max_width: Maximum width of bars in characters

        Returns:
            Text-based bar chart
        """
        if not data:
            return ""

        max_value = max(data.values())
        chart = ""

        for category, amount in data.items():
            # Calculate bar width
            if max_value > 0:
                bar_width = int((amount / max_value) * max_width)
            else:
                bar_width = 0

            # Create bar
            bar = "█" * bar_width
            percentage = (amount / sum(data.values())) * 100 if sum(data.values()) > 0 else 0

            chart += f"{category:12} {bar} ${amount:.2f} ({percentage:.1f}%)\n"

        return chart

    def get_detailed_report(self, period: str = "weekly") -> str:
        """
        Generate detailed financial report with trends, percentages, and charts

        Args:
            period: "weekly" or "monthly"

        Returns:
            Formatted detailed report
        """
        if period == "weekly":
            summary = self.get_weekly_summary()
            period_name = f"Week of {summary['week_start']}"
        else:
            summary = self.get_monthly_summary()
            period_name = summary['month']

        report = f"📊 *DETAILED FINANCIAL REPORT*\n"
        report += f"{'=' * 35}\n"
        report += f"Period: {period_name}\n\n"

        # Income & Expenses Overview
        report += "💰 *INCOME & EXPENSES*\n"
        report += f"{'─' * 35}\n"
        report += f"Income:    ${summary['total_income']:>10.2f}\n"
        report += f"Expenses:  ${summary['total_expenses']:>10.2f}\n"
        report += f"{'─' * 35}\n"

        net = summary['net_balance']
        if net >= 0:
            report += f"Net:       ${net:>10.2f} ✅\n"
            savings_rate = (net / summary['total_income'] * 100) if summary['total_income'] > 0 else 0
            report += f"Savings Rate: {savings_rate:.1f}%\n"
        else:
            report += f"Net:       ${net:>10.2f} ⚠️\n"
            report += f"Overspent by ${abs(net):.2f}\n"

        report += "\n"

        # Spending Breakdown with Chart
        if summary['expenses_by_category']:
            report += "📈 *SPENDING BY CATEGORY*\n"
            report += f"{'─' * 35}\n"
            report += self.create_text_bar_chart(summary['expenses_by_category'])
            report += "\n"

        # Budget Comparison (if budgets exist)
        budget_period = BudgetPeriod.MONTHLY if period == "monthly" else BudgetPeriod.WEEKLY
        budget = self.db.query(Budget).filter(
            Budget.user_id == self.user_id,
            Budget.period == budget_period
        ).first()

        if budget:
            budget_used = (summary['total_expenses'] / budget.amount) * 100 if budget.amount > 0 else 0
            report += "🎯 *BUDGET TRACKING*\n"
            report += f"{'─' * 35}\n"
            report += f"Budget:    ${budget.amount:.2f}\n"
            report += f"Spent:     ${summary['total_expenses']:.2f}\n"
            report += f"Remaining: ${budget.amount - summary['total_expenses']:.2f}\n"
            report += f"Used:      {budget_used:.1f}%\n"

            # Progress bar
            bar_length = 20
            filled = int((budget_used / 100) * bar_length)
            bar = "█" * min(filled, bar_length) + "░" * max(bar_length - filled, 0)
            report += f"[{bar}]\n"

            if budget_used > 100:
                report += "⚠️ Over budget!\n"
            elif budget_used > 80:
                report += "⚠️ Approaching limit!\n"
            report += "\n"

        # Category Goals
        goals = self.db.query(CategoryGoal).filter(
            CategoryGoal.user_id == self.user_id
        ).all()

        if goals:
            report += "🎯 *CATEGORY GOALS*\n"
            report += f"{'─' * 35}\n"
            for goal in goals:
                spent = summary['expenses_by_category'].get(goal.category, 0)
                percentage = (spent / goal.goal_amount) * 100 if goal.goal_amount > 0 else 0

                status = "✅" if percentage < 80 else ("⚠️" if percentage < 100 else "🚨")
                report += f"{goal.category}: ${spent:.2f} / ${goal.goal_amount:.2f} ({percentage:.0f}%) {status}\n"
            report += "\n"

        # Trends (for weekly reports)
        if period == "weekly" and "percent_change_from_last_week" in summary:
            report += "📉 *TRENDS*\n"
            report += f"{'─' * 35}\n"
            change = summary['percent_change_from_last_week']

            if change > 0:
                report += f"Spending UP {abs(change):.1f}% vs last week 📈\n"
            elif change < 0:
                report += f"Spending DOWN {abs(change):.1f}% vs last week 📉\n"
            else:
                report += "Spending unchanged vs last week\n"

            report += f"Last week: ${summary['prev_week_expenses']:.2f}\n"
            report += f"This week: ${summary['total_expenses']:.2f}\n"
            report += "\n"

        # Insights
        insights = self.get_spending_insights()
        if insights:
            report += "💡 *KEY INSIGHTS*\n"
            report += f"{'─' * 35}\n"
            for insight in insights:
                report += f"• {insight}\n"
            report += "\n"

        report += f"{'=' * 35}\n"
        report += f"Total Transactions: {summary['transaction_count']}\n"

        return report

    def format_summary_message(self, summary_type: str = "weekly") -> str:
        """
        Format a human-readable summary message

        Args:
            summary_type: "weekly" or "monthly"

        Returns:
            Formatted message string
        """
        if summary_type == "weekly":
            summary = self.get_weekly_summary()
            period = f"Week of {summary['week_start']}"
        else:
            summary = self.get_monthly_summary()
            period = summary['month']

        message = f"📊 *Financial Summary - {period}*\n\n"
        message += f"💵 Income: ${summary['total_income']:.2f}\n"
        message += f"💸 Expenses: ${summary['total_expenses']:.2f}\n"
        message += f"💰 Net Balance: ${summary['net_balance']:.2f}\n\n"

        if summary['expenses_by_category']:
            message += "*Top Spending Categories:*\n"
            for i, (category, amount) in enumerate(list(summary['expenses_by_category'].items())[:5], 1):
                message += f"{i}. {category}: ${amount:.2f}\n"

        # Add insights for weekly summaries
        if summary_type == "weekly":
            insights = self.get_spending_insights()
            if insights:
                message += "\n*Insights:*\n"
                for insight in insights:
                    message += f"{insight}\n"

        return message
