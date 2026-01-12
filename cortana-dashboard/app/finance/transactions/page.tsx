"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Edit2,
  Trash2,
  Search,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { useFinance } from "../components/FinanceContext";
import {
  addFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  type FinanceRecord,
  isAuthenticated,
} from "@/lib/api";

export default function TransactionsPage() {
  const router = useRouter();
  const {
    records,
    loadData,
    setSuccessMessage,
    setShowSuccessToast,
  } = useFinance();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

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

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Filter records by search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const query = searchQuery.toLowerCase();
    return records.filter(
      (record) =>
        record.category.toLowerCase().includes(query) ||
        (record.description && record.description.toLowerCase().includes(query)) ||
        record.amount.toString().includes(query)
    );
  }, [records, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredRecords
      .filter((r) => r.transaction_type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    const expenses = filteredRecords
      .filter((r) => r.transaction_type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [filteredRecords]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingRecord) {
        // Update existing
        await updateFinanceRecord(editingRecord.id, {
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
        });

        setSuccessMessage({
          title: "Transaction Updated",
          subtitle: "Your transaction has been updated",
        });
      } else {
        // Add new
        await addFinanceRecord({
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
        });

        setSuccessMessage({
          title: "Transaction Added",
          subtitle: "Your transaction has been recorded",
        });
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reset form
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowAddModal(false);
      setEditingRecord(null);
      loadData();
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirmId || deleting) return;

    setDeleting(true);
    try {
      await deleteFinanceRecord(deleteConfirmId);
      setDeleteConfirmId(null);

      setSuccessMessage({
        title: "Transaction Deleted",
        subtitle: "Transaction removed from your records",
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadData();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit(record: FinanceRecord) {
    setEditingRecord(record);
    setFormData({
      type: record.transaction_type as "income" | "expense",
      amount: record.amount.toString(),
      category: record.category,
      description: record.description || "",
      date: new Date(record.transaction_date).toISOString().split("T")[0],
    });
    setShowAddModal(true);
  }

  const CATEGORIES = {
    expense: ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Other"],
    income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ReceiptIcon className="w-8 h-8 text-blue-600" />
            <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Transactions
            </h1>
          </div>
          <button
            onClick={() => {
              setEditingRecord(null);
              setFormData({
                type: "expense",
                amount: "",
                category: "",
                description: "",
                date: new Date().toISOString().split("T")[0],
              });
              setShowAddModal(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              darkMode
                ? "bg-blue-900 text-blue-400 border-blue-800 hover:bg-blue-800"
                : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`border rounded-xl p-4 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${darkMode ? "bg-green-900/30" : "bg-green-50"}`}>
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
              <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                INCOME
              </span>
            </div>
            <p className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              ${totals.income.toFixed(2)}
            </p>
          </div>

          <div className={`border rounded-xl p-4 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${darkMode ? "bg-red-900/30" : "bg-red-50"}`}>
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              </div>
              <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                EXPENSES
              </span>
            </div>
            <p className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              ${totals.expenses.toFixed(2)}
            </p>
          </div>

          <div className={`border rounded-xl p-4 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                NET BALANCE
              </span>
            </div>
            <p className={`text-2xl font-semibold ${
              totals.balance >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              ${totals.balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className={`border rounded-xl p-6 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            All Transactions ({filteredRecords.length})
          </h3>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                No transactions found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700/50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
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
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {record.description || record.category}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {record.category} • {new Date(record.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(record)}
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
                        onClick={() => setDeleteConfirmId(record.id)}
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl max-w-md w-full p-6 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {editingRecord ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRecord(null);
                }}
                className={`p-2 rounded-lg ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                      formData.type === "expense"
                        ? darkMode
                          ? "bg-blue-900 text-blue-400 border-blue-800"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income", category: "" })}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                      formData.type === "income"
                        ? darkMode
                          ? "bg-blue-900 text-blue-400 border-blue-800"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount */}
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

              {/* Category */}
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
                  {CATEGORIES[formData.type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {/* Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
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
                  {submitting ? "Saving..." : editingRecord ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl max-w-sm w-full p-6 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Delete Transaction?
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
                disabled={deleting}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
