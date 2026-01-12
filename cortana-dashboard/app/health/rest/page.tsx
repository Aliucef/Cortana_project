"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bed,
  Calendar,
  Heart,
  Activity,
  Wind,
  Footprints,
  Droplet,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  TrendingUp,
} from "lucide-react";
import { getRestDays, scheduleRestDay, deleteRestDay, RestDay } from "@/lib/health-api";
import { isAuthenticated } from "@/lib/api";

export default function RestPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const userId = 1;

  // Rest day calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [restDays, setRestDays] = useState<string[]>([]);
  const [restDayData, setRestDayData] = useState<RestDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Active recovery activities
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

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

  useEffect(() => {
    fetchRestDays();
  }, []);

  async function fetchRestDays() {
    try {
      setLoading(true);
      const data = await getRestDays(userId);
      setRestDayData(data);
      // Convert to date strings for calendar display
      setRestDays(data.map((rd: RestDay) => rd.rest_date));
    } catch (error) {
      console.error("Error fetching rest days:", error);
    } finally {
      setLoading(false);
    }
  }

  const recoveryActivities = [
    {
      id: "yoga",
      name: "Yoga Flow",
      icon: Activity,
      duration: "20-30 min",
      intensity: "Low",
      benefits: "Improves flexibility, reduces muscle tension, promotes relaxation",
      description: "Gentle yoga sequences focusing on stretching and breathing",
      color: "purple",
    },
    {
      id: "walk",
      name: "Light Walk",
      icon: Footprints,
      duration: "30-45 min",
      intensity: "Very Low",
      benefits: "Increases blood flow, aids recovery, clears the mind",
      description: "Easy-paced walk outdoors or on a treadmill",
      color: "green",
    },
    {
      id: "stretching",
      name: "Dynamic Stretching",
      icon: Wind,
      duration: "15-20 min",
      intensity: "Low",
      benefits: "Reduces soreness, improves mobility, prevents injury",
      description: "Full-body stretching routine targeting major muscle groups",
      color: "blue",
    },
    {
      id: "foam-rolling",
      name: "Foam Rolling",
      icon: Droplet,
      duration: "15-25 min",
      intensity: "Low-Medium",
      benefits: "Releases muscle knots, improves circulation, reduces DOMS",
      description: "Self-myofascial release using foam roller on tight areas",
      color: "orange",
    },
    {
      id: "swimming",
      name: "Light Swimming",
      icon: Droplet,
      duration: "20-30 min",
      intensity: "Low",
      benefits: "Low-impact cardio, full-body movement, joint-friendly",
      description: "Gentle swimming or water aerobics at comfortable pace",
      color: "cyan",
    },
    {
      id: "meditation",
      name: "Meditation",
      icon: Moon,
      duration: "10-20 min",
      intensity: "Minimal",
      benefits: "Reduces stress, improves focus, aids mental recovery",
      description: "Guided meditation or mindfulness breathing exercises",
      color: "indigo",
    },
  ];

  function getDaysInMonth(month: number, year: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number) {
    return new Date(year, month, 1).getDay();
  }

  function previousMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function isRestDay(dateStr: string) {
    return restDays.includes(dateStr);
  }

  async function toggleRestDay(dateStr: string) {
    if (isRestDay(dateStr)) {
      // Find and delete the rest day
      const restDay = restDayData.find((rd) => rd.rest_date === dateStr);
      if (restDay) {
        try {
          await deleteRestDay(restDay.id);
          await fetchRestDays(); // Refresh data
        } catch (error) {
          console.error("Error deleting rest day:", error);
        }
      }
    } else {
      // Schedule a new rest day
      try {
        await scheduleRestDay(userId, {
          rest_date: dateStr,
          is_scheduled: true,
        });
        await fetchRestDays(); // Refresh data
      } catch (error) {
        console.error("Error scheduling rest day:", error);
      }
    }
  }

  async function handleScheduleRestDay() {
    if (selectedDate && !isRestDay(selectedDate)) {
      try {
        await scheduleRestDay(userId, {
          rest_date: selectedDate,
          is_scheduled: true,
        });
        await fetchRestDays(); // Refresh data
      } catch (error) {
        console.error("Error scheduling rest day:", error);
      }
    }
    setShowScheduleModal(false);
    setSelectedDate("");
  }

  function completeActivity(activityId: string) {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities([...completedActivities, activityId]);
    }
  }

  function getRestDayStats() {
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const restDaysThisWeek = restDays.filter((dateStr) => {
      const date = new Date(dateStr);
      return date >= thisWeekStart && date <= today;
    }).length;

    const restDaysThisMonth = restDays.filter((dateStr) => {
      const date = new Date(dateStr);
      return date >= thisMonthStart && date <= today;
    }).length;

    // Calculate streak (consecutive rest days taken as scheduled)
    let streak = 0;
    const sortedRestDays = [...restDays].sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );

    for (const dateStr of sortedRestDays) {
      if (new Date(dateStr) <= today) {
        streak++;
      } else {
        break;
      }
    }

    return {
      thisWeek: restDaysThisWeek,
      thisMonth: restDaysThisMonth,
      streak,
      total: restDays.length,
    };
  }

  const stats = getRestDayStats();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div
      className="min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bed className="w-8 h-8 text-teal-600" />
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Rest & Recovery
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            className={`border rounded-lg p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This Week
              </span>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats.thisWeek}
            </p>
            <p className="text-sm text-gray-500 mt-1">Rest days</p>
          </div>

          <div
            className={`border rounded-lg p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This Month
              </span>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats.thisMonth}
            </p>
            <p className="text-sm text-gray-500 mt-1">Rest days</p>
          </div>

          <div
            className={`border rounded-lg p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Streak
              </span>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats.streak}
            </p>
            <p className="text-sm text-gray-500 mt-1">Days</p>
          </div>

          <div
            className={`border rounded-lg p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-red-600" />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Rest Days
              </span>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats.total}
            </p>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rest Day Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Rest Day Schedule
              </h2>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Rest Day
              </button>
            </div>

            <div
              className={`border rounded-lg p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={previousMonth}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <button
                  onClick={nextMonth}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map(
                  (_, index) => (
                    <div key={`empty-${index}`} />
                  )
                )}

                {/* Calendar days */}
                {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map(
                  (_, index) => {
                    const day = index + 1;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
                      2,
                      "0"
                    )}-${String(day).padStart(2, "0")}`;
                    const isRest = isRestDay(dateStr);
                    const isToday =
                      new Date().toDateString() === new Date(dateStr).toDateString();

                    return (
                      <button
                        key={day}
                        onClick={() => toggleRestDay(dateStr)}
                        className={`aspect-square p-2 border rounded-lg transition-all text-center ${
                          isToday
                            ? "border-blue-500 bg-blue-500/10"
                            : isRest
                            ? darkMode
                              ? "bg-teal-900/30 border-teal-500/50 hover:bg-teal-900/50"
                              : "bg-teal-50 border-teal-200 hover:bg-teal-100"
                            : darkMode
                            ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`text-sm font-medium ${
                            isRest
                              ? darkMode
                                ? "text-teal-400"
                                : "text-teal-700"
                              : darkMode
                              ? "text-gray-300"
                              : "text-gray-700"
                          }`}
                        >
                          {day}
                        </div>
                        {isRest && (
                          <Bed className="w-3 h-3 mx-auto mt-1 text-teal-600" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              <p
                className={`text-sm mt-4 text-center ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Click on a day to toggle rest day status
              </p>
            </div>
          </div>

          {/* Active Recovery Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Active Recovery Activities
              </h2>
            </div>

            <div className="space-y-4">
              {recoveryActivities.map((activity) => {
                const Icon = activity.icon;
                const isCompleted = completedActivities.includes(activity.id);

                return (
                  <div
                    key={activity.id}
                    className={`border rounded-lg p-5 transition-all ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`p-3 rounded-lg ${
                            activity.color === "purple"
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : activity.color === "green"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : activity.color === "blue"
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : activity.color === "orange"
                              ? "bg-orange-100 dark:bg-orange-900/30"
                              : activity.color === "cyan"
                              ? "bg-cyan-100 dark:bg-cyan-900/30"
                              : "bg-indigo-100 dark:bg-indigo-900/30"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${
                              activity.color === "purple"
                                ? "text-purple-600"
                                : activity.color === "green"
                                ? "text-green-600"
                                : activity.color === "blue"
                                ? "text-blue-600"
                                : activity.color === "orange"
                                ? "text-orange-600"
                                : activity.color === "cyan"
                                ? "text-cyan-600"
                                : "text-indigo-600"
                            }`}
                          />
                        </div>

                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-lg mb-1 ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {activity.name}
                          </h3>
                          <p
                            className={`text-sm mb-3 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {activity.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                darkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {activity.duration}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                darkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {activity.intensity}
                            </span>
                          </div>

                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <span className="font-medium">Benefits:</span>{" "}
                            {activity.benefits}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {isCompleted ? (
                          <button
                            disabled
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed opacity-75"
                          >
                            <Check className="w-4 h-4" />
                            Completed
                          </button>
                        ) : (
                          <button
                            onClick={() => completeActivity(activity.id)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              darkMode
                                ? "bg-teal-700 hover:bg-teal-600 text-white"
                                : "bg-teal-600 hover:bg-teal-700 text-white"
                            }`}
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedActivity(activity);
                            setShowActivityModal(true);
                          }}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            darkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                          }`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recovery Tips */}
        <div className="mt-8">
          <h2
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Recovery Tips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`border rounded-lg p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <Moon className="w-8 h-8 text-indigo-600 mb-3" />
              <h3
                className={`font-semibold text-lg mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Prioritize Sleep
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Aim for 7-9 hours of quality sleep. Sleep is when your body repairs and
                builds muscle tissue.
              </p>
            </div>

            <div
              className={`border rounded-lg p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <Droplet className="w-8 h-8 text-blue-600 mb-3" />
              <h3
                className={`font-semibold text-lg mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Stay Hydrated
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Drink plenty of water throughout the day. Proper hydration supports
                recovery and reduces muscle soreness.
              </p>
            </div>

            <div
              className={`border rounded-lg p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <Heart className="w-8 h-8 text-red-600 mb-3" />
              <h3
                className={`font-semibold text-lg mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Listen to Your Body
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Don't ignore pain or excessive fatigue. Rest days are just as important as
                training days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Rest Day Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Schedule Rest Day
                  </h2>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-gray-700/50" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Rest days are essential for muscle recovery and growth. Schedule
                      them strategically to optimize your training results.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowScheduleModal(false)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleScheduleRestDay}
                      disabled={!selectedDate}
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {showActivityModal && selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowActivityModal(false);
              setSelectedActivity(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        selectedActivity.color === "purple"
                          ? "bg-purple-100 dark:bg-purple-900/30"
                          : selectedActivity.color === "green"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : selectedActivity.color === "blue"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : selectedActivity.color === "orange"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : selectedActivity.color === "cyan"
                          ? "bg-cyan-100 dark:bg-cyan-900/30"
                          : "bg-indigo-100 dark:bg-indigo-900/30"
                      }`}
                    >
                      <selectedActivity.icon
                        className={`w-6 h-6 ${
                          selectedActivity.color === "purple"
                            ? "text-purple-600"
                            : selectedActivity.color === "green"
                            ? "text-green-600"
                            : selectedActivity.color === "blue"
                            ? "text-blue-600"
                            : selectedActivity.color === "orange"
                            ? "text-orange-600"
                            : selectedActivity.color === "cyan"
                            ? "text-cyan-600"
                            : "text-indigo-600"
                        }`}
                      />
                    </div>
                    <h2
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedActivity.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowActivityModal(false);
                      setSelectedActivity(null);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3
                      className={`text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Description
                    </h3>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedActivity.description}
                    </p>
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Duration
                    </h3>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedActivity.duration}
                    </p>
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Intensity
                    </h3>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedActivity.intensity}
                    </p>
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Benefits
                    </h3>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedActivity.benefits}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      completeActivity(selectedActivity.id);
                      setShowActivityModal(false);
                      setSelectedActivity(null);
                    }}
                    className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
