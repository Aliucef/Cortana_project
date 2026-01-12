"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Pages that don't need padding
  const noPaddingPages = ["/chat", "/login", "/signup"];
  const shouldHavePadding = !noPaddingPages.includes(pathname || "");

  // Reset scroll position when route changes
  useEffect(() => {
    // Immediate scroll
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    // Delayed scroll to ensure DOM has updated
    requestAnimationFrame(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    });

    // Backup timeout
    const timeoutId = setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    // Sync with dark mode from localStorage
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    // Listen for dark mode changes
    const handleDarkModeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);

      // Update document class for global dark mode
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);

    // Initialize on mount
    handleDarkModeChange();

    return () => {
      window.removeEventListener("darkModeChange", handleDarkModeChange);
    };
  }, []);

  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">
        {/* Main layout structure */}
        <div className={`min-h-screen transition-colors duration-200 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}>
          {/* Sidebar - Fixed left, no scroll */}
          <Sidebar />

          {/* Header - Fixed top */}
          <Header />

          {/* Main content area - with scroll */}
          <main ref={mainRef} className={`ml-16 mt-16 h-[calc(100vh-4rem)] overflow-y-auto transition-colors duration-200 ${
            darkMode ? "bg-gray-900" : "bg-gray-50"
          }`}>
            <div className={shouldHavePadding ? "p-6" : ""}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
