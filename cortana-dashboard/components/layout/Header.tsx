"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, User, Dumbbell, History, Plus, BookOpen, Target, TrendingUp, Bed, BarChart3, LayoutDashboard, Receipt, Repeat, DollarSign, LogOut } from "lucide-react";
import { clearAuth, getCurrentUser } from "@/lib/api";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHealthPage = pathname?.startsWith("/health");
  const isFinancePage = pathname?.startsWith("/finance");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Sync with dark mode from localStorage
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    // Listen for dark mode changes
    const handleStorage = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("storage", handleStorage);
    // Also listen for custom dark mode event
    window.addEventListener("darkModeToggle", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("darkModeToggle", handleStorage);
    };
  }, []);

  // Navigate to health sub-pages
  const navigateTo = (path: string) => {
    router.push(path);
  };

  const isActivePage = (path: string) => pathname === path;

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  // Hide header on login/signup pages (AFTER all hooks)
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <header className={`fixed top-0 left-16 right-0 h-16 border-b z-40 transition-colors duration-200 ${
      darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
    }`}>
      <div className="h-full px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <h1 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            CORTANA
          </h1>
          <span className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Personal AI Assistant
          </span>
        </div>

        {/* Finance Page Navigation */}
        {isFinancePage && (
          <nav className="flex items-center gap-2 flex-1 justify-center max-w-4xl mx-8">
            <button
              onClick={() => navigateTo("/finance/dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/finance/dashboard")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Finance Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => navigateTo("/finance/transactions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/finance/transactions")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Transactions"
            >
              <Receipt className="w-3.5 h-3.5" />
              Transactions
            </button>
            <button
              onClick={() => navigateTo("/finance/budget-goals")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/finance/budget-goals")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Budget & Goals"
            >
              <Target className="w-3.5 h-3.5" />
              Budget & Goals
            </button>
            <button
              onClick={() => navigateTo("/finance/recurring")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/finance/recurring")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Recurring Expenses"
            >
              <Repeat className="w-3.5 h-3.5" />
              Recurring
            </button>
          </nav>
        )}

        {/* Health Page Navigation */}
        {isHealthPage && (
          <nav className="flex items-center gap-2 flex-1 justify-center max-w-4xl mx-8">
            <button
              onClick={() => navigateTo("/health")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/health")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Overview & Stats"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Overview
            </button>
            <button
              onClick={() => navigateTo("/health/workouts")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/health/workouts")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Today's Workouts"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              Workouts
            </button>
            <button
              onClick={() => navigateTo("/health/history")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/health/history")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Workout History"
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
            <button
              onClick={() => navigateTo("/health/create")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/health/create")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Create Custom Workout"
            >
              <Plus className="w-3.5 h-3.5" />
              Create
            </button>
            <button
              onClick={() => navigateTo("/health/library")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/health/library")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Exercise Library"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Library
            </button>
            <button
              onClick={() => navigateTo("/health/goals")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/health/goals")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Fitness Goals"
            >
              <Target className="w-3.5 h-3.5" />
              Goals
            </button>
            <button
              onClick={() => navigateTo("/health/progress")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/health/progress")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Progress Tracking"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Progress
            </button>
            <button
              onClick={() => navigateTo("/health/rest")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActivePage("/health/rest")
                  ? darkMode
                    ? "bg-blue-900 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Rest Days"
            >
              <Bed className="w-3.5 h-3.5" />
              Rest
            </button>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}>
            <Bell className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* User Profile */}
          <button
            onClick={() => navigateTo("/profile")}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              pathname === "/profile"
                ? darkMode
                  ? "bg-blue-900 text-blue-400"
                  : "bg-blue-100 text-blue-600"
                : darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
            title="Profile & Settings"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              darkMode
                ? "bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-400"
                : "bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600"
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
