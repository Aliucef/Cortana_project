"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Repeat,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Play,
  AlertCircle,
  X,
} from "lucide-react";
import { useFinance } from "../components/FinanceContext";
import {
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  processRecurringExpense,
  type RecurringExpense,
} from "@/lib/api";

export default function RecurringExpensesPage() {
  const {
    recurringExpenses,
    darkMode,
    loadData,
    setSuccessMessage,
    setShowSuccessToast,
  } = useFinance();

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
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
        frequency: expense.frequency,
        next_due_date: new Date(expense.next_due_date).toISOString().split("T")[0],
        reminder_days_before: expense.reminder_days_before.toString(),
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
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
      } else {
        await createRecurringExpense(data);
      }

      closeModal();

      setSuccessMessage({
        title: editingExpense ? "Recurring Updated!" : "Recurring Created!",
        subtitle: `${formData.name} ${editingExpense ? "updated" : "added"} successfully`,
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadData();
    } catch (error) {
      console.error("Failed to save recurring expense:", error);
      alert("Failed to save recurring expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(expenseId: number) {
    if (!confirm("Are you sure you want to delete this recurring expense?")) return;

    try {
      await deleteRecurringExpense(expenseId);

      setSuccessMessage({
        title: "Recurring Deleted",
        subtitle: "Recurring expense removed",
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadData();
    } catch (error) {
      console.error("Failed to delete recurring expense:", error);
      alert("Failed to delete recurring expense. Please try again.");
    }
  }

  async function handleProcess(expenseId: number, name: string) {
    if (!confirm(`Process "${name}" and create a transaction?`)) return;

    try {
      await processRecurringExpense(expenseId);

      setSuccessMessage({
        title: "Expense Processed!",
        subtitle: "Transaction created and next due date updated",
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadData();
    } catch (error) {
      console.error("Failed to process recurring expense:", error);
      alert("Failed to process recurring expense. Please try again.");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Recurring Expenses
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add Recurring
        </button>
      </div>

      {/* Recurring Expenses List */}
      {recurringExpenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurringExpenses.map((expense, index) => {
            const nextDueDate = new Date(expense.next_due_date);
            const today = new Date();
            const daysUntilDue = Math.ceil(
              (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            const isDueSoon = daysUntilDue <= expense.reminder_days_before && daysUntilDue >= 0;
            const isOverdue = daysUntilDue < 0;

            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-xl border-2 transition-all ${
                  darkMode
                    ? isOverdue
                      ? "border-rose-900/50 bg-rose-950/30"
                      : isDueSoon
                      ? "border-amber-900/50 bg-amber-950/30"
                      : "border-gray-700 bg-gray-800"
                    : isOverdue
                    ? "border-rose-200 bg-rose-50"
                    : isDueSoon
                    ? "border-amber-200 bg-amber-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {expense.name}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 border rounded-full font-medium ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-300"
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                      >
                        {expense.frequency}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {expense.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(expense)}
                      className={`p-1.5 rounded-lg transition-all ${
                        darkMode
                          ? "text-gray-500 hover:text-blue-400 hover:bg-blue-900/30"
                          : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        darkMode
                          ? "text-gray-500 hover:text-red-500 hover:bg-red-900/30"
                          : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      ${expense.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleProcess(expense.id, expense.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                        isOverdue || isDueSoon
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                      title="Process now and update next due date"
                    >
                      <Play className="w-3 h-3" />
                      <span>Process</span>
                    </button>
                  </div>

                  <div
                    className={`text-xs flex items-center gap-1 ${
                      isOverdue
                        ? "text-rose-600"
                        : isDueSoon
                        ? "text-amber-600"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {isOverdue
                        ? `Overdue by ${Math.abs(daysUntilDue)} day${
                            Math.abs(daysUntilDue) !== 1 ? "s" : ""
                          }`
                        : isDueSoon
                        ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`
                        : `Next: ${nextDueDate.toLocaleDateString()}`}
                    </span>
                  </div>

                  {(isOverdue || isDueSoon) && (
                    <div className="flex items-center gap-2 pt-1">
                      <AlertCircle
                        className={`w-4 h-4 ${
                          isOverdue ? "text-rose-600" : "text-amber-600"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          isOverdue
                            ? darkMode
                              ? "text-rose-400"
                              : "text-rose-700"
                            : darkMode
                            ? "text-amber-400"
                            : "text-amber-700"
                        }`}
                      >
                        {isOverdue ? "Payment overdue!" : "Due soon"}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed ${
            darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <Repeat className={`w-8 h-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <h3
            className={`text-lg font-semibold mb-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            No recurring expenses
          </h3>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Add your first recurring expense to track subscriptions and bills
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl p-8 max-w-md w-full shadow-lg my-8 max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {editingExpense ? "Edit Recurring Expense" : "Add Recurring Expense"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="e.g., Netflix Subscription"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="0.00"
                  />
                </div>

                {/* Category */}
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
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  >
                    <option value="">Select category</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Loan">Loan</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Frequency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["daily", "weekly", "monthly", "yearly"] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFormData({ ...formData, frequency: freq })}
                        className={`py-2.5 rounded-xl font-semibold transition-all ${
                          formData.frequency === freq
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                            : darkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Due Date */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.next_due_date}
                    onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                {/* Reminder Days Before */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Remind {formData.reminder_days_before} days before
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="7"
                    value={formData.reminder_days_before}
                    onChange={(e) =>
                      setFormData({ ...formData, reminder_days_before: e.target.value })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className={darkMode ? "text-gray-500" : "text-gray-400"}>Same day</span>
                    <span className={darkMode ? "text-gray-500" : "text-gray-400"}>1 week before</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving..." : editingExpense ? "Update" : "Add"}
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
