"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useFinance } from "./FinanceContext";

interface StatsCardProps {
  title: string;
  value: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgLight: string;
  iconBgDark: string;
  hoverBorderLight: string;
  hoverBorderDark: string;
  hoverShadow: string;
  delay?: number;
  children?: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  label,
  icon: Icon,
  iconColor,
  iconBgLight,
  iconBgDark,
  hoverBorderLight,
  hoverBorderDark,
  hoverShadow,
  delay = 0,
  children,
}: StatsCardProps) {
  const { darkMode } = useFinance();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
        darkMode
          ? `bg-gray-800 border-gray-700 ${hoverBorderDark} hover:shadow-lg ${hoverShadow}`
          : `bg-white border-gray-200 ${hoverBorderLight} hover:shadow-lg ${hoverShadow}`
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-2.5 rounded-lg ${
            darkMode ? iconBgDark : iconBgLight
          }`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span
          className={`text-xs font-medium ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {label}
        </span>
      </div>
      <h3
        className={`text-sm mb-1 ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-2xl font-semibold ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {children}
    </motion.div>
  );
}
