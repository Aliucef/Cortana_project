"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Flame,
  Award,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getWorkoutPlan,
  getWeightLogs,
  getWorkoutLogs,
  type WorkoutPlan,
  type WeightLog,
  type WorkoutLog,
} from "@/lib/api";

export default function HealthPage() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [plan, weights, workouts] = await Promise.all([
        getWorkoutPlan(1),
        getWeightLogs(1),
        getWorkoutLogs(1),
      ]);
      setWorkoutPlan(plan);
      setWeightLogs(weights);
      setWorkoutLogs(workouts);
    } catch (error) {
      console.error("Failed to load health data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats
  const latestWeight = weightLogs[0];
  const previousWeight = weightLogs[1];
  const weightChange =
    latestWeight && previousWeight
      ? latestWeight.weight_kg - previousWeight.weight_kg
      : 0;

  const workoutsThisWeek = workoutLogs.filter((log) => {
    const logDate = new Date(log.workout_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  }).length;

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const hasWorkout = workoutLogs.some((log) => {
      const logDate = new Date(log.workout_date);
      return logDate.toDateString() === checkDate.toDateString();
    });
    if (hasWorkout) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Prepare weight chart data
  const weightChartData = weightLogs
    .slice(0, 30)
    .reverse()
    .map((log) => ({
      date: new Date(log.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: log.weight_kg,
    }));

  // Prepare workout frequency data (last 7 days)
  const workoutFrequencyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const count = workoutLogs.filter((log) => {
      const logDate = new Date(log.workout_date);
      return logDate.toDateString() === date.toDateString();
    }).length;
    return { day: dateStr, workouts: count };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-gray-900 text-xl font-medium"
        >
          Loading your workout data...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Health & Fitness
        </h1>
        <p className="text-gray-600">Track your progress and stay motivated</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Current Weight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl border border-blue-200/50 rounded-3xl p-6 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-100/70 transition-all hover:scale-105"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl backdrop-blur-sm">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="px-3 py-1 bg-blue-100 rounded-full">
              <span className="text-blue-700 text-xs font-semibold">Weight</span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Current Weight
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {latestWeight ? `${latestWeight.weight_kg} kg` : "N/A"}
          </p>
          {weightChange !== 0 && (
            <div
              className={`flex items-center gap-1 mt-3 text-sm font-medium ${
                weightChange < 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {weightChange < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span>{Math.abs(weightChange).toFixed(1)} kg</span>
            </div>
          )}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl" />
        </motion.div>

        {/* Workouts This Week */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl border border-purple-200/50 rounded-3xl p-6 shadow-lg shadow-purple-100/50 hover:shadow-xl hover:shadow-purple-100/70 transition-all hover:scale-105"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl backdrop-blur-sm">
              <Dumbbell className="w-6 h-6 text-purple-600" />
            </div>
            <div className="px-3 py-1 bg-purple-100 rounded-full">
              <span className="text-purple-700 text-xs font-semibold">
                Weekly
              </span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Workouts This Week
          </h3>
          <p className="text-3xl font-bold text-gray-900">{workoutsThisWeek}</p>
          <p className="text-sm text-purple-600 font-medium mt-3">
            Keep it up!
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl" />
        </motion.div>

        {/* Current Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-xl border border-orange-200/50 rounded-3xl p-6 shadow-lg shadow-orange-100/50 hover:shadow-xl hover:shadow-orange-100/70 transition-all hover:scale-105"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl backdrop-blur-sm">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div className="px-3 py-1 bg-orange-100 rounded-full">
              <span className="text-orange-700 text-xs font-semibold">
                Streak
              </span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Current Streak
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {currentStreak} days
          </p>
          <p className="text-sm text-orange-600 font-medium mt-3">
            {currentStreak > 0 ? "Amazing!" : "Start today!"}
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl" />
        </motion.div>

        {/* Total Workouts */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl border border-green-200/50 rounded-3xl p-6 shadow-lg shadow-green-100/50 hover:shadow-xl hover:shadow-green-100/70 transition-all hover:scale-105"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-2xl backdrop-blur-sm">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="px-3 py-1 bg-green-100 rounded-full">
              <span className="text-green-700 text-xs font-semibold">
                All Time
              </span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Total Workouts
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {workoutLogs.length}
          </p>
          <p className="text-sm text-green-600 font-medium mt-3">
            Great work!
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl" />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weight Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            Weight Progress (30 Days)
          </h3>
          {weightChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No weight data available
            </div>
          )}
        </motion.div>

        {/* Workout Frequency Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            Workout Frequency (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="day"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="workouts" fill="#A855F7" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Workout Plan */}
      {workoutPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-lg shadow-gray-100/50"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h3 className="text-3xl font-bold mb-2 text-gray-900">
                Your Workout Plan
              </h3>
              <p className="text-gray-600 font-medium">
                Goal: <span className="text-purple-600">{workoutPlan.goal}</span>{" "}
                • {workoutPlan.duration_weeks} weeks
              </p>
            </div>
            <div className="flex gap-2 bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-200/50 shadow-sm">
              {Array.from({ length: workoutPlan.duration_weeks }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedWeek(i + 1)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    selectedWeek === i + 1
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Week {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutPlan.plan_data.weeks
              .find((w) => w.week_number === selectedWeek)
              ?.days.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.8 + index * 0.05,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="bg-gradient-to-br from-gray-50 to-blue-50/30 border border-gray-200/50 rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-100/50 transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg text-gray-900">
                      {day.day_name}
                    </h4>
                    <div className="px-3 py-1 bg-purple-100 rounded-full">
                      <span className="text-purple-700 text-xs font-semibold">
                        Day {day.day_number}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {day.exercises.map((exercise, exIndex) => (
                      <div
                        key={exIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <div className="p-1 bg-purple-100 rounded-lg mt-0.5">
                          <ChevronRight className="w-3 h-3 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-semibold">
                            {exercise.name}
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5">
                            {exercise.sets} sets × {exercise.reps}
                            {exercise.rest && ` • Rest: ${exercise.rest}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {!workoutPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-12 text-center shadow-lg shadow-gray-100/50"
        >
          <div className="p-4 bg-gray-100 rounded-3xl w-fit mx-auto mb-6">
            <Dumbbell className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">
            No Workout Plan Yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Generate a personalized workout plan to get started on your fitness
            journey
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-purple-200 hover:shadow-xl transition-all hover:scale-105">
            Generate Workout Plan
          </button>
        </motion.div>
      )}
    </div>
  );
}
