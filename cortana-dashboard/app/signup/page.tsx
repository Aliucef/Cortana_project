"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, User as UserIcon, Phone } from "lucide-react";
import { signup as apiSignup, login as apiLogin, saveAuth, isAuthenticated } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      // Register user
      await apiSignup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName || undefined,
        phone_number: formData.phone || undefined,
      });

      // Auto login after successful signup
      const loginResponse = await apiLogin({
        username: formData.username,
        password: formData.password,
      });

      saveAuth(loginResponse);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-200 px-4 py-8 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4">
            <Image
              src="/logo.png"
              alt="Cortana Logo"
              width={64}
              height={64}
              className="rounded-xl"
            />
          </div>
          <h1
            className={`text-3xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Create Account
          </h1>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Join Cortana to start your journey
          </p>
        </div>

        {/* Signup Form */}
        <div
          className={`border rounded-xl p-6 sm:p-8 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Username *
              </label>
              <div className="relative">
                <UserIcon
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Full Name (Optional)
              </label>
              <div className="relative">
                <UserIcon
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email *
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Password *
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={`w-full pl-11 pr-11 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    darkMode
                      ? "text-gray-500 hover:text-gray-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Confirm Password *
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-11 pr-11 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    darkMode
                      ? "text-gray-500 hover:text-gray-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                required
                className={`mt-0.5 w-4 h-4 rounded border ${
                  darkMode
                    ? "border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-900"
                    : "border-gray-300 bg-white text-blue-600 focus:ring-blue-100"
                }`}
              />
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className={`font-medium ${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className={`font-medium ${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  Privacy Policy
                </Link>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors border ${
                loading
                  ? darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : darkMode
                  ? "bg-blue-900 border-blue-800 text-blue-400 hover:bg-blue-800"
                  : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className={`font-medium ${
                darkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
