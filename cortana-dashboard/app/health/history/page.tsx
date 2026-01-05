"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History,
  Search,
  Calendar,
  Clock,
  Activity,
  Weight,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  StickyNote,
} from "lucide-react";
import { getWorkoutHistory } from "@/lib/health-api";

export default function HistoryPage() {
  const [darkMode, setDarkMode] = useState(false);
  const userId = 1;

  // Workout history state
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, week, month
  const [currentPage, setCurrentPage] = useState(1);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv"); // csv or pdf
  const [exportDateRange, setExportDateRange] = useState("all"); // all, week, month, custom

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
      const historyData = await getWorkoutHistory(userId, { limit: 100 });
      // API returns { total, logs } - extract the logs array
      const logs = Array.isArray(historyData) ? historyData : (historyData?.logs || []);
      setWorkoutHistory(logs);
      setFilteredHistory(logs);
    } catch (error) {
      console.error("Error fetching workout history:", error);
      setWorkoutHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  }

  // Filter workout history based on search and date filter
  useEffect(() => {
    let filtered = [...workoutHistory];

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      if (dateFilter === "week") {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "month") {
        filterDate.setDate(now.getDate() - 30);
      }

      filtered = filtered.filter(
        (workout) => new Date(workout.loggedAt) >= filterDate
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((workout) =>
        workout.exerciseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [workoutHistory, searchQuery, dateFilter]);

  // Get paginated workout history
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  // Export functions
  function getFilteredWorkoutsForExport() {
    if (exportDateRange === "all") {
      return workoutHistory;
    }

    const now = new Date();
    let startDate = new Date();

    if (exportDateRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (exportDateRange === "month") {
      startDate.setMonth(now.getMonth() - 1);
    }

    return workoutHistory.filter((w: any) => {
      const workoutDate = new Date(w.loggedAt);
      return workoutDate >= startDate;
    });
  }

  function exportToCSV() {
    const data = getFilteredWorkoutsForExport();

    if (data.length === 0) {
      alert("No workout data to export");
      return;
    }

    // CSV headers
    const headers = ["Date", "Exercise", "Sets", "Reps", "Weight (kg)", "Duration (min)", "Notes"];
    const csvRows = [headers.join(",")];

    // CSV data rows
    data.forEach((workout: any) => {
      const row = [
        new Date(workout.loggedAt).toLocaleDateString(),
        workout.exerciseName || "N/A",
        workout.sets || "N/A",
        workout.reps || "N/A",
        workout.weight || "N/A",
        workout.durationMinutes || "N/A",
        (workout.notes || "").replace(/,/g, ";"), // Replace commas to avoid CSV issues
      ];
      csvRows.push(row.join(","));
    });

    // Create CSV blob
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Download file
    const link = document.createElement("a");
    link.href = url;
    link.download = `workout_history_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }

  function exportToPDF() {
    const data = getFilteredWorkoutsForExport();

    if (data.length === 0) {
      alert("No workout data to export");
      return;
    }

    // Create printable HTML
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Workout History</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #4F46E5;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .header-info {
            margin-bottom: 20px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Workout History Report</h1>
        <div class="header-info">
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Workouts:</strong> ${data.length}</p>
          <p><strong>Date Range:</strong> ${exportDateRange === "all" ? "All Time" : exportDateRange === "week" ? "Last 7 Days" : "Last 30 Days"}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Weight (kg)</th>
              <th>Duration (min)</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((workout: any) => `
              <tr>
                <td>${new Date(workout.loggedAt).toLocaleDateString()}</td>
                <td>${workout.exerciseName || "N/A"}</td>
                <td>${workout.sets || "N/A"}</td>
                <td>${workout.reps || "N/A"}</td>
                <td>${workout.weight || "N/A"}</td>
                <td>${workout.durationMinutes || "N/A"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    setShowExportModal(false);
  }

  function handleExport() {
    if (exportFormat === "csv") {
      exportToCSV();
    } else {
      exportToPDF();
    }
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
            Loading workout history...
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
            <History className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Workout History
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {filteredHistory.length} workout{filteredHistory.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-lg p-4 mb-6 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder="Search by exercise name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex gap-2">
              {["all", "week", "month"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    dateFilter === filter
                      ? "bg-blue-600 text-white shadow-lg"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter === "all" ? "All Time" : filter === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workout History List */}
        {paginatedHistory.length === 0 ? (
          <div className={`rounded-lg p-8 text-center ${darkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <History className={`w-12 h-12 mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
            <p className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              No workout history found
            </p>
            <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
              {searchQuery || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Complete some workouts to see them here"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedHistory.map((workout: any, index: number) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedHistoryWorkout(workout);
                    setShowHistoryDetail(true);
                  }}
                  className={`rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-750 shadow-md"
                      : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`font-semibold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {workout.exerciseName}
                        </h4>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(workout.loggedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>

                        {workout.duration_minutes && (
                          <div className={`flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <Clock className="w-4 h-4" />
                            {workout.duration_minutes} min
                          </div>
                        )}

                        {workout.sets && workout.reps && (
                          <div className={`flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <Activity className="w-4 h-4" />
                            {workout.sets} × {workout.reps}
                          </div>
                        )}

                        {workout.weight && (
                          <div className={`flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <Weight className="w-4 h-4" />
                            {workout.weight} kg
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className={`w-5 h-5 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? darkMode
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : darkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? darkMode
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : darkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Workout History Detail Modal */}
      {showHistoryDetail && selectedHistoryWorkout && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHistoryDetail(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-6 max-w-2xl w-full shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {selectedHistoryWorkout.exerciseName}
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {new Date(selectedHistoryWorkout.loggedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryDetail(false)}
                className={`p-2 rounded-lg transition-all ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
              </button>
            </div>

            {/* Workout Details */}
            <div className="space-y-4">
              {selectedHistoryWorkout.sets && selectedHistoryWorkout.reps && (
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Performance
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-600"}`}>Sets</p>
                      <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedHistoryWorkout.sets}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-600"}`}>Reps</p>
                      <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedHistoryWorkout.reps}
                      </p>
                    </div>
                    {selectedHistoryWorkout.weight && (
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-600"}`}>Weight</p>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedHistoryWorkout.weight} kg
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedHistoryWorkout.duration_minutes && (
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <h3 className={`font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Duration
                  </h3>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                    <span className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedHistoryWorkout.duration_minutes} minutes
                    </span>
                  </div>
                </div>
              )}

              {selectedHistoryWorkout.notes && (
                <div className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <h3 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <StickyNote className="w-4 h-4" />
                    Notes
                  </h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {selectedHistoryWorkout.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowHistoryDetail(false)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowExportModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-6 max-w-md w-full shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Export Workout Data
            </h2>

            {/* Export Format Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat("csv")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    exportFormat === "csv"
                      ? "border-green-500 bg-green-500/10"
                      : darkMode
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <svg className={`w-8 h-8 mx-auto mb-2 ${
                    exportFormat === "csv"
                      ? "text-green-500"
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className={`text-sm font-medium ${
                    exportFormat === "csv"
                      ? "text-green-500"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}>
                    Excel (CSV)
                  </span>
                </button>

                <button
                  onClick={() => setExportFormat("pdf")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    exportFormat === "pdf"
                      ? "border-green-500 bg-green-500/10"
                      : darkMode
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <svg className={`w-8 h-8 mx-auto mb-2 ${
                    exportFormat === "pdf"
                      ? "text-green-500"
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm font-medium ${
                    exportFormat === "pdf"
                      ? "text-green-500"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}>
                    PDF
                  </span>
                </button>
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Date Range
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setExportDateRange("all")}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    exportDateRange === "all"
                      ? "border-green-500 bg-green-500/10"
                      : darkMode
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className={`font-medium ${
                    exportDateRange === "all"
                      ? "text-green-500"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}>
                    All Time
                  </span>
                  <span className={`block text-xs mt-1 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Export all {workoutHistory.length} workouts
                  </span>
                </button>

                <button
                  onClick={() => setExportDateRange("week")}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    exportDateRange === "week"
                      ? "border-green-500 bg-green-500/10"
                      : darkMode
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className={`font-medium ${
                    exportDateRange === "week"
                      ? "text-green-500"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}>
                    Last 7 Days
                  </span>
                  <span className={`block text-xs mt-1 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Recent workout history
                  </span>
                </button>

                <button
                  onClick={() => setExportDateRange("month")}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    exportDateRange === "month"
                      ? "border-green-500 bg-green-500/10"
                      : darkMode
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className={`font-medium ${
                    exportDateRange === "month"
                      ? "text-green-500"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}>
                    Last 30 Days
                  </span>
                  <span className={`block text-xs mt-1 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Monthly workout report
                  </span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-sm rounded-lg transition-all"
              >
                Export {exportFormat.toUpperCase()}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
