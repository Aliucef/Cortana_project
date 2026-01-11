"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Cortana3D from "@/components/dashboard/Cortana3D";
import { StatCard } from "@/components/ui/GlassCard";
import {
  DollarSign,
  Dumbbell,
  Target,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Activity,
  Wallet,
  Clock,
  Receipt,
  Calendar,
} from "lucide-react";
import { getDashboardOverview, type DashboardOverview } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode listener
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    const handleDarkModeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);
    return () =>
      window.removeEventListener("darkModeChange", handleDarkModeChange);
  }, []);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    setLoading(true);
    try {
      const data = await getDashboardOverview(1);
      setOverview(data);
    } catch (error) {
      console.error("Failed to load overview:", error);
    } finally {
      setLoading(false);
    }
  }

  // Mock recent activity data - you can replace this with real API data later
  const recentActivities = [
    {
      type: "expense",
      description: "Grocery shopping",
      amount: "$45.20",
      time: "2 hours ago",
      icon: Receipt,
      color: "red",
    },
    {
      type: "workout",
      description: "Completed chest & triceps workout",
      time: "5 hours ago",
      icon: Dumbbell,
      color: "purple",
    },
    {
      type: "expense",
      description: "Coffee at Starbucks",
      amount: "$5.80",
      time: "Yesterday",
      icon: Receipt,
      color: "red",
    },
    {
      type: "chat",
      description: "Asked about budget recommendations",
      time: "Yesterday",
      icon: MessageCircle,
      color: "blue",
    },
  ];

  return (
    <div className={`min-h-screen pt-24 pb-16 transition-colors duration-200 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className={`text-3xl font-semibold mb-1 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Welcome back, Chief
          </h1>
          <p className={`text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            Here's your overview for today
          </p>
        </motion.div>

        {/* Cortana 3D Visualization */}
        <Cortana3D />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <StatCard
            label="This Month's Spending"
            value={loading ? "Loading..." : `$${overview?.finance.total_expenses.toFixed(2) || "0.00"}`}
            change={-15}
            icon={<DollarSign className="w-5 h-5 text-blue-600" />}
            trend="down"
            delay={0.1}
          />

          <StatCard
            label="Workouts This Week"
            value={loading ? "Loading..." : `${overview?.health.workouts_this_week || 0}`}
            change={25}
            icon={<Dumbbell className="w-5 h-5 text-green-600" />}
            trend="up"
            delay={0.2}
          />

          <StatCard
            label="Current Weight"
            value={loading ? "Loading..." : overview?.health.current_weight ? `${overview.health.current_weight} kg` : "N/A"}
            change={12}
            icon={<Target className="w-5 h-5 text-purple-600" />}
            trend="up"
            delay={0.3}
          />

          <StatCard
            label="Net Balance"
            value={loading ? "Loading..." : `$${overview?.finance.net_balance.toFixed(2) || "0.00"}`}
            change={0}
            icon={<TrendingUp className="w-5 h-5 text-gray-600" />}
            trend="neutral"
            delay={0.4}
          />
        </div>

        {/* Quick Action Cards */}
        <div className="mt-8">
          <h2 className={`text-xl font-semibold mb-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Finance Card */}
            <div
              onClick={() => router.push("/finance/dashboard")}
              className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    darkMode ? "bg-green-900/30" : "bg-green-50"
                  }`}>
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Finance
                  </h3>
                </div>
                <ArrowRight className={`w-5 h-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`} />
              </div>
              <p className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Track expenses, manage budgets, and view spending goals
              </p>
            </div>

            {/* Health Card */}
            <div
              onClick={() => router.push("/health")}
              className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    darkMode ? "bg-purple-900/30" : "bg-purple-50"
                  }`}>
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Health & Fitness
                  </h3>
                </div>
                <ArrowRight className={`w-5 h-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`} />
              </div>
              <p className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                View workout plans, track progress, and log exercises
              </p>
            </div>

            {/* AI Chat Card */}
            <div
              onClick={() => router.push("/chat")}
              className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    darkMode ? "bg-blue-900/30" : "bg-blue-50"
                  }`}>
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    AI Chat
                  </h3>
                </div>
                <ArrowRight className={`w-5 h-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`} />
              </div>
              <p className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Chat with Cortana for personalized assistance and insights
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className={`text-xl font-semibold mb-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Recent Activity
          </h2>
          <div className={`border rounded-lg ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}>
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 ${
                    index !== recentActivities.length - 1
                      ? darkMode
                        ? "border-b border-gray-700"
                        : "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.color === "red"
                        ? darkMode
                          ? "bg-red-900/30"
                          : "bg-red-50"
                        : activity.color === "purple"
                        ? darkMode
                          ? "bg-purple-900/30"
                          : "bg-purple-50"
                        : darkMode
                        ? "bg-blue-900/30"
                        : "bg-blue-50"
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        activity.color === "red"
                          ? "text-red-600"
                          : activity.color === "purple"
                          ? "text-purple-600"
                          : "text-blue-600"
                      }`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className={`w-3 h-3 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`} />
                        <p className={`text-xs ${
                          darkMode ? "text-gray-500" : "text-gray-500"
                        }`}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className={`text-sm font-semibold ${
                      darkMode ? "text-red-400" : "text-red-600"
                    }`}>
                      {activity.amount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
