"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  PieChart,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  Download,
  FileText,
  FileSpreadsheet,
  CalendarDays,
  X,
  Target,
  AlertCircle,
  Search,
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
import {
  getFinanceSummary,
  getFinanceRecords,
  getBudget,
  createBudget,
  addFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  getCategoryGoals,
  createCategoryGoal,
  deleteCategoryGoal,
  type FinanceSummary,
  type FinanceRecord,
  type Budget,
  type CategoryGoal,
} from "@/lib/api";

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categoryGoals, setCategoryGoals] = useState<CategoryGoal[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "custom">("monthly");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", subtitle: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCategoryGoalModal, setShowCategoryGoalModal] = useState(false);

  // Date range state
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Budget form state
  const [budgetFormData, setBudgetFormData] = useState({
    amount: "",
    period: "monthly" as "weekly" | "monthly",
  });

  // Category goal form state
  const [categoryGoalFormData, setCategoryGoalFormData] = useState({
    category: "",
    goal_amount: "",
    period: "monthly" as "weekly" | "monthly",
    alert_threshold: "80",
  });

  useEffect(() => {
    loadData();
  }, [period, customStartDate, customEndDate]);

  async function loadData() {
    setLoading(true);
    try {
      const [summaryData, recordsData, budgetData, goalsData] = await Promise.all([
        getFinanceSummary(
          1,
          period,
          period === "custom" ? customStartDate : undefined,
          period === "custom" ? customEndDate : undefined
        ),
        getFinanceRecords(1),
        getBudget(1),
        getCategoryGoals(1),
      ]);
      setSummary(summaryData);
      setRecords(recordsData);
      setBudget(budgetData);
      setCategoryGoals(goalsData);
    } catch (error) {
      console.error("Failed to load finance data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitting) return; // Prevent duplicate submissions

    setSubmitting(true);

    try {
      await addFinanceRecord({
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
      });

      // Close modal and reset form
      setShowAddModal(false);
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      // Show success notification
      setSuccessMessage({ title: "Transaction Added!", subtitle: "AI context updated successfully" });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data in background
      loadData();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(record: FinanceRecord) {
    // Pre-fill form with existing data
    setFormData({
      type: record.transaction_type,
      amount: record.amount.toString(),
      category: record.category,
      description: record.description || "",
      date: new Date(record.transaction_date).toISOString().split("T")[0],
    });
    setEditingRecord(record);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!editingRecord || submitting) return;

    setSubmitting(true);

    try {
      await updateFinanceRecord(editingRecord.id, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
      });

      // Close modal and reset
      setEditingRecord(null);
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      // Show success notification
      setSuccessMessage({ title: "Transaction Updated!", subtitle: "AI context updated successfully" });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Failed to update transaction:", error);
      alert("Failed to update transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(recordId: number) {
    setDeleting(true);
    try {
      await deleteFinanceRecord(recordId);

      // Close confirmation dialog
      setDeleteConfirmId(null);

      // Show success notification
      setSuccessMessage({ title: "Transaction Deleted!", subtitle: "AI context updated successfully" });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleBudgetSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      await createBudget({
        total_budget: parseFloat(budgetFormData.amount),
        period: budgetFormData.period,
      });

      // Close modal and reset form
      setShowBudgetModal(false);
      setBudgetFormData({
        amount: "",
        period: "monthly",
      });

      // Show success notification
      setSuccessMessage({ title: "Budget Set!", subtitle: "AI context updated successfully" });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Failed to set budget:", error);
      alert("Failed to set budget. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditBudget() {
    // Pre-fill form with existing budget
    if (budget) {
      setBudgetFormData({
        amount: budget.amount.toString(),
        period: budget.period,
      });
    }
    setShowBudgetModal(true);
  }

  async function handleCategoryGoalSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      await createCategoryGoal({
        category: categoryGoalFormData.category,
        goal_amount: parseFloat(categoryGoalFormData.goal_amount),
        period: categoryGoalFormData.period,
        alert_threshold: parseFloat(categoryGoalFormData.alert_threshold) / 100,
      });

      // Close modal and reset form
      setShowCategoryGoalModal(false);
      setCategoryGoalFormData({
        category: "",
        goal_amount: "",
        period: "monthly",
        alert_threshold: "80",
      });

      // Show success notification
      setSuccessMessage({ title: "Category Goal Set!", subtitle: "Spending limit created successfully" });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Failed to set category goal:", error);
      alert("Failed to set category goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategoryGoal(goalId: number) {
    try {
      await deleteCategoryGoal(goalId);

      // Show success notification
      setSuccessMessage({ title: "Goal Deleted!", subtitle: "Category goal removed successfully" });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Failed to delete category goal:", error);
      alert("Failed to delete category goal. Please try again.");
    }
  }

  // Helper function to apply custom date range
  function applyCustomDateRange() {
    if (customStartDate && customEndDate) {
      setPeriod("custom");
      setShowDatePicker(false);
    }
  }

  // Helper function to clear custom date range
  function clearCustomDateRange() {
    setCustomStartDate("");
    setCustomEndDate("");
    setPeriod("monthly");
    setShowDatePicker(false);
  }

  // Calculate budget progress
  const budgetProgress = budget && summary
    ? (summary.total_expenses / budget.amount) * 100
    : 0;

  const budgetRemaining = budget && summary
    ? budget.amount - summary.total_expenses
    : 0;

  // Filter records based on date range and search query
  const filteredRecords = records.filter((record) => {
    // Date range filter
    if (period === "custom" && customStartDate && customEndDate) {
      const recordDate = new Date(record.transaction_date);
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      if (!(recordDate >= start && recordDate <= end)) {
        return false;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = record.description?.toLowerCase().includes(query);
      const matchesCategory = record.category.toLowerCase().includes(query);
      const matchesAmount = record.amount.toString().includes(query);

      return matchesDescription || matchesCategory || matchesAmount;
    }

    return true;
  });

  // Prepare category data for pie chart
  const categoryData = summary?.category_breakdown
    ? Object.entries(summary.category_breakdown).map(([category, amount]) => ({
        name: category,
        value: Math.abs(amount),
      }))
    : [];

  // Prepare trend data for area chart (filtered by date range)
  const trendData = filteredRecords
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

  // Chart colors - Apple-inspired vibrant colors
  const COLORS = [
    "#007AFF", // Blue
    "#5856D6", // Purple
    "#FF2D55", // Pink
    "#34C759", // Green
    "#FF9500", // Orange
    "#AF52DE", // Purple-pink
    "#FFD60A", // Yellow
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-gray-700 text-xl"
        >
          Loading your finances...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-semibold mb-2 text-gray-900">
            Finance
          </h1>
          <p className="text-gray-500">Track your spending and manage your budget</p>

          {/* Period Selector & Export Buttons */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            {/* Period Selector */}
            <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
              <button
                onClick={() => {
                  setPeriod("weekly");
                  setShowDatePicker(false);
                }}
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all ${
                  period === "weekly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => {
                  setPeriod("monthly");
                  setShowDatePicker(false);
                }}
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all ${
                  period === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${
                  period === "custom"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Custom
              </button>
            </div>

            {/* Custom Date Range Badge */}
            {period === "custom" && customStartDate && customEndDate && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                <span className="text-sm font-medium">
                  {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
                </span>
                <button
                  onClick={clearCustomDateRange}
                  className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Export Buttons */}
            <div className="flex gap-2">
              <a
                href={`http://localhost:8000/finance/export/1/pdf?period=${period}`}
                download
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition-all"
              >
                <FileText className="w-4 h-4" />
                PDF
              </a>
              <a
                href={`http://localhost:8000/finance/export/1/excel?period=${period}`}
                download
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </a>
            </div>
          </div>

          {/* Date Range Picker */}
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    From
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    To
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={applyCustomDateRange}
                    disabled={!customStartDate || !customEndDate}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-all"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Income */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">INCOME</span>
            </div>
            <h3 className="text-sm text-gray-500 mb-1">Total Income</h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${summary?.total_income.toFixed(2) || "0.00"}
            </p>
          </motion.div>

          {/* Total Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-rose-50 rounded-lg">
                <ArrowDownRight className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">EXPENSES</span>
            </div>
            <h3 className="text-sm text-gray-500 mb-1">Total Expenses</h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${summary?.total_expenses.toFixed(2) || "0.00"}
            </p>
          </motion.div>

          {/* Net Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">BALANCE</span>
            </div>
            <h3 className="text-sm text-gray-500 mb-1">Net Balance</h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${summary?.net_balance.toFixed(2) || "0.00"}
            </p>
          </motion.div>

          {/* Budget Remaining */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-gray-700" />
              </div>
              <button
                onClick={budget ? handleEditBudget : () => setShowBudgetModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                {budget ? "Edit" : "Set"}
              </button>
            </div>
            <h3 className="text-sm text-gray-500 mb-1">Budget Remaining</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {budget ? `$${budgetRemaining.toFixed(2)}` : "Not set"}
            </p>
            {budget && (
              <div className="mt-3">
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      budgetProgress > 100
                        ? "bg-rose-500"
                        : budgetProgress > 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {budgetProgress.toFixed(0)}% spent
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Spending Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Spending Trend
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2D55" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF2D55" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#34C759"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#FF2D55"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Breakdown Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <PieChart className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                By Category
              </h3>
            </div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No spending data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Category Goals Section */}
        {categoryGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Target className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Category Spending Goals
                </h3>
              </div>
              <button
                onClick={() => setShowCategoryGoalModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all"
              >
                Add Goal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryGoals.map((goal) => {
                const spent = summary?.category_breakdown[goal.category] || 0;
                const progress = (spent / goal.goal_amount) * 100;
                const isWarning = progress >= goal.alert_threshold * 100;
                const isOverBudget = progress >= 100;

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isOverBudget
                        ? "border-rose-200 bg-rose-50"
                        : isWarning
                        ? "border-amber-200 bg-amber-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{goal.category}</h4>
                        <p className="text-sm text-gray-500">{goal.period}ly limit</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategoryGoal(goal.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          ${spent.toFixed(2)} of ${goal.goal_amount.toFixed(2)}
                        </span>
                        <span
                          className={`font-semibold ${
                            isOverBudget
                              ? "text-rose-600"
                              : isWarning
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {progress.toFixed(0)}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isOverBudget
                              ? "bg-rose-500"
                              : isWarning
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      {isWarning && (
                        <div className="flex items-center gap-2 mt-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-xs text-amber-700">
                            {isOverBudget ? "Over budget!" : "Approaching limit"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Add Category Goal Button (when no goals exist) */}
        {categoryGoals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 mb-8 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Target className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Set Category Spending Goals
              </h3>
              <p className="text-gray-500 mb-4">
                Track your spending per category and get alerts when approaching limits
              </p>
              <button
                onClick={() => setShowCategoryGoalModal(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
              >
                Create Your First Goal
              </button>
            </div>
          </motion.div>
        )}

        {/* Recent Transactions - Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl shadow-gray-200/50"
        >
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>

            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-200/50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Transaction List or Empty State */}
          {filteredRecords.length > 0 ? (
            <div className="space-y-3">
              {filteredRecords.slice(0, 8).map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05, type: "spring", stiffness: 300 }}
                  className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white transition-all border border-gray-100/50 hover:shadow-md"
                >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      record.transaction_type === "income"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {record.transaction_type === "income" ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{record.category}</p>
                    <p className="text-sm text-gray-500">
                      {record.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(record.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={`text-xl font-bold ${
                      record.transaction_type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {record.transaction_type === "income" ? "+" : "-"}$
                    {record.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(record.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h4>
              <p className="text-gray-500">
                {searchQuery
                  ? `No results matching "${searchQuery}"`
                  : "No transactions to display"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Add Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-50"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add/Edit Transaction Modal */}
      {(showAddModal || editingRecord) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRecord ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <form onSubmit={editingRecord ? handleUpdate : handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "expense" })}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                    formData.type === "expense"
                      ? "bg-white text-red-600 shadow-md"
                      : "text-gray-600"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "income" })}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                    formData.type === "income"
                      ? "bg-white text-green-600 shadow-md"
                      : "text-gray-600"
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0.00"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select category</option>
                  {formData.type === "expense" ? (
                    <>
                      <option value="Food">Food</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Investment">Investment</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Add a note"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
                    setFormData({
                      type: "expense",
                      amount: "",
                      category: "",
                      description: "",
                      date: new Date().toISOString().split("T")[0],
                    });
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {submitting ? "Processing & updating AI..." : (editingRecord ? "Update Transaction" : "Add Transaction")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Transaction?</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
              >
                {deleting && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {budget ? "Edit Budget" : "Set Budget"}
            </h2>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={budgetFormData.amount}
                  onChange={(e) =>
                    setBudgetFormData({ ...budgetFormData, amount: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  placeholder="0.00"
                />
              </div>

              {/* Period Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period
                </label>
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setBudgetFormData({ ...budgetFormData, period: "weekly" })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      budgetFormData.period === "weekly"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetFormData({ ...budgetFormData, period: "monthly" })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      budgetFormData.period === "monthly"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-800">
                  Your budget will be used to track spending limits and alert you when approaching the limit.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetModal(false);
                    setBudgetFormData({
                      amount: "",
                      period: "monthly",
                    });
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-400 disabled:to-pink-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {submitting ? "Processing & updating AI..." : (budget ? "Update Budget" : "Set Budget")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Category Goal Modal */}
      {showCategoryGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Set Category Goal
            </h2>

            <form onSubmit={handleCategoryGoalSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  required
                  value={categoryGoalFormData.category}
                  onChange={(e) =>
                    setCategoryGoalFormData({ ...categoryGoalFormData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select category</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Goal Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Spending Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={categoryGoalFormData.goal_amount}
                  onChange={(e) =>
                    setCategoryGoalFormData({ ...categoryGoalFormData, goal_amount: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0.00"
                />
              </div>

              {/* Period Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period
                </label>
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setCategoryGoalFormData({ ...categoryGoalFormData, period: "weekly" })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      categoryGoalFormData.period === "weekly"
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryGoalFormData({ ...categoryGoalFormData, period: "monthly" })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      categoryGoalFormData.period === "monthly"
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Alert Threshold */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alert at {categoryGoalFormData.alert_threshold}% spent
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={categoryGoalFormData.alert_threshold}
                  onChange={(e) =>
                    setCategoryGoalFormData({ ...categoryGoalFormData, alert_threshold: e.target.value })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  You'll receive alerts when your spending in this category reaches {categoryGoalFormData.alert_threshold}% of your goal.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryGoalModal(false);
                    setCategoryGoalFormData({
                      category: "",
                      goal_amount: "",
                      period: "monthly",
                      alert_threshold: "80",
                    });
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {submitting ? "Setting Goal..." : "Set Goal"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-green-200 flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold">{successMessage.title}</p>
                <p className="text-sm text-green-50">{successMessage.subtitle}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
