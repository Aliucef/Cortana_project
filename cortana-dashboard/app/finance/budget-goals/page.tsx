"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  PiggyBank,
  Wallet,
  Plus,
  X,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { useFinance } from "../components/FinanceContext";
import {
  createBudget,
  createCategoryGoal,
  deleteCategoryGoal,
  type Budget,
} from "@/lib/api";

export default function BudgetGoalsPage() {
  const {
    budget,
    categoryGoals,
    summary,
    darkMode,
    loadData,
    setSuccessMessage,
    setShowSuccessToast,
  } = useFinance();

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetFormData, setBudgetFormData] = useState({
    amount: budget?.amount.toString() || "",
    period: (budget?.period as "weekly" | "monthly") || ("monthly" as "weekly" | "monthly"),
  });

  // Category goal modal state
  const [showCategoryGoalModal, setShowCategoryGoalModal] = useState(false);
  const [categoryGoalFormData, setCategoryGoalFormData] = useState({
    category: "",
    goal_amount: "",
    period: "monthly" as "weekly" | "monthly",
    alert_threshold: "0.8",
  });

  // Savings goals state (local only - not backend)
  const [savingsGoals, setSavingsGoals] = useState<
    Array<{
      id: number;
      name: string;
      targetAmount: number;
      currentAmount: number;
      deadline: string;
    }>
  >([]);
  const [showSavingsGoalModal, setShowSavingsGoalModal] = useState(false);
  const [editingSavingsGoal, setEditingSavingsGoal] = useState<number | null>(null);
  const [savingsGoalFormData, setSavingsGoalFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  const [submitting, setSubmitting] = useState(false);

  async function handleBudgetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await createBudget({
        total_budget: parseFloat(budgetFormData.amount),
        period: budgetFormData.period,
      });

      setShowBudgetModal(false);
      setBudgetFormData({ amount: "", period: "monthly" });

      setSuccessMessage({
        title: "Budget Updated!",
        subtitle: `${budgetFormData.period} budget set to $${budgetFormData.amount}`,
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadData();
    } catch (error) {
      console.error("Failed to set budget:", error);
      alert("Failed to set budget. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
        alert_threshold: parseFloat(categoryGoalFormData.alert_threshold),
      });

      setShowCategoryGoalModal(false);
      setCategoryGoalFormData({
        category: "",
        goal_amount: "",
        period: "monthly",
        alert_threshold: "0.8",
      });

      setSuccessMessage({
        title: "Goal Created!",
        subtitle: `${categoryGoalFormData.category} spending goal added`,
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadData();
    } catch (error) {
      console.error("Failed to create category goal:", error);
      alert("Failed to create goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategoryGoal(goalId: number) {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      await deleteCategoryGoal(goalId);

      setSuccessMessage({
        title: "Goal Deleted",
        subtitle: "Spending goal removed",
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadData();
    } catch (error) {
      console.error("Failed to delete goal:", error);
      alert("Failed to delete goal. Please try again.");
    }
  }

  function handleSavingsGoalSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newGoal = {
      id: editingSavingsGoal || Date.now(),
      name: savingsGoalFormData.name,
      targetAmount: parseFloat(savingsGoalFormData.targetAmount),
      currentAmount: parseFloat(savingsGoalFormData.currentAmount),
      deadline: savingsGoalFormData.deadline,
    };

    if (editingSavingsGoal) {
      setSavingsGoals(savingsGoals.map((g) => (g.id === editingSavingsGoal ? newGoal : g)));
    } else {
      setSavingsGoals([...savingsGoals, newGoal]);
    }

    setShowSavingsGoalModal(false);
    setEditingSavingsGoal(null);
    setSavingsGoalFormData({ name: "", targetAmount: "", currentAmount: "", deadline: "" });

    setSuccessMessage({
      title: editingSavingsGoal ? "Goal Updated!" : "Goal Created!",
      subtitle: `Savings goal ${editingSavingsGoal ? "updated" : "added"} successfully`,
    });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }

  function openSavingsGoalModal(goal?: any) {
    if (goal) {
      setEditingSavingsGoal(goal.id);
      setSavingsGoalFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline,
      });
    }
    setShowSavingsGoalModal(true);
  }

  function handleDeleteSavingsGoal(goalId: number) {
    if (!confirm("Are you sure you want to delete this savings goal?")) return;
    setSavingsGoals(savingsGoals.filter((g) => g.id !== goalId));

    setSuccessMessage({
      title: "Goal Deleted",
      subtitle: "Savings goal removed",
    });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }

  function updateSavingsGoalAmount(goalId: number, newAmount: number) {
    setSavingsGoals(savingsGoals.map((g) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g)));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Budget & Goals
        </h1>
      </div>

      {/* Overall Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-xl p-6 mb-8 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <Wallet className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Overall Budget
            </h3>
          </div>
          <button
            onClick={() => {
              setBudgetFormData({
                amount: budget?.amount.toString() || "",
                period: budget?.period as "weekly" | "monthly" || "monthly",
              });
              setShowBudgetModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all"
          >
            {budget ? "Edit Budget" : "Set Budget"}
          </button>
        </div>

        {budget ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Period</p>
                <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Budget</p>
                <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  ${budget.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Spent</p>
                <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  ${summary?.total_expenses.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Remaining</p>
                <p
                  className={`text-lg font-semibold ${
                    (budget.amount - (summary?.total_expenses || 0)) >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  ${(budget.amount - (summary?.total_expenses || 0)).toFixed(2)}
                </p>
              </div>
            </div>

            {summary && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                    {((summary.total_expenses / budget.amount) * 100).toFixed(0)}% used
                  </span>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                    ${budget.amount.toFixed(2)}
                  </span>
                </div>
                <div
                  className={`h-3 rounded-full overflow-hidden ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-full transition-all duration-500 ${
                      (summary.total_expenses / budget.amount) * 100 >= 100
                        ? "bg-rose-500"
                        : (summary.total_expenses / budget.amount) * 100 >= 90
                        ? "bg-yellow-500"
                        : (summary.total_expenses / budget.amount) * 100 >= 75
                        ? "bg-yellow-400"
                        : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min((summary.total_expenses / budget.amount) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Wallet
              className={`w-12 h-12 mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-300"}`}
            />
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              No budget set. Click "Set Budget" to get started!
            </p>
          </div>
        )}
      </motion.div>

      {/* Category Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`border rounded-xl p-6 mb-8 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <Target className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
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

        {categoryGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryGoals.map((goal) => {
              const spent = Math.abs(summary?.category_breakdown[goal.category] || 0);
              const progress = (spent / goal.goal_amount) * 100;
              const isWarning = progress >= goal.alert_threshold * 100;
              const isOverBudget = progress >= 100;

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    darkMode
                      ? isOverBudget
                        ? "border-rose-900/50 bg-rose-950/30"
                        : isWarning
                        ? "border-amber-900/50 bg-amber-950/30"
                        : "border-gray-700 bg-gray-800"
                      : isOverBudget
                      ? "border-rose-200 bg-rose-50"
                      : isWarning
                      ? "border-amber-200 bg-amber-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {goal.category}
                      </h4>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {goal.period}ly limit
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategoryGoal(goal.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        darkMode
                          ? "text-gray-500 hover:text-red-500 hover:bg-red-900/30"
                          : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
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

                    <div
                      className={`w-full rounded-full h-2 overflow-hidden ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
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
                        <span
                          className={`text-xs ${
                            darkMode ? "text-amber-400" : "text-amber-700"
                          }`}
                        >
                          {isOverBudget ? "Over budget!" : "Approaching limit"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Target
              className={`w-12 h-12 mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-300"}`}
            />
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              No category goals yet. Create one to track spending limits!
            </p>
          </div>
        )}
      </motion.div>

      {/* Savings Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`border rounded-xl p-6 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <PiggyBank className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Savings Goals
            </h3>
          </div>
          <button
            onClick={() => openSavingsGoalModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all"
          >
            Add Goal
          </button>
        </div>

        {savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = goal.deadline
                ? Math.ceil(
                    (new Date(goal.deadline).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    darkMode
                      ? "border-gray-700 hover:border-gray-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {goal.name}
                      </h4>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openSavingsGoalModal(goal)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                      >
                        <Pencil
                          className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteSavingsGoal(goal.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-red-900/30" : "hover:bg-red-100"
                        }`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div
                      className={`w-full rounded-full h-3 overflow-hidden ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress >= 100
                            ? "bg-green-500"
                            : progress >= 75
                            ? "bg-blue-500"
                            : progress >= 50
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {progress.toFixed(0)}% Complete
                      </span>
                      {daysLeft !== null && (
                        <span
                          className={`text-xs ${
                            daysLeft < 0
                              ? "text-red-600"
                              : daysLeft < 30
                              ? "text-yellow-600"
                              : darkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {daysLeft < 0
                            ? `${Math.abs(daysLeft)} days overdue`
                            : `${daysLeft} days left`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick add amount */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateSavingsGoalAmount(goal.id, goal.currentAmount + 10)}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      +$10
                    </button>
                    <button
                      onClick={() => updateSavingsGoalAmount(goal.id, goal.currentAmount + 50)}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      +$50
                    </button>
                    <button
                      onClick={() => updateSavingsGoalAmount(goal.id, goal.currentAmount + 100)}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      +$100
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <PiggyBank
              className={`w-12 h-12 mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-300"}`}
            />
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              No savings goals yet. Create one to start tracking your progress!
            </p>
          </div>
        )}
      </motion.div>

      {/* Budget Modal */}
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl p-8 max-w-md w-full shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {budget ? "Edit Budget" : "Set Budget"}
              </h2>

              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Budget Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={budgetFormData.amount}
                    onChange={(e) => setBudgetFormData({ ...budgetFormData, amount: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Period
                  </label>
                  <div className={`flex gap-2 p-1.5 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <button
                      type="button"
                      onClick={() => setBudgetFormData({ ...budgetFormData, period: "weekly" })}
                      className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                        budgetFormData.period === "weekly"
                          ? darkMode
                            ? "bg-gray-800 text-blue-400 shadow-md"
                            : "bg-white text-blue-600 shadow-md"
                          : darkMode
                          ? "text-gray-400"
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
                          ? darkMode
                            ? "bg-gray-800 text-blue-400 shadow-md"
                            : "bg-white text-blue-600 shadow-md"
                          : darkMode
                          ? "text-gray-400"
                          : "text-gray-600"
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
                    className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Goal Modal */}
      <AnimatePresence>
        {showCategoryGoalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl p-8 max-w-md w-full shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Add Category Goal
              </h2>

              <form onSubmit={handleCategoryGoalSubmit} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Category
                  </label>
                  <select
                    required
                    value={categoryGoalFormData.category}
                    onChange={(e) =>
                      setCategoryGoalFormData({ ...categoryGoalFormData, category: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
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

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Goal Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={categoryGoalFormData.goal_amount}
                    onChange={(e) =>
                      setCategoryGoalFormData({ ...categoryGoalFormData, goal_amount: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Period
                  </label>
                  <div className={`flex gap-2 p-1.5 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <button
                      type="button"
                      onClick={() => setCategoryGoalFormData({ ...categoryGoalFormData, period: "weekly" })}
                      className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                        categoryGoalFormData.period === "weekly"
                          ? darkMode
                            ? "bg-gray-800 text-blue-400 shadow-md"
                            : "bg-white text-blue-600 shadow-md"
                          : darkMode
                          ? "text-gray-400"
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
                          ? darkMode
                            ? "bg-gray-800 text-blue-400 shadow-md"
                            : "bg-white text-blue-600 shadow-md"
                          : darkMode
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Alert Threshold: {(parseFloat(categoryGoalFormData.alert_threshold) * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={categoryGoalFormData.alert_threshold}
                    onChange={(e) =>
                      setCategoryGoalFormData({ ...categoryGoalFormData, alert_threshold: e.target.value })
                    }
                    className="w-full"
                  />
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Get notified when you reach this percentage of your goal
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryGoalModal(false)}
                    className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Savings Goal Modal */}
      <AnimatePresence>
        {showSavingsGoalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl p-8 max-w-md w-full shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {editingSavingsGoal ? "Edit Savings Goal" : "Add Savings Goal"}
              </h2>

              <form onSubmit={handleSavingsGoalSubmit} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Goal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={savingsGoalFormData.name}
                    onChange={(e) => setSavingsGoalFormData({ ...savingsGoalFormData, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="e.g., Emergency Fund, Vacation"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Target Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={savingsGoalFormData.targetAmount}
                    onChange={(e) =>
                      setSavingsGoalFormData({ ...savingsGoalFormData, targetAmount: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Current Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={savingsGoalFormData.currentAmount}
                    onChange={(e) =>
                      setSavingsGoalFormData({ ...savingsGoalFormData, currentAmount: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={savingsGoalFormData.deadline}
                    onChange={(e) =>
                      setSavingsGoalFormData({ ...savingsGoalFormData, deadline: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSavingsGoalModal(false);
                      setEditingSavingsGoal(null);
                      setSavingsGoalFormData({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
                    }}
                    className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    {editingSavingsGoal ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
