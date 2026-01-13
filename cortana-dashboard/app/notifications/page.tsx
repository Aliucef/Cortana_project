"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Loader2,
  AlertCircle,
  DollarSign,
  Newspaper,
  Heart,
  Info,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  isAuthenticated,
  getNotifications,
  markNotificationsRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "@/lib/api";

export default function NotificationsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 20;

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
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

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, [showUnreadOnly, currentPage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * notificationsPerPage;
      const response = await getNotifications(
        skip,
        notificationsPerPage,
        showUnreadOnly
      );
      setNotifications(response.notifications || []);
      setTotalNotifications(response.total || 0);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      // Set empty state on error
      setNotifications([]);
      setTotalNotifications(0);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationsRead([notificationId]);
      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      alert("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      // Reload notifications
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      alert("Failed to mark all notifications as read");
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await deleteNotification(notificationId);
      // Update local state
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      setTotalNotifications((prev) => prev - 1);

      // Update unread count if it was unread
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      alert("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "finance":
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case "news":
        return <Newspaper className="w-5 h-5 text-blue-500" />;
      case "health":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "system":
        return <Info className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const totalPages = Math.ceil(totalNotifications / notificationsPerPage);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:ml-64 mt-16">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Notifications</h1>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode
                      ? "bg-blue-900 text-blue-400 hover:bg-blue-800"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All as Read
                </button>
              )}
            </div>

            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {unreadCount > 0 ? (
                <>
                  You have <span className="font-bold">{unreadCount}</span>{" "}
                  unread notification{unreadCount !== 1 ? "s" : ""}
                </>
              ) : (
                "You're all caught up!"
              )}
            </p>
          </div>

          {/* Filter Toggle */}
          <div className="mb-4">
            <button
              onClick={() => {
                setShowUnreadOnly(!showUnreadOnly);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                showUnreadOnly
                  ? darkMode
                    ? "bg-purple-900 border-purple-800 text-purple-400"
                    : "bg-purple-100 border-purple-200 text-purple-700"
                  : darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              {showUnreadOnly ? "Show All" : "Show Unread Only"}
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            /* Empty State */
            <div
              className={`border rounded-xl p-12 text-center ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <Bell
                className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <p
                className={`text-lg font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {showUnreadOnly
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className={darkMode ? "text-gray-500" : "text-gray-500"}>
                {showUnreadOnly
                  ? "You're all caught up!"
                  : "Notifications from Cortana will appear here"}
              </p>
            </div>
          ) : (
            /* Notifications List */
            <>
              <div className="space-y-3">
                {(notifications || []).map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-xl p-4 transition-colors ${
                      notification.is_read
                        ? darkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                        : darkMode
                        ? "bg-blue-900/20 border-blue-800"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.notification_type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                          )}
                        </div>

                        <p
                          className={`text-sm mb-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-4">
                          <span
                            className={`text-xs ${
                              darkMode ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </span>

                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                  darkMode
                                    ? "text-blue-400 hover:bg-blue-900/30"
                                    : "text-blue-600 hover:bg-blue-100"
                                }`}
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                                Mark Read
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(notification.id)}
                              className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                darkMode
                                  ? "text-red-400 hover:bg-red-900/30"
                                  : "text-red-600 hover:bg-red-100"
                              }`}
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      currentPage === 1
                        ? darkMode
                          ? "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed"
                          : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                        : darkMode
                        ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  <span
                    className={`px-4 py-2 text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      currentPage === totalPages
                        ? darkMode
                          ? "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed"
                          : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                        : darkMode
                        ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
