"use client";

import { useState, useEffect } from "react";
import {
  Repeat,
  Plus,
  Edit2,
  Trash2,
  Clock,
  X,
  Calendar,
} from "lucide-react";
import { useFinance } from "../components/FinanceContext";
import {
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  type RecurringExpense,
} from "@/lib/api";

export default function RecurringExpensesPage() {
  const {
    recurringExpenses,
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

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    next_due_date: new Date().toISOString().split("T")[0],
    reminder_days_before: "3",
  });

  function openModal(expense?: RecurringExpense) {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        name: expense.name,
        amount: expense.amount.toString(),
        category: expense.category,
        frequency: expense.frequency as "daily" | "weekly" | "monthly" | "yearly",
        next_due_date: new Date(expense.next_due_date).toISOString().split("T")[0],
        reminder_days_before: expense.reminder_days_before?.toString() || "3",
      });
    } else {
      setEditingExpense(null);
      setFormData({
        name: "",
        amount: "",
        category: "",
        frequency: "monthly",
        next_due_date: new Date().toISOString().split("T")[0],
        reminder_days_before: "3",
      });
    }
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const data = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        frequency: formData.frequency,
        next_due_date: new Date(formData.next_due_date).toISOString(),
        reminder_days_before: parseInt(formData.reminder_days_before),
      };

      if (editingExpense) {
        await updateRecurringExpense(editingExpense.id, data);
        setSuccessMessage({
          title: "Recurring Expense Updated",
          subtitle: "Changes have been saved",
        });
      } else {
        await createRecurringExpense(data);
        setSuccessMessage({
          title: "Recurring Expense Added",
          subtitle: "New recurring expense has been created",
        });
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setShowModal(false);
      setEditingExpense(null);
      loadData();
    } catch (error) {
      console.error("Failed to save recurring expense:", error);
      alert("Failed to save recurring expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirmId || submitting) return;

    setSubmitting(true);
    try {
      await deleteRecurringExpense(deleteConfirmId);

      setSuccessMessage({
        title: "Recurring Expense Deleted",
        subtitle: "Recurring expense has been removed",
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setDeleteConfirmId(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete recurring expense:", error);
      alert("Failed to delete recurring expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const CATEGORIES = [
    "Subscriptions",
    "Bills",
    "Rent",
    "Insurance",
    "Loans",
    "Other",
  ];

  const totalMonthly = recurringExpenses
    ?.filter((e) => e.frequency === "monthly")
    .reduce((sum, e) => sum + e.amount, 0) || 0;

  return (
    <div className={`min-h-screen transition-colors duration-200 pt-24 px-6 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Repeat className="w-8 h-8 text-blue-600" />
            <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Recurring Expenses
            </h1>
          </div>
          <button
            onClick={() => openModal()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              darkMode
                ? "bg-blue-900 text-blue-400 border-blue-800 hover:bg-blue-800"
                : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Recurring Expense
          </button>
        </div>

        {/* Summary Card */}
        <div className={`border rounded-xl p-6 mb-6 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Total Monthly Recurring
              </p>
              <p className={`text-3xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                ${totalMonthly.toFixed(2)}
              </p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Active Subscriptions
              </p>
              <p className={`text-3xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                {recurringExpenses?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Recurring Expenses List */}
        <div className={`border rounded-xl p-6 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            All Recurring Expenses
          </h2>

          {!recurringExpenses || recurringExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                No recurring expenses found. Click the button above to add one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringExpenses.map((expense) => {
                const daysUntil = getDaysUntilDue(expense.next_due_date);
                const isDueSoon = daysUntil <= 7 && daysUntil >= 0;
                const isOverdue = daysUntil < 0;

                return (
                  <div
                    key={expense.id}
                    className={`border rounded-lg p-4 ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2.5 rounded-lg ${
                          darkMode ? "bg-purple-900/30" : "bg-purple-50"
                        }`}>
                          <Repeat className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}>
                            {expense.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <p className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              {expense.category}
                            </p>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className={`text-xs ${
                                darkMode ? "text-gray-500" : "text-gray-400"
                              }`}>
                                {expense.frequency}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className={`text-xs ${
                                isOverdue
                                  ? "text-red-600"
                                  : isDueSoon
                                  ? "text-yellow-600"
                                  : darkMode
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}>
                                {isOverdue
                                  ? `Overdue by ${Math.abs(daysUntil)} days`
                                  : isDueSoon
                                  ? `Due in ${daysUntil} days`
                                  : `Next: ${new Date(expense.next_due_date).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-xl font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}>
                            ${expense.amount.toFixed(2)}
                          </p>
                          <p className={`text-xs ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}>
                            per {expense.frequency === "monthly" ? "month" : expense.frequency === "weekly" ? "week" : expense.frequency === "yearly" ? "year" : "day"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openModal(expense)}
                            className={`p-2 rounded-lg transition-all ${
                              darkMode
                                ? "hover:bg-gray-600 text-gray-400"
                                : "hover:bg-gray-100 text-gray-500"
                            }`}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(expense.id)}
                            className={`p-2 rounded-lg transition-all ${
                              darkMode
                                ? "hover:bg-gray-600 text-gray-400"
                                : "hover:bg-gray-100 text-gray-500"
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-md w-full p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {editingExpense ? "Edit Recurring Expense" : "Add Recurring Expense"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingExpense(null);
                }}
                className={`p-2 rounded-lg ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="e.g., Netflix"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
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
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={formData.next_due_date}
                  onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
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
                    setShowModal(false);
                    setEditingExpense(null);
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
                  {submitting ? "Saving..." : editingExpense ? "Update" : "Add"}
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
              Delete Recurring Expense?
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
                onClick={handleDelete}
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
