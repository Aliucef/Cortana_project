"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useFinance } from "../components/FinanceContext";
import {
  setBudget,
  addCategoryGoal,
  updateCategoryGoal,
  deleteCategoryGoal,
  type CategoryGoal,
} from "@/lib/api";

export default function BudgetGoalsPage() {
  const {
    budget,
    categoryGoals,
    summary,
    loadData,
    setSuccessMessage,
    setShowSuccessToast,
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

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<CategoryGoal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [budgetForm, setBudgetForm] = useState({
    amount: budget?.amount.toString() || "",
    period: (budget?.period as "weekly" | "monthly") || "monthly",
  });

  const [goalForm, setGoalForm] = useState({
    category: "",
    amount: "",
  });

  // Calculate budget progress
  const budgetProgress = useMemo(() => {
    if (!budget || !summary) return { percentage: 0, remaining: 0, spent: 0 };
    const spent = Math.abs(summary.total_expenses);
    const percentage = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;
    return { percentage, remaining, spent };
  }, [budget, summary]);

  // Calculate category goal progress
  const goalProgress = useMemo(() => {
    return categoryGoals?.map((goal) => {
      const spent = Math.abs(
        (summary?.category_breakdown?.[goal.category] as number) || 0
      );
      const percentage = (spent / goal.goal_amount) * 100;
      const remaining = goal.goal_amount - spent;
      return {
        ...goal,
        spent,
        percentage,
        remaining,
        status:
          percentage >= 100
            ? "exceeded"
            : percentage >= 80
            ? "warning"
            : "good",
      };
    }) || [];
  }, [categoryGoals, summary]);

  async function handleBudgetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await setBudget({
        amount: parseFloat(budgetForm.amount),
        period: budgetForm.period,
      });

      setSuccessMessage({
        title: "Budget Updated",
        subtitle: `Your ${budgetForm.period} budget has been set`,
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setShowBudgetModal(false);
      loadData();
    } catch (error) {
      console.error("Failed to set budget:", error);
      alert("Failed to set budget. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingGoal) {
        await updateCategoryGoal(editingGoal.id, {
          category: goalForm.category,
          goal_amount: parseFloat(goalForm.amount),
        });
        setSuccessMessage({
          title: "Goal Updated",
          subtitle: "Category goal has been updated",
        });
      } else {
        await addCategoryGoal({
          category: goalForm.category,
          goal_amount: parseFloat(goalForm.amount),
        });
        setSuccessMessage({
          title: "Goal Added",
          subtitle: "New category goal has been created",
        });
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setGoalForm({ category: "", amount: "" });
      setShowGoalModal(false);
      setEditingGoal(null);
      loadData();
    } catch (error) {
      console.error("Failed to save goal:", error);
      alert("Failed to save goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteGoal() {
    if (!deleteConfirmId || submitting) return;

    setSubmitting(true);
    try {
      await deleteCategoryGoal(deleteConfirmId);

      setSuccessMessage({
        title: "Goal Deleted",
        subtitle: "Category goal has been removed",
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setDeleteConfirmId(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete goal:", error);
      alert("Failed to delete goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const CATEGORIES = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Healthcare",
    "Other",
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 pt-24 px-6 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Budget & Goals
          </h1>
        </div>

        {/* Overall Budget Section */}
        <div className={`border rounded-xl p-6 mb-6 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Overall Budget
            </h2>
            <button
              onClick={() => {
                setBudgetForm({
                  amount: budget?.amount.toString() || "",
                  period: (budget?.period as "weekly" | "monthly") || "monthly",
                });
                setShowBudgetModal(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                darkMode
                  ? "bg-blue-900 text-blue-400 border-blue-800 hover:bg-blue-800"
                  : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              }`}
            >
              {budget ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {budget ? "Edit Budget" : "Set Budget"}
            </button>
          </div>

          {budget ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Budget Amount
                  </p>
                  <p className={`text-2xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    ${budget.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {budget.period}
                  </p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Spent
                  </p>
                  <p className="text-2xl font-semibold text-red-600">
                    ${budgetProgress.spent.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Remaining
                  </p>
                  <p className={`text-2xl font-semibold ${
                    budgetProgress.remaining >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    ${budgetProgress.remaining.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className={`w-full h-4 rounded-full overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetProgress.percentage >= 100
                        ? "bg-red-600"
                        : budgetProgress.percentage >= 80
                        ? "bg-yellow-600"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(budgetProgress.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <p className={`text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {budgetProgress.percentage.toFixed(1)}% used
              </p>

              {/* Alert */}
              {budgetProgress.percentage >= 80 && (
                <div className={`mt-4 p-3 rounded-lg border flex items-start gap-2 ${
                  budgetProgress.percentage >= 100
                    ? darkMode
                      ? "bg-red-900/20 border-red-800"
                      : "bg-red-50 border-red-200"
                    : darkMode
                    ? "bg-yellow-900/20 border-yellow-800"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    budgetProgress.percentage >= 100 ? "text-red-600" : "text-yellow-600"
                  }`} />
                  <div>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {budgetProgress.percentage >= 100
                        ? "Budget Exceeded!"
                        : "Budget Warning"}
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {budgetProgress.percentage >= 100
                        ? `You've exceeded your budget by $${Math.abs(budgetProgress.remaining).toFixed(2)}`
                        : `You've used ${budgetProgress.percentage.toFixed(0)}% of your budget`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                No budget set. Click the button above to set your budget.
              </p>
            </div>
          )}
        </div>

        {/* Category Goals Section */}
        <div className={`border rounded-xl p-6 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Category Goals
            </h2>
            <button
              onClick={() => {
                setEditingGoal(null);
                setGoalForm({ category: "", amount: "" });
                setShowGoalModal(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                darkMode
                  ? "bg-blue-900 text-blue-400 border-blue-800 hover:bg-blue-800"
                  : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>

          {goalProgress.length === 0 ? (
            <div className="text-center py-8">
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                No category goals set. Click the button above to add a goal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goalProgress.map((goal) => (
                <div
                  key={goal.id}
                  className={`border rounded-lg p-4 ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        goal.status === "exceeded"
                          ? darkMode ? "bg-red-900/30" : "bg-red-50"
                          : goal.status === "warning"
                          ? darkMode ? "bg-yellow-900/30" : "bg-yellow-50"
                          : darkMode ? "bg-green-900/30" : "bg-green-50"
                      }`}>
                        {goal.status === "good" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className={`w-4 h-4 ${
                            goal.status === "exceeded" ? "text-red-600" : "text-yellow-600"
                          }`} />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {goal.category}
                        </h3>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          ${goal.spent.toFixed(2)} of ${goal.goal_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setGoalForm({
                            category: goal.category,
                            amount: goal.goal_amount.toString(),
                          });
                          setShowGoalModal(true);
                        }}
                        className={`p-2 rounded-lg transition-all ${
                          darkMode
                            ? "hover:bg-gray-600 text-gray-400"
                            : "hover:bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(goal.id)}
                        className={`p-2 rounded-lg transition-all ${
                          darkMode
                            ? "hover:bg-gray-600 text-gray-400"
                            : "hover:bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.status === "exceeded"
                          ? "bg-red-600"
                          : goal.status === "warning"
                          ? "bg-yellow-600"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 text-right ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {goal.percentage.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-md w-full p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Set Budget
              </h2>
              <button
                onClick={() => setShowBudgetModal(false)}
                className={`p-2 rounded-lg ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetForm.amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Period
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBudgetForm({ ...budgetForm, period: "weekly" })}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                      budgetForm.period === "weekly"
                        ? darkMode
                          ? "bg-blue-900 text-blue-400 border-blue-800"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetForm({ ...budgetForm, period: "monthly" })}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                      budgetForm.period === "monthly"
                        ? darkMode
                          ? "bg-blue-900 text-blue-400 border-blue-800"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                    darkMode
                      ? "bg-blue-900 text-blue-400 border-blue-800 hover:bg-blue-800"
                      : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                  } disabled:opacity-50`}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-md w-full p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {editingGoal ? "Edit Goal" : "Add Goal"}
              </h2>
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  setEditingGoal(null);
                }}
                className={`p-2 rounded-lg ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Category
                </label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                  disabled={!!editingGoal}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Goal Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={goalForm.amount}
                  onChange={(e) => setGoalForm({ ...goalForm, amount: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGoalModal(false);
                    setEditingGoal(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                    darkMode
                      ? "bg-blue-900 text-blue-400 border-blue-800 hover:bg-blue-800"
                      : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                  } disabled:opacity-50`}
                >
                  {submitting ? "Saving..." : editingGoal ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-sm w-full p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Delete Goal?
            </h2>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                disabled={submitting}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
