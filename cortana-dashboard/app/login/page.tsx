"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User as UserIcon, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { login as apiLogin, saveAuth, isAuthenticated } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiLogin({ username, password });
      saveAuth(response);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-200 px-4 ${
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
            Welcome Back
          </h1>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Sign in to your Cortana account
          </p>
        </div>

        {/* Login Form */}
        <div
          className={`border rounded-xl p-6 sm:p-8 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Username
              </label>
              <div className="relative">
                <UserIcon
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
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
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className={`w-4 h-4 rounded border ${
                    darkMode
                      ? "border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-900"
                      : "border-gray-300 bg-white text-blue-600 focus:ring-blue-100"
                  }`}
                />
                <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className={`font-medium ${
                  darkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Forgot password?
              </Link>
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm">
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Don't have an account?{" "}
            </span>
            <Link
              href="/signup"
              className={`font-medium ${
                darkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p
          className={`mt-8 text-center text-xs ${
            darkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:no-underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:no-underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
