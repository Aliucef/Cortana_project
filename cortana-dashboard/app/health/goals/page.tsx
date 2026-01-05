"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  Scale,
  Calendar,
  Dumbbell,
  Trophy,
  TrendingUp,
  X,
  Trash2,
} from "lucide-react";
import { getWorkoutStats } from "@/lib/health-api";

export default function GoalsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const userId = 1;

  // Goals state
  const [fitnessGoals, setFitnessGoals] = useState<any[]>([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalType, setGoalType] = useState("weight"); // weight, frequency, strength
  const [weightGoalTarget, setWeightGoalTarget] = useState("");
  const [weightGoalType, setWeightGoalType] = useState("lose"); // lose, gain
  const [goalDeadline, setGoalDeadline] = useState("");
  const [frequencyGoalTarget, setFrequencyGoalTarget] = useState(4);
  const [strengthGoalExercise, setStrengthGoalExercise] = useState("");
  const [strengthGoalTarget, setStrengthGoalTarget] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    const handleDarkModeToggle = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeToggle", handleDarkModeToggle);
    return () => window.removeEventListener("darkModeToggle", handleDarkModeToggle);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const statsData = await getWorkoutStats(userId);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetGoalsForm() {
    setGoalType("weight");
    setWeightGoalTarget("");
    setWeightGoalType("lose");
    setGoalDeadline("");
    setFrequencyGoalTarget(4);
    setStrengthGoalExercise("");
    setStrengthGoalTarget("");
  }

  function handleSaveGoal() {
    let newGoal: any = {
      id: Date.now(),
      type: goalType,
      createdAt: new Date().toISOString(),
    };

    if (goalType === "weight") {
      if (!weightGoalTarget || !goalDeadline) {
        alert("Please fill in all weight goal fields");
        return;
      }
      newGoal = {
        ...newGoal,
        targetWeight: parseFloat(weightGoalTarget),
        currentWeight: stats?.currentWeight || 0,
        goalType: weightGoalType,
        deadline: goalDeadline,
      };
    } else if (goalType === "frequency") {
      newGoal = {
        ...newGoal,
        targetFrequency: frequencyGoalTarget,
        currentFrequency: stats?.completedThisWeek || 0,
      };
    } else if (goalType === "strength") {
      if (!strengthGoalExercise || !strengthGoalTarget) {
        alert("Please fill in all strength goal fields");
        return;
      }
      newGoal = {
        ...newGoal,
        exercise: strengthGoalExercise,
        targetWeight: parseFloat(strengthGoalTarget),
        currentWeight: 0,
      };
    }

    setFitnessGoals([...fitnessGoals, newGoal]);
    setShowGoalsModal(false);
    resetGoalsForm();
  }

  function deleteGoal(goalId: number) {
    if (confirm("Are you sure you want to delete this goal?")) {
      setFitnessGoals(fitnessGoals.filter((g) => g.id !== goalId));
    }
  }

  function calculateGoalProgress(goal: any) {
    if (goal.type === "weight") {
      const start = goal.currentWeight;
      const target = goal.targetWeight;
      const current = stats?.currentWeight || start;
      const totalChange = Math.abs(target - start);
      const currentChange = Math.abs(current - start);
      return Math.min((currentChange / totalChange) * 100, 100);
    } else if (goal.type === "frequency") {
      return Math.min(((stats?.completedThisWeek || 0) / goal.targetFrequency) * 100, 100);
    } else if (goal.type === "strength") {
      return Math.min((goal.currentWeight / goal.targetWeight) * 100, 100);
    }
    return 0;
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-200 pt-24 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading goals...
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
            <Target className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Fitness Goals
            </h1>
          </div>
          <button
            onClick={() => setShowGoalsModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Set New Goal
          </button>
        </div>

        {/* Goals Grid */}
        {fitnessGoals.length === 0 ? (
          <div className={`border rounded-lg p-12 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <Target className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"} opacity-50`} />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              No goals set yet
            </h3>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
              Define your fitness objectives to track your progress
            </p>
            <button
              onClick={() => setShowGoalsModal(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fitnessGoals.map((goal, index) => {
              const progress = calculateGoalProgress(goal);
              const isCompleted = progress >= 100;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-lg p-5 ${
                    darkMode
                      ? isCompleted
                        ? "bg-green-900/20 border-green-500/30"
                        : "bg-gray-800 border-gray-700"
                      : isCompleted
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Goal Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {goal.type === "weight" && <Scale className={`w-5 h-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />}
                      {goal.type === "frequency" && <Calendar className={`w-5 h-5 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />}
                      {goal.type === "strength" && <Dumbbell className={`w-5 h-5 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />}
                      <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {goal.type === "weight" && `${goal.goalType === "lose" ? "Lose" : "Gain"} Weight`}
                        {goal.type === "frequency" && "Workout Frequency"}
                        {goal.type === "strength" && "Strength Milestone"}
                      </h3>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className={`p-1.5 rounded transition-all ${
                        darkMode
                          ? "hover:bg-red-500/20 text-red-400"
                          : "hover:bg-red-50 text-red-600"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Goal Details */}
                  <div className="space-y-2 mb-4">
                    {goal.type === "weight" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Target:</span>
                          <span className={darkMode ? "text-white" : "text-gray-900"}>{goal.targetWeight} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Current:</span>
                          <span className={darkMode ? "text-white" : "text-gray-900"}>{stats?.currentWeight || goal.currentWeight} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Deadline:</span>
                          <span className={darkMode ? "text-white" : "text-gray-900"}>
                            {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </>
                    )}
                    {goal.type === "frequency" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Target:</span>
                          <span className={darkMode ? "text-white" : "text-gray-900"}>{goal.targetFrequency} workouts/week</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>This Week:</span>
                          <span className={darkMode ? "text-white" : "text-gray-900"}>{stats?.completedThisWeek || 0} completed</span>
                        </div>
                      </>
                    )}
                    {goal.type === "strength" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Exercise:</span>
                          <span className={darkMode ? "text-white" : "text-gray-900"}>{goal.exercise}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Target Weight:</span>
                          <span className={darkMode ? "text-white" : "text-gray-900"}>{goal.targetWeight} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Current Weight:</span>
                          <span className={darkMode ? "text-white" : "text-gray-900"}>{goal.currentWeight} kg</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Progress
                      </span>
                      <span className={`text-xs font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isCompleted
                            ? "bg-green-500"
                            : goal.type === "weight"
                            ? "bg-blue-500"
                            : goal.type === "frequency"
                            ? "bg-purple-500"
                            : "bg-orange-500"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4 flex items-center gap-2 text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-2 rounded-lg"
                    >
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-semibold">Goal Achieved!</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showGoalsModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGoalsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Set New Goal
                </h2>
                <button
                  onClick={() => setShowGoalsModal(false)}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                </button>
              </div>

              {/* Goal Type Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Goal Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setGoalType("weight")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      goalType === "weight"
                        ? "border-blue-500 bg-blue-500/10"
                        : darkMode
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Scale className={`w-6 h-6 mx-auto mb-2 ${
                      goalType === "weight"
                        ? "text-blue-500"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`} />
                    <span className={`text-sm font-medium ${
                      goalType === "weight"
                        ? "text-blue-500"
                        : darkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>
                      Weight
                    </span>
                  </button>

                  <button
                    onClick={() => setGoalType("frequency")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      goalType === "frequency"
                        ? "border-purple-500 bg-purple-500/10"
                        : darkMode
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Calendar className={`w-6 h-6 mx-auto mb-2 ${
                      goalType === "frequency"
                        ? "text-purple-500"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`} />
                    <span className={`text-sm font-medium ${
                      goalType === "frequency"
                        ? "text-purple-500"
                        : darkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>
                      Frequency
                    </span>
                  </button>

                  <button
                    onClick={() => setGoalType("strength")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      goalType === "strength"
                        ? "border-orange-500 bg-orange-500/10"
                        : darkMode
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Dumbbell className={`w-6 h-6 mx-auto mb-2 ${
                      goalType === "strength"
                        ? "text-orange-500"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`} />
                    <span className={`text-sm font-medium ${
                      goalType === "strength"
                        ? "text-orange-500"
                        : darkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>
                      Strength
                    </span>
                  </button>
                </div>
              </div>

              {/* Weight Goal Form */}
              {goalType === "weight" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Goal Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setWeightGoalType("lose")}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          weightGoalType === "lose"
                            ? "border-blue-500 bg-blue-500/10"
                            : darkMode
                            ? "border-gray-600 hover:border-gray-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          weightGoalType === "lose"
                            ? "text-blue-500"
                            : darkMode
                            ? "text-gray-300"
                            : "text-gray-700"
                        }`}>
                          Lose Weight
                        </span>
                      </button>
                      <button
                        onClick={() => setWeightGoalType("gain")}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          weightGoalType === "gain"
                            ? "border-blue-500 bg-blue-500/10"
                            : darkMode
                            ? "border-gray-600 hover:border-gray-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          weightGoalType === "gain"
                            ? "text-blue-500"
                            : darkMode
                            ? "text-gray-300"
                            : "text-gray-700"
                        }`}>
                          Gain Weight
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightGoalTarget}
                      onChange={(e) => setWeightGoalTarget(e.target.value)}
                      placeholder="e.g., 75"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Target Deadline
                    </label>
                    <input
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Frequency Goal Form */}
              {goalType === "frequency" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Workouts per Week
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={frequencyGoalTarget}
                        onChange={(e) => setFrequencyGoalTarget(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className={`text-2xl font-bold w-12 text-center ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {frequencyGoalTarget}
                      </span>
                    </div>
                    <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Aim to work out {frequencyGoalTarget} times per week
                    </p>
                  </div>
                </div>
              )}

              {/* Strength Goal Form */}
              {goalType === "strength" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Exercise
                    </label>
                    <input
                      type="text"
                      value={strengthGoalExercise}
                      onChange={(e) => setStrengthGoalExercise(e.target.value)}
                      placeholder="e.g., Bench Press, Squat, Deadlift"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={strengthGoalTarget}
                      onChange={(e) => setStrengthGoalTarget(e.target.value)}
                      placeholder="e.g., 100"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalsModal(false)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoal}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Save Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
