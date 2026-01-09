"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Search,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useFinance } from "../components/FinanceContext";
import {
  addFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  type FinanceRecord,
} from "@/lib/api";

export default function TransactionsPage() {
  const {
    records,
    darkMode,
    loadData,
    setSuccessMessage,
    setShowSuccessToast,
    transactionCurrencies,
    setTransactionCurrencies,
    receiptImages,
    setReceiptImages,
    convertToUSD,
    getCurrencySymbol,
  } = useFinance();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [currentReceipt, setCurrentReceipt] = useState<string | null>(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [viewingReceiptId, setViewingReceiptId] = useState<number | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const amountInUSD =
        selectedCurrency === "USD"
          ? parseFloat(formData.amount)
          : convertToUSD(parseFloat(formData.amount), selectedCurrency);

      const newRecord = await addFinanceRecord({
        type: formData.type,
        amount: amountInUSD,
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
      });

      // Save currency info if not USD
      if (selectedCurrency !== "USD" && newRecord.id) {
        const newCurrencies = {
          ...transactionCurrencies,
          [newRecord.id]: {
            currency: selectedCurrency,
            originalAmount: parseFloat(formData.amount),
          },
        };
        setTransactionCurrencies(newCurrencies);
        localStorage.setItem("transactionCurrencies", JSON.stringify(newCurrencies));
      }

      // Save receipt if one was uploaded
      if (currentReceipt && newRecord.id) {
        const newReceipts = { ...receiptImages, [newRecord.id]: currentReceipt };
        setReceiptImages(newReceipts);
        localStorage.setItem("receiptImages", JSON.stringify(newReceipts));
      }

      // Close modal and reset form
      setShowAddModal(false);
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setCurrentReceipt(null);
      setSelectedCurrency("USD");

      // Show success notification
      setSuccessMessage({
        title: "Transaction Added!",
        subtitle: currentReceipt
          ? "Transaction and receipt saved"
          : "AI context updated successfully",
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

      setEditingRecord(null);
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      setSuccessMessage({
        title: "Transaction Updated!",
        subtitle: "Changes saved successfully",
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadData();
    } catch (error) {
      console.error("Failed to update transaction:", error);
      alert("Failed to update transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirmId || deleting) return;

    setDeleting(true);
    try {
      await deleteFinanceRecord(deleteConfirmId);

      // Remove receipt if exists
      if (receiptImages[deleteConfirmId]) {
        const newReceipts = { ...receiptImages };
        delete newReceipts[deleteConfirmId];
        setReceiptImages(newReceipts);
        localStorage.setItem("receiptImages", JSON.stringify(newReceipts));
      }

      // Remove currency info if exists
      if (transactionCurrencies[deleteConfirmId]) {
        const newCurrencies = { ...transactionCurrencies };
        delete newCurrencies[deleteConfirmId];
        setTransactionCurrencies(newCurrencies);
        localStorage.setItem("transactionCurrencies", JSON.stringify(newCurrencies));
      }

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
  }

  function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>, recordId?: number) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (recordId) {
        // Attaching to existing transaction
        const newReceipts = { ...receiptImages, [recordId]: base64 };
        setReceiptImages(newReceipts);
        localStorage.setItem("receiptImages", JSON.stringify(newReceipts));
      } else {
        // For new transaction
        setCurrentReceipt(base64);
      }
    };
    reader.readAsDataURL(file);
  }

  function viewReceipt(recordId: number) {
    setViewingReceiptId(recordId);
    setShowReceiptViewer(true);
  }

  function deleteReceipt(recordId: number) {
    const newReceipts = { ...receiptImages };
    delete newReceipts[recordId];
    setReceiptImages(newReceipts);
    localStorage.setItem("receiptImages", JSON.stringify(newReceipts));
    setShowReceiptViewer(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Transactions
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-11 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {filteredRecords.length > 0 ? (
        <>
          <div className="space-y-3">
            {filteredRecords
              .slice(0, showAllTransactions ? filteredRecords.length : 10)
              .map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className={`flex items-center justify-between p-5 rounded-xl transition-all duration-200 border cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        record.transaction_type === "income"
                          ? darkMode
                            ? "bg-green-900/30"
                            : "bg-green-100"
                          : darkMode
                          ? "bg-red-900/30"
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
                      <p
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {record.category}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {record.description || "No description"}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {new Date(record.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {transactionCurrencies[record.id] ? (
                        <>
                          <p
                            className={`text-xl font-bold ${
                              record.transaction_type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {record.transaction_type === "income" ? "+" : "-"}
                            {getCurrencySymbol(transactionCurrencies[record.id].currency)}
                            {transactionCurrencies[record.id].originalAmount.toFixed(2)}
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            ≈ ${record.amount.toFixed(2)} USD
                          </p>
                        </>
                      ) : (
                        <p
                          className={`text-xl font-bold ${
                            record.transaction_type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {record.transaction_type === "income" ? "+" : "-"}$
                          {record.amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    {receiptImages[record.id] ? (
                      <button
                        onClick={() => viewReceipt(record.id)}
                        className={`p-2 rounded-lg transition-all ${
                          darkMode
                            ? "text-gray-500 hover:text-purple-400 hover:bg-purple-900/30"
                            : "text-gray-400 hover:text-purple-500 hover:bg-purple-50"
                        }`}
                        title="View receipt"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <label
                        htmlFor={`receipt-${record.id}`}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          darkMode
                            ? "text-gray-500 hover:text-purple-400 hover:bg-purple-900/30"
                            : "text-gray-400 hover:text-purple-500 hover:bg-purple-50"
                        }`}
                        title="Attach receipt"
                      >
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          id={`receipt-${record.id}`}
                          accept="image/*"
                          onChange={(e) => handleReceiptUpload(e, record.id)}
                          className="hidden"
                        />
                      </label>
                    )}
                    <button
                      onClick={() => handleEdit(record)}
                      className={`p-2 rounded-lg transition-all ${
                        darkMode
                          ? "text-gray-500 hover:text-blue-400 hover:bg-blue-900/30"
                          : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(record.id)}
                      className={`p-2 rounded-lg transition-all ${
                        darkMode
                          ? "text-gray-500 hover:text-red-500 hover:bg-red-900/30"
                          : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Show More/Less Button */}
          {filteredRecords.length > 10 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className={`flex items-center gap-2 mx-auto px-6 py-2.5 font-medium text-sm rounded-lg transition-all ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {showAllTransactions ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show All ({filteredRecords.length}) <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
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
            <Search className={`w-8 h-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
            No transactions found
          </h3>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {searchQuery ? "Try a different search term" : "Add your first transaction to get started"}
          </p>
        </div>
      )}

      {/* Add/Edit Transaction Modal */}
      <AnimatePresence>
        {(showAddModal || editingRecord) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl p-8 max-w-md w-full shadow-lg my-8 max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {editingRecord ? "Edit Transaction" : "Add Transaction"}
              </h2>

              <form onSubmit={editingRecord ? handleUpdate : handleSubmit} className="space-y-4">
                {/* Type Toggle */}
                <div className={`flex gap-2 p-1.5 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense" })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      formData.type === "expense"
                        ? darkMode
                          ? "bg-gray-800 text-red-500 shadow-md"
                          : "bg-white text-red-600 shadow-md"
                        : darkMode
                        ? "text-gray-400"
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
                        ? darkMode
                          ? "bg-gray-800 text-green-500 shadow-md"
                          : "bg-white text-green-600 shadow-md"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Amount
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                      placeholder="0.00"
                    />
                    {!editingRecord && (
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className={`w-28 px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      >
                        <option value="USD">USD $</option>
                        <option value="EUR">EUR €</option>
                        <option value="GBP">GBP £</option>
                        <option value="LBP">LBP LL</option>
                        <option value="AED">AED</option>
                        <option value="SAR">SAR</option>
                      </select>
                    )}
                  </div>
                  {!editingRecord && selectedCurrency !== "USD" && formData.amount && (
                    <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      ≈ ${convertToUSD(parseFloat(formData.amount) || 0, selectedCurrency).toFixed(2)} USD
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="Add a note"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                {/* Receipt Upload */}
                {!editingRecord && (
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Attach Receipt (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleReceiptUpload(e)}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                          darkMode
                            ? "border-gray-600 hover:border-blue-500 hover:bg-blue-900/30 text-gray-400 hover:text-blue-400"
                            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                        }`}
                      >
                        <Upload className="w-5 h-5" />
                        <span className="font-medium">
                          {currentReceipt ? "Change Receipt" : "Upload Receipt"}
                        </span>
                      </label>
                    </div>
                    {currentReceipt && (
                      <div className="mt-3 relative">
                        <img
                          src={currentReceipt}
                          alt="Receipt preview"
                          className={`w-full h-32 object-cover rounded-xl border ${
                            darkMode ? "border-gray-700" : "border-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentReceipt(null)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

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
                      setCurrentReceipt(null);
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
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving..." : editingRecord ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl p-6 max-w-sm w-full shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Delete Transaction?
              </h3>
              <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                This action cannot be undone. The transaction will be permanently removed from your
                records.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className={`flex-1 px-4 py-2 font-semibold rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Viewer */}
      <AnimatePresence>
        {showReceiptViewer && viewingReceiptId && receiptImages[viewingReceiptId] && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReceiptViewer(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={receiptImages[viewingReceiptId]}
                  alt="Receipt"
                  className="w-full max-h-[80vh] object-contain rounded-xl"
                />
                <button
                  onClick={() => setShowReceiptViewer(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={() => deleteReceipt(viewingReceiptId)}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-semibold"
                >
                  Delete Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
