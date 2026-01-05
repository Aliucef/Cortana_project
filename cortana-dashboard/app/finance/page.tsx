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
  Repeat,
  Clock,
  Play,
  Bell,
  AlertTriangle,
  Pencil,
  PiggyBank,
  SplitSquareVertical,
  Upload,
  Image,
  Eye,
  Coins,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
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
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  processRecurringExpense,
  type FinanceSummary,
  type FinanceRecord,
  type Budget,
  type CategoryGoal,
  type RecurringExpense,
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
  const [showSavingsGoalModal, setShowSavingsGoalModal] = useState(false);

  // Savings goals state
  const [savingsGoals, setSavingsGoals] = useState<Array<{
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }>>([]);
  const [editingSavingsGoal, setEditingSavingsGoal] = useState<number | null>(null);

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

  // Recurring expense state
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringExpense | null>(null);
  const [recurringFormData, setRecurringFormData] = useState({
    name: "",
    amount: "",
    category: "",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    next_due_date: new Date().toISOString().split("T")[0],
    reminder_days_before: "1",
  });

  // Savings goal form state
  const [savingsGoalFormData, setSavingsGoalFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  // Split transaction state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitItems, setSplitItems] = useState<Array<{ category: string; amount: string }>>([
    { category: "", amount: "" },
    { category: "", amount: "" },
  ]);
  const [splitFormData, setSplitFormData] = useState({
    type: "expense" as "income" | "expense",
    totalAmount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Receipt attachments state
  const [receiptImages, setReceiptImages] = useState<Record<number, string>>({});
  const [currentReceipt, setCurrentReceipt] = useState<string | null>(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [viewingReceiptId, setViewingReceiptId] = useState<number | null>(null);

  // Multi-currency state
  const [transactionCurrencies, setTransactionCurrencies] = useState<Record<number, { currency: string; originalAmount: number }>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [showCurrencySettings, setShowCurrencySettings] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    LBP: 89500, // Lebanese Pound
    AED: 3.67, // UAE Dirham
    SAR: 3.75, // Saudi Riyal
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Pagination state
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    loadData();
  }, [period, customStartDate, customEndDate]);

  async function loadData() {
    setLoading(true);
    try {
      const [summaryData, recordsData, budgetData, goalsData, recurringData] = await Promise.all([
        getFinanceSummary(
          1,
          period,
          period === "custom" ? customStartDate : undefined,
          period === "custom" ? customEndDate : undefined
        ),
        getFinanceRecords(1),
        getBudget(1),
        getCategoryGoals(1),
        getRecurringExpenses(1),
      ]);
      setSummary(summaryData);
      setRecords(recordsData);
      setBudget(budgetData);
      setCategoryGoals(goalsData);
      setRecurringExpenses(recurringData);
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
      // Convert amount to USD if different currency
      const amountInUSD = selectedCurrency === "USD"
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
        localStorage.setItem('transactionCurrencies', JSON.stringify(newCurrencies));
      }

      // Save receipt if one was uploaded
      if (currentReceipt && newRecord.id) {
        const newReceipts = { ...receiptImages, [newRecord.id]: currentReceipt };
        setReceiptImages(newReceipts);
        localStorage.setItem('receiptImages', JSON.stringify(newReceipts));
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
        subtitle: currentReceipt ? "Transaction and receipt saved" : "AI context updated successfully"
      });
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

  // Recurring expense handlers
  async function handleRecurringSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      if (editingRecurring) {
        // Update existing recurring expense
        await updateRecurringExpense(editingRecurring.id, {
          name: recurringFormData.name,
          amount: parseFloat(recurringFormData.amount),
          category: recurringFormData.category,
          frequency: recurringFormData.frequency,
          next_due_date: recurringFormData.next_due_date,
          reminder_days_before: parseInt(recurringFormData.reminder_days_before),
        });
        setSuccessMessage({ title: "Recurring Expense Updated!", subtitle: "Changes saved successfully" });
      } else {
        // Create new recurring expense
        await createRecurringExpense({
          name: recurringFormData.name,
          amount: parseFloat(recurringFormData.amount),
          category: recurringFormData.category,
          frequency: recurringFormData.frequency,
          next_due_date: recurringFormData.next_due_date,
          reminder_days_before: parseInt(recurringFormData.reminder_days_before),
        });
        setSuccessMessage({ title: "Recurring Expense Created!", subtitle: "Automatic transaction scheduled" });
      }

      // Close modal and reset form
      setShowRecurringModal(false);
      setEditingRecurring(null);
      setRecurringFormData({
        name: "",
        amount: "",
        category: "",
        frequency: "monthly",
        next_due_date: new Date().toISOString().split("T")[0],
        reminder_days_before: "1",
      });

      // Show success notification
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Failed to save recurring expense:", error);
      alert("Failed to save recurring expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRecurring(expenseId: number) {
    try {
      await deleteRecurringExpense(expenseId);

      // Show success notification
      setSuccessMessage({ title: "Recurring Expense Deleted!", subtitle: "Transaction removed successfully" });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Failed to delete recurring expense:", error);
      alert("Failed to delete recurring expense. Please try again.");
    }
  }

  async function handleProcessRecurring(expenseId: number, expenseName: string) {
    try {
      await processRecurringExpense(expenseId);

      // Show success notification
      setSuccessMessage({ title: "Transaction Created!", subtitle: `${expenseName} processed successfully` });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Reload data to show new transaction
      loadData();
    } catch (error) {
      console.error("Failed to process recurring expense:", error);
      alert("Failed to process recurring expense. Please try again.");
    }
  }

  function openRecurringModal(expense?: RecurringExpense) {
    if (expense) {
      setEditingRecurring(expense);
      setRecurringFormData({
        name: expense.name,
        amount: expense.amount.toString(),
        category: expense.category,
        frequency: expense.frequency,
        next_due_date: new Date(expense.next_due_date).toISOString().split("T")[0],
        reminder_days_before: expense.reminder_days_before.toString(),
      });
    } else {
      setEditingRecurring(null);
      setRecurringFormData({
        name: "",
        amount: "",
        category: "",
        frequency: "monthly",
        next_due_date: new Date().toISOString().split("T")[0],
        reminder_days_before: "1",
      });
    }
    setShowRecurringModal(true);
  }

  // Savings goal handlers
  function handleSavingsGoalSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newGoal = {
      id: editingSavingsGoal || Date.now(),
      name: savingsGoalFormData.name,
      targetAmount: parseFloat(savingsGoalFormData.targetAmount),
      currentAmount: parseFloat(savingsGoalFormData.currentAmount) || 0,
      deadline: savingsGoalFormData.deadline,
    };

    if (editingSavingsGoal) {
      setSavingsGoals(savingsGoals.map(g => g.id === editingSavingsGoal ? newGoal : g));
    } else {
      setSavingsGoals([...savingsGoals, newGoal]);
    }

    // Save to localStorage
    localStorage.setItem('savingsGoals', JSON.stringify(
      editingSavingsGoal
        ? savingsGoals.map(g => g.id === editingSavingsGoal ? newGoal : g)
        : [...savingsGoals, newGoal]
    ));

    // Reset form and close modal
    setSavingsGoalFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
    });
    setEditingSavingsGoal(null);
    setShowSavingsGoalModal(false);

    // Show success notification
    setSuccessMessage({
      title: editingSavingsGoal ? "Goal Updated!" : "Goal Created!",
      subtitle: "Savings goal saved successfully"
    });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }

  function openSavingsGoalModal(goal?: typeof savingsGoals[0]) {
    if (goal) {
      setEditingSavingsGoal(goal.id);
      setSavingsGoalFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline,
      });
    } else {
      setEditingSavingsGoal(null);
      setSavingsGoalFormData({
        name: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
      });
    }
    setShowSavingsGoalModal(true);
  }

  function handleDeleteSavingsGoal(goalId: number) {
    const newGoals = savingsGoals.filter(g => g.id !== goalId);
    setSavingsGoals(newGoals);
    localStorage.setItem('savingsGoals', JSON.stringify(newGoals));

    // Show success notification
    setSuccessMessage({ title: "Goal Deleted!", subtitle: "Savings goal removed successfully" });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }

  function updateSavingsGoalAmount(goalId: number, amount: number) {
    const newGoals = savingsGoals.map(g =>
      g.id === goalId ? { ...g, currentAmount: amount } : g
    );
    setSavingsGoals(newGoals);
    localStorage.setItem('savingsGoals', JSON.stringify(newGoals));

    setSuccessMessage({ title: "Amount Updated!", subtitle: "Savings amount updated" });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }

  // Load savings goals from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('savingsGoals');
    if (stored) {
      setSavingsGoals(JSON.parse(stored));
    }
  }, []);

  // Load receipt images from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('receiptImages');
    if (stored) {
      setReceiptImages(JSON.parse(stored));
    }
  }, []);

  // Load currency data from localStorage
  useEffect(() => {
    const storedCurrencies = localStorage.getItem('transactionCurrencies');
    if (storedCurrencies) {
      setTransactionCurrencies(JSON.parse(storedCurrencies));
    }
    const storedRates = localStorage.getItem('exchangeRates');
    if (storedRates) {
      setExchangeRates(JSON.parse(storedRates));
    }
  }, []);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('financeDarkMode');
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }
  }, []);

  // Toggle dark mode
  function toggleDarkMode() {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('financeDarkMode', JSON.stringify(newDarkMode));
  }

  // Currency helpers
  function convertToUSD(amount: number, currency: string): number {
    const rate = exchangeRates[currency] || 1;
    return amount / rate;
  }

  function getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      LBP: 'LL',
      AED: 'د.إ',
      SAR: '﷼',
    };
    return symbols[currency] || currency;
  }

  // Receipt handlers
  function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>, transactionId?: number) {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;

        if (transactionId) {
          // Attach to existing transaction
          const newReceipts = { ...receiptImages, [transactionId]: base64 };
          setReceiptImages(newReceipts);
          localStorage.setItem('receiptImages', JSON.stringify(newReceipts));

          setSuccessMessage({ title: "Receipt Attached!", subtitle: "Receipt image saved successfully" });
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
        } else {
          // For new transaction (in form)
          setCurrentReceipt(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function viewReceipt(transactionId: number) {
    setViewingReceiptId(transactionId);
    setShowReceiptViewer(true);
  }

  function deleteReceipt(transactionId: number) {
    const newReceipts = { ...receiptImages };
    delete newReceipts[transactionId];
    setReceiptImages(newReceipts);
    localStorage.setItem('receiptImages', JSON.stringify(newReceipts));

    setSuccessMessage({ title: "Receipt Deleted!", subtitle: "Receipt image removed" });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }

  // Split transaction handlers
  function openSplitModal() {
    setSplitFormData({
      type: "expense",
      totalAmount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setSplitItems([
      { category: "", amount: "" },
      { category: "", amount: "" },
    ]);
    setShowSplitModal(true);
  }

  function addSplitItem() {
    setSplitItems([...splitItems, { category: "", amount: "" }]);
  }

  function removeSplitItem(index: number) {
    if (splitItems.length > 2) {
      setSplitItems(splitItems.filter((_, i) => i !== index));
    }
  }

  function updateSplitItem(index: number, field: "category" | "amount", value: string) {
    const newItems = [...splitItems];
    newItems[index][field] = value;
    setSplitItems(newItems);
  }

  async function handleSplitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate total matches splits
      const total = parseFloat(splitFormData.totalAmount);
      const splitTotal = splitItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      if (Math.abs(total - splitTotal) > 0.01) {
        alert(`Split amounts (${splitTotal.toFixed(2)}) don't match total (${total.toFixed(2)})`);
        setSubmitting(false);
        return;
      }

      // Create multiple transactions
      const promises = splitItems.map(item =>
        addFinanceRecord({
          type: splitFormData.type,
          amount: parseFloat(item.amount),
          category: item.category,
          description: `${splitFormData.description} (Split)`,
          date: splitFormData.date,
        })
      );

      await Promise.all(promises);
      await loadData();

      // Reset and close
      setShowSplitModal(false);
      setSplitFormData({
        type: "expense",
        totalAmount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setSplitItems([
        { category: "", amount: "" },
        { category: "", amount: "" },
      ]);

      setSuccessMessage({
        title: "Split Transaction Added!",
        subtitle: `Added ${splitItems.length} transactions`
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Failed to create split transaction:", error);
      alert("Failed to create split transaction");
    } finally {
      setSubmitting(false);
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
  const filteredRecords = records
    .filter((record) => {
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
    })
    .sort((a, b) => {
      // Sort by created_at timestamp (newest first), which includes hours/minutes/seconds
      const createdA = new Date(a.created_at).getTime();
      const createdB = new Date(b.created_at).getTime();
      return createdB - createdA;
    });

  // Prepare category data for pie chart (expenses)
  const categoryData = summary?.category_breakdown
    ? Object.entries(summary.category_breakdown).map(([category, amount]) => ({
        name: category,
        value: Math.abs(amount),
      }))
    : [];

  // Prepare top 5 spending categories for bar chart
  const topSpendingCategories = categoryData
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Prepare income breakdown data
  const incomeData = filteredRecords
    .filter((record) => record.transaction_type === "income")
    .reduce((acc: { [key: string]: number }, record) => {
      const category = record.category || "Other";
      acc[category] = (acc[category] || 0) + record.amount;
      return acc;
    }, {});

  const incomeBreakdownData = Object.entries(incomeData).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  // Calculate alerts
  const alerts: Array<{
    type: "error" | "warning" | "info";
    title: string;
    message: string;
  }> = [];

  // Check overall budget
  if (budget && summary) {
    const budgetUsage = (summary.total_expenses / budget.amount) * 100;

    if (budgetUsage >= 100) {
      alerts.push({
        type: "error",
        title: "Budget Exceeded",
        message: `You've exceeded your ${budget.period} budget by $${(summary.total_expenses - budget.amount).toFixed(2)}!`,
      });
    } else if (budgetUsage >= 90) {
      alerts.push({
        type: "warning",
        title: "Budget Alert",
        message: `You've used ${budgetUsage.toFixed(0)}% of your ${budget.period} budget. Only $${(budget.amount - summary.total_expenses).toFixed(2)} remaining.`,
      });
    } else if (budgetUsage >= 75) {
      alerts.push({
        type: "info",
        title: "Budget Warning",
        message: `You've used ${budgetUsage.toFixed(0)}% of your ${budget.period} budget.`,
      });
    }
  }

  // Check category goals
  categoryGoals.forEach((goal) => {
    const spent = summary?.category_breakdown[goal.category] || 0;
    const progress = (spent / goal.goal_amount) * 100;

    if (progress >= 100) {
      alerts.push({
        type: "error",
        title: `${goal.category} Goal Exceeded`,
        message: `You've exceeded your ${goal.category} spending goal by $${(spent - goal.goal_amount).toFixed(2)}!`,
      });
    } else if (progress >= goal.alert_threshold * 100) {
      alerts.push({
        type: "warning",
        title: `${goal.category} Alert`,
        message: `You've used ${progress.toFixed(0)}% of your ${goal.category} goal ($${spent.toFixed(2)} of $${goal.goal_amount.toFixed(2)}).`,
      });
    }
  });

  // Calculate monthly comparison
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const thisMonthRecords = records.filter((record) => {
    const recordDate = new Date(record.transaction_date);
    return recordDate >= thisMonthStart;
  });

  const lastMonthRecords = records.filter((record) => {
    const recordDate = new Date(record.transaction_date);
    return recordDate >= lastMonthStart && recordDate <= lastMonthEnd;
  });

  const thisMonthIncome = thisMonthRecords
    .filter((r) => r.transaction_type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const thisMonthExpenses = thisMonthRecords
    .filter((r) => r.transaction_type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  const lastMonthIncome = lastMonthRecords
    .filter((r) => r.transaction_type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const lastMonthExpenses = lastMonthRecords
    .filter((r) => r.transaction_type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  const incomeChange = lastMonthIncome
    ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
    : 0;

  const expenseChange = lastMonthExpenses
    ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    : 0;

  const monthlyComparison = {
    thisMonth: {
      income: thisMonthIncome,
      expenses: thisMonthExpenses,
      balance: thisMonthIncome - thisMonthExpenses,
    },
    lastMonth: {
      income: lastMonthIncome,
      expenses: lastMonthExpenses,
      balance: lastMonthIncome - lastMonthExpenses,
    },
    changes: {
      income: incomeChange,
      expenses: expenseChange,
      balance:
        lastMonthIncome - lastMonthExpenses !== 0
          ? (((thisMonthIncome - thisMonthExpenses) -
              (lastMonthIncome - lastMonthExpenses)) /
              Math.abs(lastMonthIncome - lastMonthExpenses)) *
            100
          : 0,
    },
  };

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
      <div className={`min-h-screen flex items-center justify-center pt-24 ${
        darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={darkMode ? 'text-gray-300 text-xl' : 'text-gray-700 text-xl'}
        >
          Loading your finances...
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 pt-24 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-4xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Finance
              </h1>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Track your spending and manage your budget</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-lg transition-all ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Period Selector & Export Buttons */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            {/* Period Selector */}
            <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <button
                onClick={() => {
                  setPeriod("weekly");
                  setShowDatePicker(false);
                }}
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all ${
                  period === "weekly"
                    ? darkMode
                      ? "bg-gray-700 text-white shadow-sm"
                      : "bg-white text-gray-900 shadow-sm"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
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
                    ? darkMode
                      ? "bg-gray-700 text-white shadow-sm"
                      : "bg-white text-gray-900 shadow-sm"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => {
                  setPeriod("custom");
                  setShowDatePicker(!showDatePicker);
                }}
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${
                  period === "custom"
                    ? darkMode
                      ? "bg-gray-700 text-white shadow-sm"
                      : "bg-white text-gray-900 shadow-sm"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
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
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg border transition-all ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF
              </a>
              <a
                href={`http://localhost:8000/finance/export/1/excel?period=${period}`}
                download
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg border transition-all ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </a>
            </div>

            {/* Split Transaction Button */}
            <button
              onClick={openSplitModal}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg transition-all ml-auto"
            >
              <SplitSquareVertical className="w-4 h-4" />
              Split Transaction
            </button>

            {/* Currency Settings Button */}
            <button
              onClick={() => setShowCurrencySettings(true)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg border transition-all ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
              }`}
              title="Currency Settings"
            >
              <Coins className="w-4 h-4" />
              Currency
            </button>
          </div>

          {/* Date Range Picker */}
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 border rounded-xl shadow-sm ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    From
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    To
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
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
                    className={`px-4 py-2 font-medium text-sm rounded-lg transition-all ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
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
            whileHover={{ scale: 1.02, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-emerald-600/50 hover:shadow-lg hover:shadow-emerald-500/10'
                : 'bg-white border-gray-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${
                darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
              }`}>
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              </div>
              <span className={`text-xs font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>INCOME</span>
            </div>
            <h3 className={`text-sm mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Total Income</h3>
            <p className={`text-2xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ${summary?.total_income.toFixed(2) || "0.00"}
            </p>
          </motion.div>

          {/* Total Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-rose-600/50 hover:shadow-lg hover:shadow-rose-500/10'
                : 'bg-white border-gray-200 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${
                darkMode ? 'bg-rose-900/30' : 'bg-rose-50'
              }`}>
                <ArrowDownRight className="w-5 h-5 text-rose-600" />
              </div>
              <span className={`text-xs font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>EXPENSES</span>
            </div>
            <h3 className={`text-sm mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Total Expenses</h3>
            <p className={`text-2xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ${summary?.total_expenses.toFixed(2) || "0.00"}
            </p>
          </motion.div>

          {/* Net Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/10'
                : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${
                darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`text-xs font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>BALANCE</span>
            </div>
            <h3 className={`text-sm mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Net Balance</h3>
            <p className={`text-2xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ${summary?.net_balance.toFixed(2) || "0.00"}
            </p>
          </motion.div>

          {/* Budget Remaining */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-500/10'
                : 'bg-white border-gray-200 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <DollarSign className={`w-5 h-5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
              </div>
              <button
                onClick={budget ? handleEditBudget : () => setShowBudgetModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                {budget ? "Edit" : "Set"}
              </button>
            </div>
            <h3 className={`text-sm mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Budget Remaining</h3>
            <p className={`text-2xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {budget ? `$${budgetRemaining.toFixed(2)}` : "Not set"}
            </p>
            {budget && (
              <div className="mt-3">
                <div className={`w-full rounded-full h-1.5 overflow-hidden ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
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
                <p className={`text-xs mt-1.5 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {budgetProgress.toFixed(0)}% spent
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Trend Alerts Section */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className={`w-5 h-5 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} />
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Spending Alerts
              </h3>
            </div>
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
                  darkMode
                    ? alert.type === "error"
                      ? "bg-red-950/30 border-red-900/50"
                      : alert.type === "warning"
                      ? "bg-yellow-950/30 border-yellow-900/50"
                      : "bg-blue-950/30 border-blue-900/50"
                    : alert.type === "error"
                    ? "bg-red-50 border-red-200"
                    : alert.type === "warning"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? alert.type === "error"
                        ? "bg-red-900/40"
                        : alert.type === "warning"
                        ? "bg-yellow-900/40"
                        : "bg-blue-900/40"
                      : alert.type === "error"
                      ? "bg-red-100"
                      : alert.type === "warning"
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  }`}
                >
                  {alert.type === "error" ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : alert.type === "warning" ? (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-semibold mb-1 ${
                      darkMode
                        ? alert.type === "error"
                          ? "text-red-400"
                          : alert.type === "warning"
                          ? "text-yellow-400"
                          : "text-blue-400"
                        : alert.type === "error"
                        ? "text-red-900"
                        : alert.type === "warning"
                        ? "text-yellow-900"
                        : "text-blue-900"
                    }`}
                  >
                    {alert.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode
                        ? alert.type === "error"
                          ? "text-red-300"
                          : alert.type === "warning"
                          ? "text-yellow-300"
                          : "text-blue-300"
                        : alert.type === "error"
                        ? "text-red-700"
                        : alert.type === "warning"
                        ? "text-yellow-700"
                        : "text-blue-700"
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Spending Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Calendar className={`w-5 h-5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
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
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                <XAxis dataKey="date" stroke={darkMode ? "#9ca3af" : "#6b7280"} style={{ fontSize: '12px' }} />
                <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
                    border: darkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                    color: darkMode ? "#f3f4f6" : "#111827",
                  }}
                  labelStyle={{
                    color: darkMode ? "#f3f4f6" : "#111827",
                    fontWeight: "600",
                  }}
                  itemStyle={{
                    color: darkMode ? "#e5e7eb" : "#374151",
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

          {/* Expense Breakdown Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <PieChart className={`w-5 h-5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Expense Breakdown
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
                      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
                      border: darkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                      color: darkMode ? "#f3f4f6" : "#111827",
                    }}
                    labelStyle={{
                      color: darkMode ? "#f3f4f6" : "#111827",
                      fontWeight: "600",
                    }}
                    itemStyle={{
                      color: darkMode ? "#e5e7eb" : "#374151",
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className={`h-[300px] flex items-center justify-center ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                No expense data available
              </div>
            )}
          </motion.div>

          {/* Income Breakdown Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <TrendingUp className={`w-5 h-5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Income Breakdown
              </h3>
            </div>
            {incomeBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={incomeBreakdownData}
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
                    {incomeBreakdownData.map((entry, index) => (
                      <Cell
                        key={`cell-income-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
                      border: darkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                      color: darkMode ? "#f3f4f6" : "#111827",
                    }}
                    labelStyle={{
                      color: darkMode ? "#f3f4f6" : "#111827",
                      fontWeight: "600",
                    }}
                    itemStyle={{
                      color: darkMode ? "#e5e7eb" : "#374151",
                    }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className={`h-[300px] flex items-center justify-center ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                No income data available
              </div>
            )}
          </motion.div>

          {/* Top 5 Spending Categories Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Coins className={`w-5 h-5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Top Spending Categories
              </h3>
            </div>
            {topSpendingCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topSpendingCategories}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis
                    type="number"
                    stroke={darkMode ? "#9ca3af" : "#6b7280"}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={darkMode ? "#9ca3af" : "#6b7280"}
                    style={{ fontSize: '12px' }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
                      border: darkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                      color: darkMode ? "#f3f4f6" : "#111827",
                    }}
                    labelStyle={{
                      color: darkMode ? "#f3f4f6" : "#111827",
                      fontWeight: "600",
                    }}
                    itemStyle={{
                      color: darkMode ? "#e5e7eb" : "#374151",
                    }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Bar
                    dataKey="value"
                    fill="#FF2D55"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-[300px] flex items-center justify-center ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                No spending data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Monthly Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className={`border rounded-xl p-6 mb-8 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <CalendarDays className={`w-5 h-5 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} />
            </div>
            <h3 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Monthly Comparison
            </h3>
          </div>

          {lastMonthRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Income Comparison */}
              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Income
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      monthlyComparison.changes.income >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {monthlyComparison.changes.income >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(monthlyComparison.changes.income).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>This Month</p>
                    <p className={`text-lg font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${monthlyComparison.thisMonth.income.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Last Month</p>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      ${monthlyComparison.lastMonth.income.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expenses Comparison */}
              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Expenses
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      monthlyComparison.changes.expenses <= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {monthlyComparison.changes.expenses <= 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                    {Math.abs(monthlyComparison.changes.expenses).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>This Month</p>
                    <p className={`text-lg font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${monthlyComparison.thisMonth.expenses.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Last Month</p>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      ${monthlyComparison.lastMonth.expenses.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Balance Comparison */}
              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Net Balance
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      monthlyComparison.changes.balance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {monthlyComparison.changes.balance >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(monthlyComparison.changes.balance).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>This Month</p>
                    <p
                      className={`text-lg font-bold ${
                        monthlyComparison.thisMonth.balance >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${monthlyComparison.thisMonth.balance.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Last Month</p>
                    <p
                      className={`text-sm ${
                        monthlyComparison.lastMonth.balance >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${monthlyComparison.lastMonth.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <CalendarDays className={`w-12 h-12 mx-auto mb-3 ${
                darkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                No data from last month to compare. Add more transactions to see monthly trends!
              </p>
            </div>
          )}
        </motion.div>

        {/* Savings Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`border rounded-xl p-6 mb-8 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <PiggyBank className={`w-5 h-5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
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
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {goal.name}
                        </h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          ${goal.currentAmount.toFixed(2)} of $
                          {goal.targetAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openSavingsGoalModal(goal)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode
                              ? 'hover:bg-gray-700'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <Pencil className={`w-4 h-4 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`} />
                        </button>
                        <button
                          onClick={() => handleDeleteSavingsGoal(goal.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode
                              ? 'hover:bg-red-900/30'
                              : 'hover:bg-red-100'
                          }`}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className={`w-full rounded-full h-3 overflow-hidden ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
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
                        <span className={`text-xs font-medium ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {progress.toFixed(0)}% Complete
                        </span>
                        {daysLeft !== null && (
                          <span
                            className={`text-xs ${
                              daysLeft < 0
                                ? "text-red-600"
                                : daysLeft < 30
                                ? "text-yellow-600"
                                : darkMode ? "text-gray-400" : "text-gray-500"
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
                        onClick={() =>
                          updateSavingsGoalAmount(
                            goal.id,
                            goal.currentAmount + 10
                          )
                        }
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          darkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        +$10
                      </button>
                      <button
                        onClick={() =>
                          updateSavingsGoalAmount(
                            goal.id,
                            goal.currentAmount + 50
                          )
                        }
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          darkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        +$50
                      </button>
                      <button
                        onClick={() =>
                          updateSavingsGoalAmount(
                            goal.id,
                            goal.currentAmount + 100
                          )
                        }
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          darkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
            <div className="p-8 text-center">
              <PiggyBank className={`w-12 h-12 mx-auto mb-3 ${
                darkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                No savings goals yet. Create one to start tracking your progress!
              </p>
            </div>
          )}
        </motion.div>

        {/* Category Goals Section */}
        {categoryGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`border rounded-xl p-6 mb-8 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Target className={`w-5 h-5 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
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
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{goal.category}</h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{goal.period}ly limit</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategoryGoal(goal.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          darkMode
                            ? 'text-gray-500 hover:text-red-500 hover:bg-red-900/30'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
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

                      <div className={`w-full rounded-full h-2 overflow-hidden ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
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
                          <span className={`text-xs ${
                            darkMode ? 'text-amber-400' : 'text-amber-700'
                          }`}>
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
            className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className={`p-3 rounded-full w-fit mx-auto mb-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Target className={`w-6 h-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Set Category Spending Goals
              </h3>
              <p className={`mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
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

        {/* Recurring Expenses Section */}
        {recurringExpenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`border rounded-xl p-6 mb-8 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Repeat className={`w-5 h-5 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Recurring Expenses
                </h3>
              </div>
              <button
                onClick={() => openRecurringModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all"
              >
                Add Recurring
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recurringExpenses.map((expense) => {
                const nextDueDate = new Date(expense.next_due_date);
                const today = new Date();
                const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isDueSoon = daysUntilDue <= expense.reminder_days_before && daysUntilDue >= 0;
                const isOverdue = daysUntilDue < 0;

                return (
                  <div
                    key={expense.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
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
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{expense.name}</h4>
                          <span className={`text-xs px-2 py-0.5 border rounded-full font-medium ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-300'
                              : 'bg-white border-gray-200 text-gray-700'
                          }`}>
                            {expense.frequency}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{expense.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openRecurringModal(expense)}
                          className={`p-1.5 rounded-lg transition-all ${
                            darkMode
                              ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/30'
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecurring(expense.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            darkMode
                              ? 'text-gray-500 hover:text-red-500 hover:bg-red-900/30'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${expense.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleProcessRecurring(expense.id, expense.name)}
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

                      <div className={`text-xs flex items-center gap-1 ${
                        isOverdue ? "text-rose-600" : isDueSoon ? "text-amber-600" : darkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {isOverdue
                            ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                            : isDueSoon
                            ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                            : `Next: ${nextDueDate.toLocaleDateString()}`}
                        </span>
                      </div>

                      {(isOverdue || isDueSoon) && (
                        <div className="flex items-center gap-2 pt-1">
                          <AlertCircle className={`w-4 h-4 ${isOverdue ? "text-rose-600" : "text-amber-600"}`} />
                          <span className={`text-xs ${
                            isOverdue
                              ? darkMode ? "text-rose-400" : "text-rose-700"
                              : darkMode ? "text-amber-400" : "text-amber-700"
                          }`}>
                            {isOverdue ? "Payment overdue!" : "Due soon"}
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

        {/* Add Recurring Expense Button (when no recurring expenses exist) */}
        {recurringExpenses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className={`p-3 rounded-full w-fit mx-auto mb-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Repeat className={`w-6 h-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Track Recurring Expenses
              </h3>
              <p className={`mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Manage subscriptions, rent, and recurring bills to stay on top of your finances
              </p>
              <button
                onClick={() => openRecurringModal()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
              >
                Add Your First Recurring Expense
              </button>
            </div>
          </motion.div>
        )}

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          className={`border rounded-lg p-6 shadow-md ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h3 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Recent Transactions</h3>

            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      darkMode
                        ? 'hover:bg-gray-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className={`w-3.5 h-3.5 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Transaction List or Empty State */}
          {filteredRecords.length > 0 ? (
            <>
            <div className="space-y-3">
              {filteredRecords.slice(0, showAllTransactions ? filteredRecords.length : 5).map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 border cursor-pointer ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg hover:bg-gray-750'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:bg-gray-50/50'
                  }`}
                >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      record.transaction_type === "income"
                        ? darkMode ? "bg-green-900/30" : "bg-green-100"
                        : darkMode ? "bg-red-900/30" : "bg-red-100"
                    }`}
                  >
                    {record.transaction_type === "income" ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{record.category}</p>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {record.description || "No description"}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {new Date(record.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
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
                            record.transaction_type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {record.transaction_type === "income" ? "+" : "-"}
                          {getCurrencySymbol(transactionCurrencies[record.id].currency)}
                          {transactionCurrencies[record.id].originalAmount.toFixed(2)}
                        </p>
                        <p className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          ≈ ${record.amount.toFixed(2)} USD
                        </p>
                      </>
                    ) : (
                      <p
                        className={`text-xl font-bold ${
                          record.transaction_type === "income" ? "text-green-600" : "text-red-600"
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
                          ? 'text-gray-500 hover:text-purple-400 hover:bg-purple-900/30'
                          : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
                      }`}
                      title="View receipt"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                  ) : (
                    <label
                      htmlFor={`receipt-${record.id}`}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        darkMode
                          ? 'text-gray-500 hover:text-purple-400 hover:bg-purple-900/30'
                          : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
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
                        ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/30'
                        : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(record.id)}
                    className={`p-2 rounded-lg transition-all ${
                      darkMode
                        ? 'text-gray-500 hover:text-red-500 hover:bg-red-900/30'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            </div>

            {/* Show More / Show Less Button */}
            {filteredRecords.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className={`flex items-center gap-2 mx-auto px-6 py-2.5 font-medium text-sm rounded-lg transition-all ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {showAllTransactions ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show More ({filteredRecords.length - 5} more) <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="py-12 text-center">
              <Search className={`w-12 h-12 mx-auto mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
              <h4 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>No transactions found</h4>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-8 max-w-md w-full shadow-lg my-8 max-h-[90vh] overflow-y-auto ${
              darkMode
                ? 'bg-gray-800'
                : 'bg-white'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {editingRecord ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <form onSubmit={editingRecord ? handleUpdate : handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className={`flex gap-2 p-1.5 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
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
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Amount
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                  {!editingRecord && (
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className={`w-28 px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
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
                  <p className={`text-sm mt-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    ≈ ${convertToUSD(parseFloat(formData.amount) || 0, selectedCurrency).toFixed(2)} USD
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
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
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="Add a note"
                />
              </div>

              {/* Date */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Receipt Upload */}
              {!editingRecord && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
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
                          ? 'border-gray-600 hover:border-blue-500 hover:bg-blue-900/30 text-gray-400 hover:text-blue-400'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600'
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
                          darkMode ? 'border-gray-700' : 'border-gray-200'
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
                  <p className={`text-xs mt-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
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
                  }}
                  className={`flex-1 py-3 font-semibold rounded-xl transition-all ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-8 max-w-md w-full shadow-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Delete Transaction?</h3>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>This action cannot be undone</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className={`flex-1 py-3 font-semibold rounded-lg transition-all ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700'
                }`}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-8 max-w-md w-full shadow-lg my-8 max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {budget ? "Edit Budget" : "Set Budget"}
            </h2>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="0.00"
                />
              </div>

              {/* Period Toggle */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Period
                </label>
                <div className={`flex gap-2 p-1.5 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <button
                    type="button"
                    onClick={() => setBudgetFormData({ ...budgetFormData, period: "weekly" })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      budgetFormData.period === "weekly"
                        ? darkMode
                          ? "bg-gray-800 text-purple-400 shadow-md"
                          : "bg-white text-purple-600 shadow-md"
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
                          ? "bg-gray-800 text-purple-400 shadow-md"
                          : "bg-white text-purple-600 shadow-md"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Info Message */}
              <div className={`rounded-xl p-4 border ${
                darkMode
                  ? 'bg-purple-900/20 border-purple-800'
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <p className={`text-sm ${
                  darkMode ? 'text-purple-300' : 'text-purple-800'
                }`}>
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
                  className={`flex-1 py-3 font-semibold rounded-xl transition-all ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-8 max-w-md w-full shadow-lg my-8 max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Set Category Goal
            </h2>

            <form onSubmit={handleCategoryGoalSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category
                </label>
                <select
                  required
                  value={categoryGoalFormData.category}
                  onChange={(e) =>
                    setCategoryGoalFormData({ ...categoryGoalFormData, category: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
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

              {/* Goal Amount */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="0.00"
                />
              </div>

              {/* Period Toggle */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Period
                </label>
                <div className={`flex gap-2 p-1.5 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
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

      {/* Recurring Expense Modal */}
      {showRecurringModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowRecurringModal(false);
              setEditingRecurring(null);
              setRecurringFormData({
                name: "",
                amount: "",
                category: "",
                frequency: "monthly",
                next_due_date: new Date().toISOString().split("T")[0],
                reminder_days_before: "1",
              });
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-6 max-w-md w-full shadow-lg relative my-8 max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {editingRecurring ? "Edit Recurring Expense" : "Add Recurring Expense"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowRecurringModal(false);
                  setEditingRecurring(null);
                  setRecurringFormData({
                    name: "",
                    amount: "",
                    category: "",
                    frequency: "monthly",
                    next_due_date: new Date().toISOString().split("T")[0],
                    reminder_days_before: "1",
                  });
                }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecurringSubmit} className="space-y-4">
              {/* Name & Amount Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Expense Name
                  </label>
                  <input
                    type="text"
                    required
                    value={recurringFormData.name}
                    onChange={(e) =>
                      setRecurringFormData({ ...recurringFormData, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Netflix"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={recurringFormData.amount}
                    onChange={(e) =>
                      setRecurringFormData({ ...recurringFormData, amount: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="15.99"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Category
                </label>
                <select
                  required
                  value={recurringFormData.category}
                  onChange={(e) =>
                    setRecurringFormData({ ...recurringFormData, category: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Loan Payment">Loan Payment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Frequency
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setRecurringFormData({ ...recurringFormData, frequency: freq })}
                      className={`py-2 rounded-lg font-medium text-xs transition-all capitalize border ${
                        recurringFormData.frequency === freq
                          ? "bg-blue-600 text-white border-blue-600"
                          : darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Due Date */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Next Due Date
                </label>
                <input
                  type="date"
                  required
                  value={recurringFormData.next_due_date}
                  onChange={(e) =>
                    setRecurringFormData({ ...recurringFormData, next_due_date: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Reminder Days */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Remind me {recurringFormData.reminder_days_before} day(s) before
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={recurringFormData.reminder_days_before}
                  onChange={(e) =>
                    setRecurringFormData({ ...recurringFormData, reminder_days_before: e.target.value })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecurringModal(false);
                    setEditingRecurring(null);
                    setRecurringFormData({
                      name: "",
                      amount: "",
                      category: "",
                      frequency: "monthly",
                      next_due_date: new Date().toISOString().split("T")[0],
                      reminder_days_before: "1",
                    });
                  }}
                  className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg transition-all border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {submitting ? (editingRecurring ? "Updating..." : "Saving...") : (editingRecurring ? "Update" : "Save")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Savings Goal Modal */}
      {showSavingsGoalModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowSavingsGoalModal(false);
              setEditingSavingsGoal(null);
              setSavingsGoalFormData({
                name: "",
                targetAmount: "",
                currentAmount: "",
                deadline: "",
              });
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-6 max-w-md w-full shadow-lg relative my-8 max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {editingSavingsGoal ? "Edit Savings Goal" : "Add Savings Goal"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowSavingsGoalModal(false);
                  setEditingSavingsGoal(null);
                  setSavingsGoalFormData({
                    name: "",
                    targetAmount: "",
                    currentAmount: "",
                    deadline: "",
                  });
                }}
                className={`p-2 rounded-full transition-colors ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavingsGoalSubmit} className="space-y-4">
              {/* Goal Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={savingsGoalFormData.name}
                  onChange={(e) =>
                    setSavingsGoalFormData({ ...savingsGoalFormData, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
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
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="0.00"
                />
              </div>

              {/* Current Amount */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
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
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="0.00"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={savingsGoalFormData.deadline}
                  onChange={(e) =>
                    setSavingsGoalFormData({ ...savingsGoalFormData, deadline: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Info Message */}
              <div className={`rounded-xl p-4 border ${
                darkMode
                  ? 'bg-blue-900/20 border-blue-800'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm ${
                  darkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  Track your progress toward this savings goal. You can add money using the quick buttons or manually update the amount.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSavingsGoalModal(false);
                    setEditingSavingsGoal(null);
                    setSavingsGoalFormData({
                      name: "",
                      targetAmount: "",
                      currentAmount: "",
                      deadline: "",
                    });
                  }}
                  className={`flex-1 py-2.5 font-medium text-sm rounded-lg transition-all border ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {editingSavingsGoal ? "Update Goal" : "Create Goal"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Split Transaction Modal */}
      {showSplitModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSplitModal(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-6 max-w-2xl w-full shadow-lg relative my-8 max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Split Transaction</h2>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Divide a payment across multiple categories</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSplitModal(false)}
                className={`p-2 rounded-full transition-colors ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSplitSubmit} className="space-y-6">
              {/* Transaction Type Toggle */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Type
                </label>
                <div className={`flex gap-2 p-1.5 rounded-2xl ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <button
                    type="button"
                    onClick={() => setSplitFormData({ ...splitFormData, type: "expense" })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      splitFormData.type === "expense"
                        ? darkMode
                          ? "bg-gray-800 text-red-400 shadow-md"
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
                    onClick={() => setSplitFormData({ ...splitFormData, type: "income" })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      splitFormData.type === "income"
                        ? darkMode
                          ? "bg-gray-800 text-green-400 shadow-md"
                          : "bg-white text-green-600 shadow-md"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Total Amount */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Total Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={splitFormData.totalAmount}
                  onChange={(e) =>
                    setSplitFormData({ ...splitFormData, totalAmount: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={splitFormData.description}
                  onChange={(e) =>
                    setSplitFormData({ ...splitFormData, description: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="e.g., Grocery & Household Shopping"
                />
              </div>

              {/* Date */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={splitFormData.date}
                  onChange={(e) =>
                    setSplitFormData({ ...splitFormData, date: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Split Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`block text-sm font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Split Breakdown
                  </label>
                  <button
                    type="button"
                    onClick={addSplitItem}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                      darkMode
                        ? 'text-purple-400 hover:text-purple-300'
                        : 'text-purple-600 hover:text-purple-700'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Split
                  </button>
                </div>

                <div className="space-y-3">
                  {splitItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <select
                          required
                          value={item.category}
                          onChange={(e) => updateSplitItem(index, "category", e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-200 text-gray-900'
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
                          <option value="Household">Household</option>
                          <option value="Salary">Salary</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Investments">Investments</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.amount}
                          onChange={(e) => updateSplitItem(index, "amount", e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-200 text-gray-900'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {splitItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeSplitItem(index)}
                          className={`p-3 rounded-xl transition-colors ${
                            darkMode
                              ? 'text-red-400 hover:bg-red-900/20'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Remaining Amount Indicator */}
                {splitFormData.totalAmount && (
                  <div className={`mt-4 p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total:</span>
                      <span className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${parseFloat(splitFormData.totalAmount || "0").toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Allocated:</span>
                      <span className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${splitItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between text-sm mt-2 pt-2 border-t ${
                      darkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Remaining:</span>
                      <span className={`font-semibold ${
                        Math.abs(parseFloat(splitFormData.totalAmount || "0") - splitItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)) < 0.01
                          ? darkMode ? "text-green-400" : "text-green-600"
                          : darkMode ? "text-orange-400" : "text-orange-600"
                      }`}>
                        ${(parseFloat(splitFormData.totalAmount || "0") - splitItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Message */}
              <div className={`rounded-xl p-4 border ${
                darkMode
                  ? 'bg-purple-900/20 border-purple-800'
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <p className={`text-sm ${
                  darkMode ? 'text-purple-300' : 'text-purple-800'
                }`}>
                  This will create {splitItems.length} separate transactions with the same description and date. Make sure the split amounts add up to the total amount.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSplitModal(false)}
                  className={`flex-1 py-2.5 font-medium text-sm rounded-lg transition-all border ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {submitting ? "Creating..." : `Create ${splitItems.length} Transactions`}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {showReceiptViewer && viewingReceiptId && receiptImages[viewingReceiptId] && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => {
            setShowReceiptViewer(false);
            setViewingReceiptId(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-6 max-w-4xl w-full shadow-lg relative my-8 max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <Image className={`w-5 h-5 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <h2 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Receipt</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteReceipt(viewingReceiptId)}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode
                      ? 'text-red-400 hover:bg-red-900/20'
                      : 'text-red-500 hover:bg-red-50'
                  }`}
                  title="Delete receipt"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowReceiptViewer(false);
                    setViewingReceiptId(null);
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Image */}
            <div className={`max-h-[70vh] overflow-auto rounded-xl border ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <img
                src={receiptImages[viewingReceiptId]}
                alt="Receipt"
                className="w-full h-auto"
              />
            </div>

            {/* Download Button */}
            <div className="mt-4 flex justify-end">
              <a
                href={receiptImages[viewingReceiptId]}
                download={`receipt-${viewingReceiptId}.jpg`}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </a>
            </div>
          </motion.div>
        </div>
      )}

      {/* Currency Settings Modal */}
      {showCurrencySettings && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCurrencySettings(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Coins className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Currency Settings</h2>
              </div>
              <button
                onClick={() => setShowCurrencySettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Exchange Rates */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Exchange rates (1 USD equals)
              </p>
              {Object.entries(exchangeRates).map(([currency, rate]) => (
                <div key={currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900 w-16">{currency}</span>
                    <span className="text-2xl">{getCurrencySymbol(currency)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currency === "USD" ? (
                      <span className="text-gray-500 font-medium">1.00</span>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        value={rate}
                        onChange={(e) => {
                          const newRates = { ...exchangeRates, [currency]: parseFloat(e.target.value) || 0 };
                          setExchangeRates(newRates);
                          localStorage.setItem('exchangeRates', JSON.stringify(newRates));
                        }}
                        className="w-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium text-right"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                All transactions are stored in USD. When you add a transaction in another currency, it's automatically converted using these rates.
              </p>
            </div>

            {/* Close Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowCurrencySettings(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                Done
              </button>
            </div>
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
