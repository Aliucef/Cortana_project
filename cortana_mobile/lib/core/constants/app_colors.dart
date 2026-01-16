import 'package:flutter/material.dart';

class AppColors {
  // Matching dashboard's Tailwind color scheme
  static const Color primaryBlue = Color(0xFF3B82F6); // blue-600
  static const Color blue50 = Color(0xFFEFF6FF);
  static const Color blue100 = Color(0xFFDBEAFE);
  static const Color blue900 = Color(0xFF1E3A8A);

  static const Color success = Color(0xFF10B981); // green-600
  static const Color warning = Color(0xFFF59E0B); // yellow-600
  static const Color error = Color(0xFFEF4444); // red-600
  static const Color purple = Color(0xFF8B5CF6); // purple-600

  // Light theme colors
  static const Color lightBackground = Color(0xFFF9FAFB); // gray-50
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightBorder = Color(0xFFE5E7EB); // gray-200
  static const Color lightText = Color(0xFF111827); // gray-900
  static const Color lightTextSecondary = Color(0xFF6B7280); // gray-600

  // Dark theme colors
  static const Color darkBackground = Color(0xFF111827); // gray-900
  static const Color darkSurface = Color(0xFF1F2937); // gray-800
  static const Color darkBorder = Color(0xFF374151); // gray-700
  static const Color darkText = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFF9CA3AF); // gray-400

  // Chart colors (matching dashboard)
  static const List<Color> chartColors = [
    Color(0xFF3B82F6), // blue
    Color(0xFF10B981), // green
    Color(0xFFF59E0B), // yellow
    Color(0xFFEF4444), // red
    Color(0xFF8B5CF6), // purple
    Color(0xFF06B6D4), // cyan
    Color(0xFFF97316), // orange
    Color(0xFFEC4899), // pink
  ];

  // Transaction type colors
  static const Color incomeColor = success;
  static const Color expenseColor = error;
}
