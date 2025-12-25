"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  Dumbbell,
  Target,
  MessageCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Workouts", href: "/workouts", icon: Dumbbell },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "AI Chat", href: "/chat", icon: MessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 z-50 flex flex-col items-center py-6 overflow-hidden">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
          <span className="text-white font-bold text-sm">C</span>
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "relative w-12 h-12 flex items-center justify-center rounded-lg transition-all",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="w-5 h-5" />

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-600 rounded-r-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <Link href="/settings">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
          <Settings className="w-5 h-5" />
        </div>
      </Link>
    </aside>
  );
}
