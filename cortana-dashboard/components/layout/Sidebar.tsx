"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  DollarSign,
  Dumbbell,
  Target,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAuthenticated } from "@/lib/api";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Workouts", href: "/health", icon: Dumbbell },
  { name: "AI Chat", href: "/chat", icon: MessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, [pathname]);

  useEffect(() => {
    // Sync with dark mode from localStorage
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    // Listen for dark mode changes
    const handleDarkModeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);
    return () => {
      window.removeEventListener("darkModeChange", handleDarkModeChange);
    };
  }, []);

  // Hide sidebar on login/signup pages or when not authenticated (AFTER all hooks)
  if (pathname === "/login" || pathname === "/signup" || !isAuth) {
    return null;
  }

  return (
    <aside className={`fixed left-0 top-0 h-screen w-16 border-r z-50 flex flex-col items-center py-6 overflow-hidden transition-colors duration-200 ${
      darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
    }`}>
      {/* Logo */}
      <Link href="/" className="mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Cortana Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "relative w-12 h-12 flex items-center justify-center rounded-lg transition-all group",
                  isActive
                    ? darkMode
                      ? "bg-gray-800 text-blue-400"
                      : "bg-gray-100 text-gray-900"
                    : darkMode
                    ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="w-5 h-5" />

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-600 rounded-r-full" />
                )}

                {/* Tooltip */}
                <div className={`absolute left-16 text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap ${
                  darkMode ? "bg-gray-800 text-white" : "bg-gray-900 text-white"
                }`}>
                  {item.name}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <Link href="/profile">
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all group relative ${
          pathname === "/profile"
            ? darkMode
              ? "bg-gray-800 text-blue-400"
              : "bg-gray-100 text-gray-900"
            : darkMode
            ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        }`}>
          <User className="w-5 h-5" />
          <div className={`absolute left-16 text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap ${
            darkMode ? "bg-gray-800 text-white" : "bg-gray-900 text-white"
          }`}>
            Profile
          </div>
        </div>
      </Link>
    </aside>
  );
}
