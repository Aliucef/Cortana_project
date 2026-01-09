"use client";

import { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar,
  AlertCircle,
  Target,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useFinance } from "../components/FinanceContext";

export default function FinanceDashboard() {
  const {
    summary,
    records,
    budget,
    categoryGoals,
    period,
    setPeriod,
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate,
    loading,
  } = useFinance();

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    const handleDarkModeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);
    return () => window.removeEventListener("darkModeChange", handleDarkModeChange);
  }, []);

  // Filter records based on period
  const filteredRecords = useMemo(() => {
    if (period === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return records.filter((record) => {
        const recordDate = new Date(record.transaction_date);
        return recordDate >= start && recordDate <= end;
      });
    }
    return records;
  }, [records, period, customStartDate, customEndDate]);

  // Prepare category data for pie chart (expenses)
  const categoryData = useMemo(() => {
    return summary?.category_breakdown
      ? Object.entries(summary.category_breakdown).map(([category, amount]) => ({
          name: category,
          value: Math.abs(amount as number),
        }))
      : [];
  }, [summary]);

  // Prepare top 5 spending categories for bar chart
  const topSpendingCategories = useMemo(() => {
    return categoryData.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [categoryData]);

  // Calculate alerts
  const alerts = useMemo(() => {
    const alertList: Array<{
      type: string;
      title: string;
      message: string;
    }> = [];

    // Budget alert
    if (budget && summary) {
      const spent = Math.abs(summary.total_expenses);
      const budgetAmount = budget.amount;
      const progress = (spent / budgetAmount) * 100;

      if (progress >= 100) {
        alertList.push({
          type: "danger",
          title: "Budget Exceeded",
          message: `You've spent $${spent.toFixed(2)} of your $${budgetAmount.toFixed(
            2
          )} ${budget.period} budget.`,
        });
      } else if (progress >= 80) {
        alertList.push({
          type: "warning",
          title: "Budget Warning",
          message: `You've used ${progress.toFixed(0)}% of your budget.`,
        });
      }
    }

    // Category goal alerts
    categoryGoals?.forEach((goal) => {
      const spent = Math.abs(
        (summary?.category_breakdown?.[goal.category] as number) || 0
      );
      const progress = (spent / goal.goal_amount) * 100;

      if (progress >= 100) {
        alertList.push({
          type: "danger",
          title: `${goal.category} Goal Exceeded`,
          message: `You've spent $${spent.toFixed(2)} of your $${goal.goal_amount.toFixed(
            2
          )} ${goal.category} goal.`,
        });
      } else if (progress >= 80) {
        alertList.push({
          type: "warning",
          title: `${goal.category} Alert`,
          message: `You've used ${progress.toFixed(0)}% of your ${
            goal.category
          } goal.`,
        });
      }
    });

    return alertList;
  }, [budget, summary, categoryGoals]);

  // Prepare trend data for area chart
  const trendData = useMemo(() => {
    return filteredRecords
      .slice(0, 30)
      .reverse()
      .reduce((acc: any[], record) => {
        const date = new Date(record.transaction_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          if (record.transaction_type === "income") {
            existing.income += record.amount;
          } else {
            existing.expenses += record.amount;
          }
        } else {
          acc.push({
            date,
            income: record.transaction_type === "income" ? record.amount : 0,
            expenses: record.transaction_type === "expense" ? record.amount : 0,
          });
        }
        return acc;
      }, []);
  }, [filteredRecords]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={darkMode ? "text-gray-300 text-xl" : "text-gray-700 text-xl"}>
          Loading your finances...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 pt-24 px-6 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <DollarSign className="w-8 h-8 text-blue-600" />
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Finance Dashboard
          </h1>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {(["weekly", "monthly", "custom"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                period === p
                  ? darkMode
                    ? "bg-blue-900 text-blue-400 border-blue-800"
                    : "bg-blue-100 text-blue-700 border-blue-200"
                  : darkMode
                  ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        {period === "custom" && (
          <div className="flex gap-4 mb-6">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.type === "danger"
                    ? darkMode
                      ? "bg-red-900/20 border-red-800"
                      : "bg-red-50 border-red-200"
                    : darkMode
                    ? "bg-yellow-900/20 border-yellow-800"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 mt-0.5 ${
                      alert.type === "danger" ? "text-red-600" : "text-yellow-600"
                    }`}
                  />
                  <div>
                    <h3
                      className={`font-medium mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {alert.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Income */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  darkMode ? "bg-green-900/30" : "bg-green-50"
                }`}
              >
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                INCOME
              </span>
            </div>
            <h3
              className={`text-sm mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Total Income
            </h3>
            <p
              className={`text-2xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ${summary?.total_income.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* Total Expenses */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  darkMode ? "bg-red-900/30" : "bg-red-50"
                }`}
              >
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                EXPENSES
              </span>
            </div>
            <h3
              className={`text-sm mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Total Expenses
            </h3>
            <p
              className={`text-2xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ${Math.abs(summary?.total_expenses || 0).toFixed(2)}
            </p>
          </div>

          {/* Net Balance */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  darkMode ? "bg-blue-900/30" : "bg-blue-50"
                }`}
              >
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                BALANCE
              </span>
            </div>
            <h3
              className={`text-sm mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Net Balance
            </h3>
            <p
              className={`text-2xl font-semibold ${
                (summary?.net_balance || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ${summary?.net_balance.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* Budget Status */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  darkMode ? "bg-purple-900/30" : "bg-purple-50"
                }`}
              >
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                BUDGET
              </span>
            </div>
            <h3
              className={`text-sm mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Budget Remaining
            </h3>
            <p
              className={`text-2xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              $
              {budget
                ? (budget.amount - Math.abs(summary?.total_expenses || 0)).toFixed(2)
                : "0.00"}
            </p>
            {budget && (
              <div className="mt-2">
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}>
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        (Math.abs(summary?.total_expenses || 0) / budget.amount) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income vs Expenses Trend */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Income vs Expenses Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                <XAxis
                  dataKey="date"
                  stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
                    borderRadius: "8px",
                    color: darkMode ? "#F3F4F6" : "#111827",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.3}
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Spending by Category */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Top Spending Categories
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSpendingCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                <XAxis
                  dataKey="name"
                  stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
                    borderRadius: "8px",
                    color: darkMode ? "#F3F4F6" : "#111827",
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                  {topSpendingCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          className={`border rounded-xl p-6 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Recent Transactions
          </h3>
          <div className="space-y-2">
            {filteredRecords.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  darkMode
                    ? "border-gray-700 hover:bg-gray-700/50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      record.transaction_type === "income"
                        ? darkMode
                          ? "bg-green-900/30"
                          : "bg-green-50"
                        : darkMode
                        ? "bg-red-900/30"
                        : "bg-red-50"
                    }`}
                  >
                    {record.transaction_type === "income" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {record.description}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {record.category} • {new Date(record.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    record.transaction_type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {record.transaction_type === "income" ? "+" : "-"}$
                  {record.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
