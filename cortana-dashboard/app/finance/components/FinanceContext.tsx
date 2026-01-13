"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  getFinanceSummary,
  getFinanceRecords,
  getBudget,
  getCategoryGoals,
  getRecurringExpenses,
  type FinanceSummary,
  type FinanceRecord,
  type Budget,
  type CategoryGoal,
  type RecurringExpense,
} from "@/lib/api";

interface FinanceContextType {
  // User & Settings
  userId: number;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Period Selection
  period: "weekly" | "monthly" | "custom";
  setPeriod: (period: "weekly" | "monthly" | "custom") => void;
  customStartDate: string;
  customEndDate: string;
  setCustomStartDate: (date: string) => void;
  setCustomEndDate: (date: string) => void;

  // Core Data
  summary: FinanceSummary | null;
  records: FinanceRecord[];
  budget: Budget | null;
  categoryGoals: CategoryGoal[];
  recurringExpenses: RecurringExpense[];

  // Loading & Refresh
  loading: boolean;
  loadData: () => Promise<void>;

  // Notifications
  showSuccessToast: boolean;
  successMessage: { title: string; subtitle: string };
  setSuccessMessage: (msg: { title: string; subtitle: string }) => void;
  setShowSuccessToast: (show: boolean) => void;

  // Multi-currency
  exchangeRates: Record<string, number>;
  transactionCurrencies: Record<number, { currency: string; originalAmount: number }>;
  setTransactionCurrencies: (currencies: Record<number, { currency: string; originalAmount: number }>) => void;
  convertToUSD: (amount: number, currency: string) => number;
  getCurrencySymbol: (currency: string) => string;

  // Receipt management
  receiptImages: Record<number, string>;
  setReceiptImages: (images: Record<number, string>) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const userId = 1; // Default user ID

  // Period state
  const [period, setPeriod] = useState<"weekly" | "monthly" | "custom">("monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Core data state
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categoryGoals, setCategoryGoals] = useState<CategoryGoal[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", subtitle: "" });

  // Multi-currency state
  const [exchangeRates] = useState<Record<string, number>>({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    LBP: 89500, // Lebanese Pound
    AED: 3.67, // UAE Dirham
    SAR: 3.75, // Saudi Riyal
  });
  const [transactionCurrencies, setTransactionCurrencies] = useState<
    Record<number, { currency: string; originalAmount: number }>
  >({});

  // Receipt state
  const [receiptImages, setReceiptImages] = useState<Record<number, string>>({});

  // Load data on mount and when period changes
  useEffect(() => {
    loadData();
  }, [period, customStartDate, customEndDate]);

  // Load saved currencies and receipts from localStorage
  useEffect(() => {
    const savedCurrencies = localStorage.getItem("transactionCurrencies");
    const savedReceipts = localStorage.getItem("receiptImages");
    const savedDarkMode = localStorage.getItem("darkMode");

    if (savedCurrencies) {
      setTransactionCurrencies(JSON.parse(savedCurrencies));
    }
    if (savedReceipts) {
      setReceiptImages(JSON.parse(savedReceipts));
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Sync with global dark mode changes
  useEffect(() => {
    const handleDarkModeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);
    return () => {
      window.removeEventListener("darkModeChange", handleDarkModeChange);
    };
  }, []);

  // Save dark mode to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  async function loadData() {
    setLoading(true);
    try {
      const [summaryData, recordsData, budgetData, goalsData, recurringData] = await Promise.all([
        getFinanceSummary(
          period,
          period === "custom" ? customStartDate : undefined,
          period === "custom" ? customEndDate : undefined
        ),
        getFinanceRecords(),
        getBudget(),
        getCategoryGoals(),
        getRecurringExpenses(),
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

  function toggleDarkMode() {
    setDarkMode((prev) => !prev);
  }

  function convertToUSD(amount: number, currency: string): number {
    if (currency === "USD") return amount;
    const rate = exchangeRates[currency];
    if (!rate) return amount;
    return amount / rate;
  }

  function getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      LBP: "ل.ل",
      AED: "د.إ",
      SAR: "ر.س",
    };
    return symbols[currency] || currency;
  }

  const value: FinanceContextType = {
    userId,
    darkMode,
    toggleDarkMode,
    period,
    setPeriod,
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate,
    summary,
    records,
    budget,
    categoryGoals,
    recurringExpenses,
    loading,
    loadData,
    showSuccessToast,
    successMessage,
    setSuccessMessage,
    setShowSuccessToast,
    exchangeRates,
    transactionCurrencies,
    setTransactionCurrencies,
    convertToUSD,
    getCurrencySymbol,
    receiptImages,
    setReceiptImages,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
