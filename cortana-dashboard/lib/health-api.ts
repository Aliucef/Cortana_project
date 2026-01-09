const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";

// ==================== Gym Profile APIs ====================

export async function getGymProfile(userId: number) {
  const res = await fetch(`${API_BASE_URL}/health/profile/${userId}`);
  if (!res.ok) {
    if (res.status === 404) {
      return null; // No profile found
    }
    throw new Error("Failed to fetch gym profile");
  }
  return res.json();
}

export async function createGymProfile(userId: number, profileData: any) {
  const res = await fetch(`${API_BASE_URL}/health/profile?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error("Failed to create gym profile");
  return res.json();
}

export async function deleteGymProfile(userId: number) {
  const res = await fetch(`${API_BASE_URL}/health/profile/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete gym profile");
  return res.json();
}

// ==================== Workout Plan APIs ====================

export async function generateWorkoutPlan(userId: number, weeks: number = 4) {
  const res = await fetch(
    `${API_BASE_URL}/health/workout-plan/generate/${userId}?weeks=${weeks}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to generate workout plan");
  return res.json();
}

export async function generateAIWorkoutPlan(userId: number, description: string) {
  const res = await fetch(
    `${API_BASE_URL}/health/workout-plan/ai-generate/${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    }
  );
  if (!res.ok) throw new Error("Failed to generate AI workout plan");
  return res.json();
}

export async function getWorkoutPlans(userId: number, weekNumber?: number) {
  const url = weekNumber
    ? `${API_BASE_URL}/health/workout-plan/${userId}?week_number=${weekNumber}`
    : `${API_BASE_URL}/health/workout-plan/${userId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch workout plans");
  return res.json();
}

export async function getCurrentWeekWorkouts(userId: number) {
  const res = await fetch(`${API_BASE_URL}/health/workout-plan/current/${userId}`);
  if (!res.ok) {
    if (res.status === 404) {
      return null; // No workouts found
    }
    throw new Error("Failed to fetch current week workouts");
  }
  return res.json();
}

export async function markWorkoutComplete(planId: number) {
  const res = await fetch(`${API_BASE_URL}/health/workout-plan/${planId}/complete`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to mark workout complete");
  return res.json();
}

export async function updateWorkoutPlan(planId: number, workoutData: any) {
  const res = await fetch(`${API_BASE_URL}/workout/${planId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workoutData),
  });
  if (!res.ok) throw new Error("Failed to update workout plan");
  return res.json();
}

export async function deleteWorkoutPlan(planId: number) {
  const res = await fetch(`${API_BASE_URL}/workout/${planId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete workout plan");
  // Handle empty response (204 No Content)
  const text = await res.text();
  return text ? JSON.parse(text) : { message: "Deleted successfully" };
}

export async function deleteAllWorkouts(userId: number) {
  const res = await fetch(`${API_BASE_URL}/health/workout-plan/delete-all/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete all workouts");
  return res.json();
}

// ==================== Workout Logging APIs ====================

export async function logWorkout(userId: number, workoutData: any) {
  const res = await fetch(`${API_BASE_URL}/health/workout-log?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workoutData),
  });
  if (!res.ok) throw new Error("Failed to log workout");
  return res.json();
}

export async function getWorkoutLogs(userId: number, limit: number = 20) {
  const res = await fetch(
    `${API_BASE_URL}/health/workout-log/${userId}?limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch workout logs");
  return res.json();
}

// ==================== Weight Tracking APIs ====================

export async function logWeight(userId: number, weightData: any) {
  const res = await fetch(`${API_BASE_URL}/health/weight-log?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weightData),
  });
  if (!res.ok) throw new Error("Failed to log weight");
  return res.json();
}

export async function getWeightLogs(userId: number, limit: number = 20) {
  const res = await fetch(
    `${API_BASE_URL}/health/weight-log/${userId}?limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch weight logs");
  return res.json();
}

// ==================== Schedule APIs ====================

export async function updateGymSchedule(userId: number, scheduleData: any) {
  const res = await fetch(`${API_BASE_URL}/health/schedule?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scheduleData),
  });
  if (!res.ok) throw new Error("Failed to update gym schedule");
  return res.json();
}

export async function getGymSchedule(userId: number) {
  const res = await fetch(`${API_BASE_URL}/health/schedule/${userId}`);
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch gym schedule");
  }
  return res.json();
}

// ==================== Stats APIs ====================

export async function getWorkoutStats(userId: number) {
  const res = await fetch(`${API_BASE_URL}/health/stats/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch workout stats");
  return res.json();
}

// ==================== DASHBOARD APIs (NEW) ====================

// Type Definitions
export interface Exercise {
  id: number;
  name: string;
  category: string;
  equipment: string;
  difficulty: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions: string;
  tips: string;
  video_url?: string;
  is_system: boolean;
  created_at: string;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  frequency: string;
  split: string;
  duration: string;
  goal: string;
  workouts: any[];
  is_system: boolean;
  created_by_user_id?: number;
  created_at: string;
}

export interface PersonalRecord {
  id: number;
  user_id: number;
  exercise_name: string;
  max_weight?: number;
  max_reps?: number;
  record_type: "weight" | "reps";
  achieved_date: string;
  created_at: string;
}

export interface BodyMeasurement {
  id: number;
  user_id: number;
  date: string;
  weight: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
  notes?: string;
  created_at: string;
}

export interface WorkoutNote {
  id: number;
  user_id: number;
  workout_plan_id?: number;
  workout_name: string;
  note: string;
  difficulty?: number;
  energy?: number;
  tags?: string[];
  workout_date: string;
  created_at: string;
}

export interface RestDay {
  id: number;
  user_id: number;
  rest_date: string;
  is_scheduled: boolean;
  recovery_activities?: string[];
  notes?: string;
  created_at: string;
}

// ==================== Exercise Library APIs ====================

export async function getExercises(params?: {
  category?: string;
  equipment?: string;
  difficulty?: string;
  muscle?: string;
  search?: string;
  limit?: number;
}): Promise<Exercise[]> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.equipment) queryParams.append("equipment", params.equipment);
  if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
  if (params?.muscle) queryParams.append("muscle", params.muscle);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const query = queryParams.toString();
  const res = await fetch(`${API_BASE_URL}/health/exercises${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch exercises");
  return res.json();
}

export async function getExerciseById(id: number): Promise<Exercise> {
  const res = await fetch(`${API_BASE_URL}/health/exercises/${id}`);
  if (!res.ok) throw new Error("Failed to fetch exercise");
  return res.json();
}

// ==================== Workout Templates APIs ====================

export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const res = await fetch(`${API_BASE_URL}/health/templates`);
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
}

export async function getWorkoutTemplateById(id: number): Promise<WorkoutTemplate> {
  const res = await fetch(`${API_BASE_URL}/health/templates/${id}`);
  if (!res.ok) throw new Error("Failed to fetch template");
  return res.json();
}

// ==================== Personal Records APIs ====================

export async function getPersonalRecords(userId: number): Promise<PersonalRecord[]> {
  const res = await fetch(`${API_BASE_URL}/health/records/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch personal records");
  return res.json();
}

export async function addPersonalRecord(
  userId: number,
  record: {
    exercise_name: string;
    max_weight?: number;
    max_reps?: number;
    record_type: "weight" | "reps";
    achieved_date: string;
  }
): Promise<PersonalRecord> {
  const res = await fetch(`${API_BASE_URL}/health/records?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error("Failed to add personal record");
  return res.json();
}

export async function deletePersonalRecord(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/health/records/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete personal record");
}

// ==================== Body Measurements APIs ====================

export async function getBodyMeasurements(userId: number): Promise<BodyMeasurement[]> {
  const res = await fetch(`${API_BASE_URL}/health/measurements/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch measurements");
  return res.json();
}

export async function getLatestBodyMeasurement(userId: number): Promise<BodyMeasurement | null> {
  const res = await fetch(`${API_BASE_URL}/health/measurements/latest/${userId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch latest measurement");
  return res.json();
}

export async function addBodyMeasurement(
  userId: number,
  measurement: {
    date: string;
    weight: number;
    body_fat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    legs?: number;
    notes?: string;
  }
): Promise<BodyMeasurement> {
  const res = await fetch(`${API_BASE_URL}/health/measurements?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(measurement),
  });
  if (!res.ok) throw new Error("Failed to add measurement");
  return res.json();
}

// ==================== Workout Notes APIs ====================

export async function getWorkoutNotes(userId: number): Promise<WorkoutNote[]> {
  const res = await fetch(`${API_BASE_URL}/health/notes/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch workout notes");
  return res.json();
}

export async function addWorkoutNote(
  userId: number,
  note: {
    workout_plan_id?: number;
    workout_name: string;
    note: string;
    difficulty?: number;
    energy?: number;
    tags?: string[];
    workout_date: string;
  }
): Promise<WorkoutNote> {
  const res = await fetch(`${API_BASE_URL}/health/notes?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to add workout note");
  return res.json();
}

export async function deleteWorkoutNote(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/health/notes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete workout note");
}

// ==================== Rest Days APIs ====================

export async function getRestDays(userId: number): Promise<RestDay[]> {
  const res = await fetch(`${API_BASE_URL}/health/rest-days/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch rest days");
  return res.json();
}

export async function scheduleRestDay(
  userId: number,
  restDay: {
    rest_date: string;
    is_scheduled: boolean;
    recovery_activities?: string[];
    notes?: string;
  }
): Promise<RestDay> {
  const res = await fetch(`${API_BASE_URL}/health/rest-days?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(restDay),
  });
  if (!res.ok) throw new Error("Failed to schedule rest day");
  return res.json();
}

export async function deleteRestDay(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/health/rest-days/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete rest day");
}

// ==================== Calendar APIs ====================

export async function getCalendarData(
  userId: number,
  month: number,
  year: number
): Promise<any[]> {
  const res = await fetch(
    `${API_BASE_URL}/health/calendar/${userId}?month=${month}&year=${year}`
  );
  if (!res.ok) throw new Error("Failed to fetch calendar data");
  return res.json();
}

// ==================== History APIs ====================

export async function getWorkoutHistory(
  userId: number,
  params?: {
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
    muscle_group?: string;
    search?: string;
  }
): Promise<any[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.muscle_group) queryParams.append("muscle_group", params.muscle_group);
  if (params?.search) queryParams.append("search", params.search);

  const query = queryParams.toString();
  const res = await fetch(
    `${API_BASE_URL}/health/history/${userId}${query ? `?${query}` : ""}`
  );
  if (!res.ok) throw new Error("Failed to fetch workout history");
  return res.json();
}

// ==================== AI Progress Insights API ====================

export interface ProgressInsight {
  type: "positive" | "warning" | "neutral";
  message: string;
}

export interface AIProgressAnalysis {
  progress_score: number;
  summary: string;
  insights: ProgressInsight[];
  recommendations: string[];
  warnings: string[];
  data_points: {
    workouts: number;
    weight_logs: number;
    prs: number;
    rest_days: number;
  };
}

export async function getAIProgressInsights(
  userId: number,
  periodDays: number = 30
): Promise<AIProgressAnalysis> {
  const res = await fetch(
    `${API_BASE_URL}/health/ai/analyze/${userId}?period_days=${periodDays}`
  );
  if (!res.ok) throw new Error("Failed to fetch AI progress insights");
  return res.json();
}

// ==================== AI Workout Logger API ====================

export interface LoggedExercise {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface AIWorkoutLogResponse {
  message: string;
  logged_exercises: LoggedExercise[];
  ai_powered: boolean;
}

export async function logWorkoutWithAI(
  userId: number,
  message: string
): Promise<AIWorkoutLogResponse> {
  const res = await fetch(`${API_BASE_URL}/health/ai/log-workout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message }),
  });
  if (!res.ok) throw new Error("Failed to log workout with AI");
  return res.json();
}
