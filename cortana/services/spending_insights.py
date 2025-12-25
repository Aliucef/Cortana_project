"""
Spending Insights Service - Provide predictions and spending analysis
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from models.finance import FinanceRecord, TransactionType
from models.budget import Budget, CategoryGoal, BudgetPeriod
from datetime import datetime, timedelta
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class SpendingInsights:
    """Analyze spending patterns and provide predictions"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def get_spending_velocity(self, days: int = 7) -> Dict:
        """
        Calculate how fast the user is spending ($/day average)

        Args:
            days: Number of days to analyze

        Returns:
            Dictionary with velocity metrics
        """
        start_date = datetime.now() - timedelta(days=days)

        expenses = self.db.query(func.sum(FinanceRecord.amount)).filter(
            FinanceRecord.user_id == self.user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE,
            FinanceRecord.transaction_date >= start_date
        ).scalar() or 0

        velocity = expenses / days if days > 0 else 0

        return {
            "total_spent": expenses,
            "days": days,
            "daily_average": velocity,
            "weekly_projection": velocity * 7,
            "monthly_projection": velocity * 30
        }

    def predict_monthly_spending(self) -> Dict:
        """
        Predict total spending for current month based on current velocity

        Returns:
            Dictionary with prediction data
        """
        now = datetime.now()

        # Get spending so far this month
        month_start = datetime(now.year, now.month, 1)
        month_expenses = self.db.query(func.sum(FinanceRecord.amount)).filter(
            FinanceRecord.user_id == self.user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE,
            FinanceRecord.transaction_date >= month_start
        ).scalar() or 0

        # Calculate days elapsed and remaining in month
        days_elapsed = (now - month_start).days + 1
        days_in_month = (datetime(now.year, now.month + 1, 1) - timedelta(days=1)).day if now.month < 12 else 31
        days_remaining = days_in_month - days_elapsed

        # Calculate daily average this month
        daily_avg = month_expenses / days_elapsed if days_elapsed > 0 else 0

        # Project to end of month
        projected_total = month_expenses + (daily_avg * days_remaining)

        # Get monthly budget
        budget = self.db.query(Budget).filter(
            Budget.user_id == self.user_id,
            Budget.period == BudgetPeriod.MONTHLY
        ).first()

        result = {
            "current_spending": month_expenses,
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "daily_average": daily_avg,
            "projected_total": projected_total,
            "month_name": now.strftime("%B")
        }

        if budget:
            result["budget_amount"] = budget.amount
            result["projected_vs_budget"] = projected_total - budget.amount
            result["projected_percentage"] = (projected_total / budget.amount * 100) if budget.amount > 0 else 0

            # Predict when budget will be exceeded
            if daily_avg > 0:
                days_until_exceeded = (budget.amount - month_expenses) / daily_avg
                if days_until_exceeded > 0:
                    exceed_date = now + timedelta(days=days_until_exceeded)
                    result["budget_exceeded_date"] = exceed_date.strftime("%B %d")
                    result["days_until_exceeded"] = int(days_until_exceeded)

        return result

    def compare_to_last_period(self, period: str = "week") -> Dict:
        """
        Compare current period spending to last period

        Args:
            period: "week" or "month"

        Returns:
            Comparison data
        """
        now = datetime.now()

        if period == "week":
            current_start = now - timedelta(days=7)
            previous_start = now - timedelta(days=14)
            previous_end = current_start
        else:  # month
            current_start = datetime(now.year, now.month, 1)
            if now.month == 1:
                previous_start = datetime(now.year - 1, 12, 1)
                previous_end = datetime(now.year - 1, 12, 31)
            else:
                previous_start = datetime(now.year, now.month - 1, 1)
                previous_end = datetime(now.year, now.month - 1,
                                       (datetime(now.year, now.month, 1) - timedelta(days=1)).day)

        # Current period spending
        current_spending = self.db.query(func.sum(FinanceRecord.amount)).filter(
            FinanceRecord.user_id == self.user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE,
            FinanceRecord.transaction_date >= current_start
        ).scalar() or 0

        # Previous period spending
        previous_spending = self.db.query(func.sum(FinanceRecord.amount)).filter(
            FinanceRecord.user_id == self.user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE,
            FinanceRecord.transaction_date >= previous_start,
            FinanceRecord.transaction_date <= previous_end
        ).scalar() or 0

        # Calculate difference
        difference = current_spending - previous_spending
        percentage_change = (difference / previous_spending * 100) if previous_spending > 0 else 0

        return {
            "period": period,
            "current_spending": current_spending,
            "previous_spending": previous_spending,
            "difference": difference,
            "percentage_change": percentage_change,
            "trend": "up" if difference > 0 else "down" if difference < 0 else "stable"
        }

    def get_category_insights(self) -> List[Dict]:
        """
        Analyze spending by category and provide insights

        Returns:
            List of category insights
        """
        # Get this week's spending by category
        week_start = datetime.now() - timedelta(days=7)

        category_spending = self.db.query(
            FinanceRecord.category,
            func.sum(FinanceRecord.amount).label('total')
        ).filter(
            FinanceRecord.user_id == self.user_id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE,
            FinanceRecord.transaction_date >= week_start
        ).group_by(FinanceRecord.category).all()

        insights = []

        for category, total in category_spending:
            insight = {
                "category": category,
                "weekly_spending": total
            }

            # Check if there's a goal
            goal = self.db.query(CategoryGoal).filter(
                CategoryGoal.user_id == self.user_id,
                CategoryGoal.category == category,
                CategoryGoal.period == BudgetPeriod.WEEKLY
            ).first()

            if goal:
                insight["goal_amount"] = goal.goal_amount
                insight["percentage"] = (total / goal.goal_amount * 100) if goal.goal_amount > 0 else 0
                insight["remaining"] = goal.goal_amount - total

                # Predict if they'll exceed
                daily_avg = total / 7
                projected_weekly = daily_avg * 7
                insight["projected"] = projected_weekly

                if projected_weekly > goal.goal_amount:
                    insight["warning"] = True
                    insight["projected_over"] = projected_weekly - goal.goal_amount

            insights.append(insight)

        return insights

    def get_spending_trends(self, weeks: int = 4) -> Dict:
        """
        Analyze spending trends over multiple weeks

        Args:
            weeks: Number of weeks to analyze

        Returns:
            Trend analysis
        """
        weekly_totals = []

        for i in range(weeks):
            week_start = datetime.now() - timedelta(days=7 * (i + 1))
            week_end = datetime.now() - timedelta(days=7 * i)

            week_spending = self.db.query(func.sum(FinanceRecord.amount)).filter(
                FinanceRecord.user_id == self.user_id,
                FinanceRecord.transaction_type == TransactionType.EXPENSE,
                FinanceRecord.transaction_date >= week_start,
                FinanceRecord.transaction_date < week_end
            ).scalar() or 0

            weekly_totals.append(week_spending)

        # Reverse to get chronological order
        weekly_totals.reverse()

        # Calculate trend
        if len(weekly_totals) >= 2:
            avg_first_half = sum(weekly_totals[:len(weekly_totals)//2]) / (len(weekly_totals)//2)
            avg_second_half = sum(weekly_totals[len(weekly_totals)//2:]) / (len(weekly_totals) - len(weekly_totals)//2)

            trend_direction = "increasing" if avg_second_half > avg_first_half else "decreasing"
            trend_percentage = abs((avg_second_half - avg_first_half) / avg_first_half * 100) if avg_first_half > 0 else 0
        else:
            trend_direction = "stable"
            trend_percentage = 0

        return {
            "weekly_totals": weekly_totals,
            "average_weekly": sum(weekly_totals) / len(weekly_totals) if weekly_totals else 0,
            "trend_direction": trend_direction,
            "trend_percentage": trend_percentage,
            "highest_week": max(weekly_totals) if weekly_totals else 0,
            "lowest_week": min(weekly_totals) if weekly_totals else 0
        }

    def format_insights_message(self) -> str:
        """
        Generate a comprehensive insights message

        Returns:
            Formatted message with predictions and insights
        """
        message = "🔮 *SPENDING INSIGHTS & PREDICTIONS*\n\n"

        # Monthly prediction
        monthly_pred = self.predict_monthly_spending()
        message += f"📊 *{monthly_pred['month_name']} Projection*\n"
        message += f"Current: ${monthly_pred['current_spending']:.2f} ({monthly_pred['days_elapsed']} days)\n"
        message += f"Daily Avg: ${monthly_pred['daily_average']:.2f}/day\n"
        message += f"Projected Total: ${monthly_pred['projected_total']:.2f}\n"

        if "budget_amount" in monthly_pred:
            budget_status = "✅" if monthly_pred['projected_total'] <= monthly_pred['budget_amount'] else "⚠️"
            message += f"\n{budget_status} Budget: ${monthly_pred['budget_amount']:.2f}\n"

            if monthly_pred['projected_total'] > monthly_pred['budget_amount']:
                message += f"Projected Over: ${monthly_pred['projected_vs_budget']:.2f} ({monthly_pred['projected_percentage']:.0f}%)\n"

                if "budget_exceeded_date" in monthly_pred:
                    message += f"⏰ Budget will be exceeded around {monthly_pred['budget_exceeded_date']}\n"
            else:
                remaining = monthly_pred['budget_amount'] - monthly_pred['projected_total']
                message += f"Projected Remaining: ${remaining:.2f}\n"

        # Week vs last week
        comparison = self.compare_to_last_period("week")
        message += f"\n📈 *Week-over-Week*\n"
        message += f"This Week: ${comparison['current_spending']:.2f}\n"
        message += f"Last Week: ${comparison['previous_spending']:.2f}\n"

        if comparison['trend'] == "up":
            message += f"📈 Up ${abs(comparison['difference']):.2f} ({abs(comparison['percentage_change']):.1f}%)\n"
        elif comparison['trend'] == "down":
            message += f"📉 Down ${abs(comparison['difference']):.2f} ({abs(comparison['percentage_change']):.1f}%)\n"
        else:
            message += f"➡️ Stable spending\n"

        # Spending velocity
        velocity = self.get_spending_velocity(7)
        message += f"\n⚡ *Spending Velocity*\n"
        message += f"7-Day Average: ${velocity['daily_average']:.2f}/day\n"
        message += f"Weekly Projection: ${velocity['weekly_projection']:.2f}\n"
        message += f"Monthly Projection: ${velocity['monthly_projection']:.2f}\n"

        # Category insights
        category_insights = self.get_category_insights()
        if category_insights:
            message += f"\n🎯 *Category Watch*\n"
            for insight in category_insights[:3]:  # Top 3 categories
                if insight.get("warning"):
                    message += f"⚠️ {insight['category'].title()}: ${insight['weekly_spending']:.2f}"
                    if "goal_amount" in insight:
                        message += f" / ${insight['goal_amount']:.2f}"
                    message += "\n"

        # Trends
        trends = self.get_spending_trends(4)
        message += f"\n📊 *4-Week Trend*\n"
        message += f"Average: ${trends['average_weekly']:.2f}/week\n"

        if trends['trend_direction'] != "stable":
            arrow = "📈" if trends['trend_direction'] == "increasing" else "📉"
            message += f"{arrow} Spending is {trends['trend_direction']} by {trends['trend_percentage']:.1f}%\n"

        message += f"\n💡 *Cortana's Analysis*\n"

        # Generate smart insights
        if monthly_pred.get('projected_total', 0) > monthly_pred.get('budget_amount', float('inf')):
            message += "You're on track to exceed your monthly budget. Time to tighten up those spending habits, Spartan! 💪\n"
        elif comparison['trend'] == "up" and comparison['percentage_change'] > 20:
            message += f"Your spending jumped {comparison['percentage_change']:.0f}% this week. Everything okay, or did you finally buy that thing you've been eyeing? 👀\n"
        elif comparison['trend'] == "down":
            message += "Nice work cutting back on expenses! Keep it up and you'll have budget surplus in no time. 🎯\n"
        else:
            message += "Your spending is consistent. Predictable patterns make my job easier - and yours too! 📊\n"

        return message
