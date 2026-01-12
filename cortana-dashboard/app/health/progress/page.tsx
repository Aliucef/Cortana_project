"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Award,
  Scale,
  Calendar as CalendarIcon,
  StickyNote,
  Plus,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Loader2,
} from "lucide-react";
import {
  getPersonalRecords,
  addPersonalRecord as apiAddPersonalRecord,
  deletePersonalRecord,
  getBodyMeasurements,
  addBodyMeasurement as apiAddBodyMeasurement,
  getCalendarData,
  getWorkoutNotes,
  addWorkoutNote as apiAddWorkoutNote,
  deleteWorkoutNote,
  PersonalRecord,
  BodyMeasurement,
  WorkoutNote,
} from "@/lib/health-api";
import { isAuthenticated } from "@/lib/api";

export default function ProgressPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const userId = 1; // Hardcoded user ID

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Personal Records state
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showAddPRModal, setShowAddPRModal] = useState(false);
  const [selectedPRExercise, setSelectedPRExercise] = useState("");
  const [prWeight, setPRWeight] = useState("");
  const [prReps, setPRReps] = useState("");
  const [prType, setPRType] = useState("weight");

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // Body Measurements state
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [showAddMeasurementModal, setShowAddMeasurementModal] = useState(false);
  const [measurementView, setMeasurementView] = useState("weight");
  const [newWeight, setNewWeight] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");
  const [newChest, setNewChest] = useState("");
  const [newWaist, setNewWaist] = useState("");
  const [newHips, setNewHips] = useState("");
  const [newArms, setNewArms] = useState("");
  const [newLegs, setNewLegs] = useState("");

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarWorkouts, setCalendarWorkouts] = useState<any[]>([]);

  // Workout Notes state
  const [workoutNotes, setWorkoutNotes] = useState<WorkoutNote[]>([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteWorkoutName, setNoteWorkoutName] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteDifficulty, setNoteDifficulty] = useState(3);
  const [noteEnergy, setNoteEnergy] = useState(3);
  const [noteTags, setNoteTags] = useState("");

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

  // Fetch all progress data on mount
  useEffect(() => {
    async function fetchProgressData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [records, measurements, calendar, notes] = await Promise.all([
          getPersonalRecords(userId),
          getBodyMeasurements(userId),
          getCalendarData(userId, currentMonth + 1, currentYear),
          getWorkoutNotes(userId),
        ]);

        setPersonalRecords(records);
        setBodyMeasurements(measurements);
        setCalendarWorkouts(calendar);
        setWorkoutNotes(notes);
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setError("Failed to load progress data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProgressData();
  }, [userId, currentMonth, currentYear]);

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

  function getWorkoutForDate(dateStr: string) {
    return calendarWorkouts.find((w) => w.date === dateStr);
  }

  async function addPersonalRecord() {
    if (!selectedPRExercise) return;

    try {
      const newPR = await apiAddPersonalRecord(userId, {
        exercise_name: selectedPRExercise,
        max_weight: prType === "weight" ? parseFloat(prWeight) : undefined,
        max_reps: parseFloat(prReps),
        record_type: prType as "weight" | "reps",
        achieved_date: new Date().toISOString().split("T")[0],
      });

      setPersonalRecords([...personalRecords, newPR]);
      setShowAddPRModal(false);
      setSelectedPRExercise("");
      setPRWeight("");
      setPRReps("");
    } catch (err) {
      console.error("Error adding personal record:", err);
      alert("Failed to add personal record. Please try again.");
    }
  }

  async function addBodyMeasurement() {
    try {
      const newMeasurement = await apiAddBodyMeasurement(userId, {
        date: new Date().toISOString().split("T")[0],
        weight: parseFloat(newWeight) || 0,
        body_fat: parseFloat(newBodyFat) || undefined,
        chest: parseFloat(newChest) || undefined,
        waist: parseFloat(newWaist) || undefined,
        hips: parseFloat(newHips) || undefined,
        arms: parseFloat(newArms) || undefined,
        legs: parseFloat(newLegs) || undefined,
      });

      setBodyMeasurements([...bodyMeasurements, newMeasurement]);
      setShowAddMeasurementModal(false);
      setNewWeight("");
      setNewBodyFat("");
      setNewChest("");
      setNewWaist("");
      setNewHips("");
      setNewArms("");
      setNewLegs("");
    } catch (err) {
      console.error("Error adding body measurement:", err);
      alert("Failed to add body measurement. Please try again.");
    }
  }

  async function addWorkoutNote() {
    if (!noteWorkoutName || !noteText) return;

    try {
      const newNote = await apiAddWorkoutNote(userId, {
        workout_name: noteWorkoutName,
        note: noteText,
        difficulty: noteDifficulty,
        energy: noteEnergy,
        tags: noteTags.split(",").map((t) => t.trim()).filter((t) => t),
        workout_date: new Date().toISOString().split("T")[0],
      });

      setWorkoutNotes([newNote, ...workoutNotes]);
      setShowAddNoteModal(false);
      setNoteWorkoutName("");
      setNoteText("");
      setNoteDifficulty(3);
      setNoteEnergy(3);
      setNoteTags("");
    } catch (err) {
      console.error("Error adding workout note:", err);
      alert("Failed to add workout note. Please try again.");
    }
  }

  const latestMeasurement = bodyMeasurements[bodyMeasurements.length - 1] || {};
  const firstMeasurement = bodyMeasurements[0] || {};
  const weightChange = (latestMeasurement.weight || 0) - (firstMeasurement.weight || 0);
  const bodyFatChange = (latestMeasurement.body_fat || 0) - (firstMeasurement.body_fat || 0);

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
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Progress Tracking
          </h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Monitor your fitness journey with detailed metrics and insights
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Loading your progress data...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className={`border rounded-lg p-6 max-w-md ${
              darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
            }`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? "text-red-400" : "text-red-800"}`}>
                Error Loading Progress Data
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? "text-red-300" : "text-red-600"}`}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
        <div className="space-y-8">
          {/* Personal Records Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Personal Records
                </h2>
              </div>
              <button
                onClick={() => setShowAddPRModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                    : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            </div>

            <div
              className={`border rounded-lg overflow-hidden ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Exercise
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Record
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Date
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {personalRecords.map((pr, index) => (
                    <tr
                      key={index}
                      className={`border-b ${
                        darkMode ? "border-gray-700" : "border-gray-100"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {pr.exercise_name}
                      </td>
                      <td
                        className={`px-6 py-4 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {pr.record_type === "weight" ? `${pr.max_weight} kg × ${pr.max_reps} reps` : `${pr.max_reps} reps`}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {new Date(pr.achieved_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={async () => {
                            try {
                              await deletePersonalRecord(pr.id);
                              setPersonalRecords(personalRecords.filter((_, i) => i !== index));
                            } catch (err) {
                              console.error("Error deleting personal record:", err);
                              alert("Failed to delete personal record. Please try again.");
                            }
                          }}
                          className={`p-2 rounded transition-colors ${
                            darkMode
                              ? "hover:bg-gray-700 text-gray-400 hover:text-red-400"
                              : "hover:bg-gray-100 text-gray-600 hover:text-red-600"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Body Measurements Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Scale className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Body Measurements
                </h2>
              </div>
              <button
                onClick={() => setShowAddMeasurementModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                    : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Measurement
              </button>
            </div>

            <div
              className={`border rounded-lg p-6 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {/* View Selector */}
              <div className="flex gap-2 mb-6 border-b pb-4" style={{borderColor: darkMode ? "#374151" : "#e5e7eb"}}>
                <button
                  onClick={() => setMeasurementView("weight")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    measurementView === "weight"
                      ? darkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                      : darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Weight
                </button>
                <button
                  onClick={() => setMeasurementView("bodyFat")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    measurementView === "bodyFat"
                      ? darkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                      : darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Body Fat %
                </button>
                <button
                  onClick={() => setMeasurementView("measurements")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    measurementView === "measurements"
                      ? darkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                      : darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Measurements
                </button>
              </div>

              {/* Weight View */}
              {measurementView === "weight" && (
                <div>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Current Weight
                      </p>
                      <p className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {latestMeasurement.weight || 0} kg
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Starting Weight
                      </p>
                      <p className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {firstMeasurement.weight || 0} kg
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Change
                      </p>
                      <p
                        className={`text-2xl font-semibold ${
                          weightChange > 0 ? "text-red-600" : weightChange < 0 ? "text-green-600" : darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {weightChange > 0 ? "+" : ""}
                        {weightChange.toFixed(1)} kg
                      </p>
                    </div>
                  </div>

                  {/* Weight Chart */}
                  <div className={`border rounded-lg p-4 ${darkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
                    <p className={`text-sm font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Weight Trend
                    </p>
                    <div className="flex items-end gap-2 h-40">
                      {bodyMeasurements.slice(-10).map((measurement, index) => {
                        const maxWeight = Math.max(...bodyMeasurements.map((m) => m.weight));
                        const minWeight = Math.min(...bodyMeasurements.map((m) => m.weight));
                        const range = maxWeight - minWeight || 1;
                        const height = ((measurement.weight - minWeight) / range) * 100;

                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className={`w-full rounded-t transition-all ${
                                darkMode ? "bg-gray-600" : "bg-gray-400"
                              }`}
                              style={{ height: `${Math.max(height, 5)}%` }}
                            />
                            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                              {new Date(measurement.date).getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Body Fat View */}
              {measurementView === "bodyFat" && (
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Current Body Fat
                    </p>
                    <p className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {latestMeasurement.bodyFat || 0}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Starting Body Fat
                    </p>
                    <p className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {firstMeasurement.bodyFat || 0}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Change
                    </p>
                    <p
                      className={`text-2xl font-semibold ${
                        bodyFatChange < 0 ? "text-green-600" : bodyFatChange > 0 ? "text-red-600" : darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {bodyFatChange > 0 ? "+" : ""}
                      {bodyFatChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Measurements View */}
              {measurementView === "measurements" && (
                <div className="space-y-4">
                  {[
                    { label: "Chest", key: "chest" },
                    { label: "Waist", key: "waist" },
                    { label: "Hips", key: "hips" },
                    { label: "Arms", key: "arms" },
                    { label: "Legs", key: "legs" },
                  ].map(({ label, key }) => {
                    const current = latestMeasurement[key] || 0;
                    const starting = firstMeasurement[key] || 0;
                    const change = current - starting;

                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          darkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {label}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {current} cm
                          </span>
                          <span
                            className={`text-sm ${
                              change > 0
                                ? "text-green-600"
                                : change < 0
                                ? "text-red-600"
                                : darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {change > 0 ? "+" : ""}
                            {change.toFixed(1)} cm
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Calendar View Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
              <h2
                className={`text-xl font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Workout Calendar
              </h2>
            </div>

            <div
              className={`border rounded-lg p-6 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
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
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
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

                {/* Empty cells */}
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
                    const workout = getWorkoutForDate(dateStr);
                    const isToday =
                      new Date().toDateString() === new Date(dateStr).toDateString();

                    return (
                      <div
                        key={day}
                        className={`aspect-square p-2 border rounded-lg text-center ${
                          isToday
                            ? darkMode
                              ? "border-blue-600 bg-blue-900/20"
                              : "border-blue-600 bg-blue-50"
                            : workout
                            ? workout.completed
                              ? darkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-100 border-gray-300"
                              : darkMode
                              ? "bg-gray-750 border-gray-700"
                              : "bg-white border-gray-200"
                            : darkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div
                          className={`text-sm font-medium ${
                            workout?.completed
                              ? darkMode
                                ? "text-green-400"
                                : "text-green-600"
                              : darkMode
                              ? "text-gray-300"
                              : "text-gray-700"
                          }`}
                        >
                          {day}
                        </div>
                        {workout && (
                          <div className={`text-xs mt-1 truncate ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {workout.type}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </section>

          {/* Workout Notes Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <StickyNote className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Workout Notes
                </h2>
              </div>
              <button
                onClick={() => setShowAddNoteModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                    : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>

            <div className="space-y-4">
              {workoutNotes.slice(0, 3).map((note) => (
                <div
                  key={note.id}
                  className={`border rounded-lg p-5 ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3
                        className={`font-semibold mb-1 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {note.workout_name}
                      </h3>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {new Date(note.workout_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await deleteWorkoutNote(note.id);
                          setWorkoutNotes(workoutNotes.filter((n) => n.id !== note.id));
                        } catch (err) {
                          console.error("Error deleting workout note:", err);
                          alert("Failed to delete workout note. Please try again.");
                        }
                      }}
                      className={`p-2 rounded transition-colors ${
                        darkMode
                          ? "hover:bg-gray-700 text-gray-400"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className={`mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {note.note}
                  </p>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Difficulty:
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < note.difficulty
                                ? "fill-gray-600 text-gray-600 dark:fill-gray-400 dark:text-gray-400"
                                : darkMode ? "text-gray-700" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Energy:
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Heart
                            key={i}
                            className={`w-4 h-4 ${
                              i < note.energy
                                ? "fill-gray-600 text-gray-600 dark:fill-gray-400 dark:text-gray-400"
                                : darkMode ? "text-gray-700" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        )}
      </div>

      {/* Add PR Modal */}
      <AnimatePresence>
        {showAddPRModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddPRModal(false)}
          >
            <div
              className={`rounded-lg shadow-xl max-w-md w-full p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Add Personal Record
                </h2>
                <button
                  onClick={() => setShowAddPRModal(false)}
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
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    value={selectedPRExercise}
                    onChange={(e) => setSelectedPRExercise(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="e.g., Bench Press"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Record Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPRType("weight")}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                        prType === "weight"
                          ? darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-gray-200 border-gray-300 text-gray-900"
                          : darkMode
                          ? "bg-gray-800 border-gray-700 text-gray-400"
                          : "bg-white border-gray-300 text-gray-600"
                      }`}
                    >
                      Weight
                    </button>
                    <button
                      onClick={() => setPRType("reps")}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                        prType === "reps"
                          ? darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-gray-200 border-gray-300 text-gray-900"
                          : darkMode
                          ? "bg-gray-800 border-gray-700 text-gray-400"
                          : "bg-white border-gray-300 text-gray-600"
                      }`}
                    >
                      Reps Only
                    </button>
                  </div>
                </div>

                {prType === "weight" && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={prWeight}
                      onChange={(e) => setPRWeight(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="100"
                    />
                  </div>
                )}

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Reps
                  </label>
                  <input
                    type="number"
                    value={prReps}
                    onChange={(e) => setPRReps(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="10"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddPRModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                        : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addPersonalRecord}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "bg-blue-700 hover:bg-blue-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Add Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Measurement Modal */}
      <AnimatePresence>
        {showAddMeasurementModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddMeasurementModal(false)}
          >
            <div
              className={`rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Add Body Measurement
                </h2>
                <button
                  onClick={() => setShowAddMeasurementModal(false)}
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
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    value={newBodyFat}
                    onChange={(e) => setNewBodyFat(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Chest (cm)
                    </label>
                    <input
                      type="number"
                      value={newChest}
                      onChange={(e) => setNewChest(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Waist (cm)
                    </label>
                    <input
                      type="number"
                      value={newWaist}
                      onChange={(e) => setNewWaist(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Hips (cm)
                    </label>
                    <input
                      type="number"
                      value={newHips}
                      onChange={(e) => setNewHips(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Arms (cm)
                    </label>
                    <input
                      type="number"
                      value={newArms}
                      onChange={(e) => setNewArms(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Legs (cm)
                    </label>
                    <input
                      type="number"
                      value={newLegs}
                      onChange={(e) => setNewLegs(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddMeasurementModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                        : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addBodyMeasurement}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "bg-blue-700 hover:bg-blue-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Add Measurement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Note Modal */}
      <AnimatePresence>
        {showAddNoteModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddNoteModal(false)}
          >
            <div
              className={`rounded-lg shadow-xl max-w-md w-full p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Add Workout Note
                </h2>
                <button
                  onClick={() => setShowAddNoteModal(false)}
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
                    Workout Name
                  </label>
                  <input
                    type="text"
                    value={noteWorkoutName}
                    onChange={(e) => setNoteWorkoutName(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="e.g., Push Day - Chest & Triceps"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Note
                  </label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="How did the workout go?"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Difficulty: {noteDifficulty}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={noteDifficulty}
                    onChange={(e) => setNoteDifficulty(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Energy: {noteEnergy}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={noteEnergy}
                    onChange={(e) => setNoteEnergy(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="e.g., great workout, PR"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddNoteModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                        : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addWorkoutNote}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "bg-blue-700 hover:bg-blue-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
