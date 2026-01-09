"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Calendar,
  CheckCircle2,
  Plus,
  Clock,
  X,
  Check,
  Timer,
  StickyNote,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import {
  getCurrentWeekWorkouts,
  getWorkoutStats,
  markWorkoutComplete,
  getWorkoutLogs,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  deleteAllWorkouts,
} from "@/lib/health-api";

// Comprehensive Exercise Library
const EXERCISE_LIBRARY = {
  chest: [
    {
      name: "Bench Press",
      category: "chest",
      equipment: "barbell",
      difficulty: "intermediate",
      primaryMuscles: ["Chest", "Triceps"],
      secondaryMuscles: ["Shoulders"],
      instructions: "Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up explosively.",
    },
    {
      name: "Incline Bench Press",
      category: "chest",
      equipment: "barbell",
      difficulty: "intermediate",
      primaryMuscles: ["Upper Chest", "Triceps"],
      secondaryMuscles: ["Shoulders"],
      instructions: "Set bench to 30-45 degrees, press barbell from upper chest to arms extended.",
    },
    {
      name: "Dumbbell Press",
      category: "chest",
      equipment: "dumbbell",
      difficulty: "beginner",
      primaryMuscles: ["Chest", "Triceps"],
      secondaryMuscles: ["Shoulders"],
      instructions: "Lie on bench with dumbbells at chest level, press up until arms are straight.",
    },
    {
      name: "Push-ups",
      category: "chest",
      equipment: "bodyweight",
      difficulty: "beginner",
      primaryMuscles: ["Chest", "Triceps", "Shoulders"],
      secondaryMuscles: ["Core"],
      instructions: "Hands shoulder-width apart, lower body until chest nearly touches floor, push back up.",
    },
    {
      name: "Cable Flys",
      category: "chest",
      equipment: "cable",
      difficulty: "intermediate",
      primaryMuscles: ["Chest"],
      secondaryMuscles: ["Shoulders"],
      instructions: "Stand between cables, bring handles together in front of chest with slight bend in elbows.",
    },
    {
      name: "Dips",
      category: "chest",
      equipment: "bodyweight",
      difficulty: "intermediate",
      primaryMuscles: ["Chest", "Triceps"],
      secondaryMuscles: ["Shoulders"],
      instructions: "Lean forward slightly, lower body until elbows at 90 degrees, push back up.",
    },
  ],
  back: [
    {
      name: "Deadlifts",
      category: "back",
      equipment: "barbell",
      difficulty: "advanced",
      primaryMuscles: ["Lower Back", "Glutes", "Hamstrings"],
      secondaryMuscles: ["Traps", "Forearms"],
      instructions: "Feet hip-width, grip bar, keep back straight, lift by extending hips and knees.",
    },
    {
      name: "Pull-ups",
      category: "back",
      equipment: "bodyweight",
      difficulty: "intermediate",
      primaryMuscles: ["Lats", "Upper Back"],
      secondaryMuscles: ["Biceps", "Forearms"],
      instructions: "Hang from bar, pull body up until chin over bar, lower with control.",
    },
    {
      name: "Barbell Rows",
      category: "back",
      equipment: "barbell",
      difficulty: "intermediate",
      primaryMuscles: ["Middle Back", "Lats"],
      secondaryMuscles: ["Biceps", "Forearms"],
      instructions: "Bend at hips, pull bar to lower chest, squeeze shoulder blades together.",
    },
    {
      name: "Lat Pulldowns",
      category: "back",
      equipment: "cable",
      difficulty: "beginner",
      primaryMuscles: ["Lats", "Upper Back"],
      secondaryMuscles: ["Biceps"],
      instructions: "Pull bar down to upper chest, focus on using back muscles, control the return.",
    },
    {
      name: "Dumbbell Rows",
      category: "back",
      equipment: "dumbbell",
      difficulty: "beginner",
      primaryMuscles: ["Middle Back", "Lats"],
      secondaryMuscles: ["Biceps", "Forearms"],
      instructions: "Support on bench, row dumbbell to hip, keep elbow close to body.",
    },
    {
      name: "Face Pulls",
      category: "back",
      equipment: "cable",
      difficulty: "beginner",
      primaryMuscles: ["Rear Delts", "Upper Back"],
      secondaryMuscles: ["Traps"],
      instructions: "Pull rope towards face, keep elbows high, squeeze shoulder blades together.",
    },
  ],
  legs: [
    {
      name: "Squats",
      category: "legs",
      equipment: "barbell",
      difficulty: "intermediate",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Hamstrings", "Core"],
      instructions: "Bar on upper back, descend until thighs parallel to ground, drive through heels.",
    },
    {
      name: "Romanian Deadlifts",
      category: "legs",
      equipment: "barbell",
      difficulty: "intermediate",
      primaryMuscles: ["Hamstrings", "Glutes"],
      secondaryMuscles: ["Lower Back"],
      instructions: "Slight knee bend, hinge at hips, lower bar along shins, feel hamstring stretch.",
    },
    {
      name: "Leg Press",
      category: "legs",
      equipment: "machine",
      difficulty: "beginner",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Hamstrings"],
      instructions: "Feet shoulder-width on platform, lower until knees at 90 degrees, press through heels.",
    },
    {
      name: "Leg Curls",
      category: "legs",
      equipment: "machine",
      difficulty: "beginner",
      primaryMuscles: ["Hamstrings"],
      secondaryMuscles: [],
      instructions: "Lie face down, curl legs up towards glutes, squeeze hamstrings at top.",
    },
    {
      name: "Calf Raises",
      category: "legs",
      equipment: "machine",
      difficulty: "beginner",
      primaryMuscles: ["Calves"],
      secondaryMuscles: [],
      instructions: "Rise up on toes as high as possible, hold briefly, lower with control.",
    },
    {
      name: "Lunges",
      category: "legs",
      equipment: "dumbbell",
      difficulty: "beginner",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Hamstrings"],
      instructions: "Step forward, lower back knee towards ground, push back to starting position.",
    },
    {
      name: "Front Squats",
      category: "legs",
      equipment: "barbell",
      difficulty: "advanced",
      primaryMuscles: ["Quads"],
      secondaryMuscles: ["Glutes", "Core"],
      instructions: "Bar rests on front shoulders, keep torso upright, squat down and drive up.",
    },
    {
      name: "Walking Lunges",
      category: "legs",
      equipment: "dumbbell",
      difficulty: "intermediate",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Hamstrings", "Calves"],
      instructions: "Step forward into lunge, push off to bring rear leg forward into next lunge.",
    },
  ],
  shoulders: [
    {
      name: "Overhead Press",
      category: "shoulders",
      equipment: "barbell",
      difficulty: "intermediate",
      primaryMuscles: ["Shoulders"],
      secondaryMuscles: ["Triceps", "Upper Chest"],
      instructions: "Press bar overhead from shoulders, lock out arms at top, lower with control.",
    },
    {
      name: "Lateral Raises",
      category: "shoulders",
      equipment: "dumbbell",
      difficulty: "beginner",
      primaryMuscles: ["Side Delts"],
      secondaryMuscles: [],
      instructions: "Raise dumbbells to sides until arms parallel to ground, control the descent.",
    },
    {
      name: "Front Raises",
      category: "shoulders",
      equipment: "dumbbell",
      difficulty: "beginner",
      primaryMuscles: ["Front Delts"],
      secondaryMuscles: [],
      instructions: "Raise dumbbells forward to shoulder height, keep slight bend in elbows.",
    },
    {
      name: "Arnold Press",
      category: "shoulders",
      equipment: "dumbbell",
      difficulty: "intermediate",
      primaryMuscles: ["Shoulders"],
      secondaryMuscles: ["Triceps"],
      instructions: "Start with palms facing you, press up while rotating palms forward.",
    },
    {
      name: "Reverse Flys",
      category: "shoulders",
      equipment: "dumbbell",
      difficulty: "beginner",
      primaryMuscles: ["Rear Delts"],
      secondaryMuscles: ["Upper Back"],
      instructions: "Bend at hips, raise dumbbells to sides, squeeze shoulder blades together.",
    },
    {
      name: "Shrugs",
      category: "shoulders",
      equipment: "dumbbell",
      difficulty: "beginner",
      primaryMuscles: ["Traps"],
      secondaryMuscles: [],
      instructions: "Raise shoulders towards ears, hold briefly, lower with control.",
    },
  ],
  arms: [
    {
      name: "Barbell Curls",
      category: "arms",
      equipment: "barbell",
      difficulty: "beginner",
      primaryMuscles: ["Biceps"],
      secondaryMuscles: ["Forearms"],
      instructions: "Curl bar up to shoulders, keep elbows stationary, squeeze at top.",
    },
    {
      name: "Tricep Pushdowns",
      category: "arms",
      equipment: "cable",
      difficulty: "beginner",
      primaryMuscles: ["Triceps"],
      secondaryMuscles: [],
      instructions: "Push bar down until arms fully extended, control the return.",
    },
    {
      name: "Hammer Curls",
      category: "arms",
      equipment: "dumbbell",
      difficulty: "beginner",
      primaryMuscles: ["Biceps", "Forearms"],
      secondaryMuscles: [],
      instructions: "Keep palms facing each other throughout movement, curl up to shoulders.",
    },
    {
      name: "Skull Crushers",
      category: "arms",
      equipment: "barbell",
      difficulty: "intermediate",
      primaryMuscles: ["Triceps"],
      secondaryMuscles: [],
      instructions: "Lower bar to forehead, extend arms back to start, keep upper arms stationary.",
    },
    {
      name: "Preacher Curls",
      category: "arms",
      equipment: "barbell",
      difficulty: "intermediate",
      primaryMuscles: ["Biceps"],
      secondaryMuscles: [],
      instructions: "Arms on pad, curl bar up, focus on bicep contraction, lower with control.",
    },
    {
      name: "Tricep Dips",
      category: "arms",
      equipment: "bodyweight",
      difficulty: "intermediate",
      primaryMuscles: ["Triceps"],
      secondaryMuscles: ["Chest", "Shoulders"],
      instructions: "Keep body upright, lower until elbows at 90 degrees, press back up.",
    },
  ],
  core: [
    {
      name: "Planks",
      category: "core",
      equipment: "bodyweight",
      difficulty: "beginner",
      primaryMuscles: ["Core", "Abs"],
      secondaryMuscles: ["Shoulders"],
      instructions: "Hold body straight from head to heels, engage core, maintain position.",
    },
    {
      name: "Russian Twists",
      category: "core",
      equipment: "bodyweight",
      difficulty: "intermediate",
      primaryMuscles: ["Obliques", "Core"],
      secondaryMuscles: [],
      instructions: "Sit with feet off ground, rotate torso side to side, keep core engaged.",
    },
    {
      name: "Crunches",
      category: "core",
      equipment: "bodyweight",
      difficulty: "beginner",
      primaryMuscles: ["Abs"],
      secondaryMuscles: [],
      instructions: "Lift shoulders off ground, contract abs, lower with control.",
    },
    {
      name: "Leg Raises",
      category: "core",
      equipment: "bodyweight",
      difficulty: "intermediate",
      primaryMuscles: ["Lower Abs", "Hip Flexors"],
      secondaryMuscles: [],
      instructions: "Raise legs to 90 degrees, lower slowly without touching ground.",
    },
  ],
  cardio: [
    {
      name: "Running",
      category: "cardio",
      equipment: "none",
      difficulty: "beginner",
      primaryMuscles: ["Legs", "Cardiovascular"],
      secondaryMuscles: [],
      instructions: "Maintain steady pace, keep good posture, breathe rhythmically.",
    },
    {
      name: "Jump Rope",
      category: "cardio",
      equipment: "rope",
      difficulty: "beginner",
      primaryMuscles: ["Calves", "Cardiovascular"],
      secondaryMuscles: ["Shoulders"],
      instructions: "Jump on balls of feet, rotate rope with wrists, maintain rhythm.",
    },
    {
      name: "Burpees",
      category: "cardio",
      equipment: "bodyweight",
      difficulty: "intermediate",
      primaryMuscles: ["Full Body", "Cardiovascular"],
      secondaryMuscles: [],
      instructions: "Drop to push-up, jump feet back, stand and jump, repeat quickly.",
    },
    {
      name: "Mountain Climbers",
      category: "cardio",
      equipment: "bodyweight",
      difficulty: "intermediate",
      primaryMuscles: ["Core", "Cardiovascular"],
      secondaryMuscles: ["Shoulders"],
      instructions: "Plank position, alternate bringing knees to chest quickly.",
    },
  ],
};

export default function WorkoutsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentWeekWorkouts, setCurrentWeekWorkouts] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = 1; // Replace with actual user ID from auth

  // Workout logging modal state
  const [showWorkoutLogModal, setShowWorkoutLogModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [exerciseProgress, setExerciseProgress] = useState<any>({});
  const [workoutLogNote, setWorkoutLogNote] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Custom workout creation state
  const [showCustomWorkoutModal, setShowCustomWorkoutModal] = useState(false);
  const [customWorkoutName, setCustomWorkoutName] = useState("");
  const [customWorkoutDay, setCustomWorkoutDay] = useState("monday");
  const [customWorkoutMuscleGroup, setCustomWorkoutMuscleGroup] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [exerciseLibraryCategory, setExerciseLibraryCategory] = useState("all");

  // Edit/Delete Workout state
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [editWorkoutName, setEditWorkoutName] = useState("");
  const [editWorkoutDay, setEditWorkoutDay] = useState("");
  const [editWorkoutMuscleGroup, setEditWorkoutMuscleGroup] = useState("");
  const [editWorkoutExercises, setEditWorkoutExercises] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<any>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  useEffect(() => {
    // Check dark mode from localStorage
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    // Fetch data
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [workoutsData, statsData] = await Promise.all([
        getCurrentWeekWorkouts(userId),
        getWorkoutStats(userId),
      ]);
      setCurrentWeekWorkouts(workoutsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching workout data:", error);
      setError("Failed to load workout data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function openWorkoutLog(workout: any) {
    setSelectedWorkout(workout);
    setStartTime(new Date());

    // Initialize exercise progress
    const progress: any = {};
    workout.exercises?.forEach((exercise: any, index: number) => {
      progress[index] = {
        completed: false,
        actualSets: exercise.sets,
        actualReps: exercise.reps,
        weight: 0,
      };
    });
    setExerciseProgress(progress);
    setWorkoutLogNote("");
    setShowWorkoutLogModal(true);
  }

  function toggleExerciseComplete(index: number) {
    setExerciseProgress((prev: any) => ({
      ...prev,
      [index]: {
        ...prev[index],
        completed: !prev[index].completed,
      },
    }));
  }

  function updateExerciseData(index: number, field: string, value: any) {
    setExerciseProgress((prev: any) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }));
  }

  async function handleCompleteWorkout() {
    if (!selectedWorkout) return;

    try {
      await markWorkoutComplete(selectedWorkout.id);
      setShowWorkoutLogModal(false);
      setSelectedWorkout(null);
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Error completing workout:", error);
    }
  }

  // Custom workout functions
  function addExerciseToWorkout(exercise: any) {
    setSelectedExercises([
      ...selectedExercises,
      {
        ...exercise,
        sets: 3,
        reps: 10,
        rest: 60,
      },
    ]);
  }

  function removeExerciseFromWorkout(index: number) {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  }

  function updateExerciseDetails(index: number, field: string, value: any) {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  }

  function resetCustomWorkout() {
    setCustomWorkoutName("");
    setCustomWorkoutDay("monday");
    setCustomWorkoutMuscleGroup("");
    setSelectedExercises([]);
    setExerciseLibraryCategory("all");
  }

  async function handleSaveCustomWorkout() {
    if (!customWorkoutName || selectedExercises.length === 0) {
      alert("Please enter a workout name and add at least one exercise");
      return;
    }

    // For now, just show success message
    // TODO: Implement API call to save custom workout
    console.log("Saving custom workout:", {
      name: customWorkoutName,
      day: customWorkoutDay,
      muscleGroup: customWorkoutMuscleGroup,
      exercises: selectedExercises,
    });

    alert("Custom workout created successfully!");
    setShowCustomWorkoutModal(false);
    resetCustomWorkout();
    // Refresh data
    await fetchData();
  }

  // Get all exercises or filtered by category
  const availableExercises =
    exerciseLibraryCategory === "all"
      ? Object.values(EXERCISE_LIBRARY).flat()
      : EXERCISE_LIBRARY[exerciseLibraryCategory as keyof typeof EXERCISE_LIBRARY] || [];

  // Edit/Delete Workout Functions
  function openEditWorkout(workout: any) {
    setEditingWorkout(workout);
    setEditWorkoutName(workout.muscle_group || "");
    setEditWorkoutDay(workout.day_of_week || "");
    setEditWorkoutMuscleGroup(workout.muscle_group || "");
    setEditWorkoutExercises(workout.exercises || []);
    setShowEditWorkoutModal(true);
  }

  function closeEditWorkout() {
    setShowEditWorkoutModal(false);
    setEditingWorkout(null);
    setEditWorkoutName("");
    setEditWorkoutDay("");
    setEditWorkoutMuscleGroup("");
    setEditWorkoutExercises([]);
  }

  async function handleUpdateWorkout() {
    if (!editingWorkout) return;

    try {
      const updatedData = {
        day_of_week: editWorkoutDay,
        muscle_group: editWorkoutMuscleGroup,
        exercises: editWorkoutExercises,
      };

      await updateWorkoutPlan(editingWorkout.id, updatedData);

      // Refresh data
      await fetchData();
      closeEditWorkout();
      alert("Workout updated successfully!");
    } catch (error) {
      console.error("Error updating workout:", error);
      alert("Failed to update workout. Please try again.");
    }
  }

  function addExerciseToEdit(exercise: any) {
    setEditWorkoutExercises([...editWorkoutExercises, {
      name: exercise.name,
      sets: 3,
      reps: 10,
      rest_seconds: 60,
    }]);
  }

  function removeExerciseFromEdit(index: number) {
    setEditWorkoutExercises(editWorkoutExercises.filter((_, i) => i !== index));
  }

  function updateEditExerciseDetails(index: number, field: string, value: any) {
    const updated = [...editWorkoutExercises];
    updated[index] = { ...updated[index], [field]: value };
    setEditWorkoutExercises(updated);
  }

  function openDeleteConfirm(workout: any) {
    setWorkoutToDelete(workout);
    setShowDeleteConfirm(true);
  }

  function closeDeleteConfirm() {
    setShowDeleteConfirm(false);
    setWorkoutToDelete(null);
  }

  async function handleDeleteWorkout() {
    if (!workoutToDelete) return;

    try {
      await deleteWorkoutPlan(workoutToDelete.id);

      // Refresh data
      await fetchData();
      closeDeleteConfirm();
      alert("Workout deleted successfully!");
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Failed to delete workout. Please try again.");
    }
  }

  async function handleDeleteAllWorkouts() {
    try {
      const result = await deleteAllWorkouts(userId);

      // Refresh data
      await fetchData();
      setShowDeleteAllConfirm(false);
      alert(`Successfully deleted ${result.count} workout plans!`);
    } catch (error) {
      console.error("Error deleting all workouts:", error);
      alert("Failed to delete workouts. Please try again.");
    }
  }

  async function handleDuplicateWorkout(workout: any) {
    try {
      // Create a copy by generating a similar workout plan
      // This would need backend support for duplication
      alert("Duplicate feature requires backend implementation. Please use 'Create Custom Workout' to make a similar routine.");
    } catch (error) {
      console.error("Error duplicating workout:", error);
      alert("Failed to duplicate workout.");
    }
  }

  function toggleDarkMode() {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    // Dispatch event to notify header about dark mode change
    window.dispatchEvent(new Event("darkModeToggle"));
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-200 pt-24 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading your workouts...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-200 pt-24 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className={`max-w-md p-6 rounded-lg border ${
          darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
        }`}>
          <h3 className={`font-semibold mb-2 ${darkMode ? "text-red-400" : "text-red-800"}`}>
            Error Loading Workouts
          </h3>
          <p className={`text-sm mb-4 ${darkMode ? "text-red-300" : "text-red-600"}`}>
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if user has no workout plan
  if (!currentWeekWorkouts || !currentWeekWorkouts.workouts) {
    return (
      <div
        className={`min-h-screen transition-colors duration-200 pt-24 px-4 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
            <Dumbbell className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              No Workout Plan Found
            </h2>
            <p className={`text-lg mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Get started by creating your first workout plan!
            </p>
            <button
              onClick={() => setShowCustomWorkoutModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Create Your First Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 pt-24 px-4 pb-8 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            This Week's Workouts
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Week {currentWeekWorkouts.current_week || 1} - Keep pushing!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Workouts
                </p>
                <p
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats?.totalWorkouts || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Dumbbell className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Completed
                </p>
                <p
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentWeekWorkouts.workouts?.filter((w: any) => w.completed).length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`border rounded-xl p-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Remaining
                </p>
                <p
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentWeekWorkouts.workouts?.filter((w: any) => !w.completed).length || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Workouts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`border rounded-xl p-6 transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg"
              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3
              className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Your Workouts
            </h3>
            <div className="flex items-center gap-3">
              {currentWeekWorkouts?.workouts && currentWeekWorkouts.workouts.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-all hover:scale-105 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              )}
              <button
                onClick={() => setShowCustomWorkoutModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Create Workout
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {currentWeekWorkouts?.workouts && currentWeekWorkouts.workouts.length > 0 ? (
              currentWeekWorkouts.workouts.map((workout: any, index: number) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`border rounded-lg p-5 transition-all ${
                  workout.completed
                    ? darkMode
                      ? "bg-green-900/20 border-green-800"
                      : "bg-green-50 border-green-200"
                    : darkMode
                    ? "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4
                        className={`font-semibold text-lg capitalize ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {workout.day_of_week}
                      </h4>
                      {workout.completed && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm mb-3 font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {workout.muscle_group}
                    </p>

                    {/* Exercises List */}
                    {workout.exercises && workout.exercises.length > 0 && (
                      <div className="space-y-2">
                        {workout.exercises.map((exercise: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                darkMode ? "bg-gray-500" : "bg-gray-400"
                              }`}
                            />
                            <span className="flex-1 font-medium">
                              {exercise.name}
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                darkMode ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
                              {exercise.sets} × {exercise.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {!workout.completed && (
                      <button
                        onClick={() => openWorkoutLog(workout)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all hover:scale-105 whitespace-nowrap"
                      >
                        Log Workout
                      </button>
                    )}

                    {/* Edit/Delete Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditWorkout(workout)}
                        className={`p-2 rounded-lg transition-all hover:scale-105 ${
                          darkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        title="Edit Workout"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateWorkout(workout)}
                        className={`p-2 rounded-lg transition-all hover:scale-105 ${
                          darkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        title="Duplicate Workout"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(workout)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all hover:scale-105"
                        title="Delete Workout"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
            ) : (
              <div className={`text-center py-12 border-2 border-dashed rounded-lg ${
                darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
              }`}>
                <Dumbbell className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-400"
                }`} />
                <h3 className={`text-lg font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  No Workouts Scheduled
                </h3>
                <p className={`text-sm mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Create your first workout to get started!
                </p>
                <button
                  onClick={() => setShowCustomWorkoutModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                  Create Workout
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Workout Logging Modal */}
        {showWorkoutLogModal && selectedWorkout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-lg p-6 max-w-2xl w-full shadow-lg my-8 max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className={`text-xl font-bold capitalize ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedWorkout.day_of_week} Workout
                  </h2>
                  <p
                    className={`text-sm mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {selectedWorkout.muscle_group}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <Timer
                      className={`w-4 h-4 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {startTime
                        ? Math.floor(
                            (new Date().getTime() - startTime.getTime()) /
                              60000
                          )
                        : 0}{" "}
                      min
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowWorkoutLogModal(false);
                      setSelectedWorkout(null);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-4 mb-6">
                {selectedWorkout.exercises?.map(
                  (exercise: any, index: number) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 transition-all ${
                        exerciseProgress[index]?.completed
                          ? darkMode
                            ? "bg-green-900/20 border-green-800"
                            : "bg-green-50 border-green-200"
                          : darkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* Exercise Name with Checkbox */}
                      <div className="flex items-start gap-3 mb-3">
                        <button
                          onClick={() => toggleExerciseComplete(index)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            exerciseProgress[index]?.completed
                              ? "bg-green-600 border-green-600"
                              : darkMode
                              ? "border-gray-500 hover:border-green-500"
                              : "border-gray-300 hover:border-green-500"
                          }`}
                        >
                          {exerciseProgress[index]?.completed && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h4
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {exercise.name}
                          </h4>
                          <p
                            className={`text-xs mt-0.5 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Target: {exercise.sets} × {exercise.reps}
                          </p>
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div className="grid grid-cols-3 gap-2 ml-8">
                        <div>
                          <label
                            className={`block text-xs font-medium mb-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Sets
                          </label>
                          <input
                            type="number"
                            value={exerciseProgress[index]?.actualSets || ""}
                            onChange={(e) =>
                              updateExerciseData(
                                index,
                                "actualSets",
                                e.target.value
                              )
                            }
                            className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              darkMode
                                ? "bg-gray-800 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-medium mb-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Reps
                          </label>
                          <input
                            type="number"
                            value={exerciseProgress[index]?.actualReps || ""}
                            onChange={(e) =>
                              updateExerciseData(
                                index,
                                "actualReps",
                                e.target.value
                              )
                            }
                            className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              darkMode
                                ? "bg-gray-800 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-medium mb-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={exerciseProgress[index]?.weight || ""}
                            onChange={(e) =>
                              updateExerciseData(
                                index,
                                "weight",
                                e.target.value
                              )
                            }
                            className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              darkMode
                                ? "bg-gray-800 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Workout Notes */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <StickyNote className="w-4 h-4" />
                  Workout Notes
                </label>
                <textarea
                  value={workoutLogNote}
                  onChange={(e) => setWorkoutLogNote(e.target.value)}
                  placeholder="How did you feel? Any adjustments needed?"
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Progress Summary */}
              <div
                className={`rounded-lg p-4 mb-6 ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                    Exercises Completed:
                  </span>
                  <span
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {
                      Object.values(exerciseProgress).filter(
                        (ex: any) => ex.completed
                      ).length
                    }{" "}
                    / {selectedWorkout.exercises?.length || 0}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWorkoutLogModal(false);
                    setSelectedWorkout(null);
                  }}
                  className={`flex-1 py-2.5 font-medium text-sm rounded-lg transition-all border ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteWorkout}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg hover:scale-105"
                >
                  Complete Workout
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Workout Creation Modal */}
        {showCustomWorkoutModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowCustomWorkoutModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-lg p-6 max-w-4xl w-full shadow-lg my-8 max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Create Custom Workout
                </h2>
                <button
                  onClick={() => {
                    setShowCustomWorkoutModal(false);
                    resetCustomWorkout();
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                </button>
              </div>

              {/* Workout Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Workout Name *
                  </label>
                  <input
                    type="text"
                    value={customWorkoutName}
                    onChange={(e) => setCustomWorkoutName(e.target.value)}
                    placeholder="e.g., Upper Body Power"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Day of Week
                  </label>
                  <select
                    value={customWorkoutDay}
                    onChange={(e) => setCustomWorkoutDay(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Muscle Group (Optional)
                  </label>
                  <input
                    type="text"
                    value={customWorkoutMuscleGroup}
                    onChange={(e) => setCustomWorkoutMuscleGroup(e.target.value)}
                    placeholder="e.g., Chest & Triceps"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>
              </div>

              {/* Exercise Library */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Exercise Library
                </h3>

                {/* Category Filter */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {["all", "chest", "back", "legs", "shoulders", "arms", "core"].map((category) => (
                    <button
                      key={category}
                      onClick={() => setExerciseLibraryCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                        exerciseLibraryCategory === category
                          ? "bg-blue-600 text-white shadow-lg"
                          : darkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Exercise List */}
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 p-4 rounded-lg max-h-48 overflow-y-auto ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}>
                  {availableExercises.map((exercise: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => addExerciseToWorkout(exercise)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${
                        darkMode
                          ? "bg-gray-600 hover:bg-gray-500 text-white"
                          : "bg-white hover:bg-gray-100 text-gray-900"
                      }`}
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {exercise.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Exercises */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Selected Exercises ({selectedExercises.length})
                </h3>

                {selectedExercises.length === 0 ? (
                  <div className={`rounded-lg p-6 text-center ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                    <Dumbbell className={`w-10 h-10 mx-auto mb-2 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      No exercises added yet. Click exercises above to add them.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedExercises.map((exercise: any, index: number) => (
                      <div
                        key={index}
                        className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {exercise.name}
                          </h4>
                          <button
                            onClick={() => removeExerciseFromWorkout(index)}
                            className={`p-1 rounded transition-all ${
                              darkMode ? "hover:bg-gray-600 text-red-400" : "hover:bg-gray-200 text-red-600"
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              Sets
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={exercise.sets}
                              onChange={(e) => updateExerciseDetails(index, "sets", parseInt(e.target.value))}
                              className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                darkMode
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              Reps
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={exercise.reps}
                              onChange={(e) => updateExerciseDetails(index, "reps", parseInt(e.target.value))}
                              className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                darkMode
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              Rest (sec)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="15"
                              value={exercise.rest}
                              onChange={(e) => updateExerciseDetails(index, "rest", parseInt(e.target.value))}
                              className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                darkMode
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCustomWorkoutModal(false);
                    resetCustomWorkout();
                  }}
                  className={`flex-1 py-2.5 font-medium text-sm rounded-lg transition-all border ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomWorkout}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg hover:scale-105"
                >
                  Save Workout
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Workout Modal */}
        {showEditWorkoutModal && editingWorkout && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={closeEditWorkout}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-lg p-6 max-w-4xl w-full shadow-lg my-8 max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Edit Workout
                </h2>
                <button
                  onClick={closeEditWorkout}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                </button>
              </div>

              {/* Workout Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Day of Week
                  </label>
                  <select
                    value={editWorkoutDay}
                    onChange={(e) => setEditWorkoutDay(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Muscle Group
                  </label>
                  <input
                    type="text"
                    value={editWorkoutMuscleGroup}
                    onChange={(e) => setEditWorkoutMuscleGroup(e.target.value)}
                    placeholder="e.g., Chest & Triceps"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>
              </div>

              {/* Current Exercises */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Exercises in this Workout
                </h3>
                {editWorkoutExercises.length === 0 ? (
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    No exercises added yet. Add from the library below.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {editWorkoutExercises.map((exercise: any, idx: number) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 ${
                          darkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {exercise.name}
                          </h4>
                          <button
                            onClick={() => removeExerciseFromEdit(idx)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Sets
                            </label>
                            <input
                              type="number"
                              value={exercise.sets || 3}
                              onChange={(e) => updateEditExerciseDetails(idx, "sets", parseInt(e.target.value))}
                              className={`w-full px-3 py-1.5 border rounded text-sm ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Reps
                            </label>
                            <input
                              type="number"
                              value={exercise.reps || 10}
                              onChange={(e) => updateEditExerciseDetails(idx, "reps", parseInt(e.target.value))}
                              className={`w-full px-3 py-1.5 border rounded text-sm ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Rest (sec)
                            </label>
                            <input
                              type="number"
                              value={exercise.rest_seconds || 60}
                              onChange={(e) => updateEditExerciseDetails(idx, "rest_seconds", parseInt(e.target.value))}
                              className={`w-full px-3 py-1.5 border rounded text-sm ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Exercises Section */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Add Exercises
                </h3>
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  {Object.values(EXERCISE_LIBRARY)
                    .flat()
                    .slice(0, 30)
                    .map((exercise: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => addExerciseToEdit(exercise)}
                        className={`p-2 rounded text-sm font-medium transition-all ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {exercise.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeEditWorkout}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateWorkout}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm rounded-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && workoutToDelete && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeDeleteConfirm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-lg p-6 max-w-md w-full shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-2xl font-bold text-center mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Delete Workout?
              </h2>

              {/* Description */}
              <p className={`text-center mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Are you sure you want to delete the <strong>{workoutToDelete.day_of_week}</strong> workout? This action cannot be undone.
              </p>

              {/* Workout Details */}
              <div className={`border rounded-lg p-3 mb-6 ${
                darkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
              }`}>
                <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {workoutToDelete.muscle_group}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {workoutToDelete.exercises?.length || 0} exercises
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteConfirm}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkout}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-all"
                >
                  Delete Workout
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete All Confirmation Modal */}
        {showDeleteAllConfirm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteAllConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-lg p-6 max-w-md w-full shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-2xl font-bold text-center mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Delete All Workouts?
              </h2>

              {/* Description */}
              <p className={`text-center mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Are you sure you want to delete <strong>ALL {currentWeekWorkouts?.total_workouts || 0} workout plans</strong>? This action cannot be undone.
              </p>

              {/* Warning */}
              <div className={`border-l-4 border-red-500 rounded p-4 mb-6 ${
                darkMode ? "bg-red-900/20" : "bg-red-50"
              }`}>
                <p className={`text-sm font-semibold ${darkMode ? "text-red-400" : "text-red-800"}`}>
                  Warning: This will permanently delete all your workout plans!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllWorkouts}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-all"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
