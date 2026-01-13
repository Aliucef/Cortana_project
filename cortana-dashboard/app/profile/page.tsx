"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
  Key,
  Trash2,
  AlertCircle,
  Loader2,
  MessageCircle,
  Link as LinkIcon,
  Unlink,
  Copy,
} from "lucide-react";
import {
  getCurrentUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  isAuthenticated,
  clearAuth,
  getTelegramStatus,
  generateTelegramLinkingCode,
  unlinkTelegram,
  type User,
} from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Telegram state
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramLinkingCode, setTelegramLinkingCode] = useState("");
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);

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

  // Load user data
  useEffect(() => {
    loadUserData();
    loadTelegramStatus();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUserProfile();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
      alert("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadTelegramStatus = async () => {
    try {
      const status = await getTelegramStatus();
      setTelegramLinked(status.is_linked);
    } catch (error) {
      console.error("Failed to load Telegram status:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update user:", error);
      alert(error.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
    });
    setEditing(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");

    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setShowPasswordModal(false);
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
      alert("Password changed successfully!");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      setPasswordError(error.message || "Failed to change password. Please check your current password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== user?.username) {
      alert("Please type your username correctly to confirm deletion.");
      return;
    }

    setDeleting(true);
    try {
      await deleteUserAccount();
      clearAuth();
      alert("Your account has been deleted.");
      router.push("/login");
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      alert(error.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    window.dispatchEvent(new Event("darkModeChange"));
  };

  const handleGenerateTelegramCode = async () => {
    setTelegramLoading(true);
    try {
      const response = await generateTelegramLinkingCode();
      setTelegramLinkingCode(response.telegram_linking_code);
      setShowTelegramModal(true);
    } catch (error: any) {
      console.error("Failed to generate linking code:", error);
      alert(error.message || "Failed to generate linking code. Please try again.");
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleCopyTelegramCode = () => {
    navigator.clipboard.writeText(`/link ${telegramLinkingCode}`);
    alert("Linking command copied to clipboard!");
  };

  const handleUnlinkTelegram = async () => {
    setTelegramLoading(true);
    try {
      await unlinkTelegram();
      setTelegramLinked(false);
      setShowUnlinkModal(false);
      alert("Telegram account unlinked successfully!");
    } catch (error: any) {
      console.error("Failed to unlink Telegram:", error);
      alert(error.message || "Failed to unlink Telegram. Please try again.");
    } finally {
      setTelegramLoading(false);
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-4xl">
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
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="hidden sm:inline">
                      {saving ? "Saving..." : "Save"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Username Field (Read-only) */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Username
                  </div>
                </label>
                <p
                  className={`px-4 py-2.5 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user?.username} (cannot be changed)
                </p>
              </div>

              {/* Full Name Field */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </div>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
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
                    {user?.full_name || "Not set"}
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
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
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
                    {user?.phone_number || "Not set"}
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

          {/* Security Settings Card */}
          <div
            className={`border rounded-xl p-4 sm:p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-green-600" />
              <h2
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Security
              </h2>
            </div>

            <div className="space-y-4">
              {/* Change Password */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode
                    ? "bg-gray-900/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-green-600" />
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Change Password
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Update your account password
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    darkMode
                      ? "bg-green-900 border-green-800 text-green-400 hover:bg-green-800"
                      : "bg-green-100 border-green-200 text-green-700 hover:bg-green-200"
                  }`}
                >
                  Change
                </button>
              </div>

              {/* Delete Account */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode
                    ? "bg-red-900/20 border-red-800"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-red-400" : "text-red-900"
                      }`}
                    >
                      Delete Account
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-red-300" : "text-red-600"
                      }`}
                    >
                      Permanently delete your account and all data
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    darkMode
                      ? "bg-red-900 border-red-800 text-red-400 hover:bg-red-800"
                      : "bg-red-100 border-red-200 text-red-700 hover:bg-red-200"
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Telegram Integration Card */}
          <div
            className={`border rounded-xl p-4 sm:p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h2
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Telegram Integration
              </h2>
            </div>

            <div className="space-y-4">
              {/* Telegram Status */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  telegramLinked
                    ? darkMode
                      ? "bg-green-900/20 border-green-800"
                      : "bg-green-50 border-green-200"
                    : darkMode
                    ? "bg-gray-900/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle
                    className={`w-5 h-5 ${
                      telegramLinked ? "text-green-600" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Telegram Status
                    </p>
                    <p
                      className={`text-sm ${
                        telegramLinked
                          ? darkMode
                            ? "text-green-400"
                            : "text-green-700"
                          : darkMode
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {telegramLinked ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    telegramLinked
                      ? darkMode
                        ? "bg-green-900 text-green-400"
                        : "bg-green-100 text-green-700"
                      : darkMode
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {telegramLinked ? "Linked" : "Not Linked"}
                </div>
              </div>

              {/* Link/Unlink Actions */}
              {!telegramLinked ? (
                <div
                  className={`p-4 rounded-lg border ${
                    darkMode
                      ? "bg-blue-900/20 border-blue-800"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <LinkIcon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium mb-1 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Link Your Telegram Account
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Connect your Telegram account to use Cortana AI Assistant
                        through Telegram messenger. You'll be able to track
                        expenses, get news updates, and more!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateTelegramCode}
                    disabled={telegramLoading}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 ${
                      darkMode
                        ? "bg-blue-900 border-blue-800 text-blue-400 hover:bg-blue-800"
                        : "bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {telegramLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        Generate Linking Code
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-lg border ${
                    darkMode
                      ? "bg-orange-900/20 border-orange-800"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <Unlink
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        darkMode ? "text-orange-400" : "text-orange-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium mb-1 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Unlink Telegram Account
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Your Telegram account is currently linked. You can unlink
                        it if you no longer wish to use Cortana through Telegram.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUnlinkModal(true)}
                    disabled={telegramLoading}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 ${
                      darkMode
                        ? "bg-orange-900 border-orange-800 text-orange-400 hover:bg-orange-800"
                        : "bg-orange-100 border-orange-200 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    <Unlink className="w-4 h-4" />
                    Unlink Telegram
                  </button>
                </div>
              )}
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
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !changingPassword && setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-xl p-6 max-w-md w-full ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Key className="w-6 h-6 text-green-600" />
                  <h2
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Change Password
                  </h2>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={changingPassword}
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

              {passwordError && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-400">{passwordError}</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-green-500 focus:ring-green-900"
                        : "bg-white border-gray-200 text-gray-900 focus:border-green-500 focus:ring-green-100"
                    }`}
                    disabled={changingPassword}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-green-500 focus:ring-green-900"
                        : "bg-white border-gray-200 text-gray-900 focus:border-green-500 focus:ring-green-100"
                    }`}
                    disabled={changingPassword}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-green-500 focus:ring-green-900"
                        : "bg-white border-gray-200 text-gray-900 focus:border-green-500 focus:ring-green-100"
                    }`}
                    disabled={changingPassword}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={changingPassword}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
                    Delete Account
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
                        Deleting your account will permanently remove all your
                        data including finances, workouts, and chat history.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Type <span className="font-bold">{user?.username}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={user?.username}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-red-500 focus:ring-red-900"
                        : "bg-white border-gray-200 text-gray-900 focus:border-red-500 focus:ring-red-100"
                    }`}
                    disabled={deleting}
                  />
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
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== user?.username}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    deleting || deleteConfirmText !== user?.username
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Telegram Linking Code Modal */}
      <AnimatePresence>
        {showTelegramModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTelegramModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-xl p-6 max-w-md w-full ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <h2
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Link Telegram Account
                  </h2>
                </div>
                <button
                  onClick={() => setShowTelegramModal(false)}
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
                      ? "bg-blue-900/20 border-blue-800"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <p
                    className={`text-sm mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    To link your Telegram account, send this command to the Cortana bot:
                  </p>
                  <div
                    className={`p-3 rounded-lg font-mono text-center ${
                      darkMode
                        ? "bg-gray-900 text-blue-400"
                        : "bg-white text-blue-600"
                    }`}
                  >
                    /link {telegramLinkingCode}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    darkMode
                      ? "bg-yellow-900/20 border-yellow-800"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <p
                    className={`text-sm flex items-start gap-2 ${
                      darkMode ? "text-yellow-400" : "text-yellow-700"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>This code expires in 24 hours</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTelegramModal(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={handleCopyTelegramCode}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Command
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unlink Telegram Confirmation Modal */}
      <AnimatePresence>
        {showUnlinkModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !telegramLoading && setShowUnlinkModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-xl p-6 max-w-md w-full ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Unlink className="w-6 h-6 text-orange-600" />
                  <h2
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Unlink Telegram
                  </h2>
                </div>
                <button
                  onClick={() => setShowUnlinkModal(false)}
                  disabled={telegramLoading}
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
                  className={`p-4 rounded-lg border ${
                    darkMode
                      ? "bg-orange-900/20 border-orange-800"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p
                        className={`font-semibold mb-2 ${
                          darkMode ? "text-orange-400" : "text-orange-900"
                        }`}
                      >
                        Are you sure you want to unlink?
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-orange-300" : "text-orange-700"
                        }`}
                      >
                        You will no longer be able to use Cortana through Telegram. You can always link again later by generating a new code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnlinkModal(false)}
                  disabled={telegramLoading}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlinkTelegram}
                  disabled={telegramLoading}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {telegramLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Unlinking...
                    </>
                  ) : (
                    <>
                      <Unlink className="w-4 h-4" />
                      Unlink
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
