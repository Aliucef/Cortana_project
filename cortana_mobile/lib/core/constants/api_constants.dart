class ApiConstants {
  // Base URL - Windows IP address for backend access from emulator
  static const String baseUrl = 'http://192.168.0.126:8000';

  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/users/register';

  // User Endpoints
  static const String userProfile = '/users/me';
  static const String updateProfile = '/users/me';
  static const String changePassword = '/users/me/change-password';
  static const String deleteAccount = '/users/me';

  // Finance Endpoints
  static const String addFinanceRecord = '/finance/';
  static String getUserFinanceRecords(int userId) => '/finance/user/$userId';
  static String getFinanceSummary(int userId) => '/finance/summary/$userId';
  static String updateFinanceRecord(int recordId) => '/finance/$recordId';
  static String deleteFinanceRecord(int recordId) => '/finance/$recordId';

  // Budget Endpoints
  static const String createBudget = '/budget/';
  static String getBudget(int userId) => '/budget/$userId';
  static String deleteBudget(int budgetId) => '/budget/$budgetId';
  static const String createCategoryGoal = '/budget/category-goal';
  static String getCategoryGoals(int userId) => '/budget/category-goal/$userId';
  static String updateCategoryGoal(int goalId) => '/budget/category-goal/$goalId';
  static String deleteCategoryGoal(int goalId) => '/budget/category-goal/$goalId';

  // Recurring Expenses
  static const String createRecurringExpense = '/recurring-expenses/';
  static String getRecurringExpenses(int userId) => '/recurring-expenses/user/$userId';
  static String updateRecurringExpense(int expenseId) => '/recurring-expenses/$expenseId';
  static String deleteRecurringExpense(int expenseId) => '/recurring-expenses/$expenseId';

  // AI Chat
  static const String chatEndpoint = '/ai-chat/chat';

  // Telegram
  static const String telegramStatus = '/users/me/telegram/status';
  static const String generateTelegramCode = '/users/me/telegram/generate-code';
  static const String unlinkTelegram = '/users/me/telegram/unlink';

  // Notifications
  static const String notifications = '/notifications/';
  static const String unreadCount = '/notifications/unread-count';
  static const String markRead = '/notifications/mark-read';
  static const String markAllRead = '/notifications/mark-all-read';
  static String deleteNotification(int notificationId) => '/notifications/$notificationId';

  // Timeouts (increased to 60s to accommodate backend vectorization)
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 60);
}
