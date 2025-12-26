/**
 * Cortana AI Backend API Integration
 * Connects Next.js dashboard to FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Default user ID (single-user system)
const DEFAULT_USER_ID = 1;

/**
 * Generic API call wrapper with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
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
  created_at: string;
}

/**
 * Get financial summary
 */
export async function getFinanceSummary(
  userId: number = DEFAULT_USER_ID,
  period: "weekly" | "monthly" = "monthly"
): Promise<FinanceSummary> {
  return apiCall(`/finance/summary/${userId}?period=${period}`);
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
  return apiCall(`/budget/category-goals/${userId}`);
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
}

export interface ChatResponse {
  response: string;
  intent?: string;
  confidence?: number;
}

/**
 * Send message to AI chat
 */
export async function sendChatMessage(
  message: string,
  userId: number = DEFAULT_USER_ID
): Promise<ChatResponse> {
  return apiCall("/ai/chat", {
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
  name: string;
  email?: string;
  phone?: string;
  telegram_id?: number;
  created_at: string;
}

/**
 * Get user info
 */
export async function getUser(userId: number = DEFAULT_USER_ID): Promise<User> {
  return apiCall(`/users/${userId}`);
}

/**
 * Update user info
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
    getFinanceSummary(userId),
    getWeightLogs(userId).catch(() => []),
    getWorkoutLogs(userId).catch(() => []),
  ]);

  const latestWeight = weightLogs[0];
  const previousWeight = weightLogs[1];

  return {
    finance: {
      total_expenses: financeSummary.total_expenses,
      total_income: financeSummary.total_income,
      net_balance: financeSummary.net_balance,
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

export default {
  // Finance
  getFinanceSummary,
  getFinanceRecords,
  addFinanceRecord,
  getBudget,
  createBudget,
  getCategoryGoals,
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
  // User
  getUser,
  updateUser,
  // Dashboard
  getDashboardOverview,
};
