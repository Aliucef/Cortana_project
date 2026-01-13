"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  TrendingUp,
  Calendar,
  MessageCircle,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  UserCheck,
} from "lucide-react";
import {
  isAuthenticated,
  isAdmin,
  getAdminStats,
  getAllUsers,
  deleteUser,
  type AdminStats,
  type User,
} from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check authentication and admin status
  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push("/");
    }
  }, [router]);

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

  // Load admin data
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
      ]);
      setStats(statsData);
      setAllUsers(usersData);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      alert("Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === 1) {
      alert("Cannot delete admin user!");
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      alert(`User ${userToDelete.username} deleted successfully!`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      // Reload data
      await loadAdminData();
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      alert(error.message || "Failed to delete user. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p
            className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div
            className={`p-2.5 rounded-lg ${
              darkMode ? "bg-purple-900/30" : "bg-purple-50"
            }`}
          >
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Admin Dashboard
            </h1>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Manage users and view system statistics
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Users */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Users
              </p>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats?.total_users || 0}
            </p>
          </div>

          {/* New This Week */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                New This Week
              </p>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats?.new_users_this_week || 0}
            </p>
          </div>

          {/* New This Month */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                New This Month
              </p>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats?.new_users_this_month || 0}
            </p>
          </div>

          {/* Telegram Linked */}
          <div
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Telegram Linked
              </p>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {stats?.telegram_linked_users || 0}
            </p>
          </div>
        </div>

        {/* Recent Signups */}
        {stats && stats.recent_signups.length > 0 && (
          <div
            className={`border rounded-xl p-6 mb-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Recent Signups
            </h2>
            <div className="space-y-3">
              {stats.recent_signups.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    darkMode
                      ? "bg-gray-900/50 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck
                      className={`w-5 h-5 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user.username}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Users Table */}
        <div
          className={`border rounded-xl p-6 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            All Users ({allUsers.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <th
                    className={`text-left py-3 px-4 text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ID
                  </th>
                  <th
                    className={`text-left py-3 px-4 text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Username
                  </th>
                  <th
                    className={`text-left py-3 px-4 text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Email
                  </th>
                  <th
                    className={`text-left py-3 px-4 text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Full Name
                  </th>
                  <th
                    className={`text-left py-3 px-4 text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Created At
                  </th>
                  <th
                    className={`text-left py-3 px-4 text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <td
                      className={`py-3 px-4 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {user.id}
                      {user.id === 1 && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-900 text-purple-400">
                          Admin
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.username}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {user.email}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {user.full_name || "-"}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {user.id !== 1 && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode
                              ? "hover:bg-red-900/20 text-red-400"
                              : "hover:bg-red-50 text-red-600"
                          }`}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className={`rounded-xl p-6 max-w-md w-full ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-red-600" />
                <h2
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Delete User
                </h2>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
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

            <div className="mb-6">
              <div
                className={`p-4 rounded-lg border mb-4 ${
                  darkMode
                    ? "bg-red-900/20 border-red-800"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p
                      className={`font-semibold mb-2 ${
                        darkMode ? "text-red-400" : "text-red-900"
                      }`}
                    >
                      Warning: This action cannot be undone!
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-red-300" : "text-red-700"
                      }`}
                    >
                      Are you sure you want to delete user{" "}
                      <span className="font-bold">{userToDelete.username}</span>
                      ? All their data including finances, workouts, and chat
                      history will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
