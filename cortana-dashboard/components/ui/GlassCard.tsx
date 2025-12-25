"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-white rounded-xl p-6 border border-gray-200",
        hover && "hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stat Card - Apple style
 */
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  trend = "neutral",
  delay = 0,
}: StatCardProps) {
  const trendColor = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500",
  };

  const trendSymbol = {
    up: "↗",
    down: "↘",
    neutral: "→",
  };

  return (
    <GlassCard delay={delay} hover={true}>
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          {icon}
        </div>

        {/* Trend indicator */}
        {change !== undefined && (
          <span className={cn("text-xs font-medium", trendColor[trend])}>
            {trendSymbol[trend]} {Math.abs(change)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </GlassCard>
  );
}
