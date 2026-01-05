"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Flame,
  Target,
  Activity,
  Clock,
  Weight,
  X,
  Timer,
  PlayCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import { getWorkoutStats } from "@/lib/health-api";
import Link from "next/link";

export default function HealthDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userId = 1; // Replace with actual user ID from auth

  // Workout Timer state
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerMode, setTimerMode] = useState("exercise"); // exercise, rest, interval
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<any>(null);
  const [intervalSets, setIntervalSets] = useState(8);
  const [intervalWork, setIntervalWork] = useState(40);
  const [intervalRest, setIntervalRest] = useState(20);
  const [currentInterval, setCurrentInterval] = useState(1);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    const handleDarkModeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);

    // Load stats
    loadStats();

    return () => {
      window.removeEventListener("darkModeChange", handleDarkModeChange);
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const response = await getWorkoutStats(userId);
      setStats(response);
    } catch (error) {
      console.error("Failed to load workout stats:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate weekly progress percentage
  const weeklyProgress =
    stats && stats.totalThisWeek > 0
      ? (stats.completedThisWeek / stats.totalThisWeek) * 100
      : 0;

  // Workout Timer Functions
  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function startTimer() {
    setTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 0) {
          // Timer finished - play alert
          playTimerAlert();
          if (timerMode === "interval") {
            // Handle interval mode
            if (isWorkPhase) {
              // Switch to rest
              setIsWorkPhase(false);
              return intervalRest;
            } else {
              // Switch to work and increment set
              setIsWorkPhase(true);
              const nextInterval = currentInterval + 1;
              if (nextInterval > intervalSets) {
                // Workout complete
                pauseTimer();
                alert("Interval workout complete!");
                return 0;
              }
              setCurrentInterval(nextInterval);
              return intervalWork;
            }
          } else {
            // Exercise or rest timer finished
            pauseTimer();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  }

  function pauseTimer() {
    setTimerRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }

  function resetTimer() {
    pauseTimer();
    setTimerSeconds(0);
    setLaps([]);
    if (timerMode === "interval") {
      setCurrentInterval(1);
      setIsWorkPhase(true);
      setTimerSeconds(intervalWork);
    }
  }

  function addLap() {
    setLaps([...laps, timerSeconds]);
  }

  function setPresetTime(seconds: number) {
    setTimerSeconds(seconds);
  }

  function playTimerAlert() {
    // Simple beep using Audio API
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.2);
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  function openTimerModal(mode: string = "exercise") {
    setTimerMode(mode);
    if (mode === "exercise") {
      setTimerSeconds(60);
    } else if (mode === "rest") {
      setTimerSeconds(60);
    } else if (mode === "interval") {
      setTimerSeconds(intervalWork);
      setCurrentInterval(1);
      setIsWorkPhase(true);
    }
    setTimerRunning(false);
    setLaps([]);
    setShowTimerModal(true);
  }

  function closeTimerModal() {
    pauseTimer();
    setShowTimerModal(false);
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Loading workout data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 pt-24 px-6 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-blue-600" />
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Workout Dashboard
            </h1>
          </div>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-xl p-6 mb-8 ${
            darkMode
              ? "bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-700"
              : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome back! Ready to crush your goals?
          </h2>
          <p
            className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Track your progress, access your workout timer, and explore detailed pages
            for workouts, history, goals, and more.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Workouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              darkMode
                ? "bg-gray-800 border-gray-700 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/10"
                : "bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  darkMode ? "bg-blue-900/30" : "bg-blue-50"
                }`}
              >
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                ALL TIME
              </span>
            </div>
            <h3
              className={`text-sm mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Total Workouts
            </h3>
            <p
              className={`text-2xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats?.totalWorkouts || 0}
            </p>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              darkMode
                ? "bg-gray-800 border-gray-700 hover:border-orange-600/50 hover:shadow-lg hover:shadow-orange-500/10"
                : "bg-white border-gray-200 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  darkMode ? "bg-orange-900/30" : "bg-orange-50"
                }`}
              >
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                STREAK
              </span>
            </div>
            <h3
              className={`text-sm mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Current Streak
            </h3>
            <p
              className={`text-2xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats?.currentStreak || 0} days
            </p>
          </motion.div>

          {/* Weekly Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              darkMode
                ? "bg-gray-800 border-gray-700 hover:border-green-600/50 hover:shadow-lg hover:shadow-green-500/10"
                : "bg-white border-gray-200 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  darkMode ? "bg-green-900/30" : "bg-green-50"
                }`}
              >
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                THIS WEEK
              </span>
            </div>
            <h3
              className={`text-sm mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Weekly Progress
            </h3>
            <p
              className={`text-2xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats?.completedThisWeek || 0}/{stats?.totalThisWeek || 0}
            </p>
            <div className="mt-3">
              <div
                className={`w-full rounded-full h-1.5 overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div
                  className="h-1.5 rounded-full bg-green-500 transition-all"
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
              <p
                className={`text-xs mt-1.5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {weeklyProgress.toFixed(0)}% complete
              </p>
            </div>
          </motion.div>

          {/* Current Weight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              darkMode
                ? "bg-gray-800 border-gray-700 hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-500/10"
                : "bg-white border-gray-200 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  darkMode ? "bg-purple-900/30" : "bg-purple-50"
                }`}
              >
                <Weight className="w-5 h-5 text-purple-600" />
              </div>
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                WEIGHT
              </span>
            </div>
            <h3
              className={`text-sm mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Current Weight
            </h3>
            <p
              className={`text-2xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats?.currentWeight || 0} kg
            </p>
            {stats?.weightChange !== 0 && stats?.weightChange && (
              <p
                className={`text-xs mt-1 font-medium ${
                  stats.weightChange > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.weightChange > 0 ? "+" : ""}
                {stats.weightChange.toFixed(1)} kg
              </p>
            )}
          </motion.div>
        </div>

        {/* Workout Timer Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Exercise Timer Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => openTimerModal("exercise")}
              className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
                darkMode
                  ? "bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700 hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/20"
                  : "bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-purple-900/50" : "bg-purple-200"
                  }`}
                >
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <PlayCircle
                  className={`w-5 h-5 ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Exercise Timer
              </h3>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-purple-300" : "text-purple-700"
                }`}
              >
                Time your exercises & sets
              </p>
            </motion.div>

            {/* Rest Timer Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => openTimerModal("rest")}
              className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
                darkMode
                  ? "bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/20"
                  : "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-blue-900/50" : "bg-blue-200"
                  }`}
                >
                  <Timer className="w-6 h-6 text-blue-600" />
                </div>
                <PlayCircle
                  className={`w-5 h-5 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Rest Timer
              </h3>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-blue-300" : "text-blue-700"
                }`}
              >
                Track rest between sets
              </p>
            </motion.div>

            {/* HIIT Timer Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => openTimerModal("interval")}
              className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
                darkMode
                  ? "bg-gradient-to-br from-orange-900/40 to-orange-800/20 border-orange-700 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
                  : "bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-orange-900/50" : "bg-orange-200"
                  }`}
                >
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <PlayCircle
                  className={`w-5 h-5 ${
                    darkMode ? "text-orange-400" : "text-orange-600"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                HIIT Timer
              </h3>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-orange-300" : "text-orange-700"
                }`}
              >
                Interval training workouts
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Links to Other Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Explore More
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/health/workouts">
              <div
                className={`border rounded-xl p-6 transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:border-blue-600"
                    : "bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Dumbbell
                    className={`w-6 h-6 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <ArrowRight
                    className={`w-5 h-5 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3
                  className={`font-semibold mb-1 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Workouts
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  View this week&apos;s scheduled workouts
                </p>
              </div>
            </Link>

            <Link href="/health/history">
              <div
                className={`border rounded-xl p-6 transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:border-purple-600"
                    : "bg-white border-gray-200 hover:border-purple-500 hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Activity
                    className={`w-6 h-6 ${
                      darkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                  <ArrowRight
                    className={`w-5 h-5 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3
                  className={`font-semibold mb-1 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  History
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Browse your workout history
                </p>
              </div>
            </Link>

            <Link href="/health/goals">
              <div
                className={`border rounded-xl p-6 transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:border-green-600"
                    : "bg-white border-gray-200 hover:border-green-500 hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Target
                    className={`w-6 h-6 ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <ArrowRight
                    className={`w-5 h-5 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3
                  className={`font-semibold mb-1 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Goals
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Track your fitness goals
                </p>
              </div>
            </Link>

            <Link href="/health/progress">
              <div
                className={`border rounded-xl p-6 transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:border-orange-600"
                    : "bg-white border-gray-200 hover:border-orange-500 hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Flame
                    className={`w-6 h-6 ${
                      darkMode ? "text-orange-400" : "text-orange-600"
                    }`}
                  />
                  <ArrowRight
                    className={`w-5 h-5 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3
                  className={`font-semibold mb-1 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Progress
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  View charts and measurements
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Workout Timer Modal */}
      {showTimerModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeTimerModal();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-6 max-w-md w-full shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Timer className="w-6 h-6 text-purple-500" />
                Workout Timer
              </h2>
              <button
                onClick={closeTimerModal}
                className={`p-2 rounded-lg transition-all ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X
                  className={`w-5 h-5 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            {/* Timer Mode Selection */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  resetTimer();
                  openTimerModal("exercise");
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timerMode === "exercise"
                    ? "bg-purple-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Exercise
              </button>
              <button
                onClick={() => {
                  resetTimer();
                  openTimerModal("rest");
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timerMode === "rest"
                    ? "bg-purple-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Rest
              </button>
              <button
                onClick={() => {
                  resetTimer();
                  openTimerModal("interval");
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timerMode === "interval"
                    ? "bg-purple-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                HIIT
              </button>
            </div>

            {/* Timer Display */}
            <div
              className={`rounded-xl p-8 mb-6 ${
                darkMode
                  ? "bg-gradient-to-br from-purple-900/50 to-pink-900/50"
                  : "bg-gradient-to-br from-purple-100 to-pink-100"
              }`}
            >
              <div className="text-center">
                <p
                  className={`text-6xl font-bold tracking-wider ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatTime(timerSeconds)}
                </p>
                {timerMode === "interval" && (
                  <div className="mt-4">
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Set {currentInterval} / {intervalSets}
                    </p>
                    <p
                      className={`text-lg font-bold mt-1 ${
                        isWorkPhase ? "text-green-500" : "text-orange-500"
                      }`}
                    >
                      {isWorkPhase ? "WORK" : "REST"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Interval Settings */}
            {timerMode === "interval" && !timerRunning && (
              <div
                className={`border rounded-lg p-4 mb-6 ${
                  darkMode
                    ? "border-gray-600 bg-gray-700/30"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <h3
                  className={`text-sm font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  HIIT Settings
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      className={`block text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Sets
                    </label>
                    <input
                      type="number"
                      value={intervalSets}
                      onChange={(e) =>
                        setIntervalSets(parseInt(e.target.value) || 1)
                      }
                      className={`w-full px-2 py-1.5 text-sm border rounded ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Work (s)
                    </label>
                    <input
                      type="number"
                      value={intervalWork}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setIntervalWork(val);
                        if (isWorkPhase) setTimerSeconds(val);
                      }}
                      className={`w-full px-2 py-1.5 text-sm border rounded ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Rest (s)
                    </label>
                    <input
                      type="number"
                      value={intervalRest}
                      onChange={(e) =>
                        setIntervalRest(parseInt(e.target.value) || 1)
                      }
                      className={`w-full px-2 py-1.5 text-sm border rounded ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preset Times (Exercise/Rest mode) */}
            {timerMode !== "interval" && !timerRunning && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[30, 60, 90, 120].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => setPresetTime(seconds)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                    }`}
                  >
                    {formatTime(seconds)}
                  </button>
                ))}
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!timerRunning ? (
                <button
                  onClick={startTimer}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                  </svg>
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Reset
              </button>
              {timerMode === "exercise" && timerRunning && (
                <button
                  onClick={addLap}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Lap
                </button>
              )}
            </div>

            {/* Laps */}
            {laps.length > 0 && (
              <div
                className={`mt-4 border rounded-lg p-3 max-h-32 overflow-y-auto ${
                  darkMode
                    ? "border-gray-600 bg-gray-700/30"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <h4
                  className={`text-xs font-semibold mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Laps
                </h4>
                <div className="space-y-1">
                  {laps.map((lapTime, index) => (
                    <div
                      key={index}
                      className={`flex justify-between text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span>Lap {index + 1}</span>
                      <span className="font-mono">{formatTime(lapTime)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
