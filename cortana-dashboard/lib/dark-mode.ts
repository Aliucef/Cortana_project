/**
 * Dark mode utility for consistent theming across the app
 */

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const darkModeClasses = {
  // Card backgrounds
  card: (darkMode: boolean) => darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
  cardHover: (darkMode: boolean) => darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50",

  // Text colors
  text: (darkMode: boolean) => darkMode ? "text-white" : "text-gray-900",
  textSecondary: (darkMode: boolean) => darkMode ? "text-gray-400" : "text-gray-600",
  textMuted: (darkMode: boolean) => darkMode ? "text-gray-500" : "text-gray-500",

  // Input fields
  input: (darkMode: boolean) => darkMode
    ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-900"
    : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-100",

  // Buttons
  buttonPrimary: (darkMode: boolean) => darkMode
    ? "bg-blue-900 border-blue-800 text-blue-400 hover:bg-blue-800"
    : "bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200",

  buttonSecondary: (darkMode: boolean) => darkMode
    ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
    : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200",

  // Dividers
  divider: (darkMode: boolean) => darkMode ? "border-gray-700" : "border-gray-200",

  // Modals
  modal: (darkMode: boolean) => darkMode ? "bg-gray-800" : "bg-white",
  modalOverlay: "bg-black/50",
};
