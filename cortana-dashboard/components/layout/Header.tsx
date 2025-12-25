"use client";

import { Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-16 right-0 h-16 bg-white border-b border-gray-200 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">
            CORTANA
          </h1>
          <span className="text-gray-400 text-sm">
            Personal AI Assistant
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* User */}
          <button className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
