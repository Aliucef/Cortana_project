"use client";

import { FinanceProvider } from "./components/FinanceContext";
import SuccessToast from "./components/SuccessToast";
import { useState, useEffect } from "react";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <FinanceProvider>
      <div className={`min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        {/* Page Content */}
        <div className="container mx-auto px-6 py-8">{children}</div>

        {/* Success Toast */}
        <SuccessToast />
      </div>
    </FinanceProvider>
  );
}
