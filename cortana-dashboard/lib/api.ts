/**
 * Cortana AI Backend API Integration
 * Connects Next.js dashboard to FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Default user ID (single-user system)
const DEFAULT_USER_ID = 1;

/**
 * Generic API call wrapper with error handling and JWT auth
 */
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    // Get auth token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // If unauthorized, clear auth and redirect to login
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
      }

      // Try to get error message from response body
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // If can't parse JSON, use default message
      }

      throw new Error(errorMessage);
    }

    // Handle 204 No Content (e.g., DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    // Don't log errors for optional health endpoints that may not exist yet
    const optionalEndpoints = ['/health/weight/', '/health/workout-logs/'];
    const isOptional = optionalEndpoints.some(e => endpoint.includes(e));

    if (!isOptional) {
      console.error(`API call failed for ${endpoint}:`, error);
    }
    throw error;
  }
}

// ==================== AUTHENTICATION API ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone_number?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name?: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  created_at: string;
}

/**
 * Login with username and password
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return apiCall<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Register a new user
 */
export async function signup(userData: SignupRequest): Promise<User> {
  return apiCall<User>("/users/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Get current user from token
 */
export function getCurrentUser(): { id: number; username: string; email: string; full_name?: string } | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("currentUser");

  if (!token || !userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Save auth token and user data
 */
export function saveAuth(authResponse: AuthResponse): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("authToken", authResponse.access_token);
  localStorage.setItem("currentUser", JSON.stringify(authResponse.user));
}

/**
 * Clear auth data (logout)
 */
export function clearAuth(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("authToken");
}

/**
 * Get current user ID from stored user data
 */
export function getCurrentUserId(): number {
  const user = getCurrentUser();
  return user?.id || DEFAULT_USER_ID;
}

/**
 * Check if current user is admin (user ID 1)
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.id === 1;
}

// ==================== FINANCE API ====================

export interface FinanceRecord {
  id: number;
  user_id: number;
  transaction_type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
  created_at: string;
}

export interface FinanceSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  category_breakdown: Record<string, number>;
  trend_analysis?: {
    comparison_period: string;
    change_percentage: number;
    message: string;
  };
  top_categories?: Array<{ category: string; amount: number }>;
}

export interface Budget {
  id: number;
  user_id: number;
  amount: number; // Backend uses 'amount', not 'total_budget'
  period: "weekly" | "monthly";
}

export interface CategoryGoal {
  id: number;
  user_id: number;
  category: string;
  goal_amount: number;
  period: "weekly" | "monthly";
  alert_threshold: number;
  created_at: string;
}

export interface RecurringExpense {
  id: number;
  user_id: number;
  name: string;
  amount: number;
  category: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  next_due_date: string;
  reminder_days_before: number;
  is_active: number;
  created_at: string;
}

/**
 * Get financial summary
 */
export async function getFinanceSummary(
  userId: number = DEFAULT_USER_ID,
  period: "weekly" | "monthly" | "custom" = "monthly",
  startDate?: string,
  endDate?: string
): Promise<FinanceSummary> {
  let url = `/finance/summary/${userId}?period=${period}`;

  // Add custom date range if provided
  if (period === "custom" && startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }

  return apiCall(url);
}

/**
 * Get all finance records
 */
export async function getFinanceRecords(
  userId: number = DEFAULT_USER_ID
): Promise<FinanceRecord[]> {
  return apiCall(`/finance/user/${userId}`); // Backend route is /finance/user/{user_id}
}

/**
 * Add finance record (income or expense)
 */
export async function addFinanceRecord(data: {
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date?: string;
}): Promise<FinanceRecord> {
  return apiCall("/finance/", {
    method: "POST",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      transaction_type: data.type, // Backend expects 'transaction_type'
      transaction_date: data.date || new Date().toISOString(), // Backend expects 'transaction_date'
      amount: data.amount,
      category: data.category,
      description: data.description,
    }),
  });
}

/**
 * Update finance record
 */
export async function updateFinanceRecord(
  recordId: number,
  data: {
    type: "income" | "expense";
    amount: number;
    category: string;
    description?: string;
    date?: string;
  }
): Promise<FinanceRecord> {
  return apiCall(`/finance/${recordId}`, {
    method: "PUT",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      transaction_type: data.type,
      transaction_date: data.date || new Date().toISOString(),
      amount: data.amount,
      category: data.category,
      description: data.description,
    }),
  });
}

/**
 * Delete finance record
 */
export async function deleteFinanceRecord(recordId: number): Promise<void> {
  return apiCall(`/finance/${recordId}`, {
    method: "DELETE",
  });
}

/**
 * Get user's budget
 */
export async function getBudget(
  userId: number = DEFAULT_USER_ID
): Promise<Budget | null> {
  try {
    const budgets = await apiCall<Budget[]>(`/budget/${userId}`);
    // Backend returns array, get the first (most recent) budget
    return budgets && budgets.length > 0 ? budgets[0] : null;
  } catch {
    return null;
  }
}

/**
 * Create or update budget
 */
export async function createBudget(data: {
  total_budget: number;
  period: "weekly" | "monthly";
}): Promise<Budget> {
  return apiCall("/budget/", {
    method: "POST",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      amount: data.total_budget, // Backend expects 'amount', not 'total_budget'
      period: data.period,
    }),
  });
}

/**
 * Get category goals
 */
export async function getCategoryGoals(
  userId: number = DEFAULT_USER_ID
): Promise<CategoryGoal[]> {
  return apiCall(`/budget/category-goal/${userId}`);
}

/**
 * Create or update category goal
 */
export async function createCategoryGoal(data: {
  category: string;
  goal_amount: number;
  period: "weekly" | "monthly";
  alert_threshold?: number;
}): Promise<CategoryGoal> {
  return apiCall("/budget/category-goal", {
    method: "POST",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      category: data.category,
      goal_amount: data.goal_amount,
      period: data.period,
      alert_threshold: data.alert_threshold || 0.8,
    }),
  });
}

/**
 * Update category goal
 */
export async function updateCategoryGoal(
  goalId: number,
  data: {
    category: string;
    goal_amount: number;
    period: "weekly" | "monthly";
    alert_threshold?: number;
  }
): Promise<CategoryGoal> {
  return apiCall(`/budget/category-goal/${goalId}`, {
    method: "PUT",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      category: data.category,
      goal_amount: data.goal_amount,
      period: data.period,
      alert_threshold: data.alert_threshold || 0.8,
    }),
  });
}

/**
 * Delete category goal
 */
export async function deleteCategoryGoal(goalId: number): Promise<void> {
  return apiCall(`/budget/category-goal/${goalId}`, {
    method: "DELETE",
  });
}

// ==================== RECURRING EXPENSES API ====================

/**
 * Get all recurring expenses for a user
 */
export async function getRecurringExpenses(
  userId: number = DEFAULT_USER_ID
): Promise<RecurringExpense[]> {
  return apiCall(`/recurring-expenses/user/${userId}`);
}

/**
 * Create new recurring expense
 */
export async function createRecurringExpense(data: {
  name: string;
  amount: number;
  category: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  next_due_date: string;
  reminder_days_before?: number;
}): Promise<RecurringExpense> {
  return apiCall("/recurring-expenses/", {
    method: "POST",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      name: data.name,
      amount: data.amount,
      category: data.category,
      frequency: data.frequency,
      next_due_date: data.next_due_date,
      reminder_days_before: data.reminder_days_before || 1,
    }),
  });
}

/**
 * Update recurring expense
 */
export async function updateRecurringExpense(
  expenseId: number,
  data: {
    name: string;
    amount: number;
    category: string;
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    next_due_date: string;
    reminder_days_before?: number;
  }
): Promise<RecurringExpense> {
  return apiCall(`/recurring-expenses/${expenseId}`, {
    method: "PUT",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      name: data.name,
      amount: data.amount,
      category: data.category,
      frequency: data.frequency,
      next_due_date: data.next_due_date,
      reminder_days_before: data.reminder_days_before || 1,
    }),
  });
}

/**
 * Delete recurring expense (soft delete)
 */
export async function deleteRecurringExpense(
  expenseId: number
): Promise<void> {
  return apiCall(`/recurring-expenses/${expenseId}`, {
    method: "DELETE",
  });
}

/**
 * Manually process a recurring expense (creates transaction and updates next due date)
 */
export async function processRecurringExpense(
  expenseId: number
): Promise<{ message: string; transaction_id: number; next_due_date: string }> {
  return apiCall(`/recurring-expenses/${expenseId}/process`, {
    method: "POST",
  });
}

// ==================== HEALTH/WORKOUT API ====================

export interface WorkoutPlan {
  id: number;
  user_id: number;
  goal: string;
  duration_weeks: number;
  plan_data: {
    weeks: Array<{
      week_number: number;
      days: Array<{
        day_number: number;
        day_name: string;
        exercises: Array<{
          name: string;
          sets: number;
          reps: string;
          rest?: string;
          notes?: string;
        }>;
      }>;
    }>;
  };
  created_at: string;
}

export interface WeightLog {
  id: number;
  user_id: number;
  weight_kg: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface WorkoutLog {
  id: number;
  user_id: number;
  workout_date: string;
  exercises_completed: string[];
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

/**
 * Get current workout plan
 */
export async function getWorkoutPlan(
  userId: number = DEFAULT_USER_ID
): Promise<WorkoutPlan | null> {
  try {
    return await apiCall(`/health/workout-plan/${userId}`);
  } catch {
    return null;
  }
}

/**
 * Generate new workout plan
 */
export async function generateWorkoutPlan(data: {
  goal: string;
  duration_weeks?: number;
  experience_level?: string;
  available_days?: number;
}): Promise<WorkoutPlan> {
  return apiCall("/health/generate-workout", {
    method: "POST",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      ...data,
    }),
  });
}

/**
 * Get weight logs
 */
export async function getWeightLogs(
  userId: number = DEFAULT_USER_ID
): Promise<WeightLog[]> {
  return apiCall(`/health/weight/${userId}`);
}

/**
 * Add weight log
 */
export async function addWeightLog(data: {
  weight_kg: number;
  date?: string;
  notes?: string;
}): Promise<WeightLog> {
  return apiCall("/health/weight", {
    method: "POST",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      ...data,
    }),
  });
}

/**
 * Get workout logs
 */
export async function getWorkoutLogs(
  userId: number = DEFAULT_USER_ID
): Promise<WorkoutLog[]> {
  return apiCall(`/health/workout-logs/${userId}`);
}

/**
 * Log completed workout
 */
export async function logWorkout(data: {
  workout_date: string;
  exercises_completed: string[];
  duration_minutes?: number;
  notes?: string;
}): Promise<WorkoutLog> {
  return apiCall("/health/workout-log", {
    method: "POST",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      ...data,
    }),
  });
}

// ==================== NEWS API ====================

export interface NewsPreference {
  id: number;
  user_id: number;
  categories: string[];
  sources: string[];
  created_at: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  category?: string;
}

/**
 * Get news preferences
 */
export async function getNewsPreferences(
  userId: number = DEFAULT_USER_ID
): Promise<NewsPreference | null> {
  try {
    return await apiCall(`/news/preferences/${userId}`);
  } catch {
    return null;
  }
}

/**
 * Update news preferences
 */
export async function updateNewsPreferences(data: {
  categories: string[];
  sources: string[];
}): Promise<NewsPreference> {
  return apiCall("/news/preferences", {
    method: "POST",
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      ...data,
    }),
  });
}

/**
 * Get personalized news feed
 */
export async function getNewsFeed(
  userId: number = DEFAULT_USER_ID
): Promise<NewsArticle[]> {
  return apiCall(`/news/feed/${userId}`);
}

// ==================== AI CHAT API ====================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  suggestions?: string[];
}

export interface ChatResponse {
  message?: string;  // For fitness AI
  response?: string; // For general AI
  sources?: string[];
  suggestions?: string[];
  ai_powered?: boolean;
}

/**
 * Send message to general AI chat (handles everything: finance, workouts, news, etc.)
 */
export async function sendChatMessage(
  message: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<ChatResponse> {
  // User ID is automatically extracted from JWT token by backend
  return apiCall("/ai-chat/chat", {
    method: "POST",
    body: JSON.stringify({
      message: message,
    }),
  });
}

/**
 * Send message to Fitness AI chat (fitness-focused with sources and suggestions)
 */
export async function sendFitnessChatMessage(
  message: string,
  conversationHistory?: Array<{ role: string; content: string }>,
  userId: number = DEFAULT_USER_ID
): Promise<ChatResponse> {
  return apiCall("/health/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      message: message,
      conversation_history: conversationHistory || null,
    }),
  });
}

/**
 * Log workout using natural language
 */
export async function logWorkoutNL(
  message: string,
  userId: number = DEFAULT_USER_ID
): Promise<{
  message: string;
  logged_exercises: Array<{
    exercise: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration_minutes?: number;
  }>;
  ai_powered: boolean;
}> {
  return apiCall("/health/ai/log-workout", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      message: message,
    }),
  });
}

// ==================== USER API ====================

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  created_at: string;
}

/**
 * Get current user info (from JWT token)
 */
export async function getCurrentUserProfile(): Promise<User> {
  return apiCall("/users/me");
}

/**
 * Update current user profile
 */
export async function updateUserProfile(data: {
  full_name?: string;
  email?: string;
  phone_number?: string;
}): Promise<User> {
  return apiCall("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Change password
 */
export async function changePassword(data: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  return apiCall("/users/me/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Delete current user account
 */
export async function deleteUserAccount(): Promise<void> {
  return apiCall("/users/me", {
    method: "DELETE",
  });
}

/**
 * Get Telegram linking status
 */
export async function getTelegramStatus(): Promise<{
  is_linked: boolean;
  telegram_user_id: string | null;
}> {
  return apiCall("/users/me/telegram/status");
}

/**
 * Generate Telegram linking code
 */
export async function generateTelegramLinkingCode(): Promise<{
  telegram_linking_code: string;
  message: string;
}> {
  return apiCall("/users/me/telegram/generate-code", {
    method: "POST",
  });
}

/**
 * Unlink Telegram account
 */
export async function unlinkTelegram(): Promise<{ message: string }> {
  return apiCall("/users/me/telegram/unlink", {
    method: "DELETE",
  });
}

/**
 * Get user info (legacy - by ID)
 */
export async function getUser(userId: number = DEFAULT_USER_ID): Promise<User> {
  return apiCall(`/users/${userId}`);
}

/**
 * Update user info (legacy)
 */
export async function updateUser(data: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<User> {
  return apiCall(`/users/${DEFAULT_USER_ID}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ==================== ADMIN API ====================

export interface AdminStats {
  total_users: number;
  new_users_this_week: number;
  new_users_this_month: number;
  telegram_linked_users: number;
  active_users: number;
  recent_signups: User[];
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
  return apiCall(`/users/?skip=${skip}&limit=${limit}`);
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  const users = await getAllUsers(0, 1000);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newUsersThisWeek = users.filter(u => new Date(u.created_at) >= weekAgo).length;
  const newUsersThisMonth = users.filter(u => new Date(u.created_at) >= monthAgo).length;

  // Sort by created_at descending and take first 5
  const recentSignups = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    total_users: users.length,
    new_users_this_week: newUsersThisWeek,
    new_users_this_month: newUsersThisMonth,
    telegram_linked_users: 0, // We'll need to enhance this with actual data
    active_users: users.length, // Placeholder
    recent_signups: recentSignups,
  };
}

/**
 * Delete a user by ID (admin only)
 */
export async function deleteUser(userId: number): Promise<void> {
  return apiCall(`/users/${userId}`, {
    method: "DELETE",
  });
}

// ==================== DASHBOARD OVERVIEW API ====================

export interface DashboardOverview {
  finance: {
    total_expenses: number;
    total_income: number;
    net_balance: number;
    budget_remaining?: number;
  };
  health: {
    current_weight?: number;
    weight_change?: number;
    workouts_this_week: number;
    current_streak: number;
  };
  news: {
    unread_count: number;
    latest_category?: string;
  };
  recent_activity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

/**
 * Get dashboard overview (aggregated data)
 */
export async function getDashboardOverview(
  userId: number = DEFAULT_USER_ID
): Promise<DashboardOverview> {
  // This would be a custom endpoint, or we aggregate from multiple calls
  // For now, we'll aggregate client-side
  const [financeSummary, weightLogs, workoutLogs] = await Promise.all([
    getFinanceSummary(userId).catch(() => ({
      total_expenses: 0,
      total_income: 0,
      net_balance: 0,
      category_breakdown: {},
    })),
    getWeightLogs(userId).catch(() => []),
    getWorkoutLogs(userId).catch(() => []),
  ]);

  const latestWeight = weightLogs[0];
  const previousWeight = weightLogs[1];

  return {
    finance: {
      total_expenses: financeSummary.total_expenses || 0,
      total_income: financeSummary.total_income || 0,
      net_balance: financeSummary.net_balance || 0,
    },
    health: {
      current_weight: latestWeight?.weight_kg,
      weight_change: previousWeight
        ? latestWeight.weight_kg - previousWeight.weight_kg
        : undefined,
      workouts_this_week: workoutLogs.filter((log) => {
        const logDate = new Date(log.workout_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      }).length,
      current_streak: 0, // TODO: Calculate streak
    },
    news: {
      unread_count: 0, // TODO: Implement unread tracking
    },
    recent_activity: [],
  };
}

// ==================== CONVENIENCE ALIASES ====================

/**
 * Alias for createBudget (for backwards compatibility)
 */
export const setBudget = createBudget;

/**
 * Alias for createCategoryGoal (for backwards compatibility)
 */
export const addCategoryGoal = createCategoryGoal;

export default {
  // Finance
  getFinanceSummary,
  getFinanceRecords,
  addFinanceRecord,
  getBudget,
  createBudget,
  setBudget,
  getCategoryGoals,
  createCategoryGoal,
  addCategoryGoal,
  updateCategoryGoal,
  deleteCategoryGoal,
  // Recurring Expenses
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  processRecurringExpense,
  // Health
  getWorkoutPlan,
  generateWorkoutPlan,
  getWeightLogs,
  addWeightLog,
  getWorkoutLogs,
  logWorkout,
  // News
  getNewsPreferences,
  updateNewsPreferences,
  getNewsFeed,
  // AI Chat
  sendChatMessage,
  sendFitnessChatMessage,
  logWorkoutNL,
  // User
  getUser,
  updateUser,
  // Dashboard
  getDashboardOverview,
};
