"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Moon,
  Sun,
  Bell,
  Shield,
  Settings as SettingsIcon,
} from "lucide-react";
import { getUser, updateUser, type User } from "@/lib/api";

export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

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

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await updateUser(formData);
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setEditing(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    window.dispatchEvent(new Event("darkModeChange"));
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div
            className={`p-2.5 rounded-lg ${
              darkMode ? "bg-blue-900/30" : "bg-blue-50"
            }`}
          >
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Profile & Settings
          </h1>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Information Card */}
          <div
            className={`border rounded-xl p-4 sm:p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Profile Information
              </h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    darkMode
                      ? "bg-blue-900 border-blue-800 text-blue-400 hover:bg-blue-800"
                      : "bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      darkMode
                        ? "bg-blue-900 border-blue-800 text-blue-400 hover:bg-blue-800"
                        : "bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {saving ? "Saving..." : "Save"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Name
                  </div>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-900"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                ) : (
                  <p
                    className={`px-4 py-2.5 ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {user?.name || "Not set"}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-900"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                ) : (
                  <p
                    className={`px-4 py-2.5 ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {user?.email || "Not set"}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </div>
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-900"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                ) : (
                  <p
                    className={`px-4 py-2.5 ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {user?.phone || "Not set"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div
            className={`border rounded-xl p-4 sm:p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              <h2
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Settings
              </h2>
            </div>

            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode
                    ? "bg-gray-900/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Dark Mode
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {darkMode ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Notifications Setting (Placeholder) */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode
                    ? "bg-gray-900/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-500" />
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Notifications
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Manage notification preferences
                    </p>
                  </div>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1`}
                  />
                </button>
              </div>

              {/* Privacy Setting (Placeholder) */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode
                    ? "bg-gray-900/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Privacy
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Control your data and privacy
                    </p>
                  </div>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Info Card */}
          <div
            className={`border rounded-xl p-4 sm:p-6 ${
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
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  User ID
                </span>
                <span
                  className={`font-mono ${
                    darkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {user?.id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Account Created
                </span>
                <span
                  className={`${darkMode ? "text-gray-200" : "text-gray-900"}`}
                >
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              {user?.telegram_id && (
                <div className="flex justify-between text-sm">
                  <span
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Telegram ID
                  </span>
                  <span
                    className={`font-mono ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {user.telegram_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
