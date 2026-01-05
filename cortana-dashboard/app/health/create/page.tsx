"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Dumbbell,
  Clock,
  Target,
  Users,
  TrendingUp,
  X,
  Check,
  ChevronRight,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import { getWorkoutTemplates, WorkoutTemplate } from "@/lib/health-api";

// Workout Templates Data
const WORKOUT_TEMPLATES = [
  {
    id: "ppl",
    name: "Push/Pull/Legs (PPL)",
    description: "Classic 6-day split focusing on push, pull, and leg movements",
    difficulty: "intermediate",
    frequency: "6 days/week",
    split: "Push/Pull/Legs",
    duration: "60-75 min",
    goal: "Muscle Gain & Strength",
    workouts: [
      {
        day: "Push Day 1",
        exercises: ["Bench Press", "Overhead Press", "Incline Bench Press", "Lateral Raises", "Tricep Pushdowns", "Tricep Dips"],
      },
      {
        day: "Pull Day 1",
        exercises: ["Deadlifts", "Pull-ups", "Barbell Rows", "Face Pulls", "Barbell Curls", "Hammer Curls"],
      },
      {
        day: "Leg Day 1",
        exercises: ["Squats", "Romanian Deadlifts", "Leg Press", "Leg Curls", "Calf Raises", "Lunges"],
      },
      {
        day: "Push Day 2",
        exercises: ["Incline Bench Press", "Dumbbell Press", "Cable Flys", "Front Raises", "Overhead Press", "Skull Crushers"],
      },
      {
        day: "Pull Day 2",
        exercises: ["Pull-ups", "Dumbbell Rows", "Lat Pulldowns", "Barbell Rows", "Preacher Curls", "Face Pulls"],
      },
      {
        day: "Leg Day 2",
        exercises: ["Front Squats", "Leg Press", "Walking Lunges", "Leg Curls", "Romanian Deadlifts", "Calf Raises"],
      },
    ],
  },
  {
    id: "upper_lower",
    name: "Upper/Lower Split",
    description: "4-day split alternating upper and lower body workouts",
    difficulty: "beginner",
    frequency: "4 days/week",
    split: "Upper/Lower",
    duration: "60-70 min",
    goal: "Balanced Development",
    workouts: [
      {
        day: "Upper Day 1",
        exercises: ["Bench Press", "Barbell Rows", "Overhead Press", "Pull-ups", "Lateral Raises", "Barbell Curls"],
      },
      {
        day: "Lower Day 1",
        exercises: ["Squats", "Romanian Deadlifts", "Leg Press", "Leg Curls", "Calf Raises", "Lunges"],
      },
      {
        day: "Upper Day 2",
        exercises: ["Incline Bench Press", "Lat Pulldowns", "Dumbbell Press", "Dumbbell Rows", "Tricep Pushdowns", "Hammer Curls"],
      },
      {
        day: "Lower Day 2",
        exercises: ["Deadlifts", "Leg Press", "Lunges", "Leg Curls", "Calf Raises", "Squats"],
      },
    ],
  },
  {
    id: "full_body",
    name: "Full Body Routine",
    description: "3-day total body workout hitting all major muscle groups",
    difficulty: "beginner",
    frequency: "3 days/week",
    split: "Full Body",
    duration: "50-60 min",
    goal: "General Fitness",
    workouts: [
      {
        day: "Full Body Day 1",
        exercises: ["Squats", "Bench Press", "Barbell Rows", "Overhead Press", "Planks", "Barbell Curls"],
      },
      {
        day: "Full Body Day 2",
        exercises: ["Deadlifts", "Incline Bench Press", "Pull-ups", "Lunges", "Lateral Raises", "Russian Twists"],
      },
      {
        day: "Full Body Day 3",
        exercises: ["Leg Press", "Dumbbell Press", "Lat Pulldowns", "Romanian Deadlifts", "Tricep Pushdowns", "Crunches"],
      },
    ],
  },
  {
    id: "bro_split",
    name: "Bro Split",
    description: "5-day split with dedicated day for each major muscle group",
    difficulty: "intermediate",
    frequency: "5 days/week",
    split: "One Muscle/Day",
    duration: "60-75 min",
    goal: "Muscle Gain",
    workouts: [
      {
        day: "Chest Day",
        exercises: ["Bench Press", "Incline Bench Press", "Dumbbell Press", "Cable Flys", "Push-ups", "Dips"],
      },
      {
        day: "Back Day",
        exercises: ["Deadlifts", "Pull-ups", "Barbell Rows", "Lat Pulldowns", "Dumbbell Rows", "Face Pulls"],
      },
      {
        day: "Leg Day",
        exercises: ["Squats", "Leg Press", "Romanian Deadlifts", "Leg Curls", "Lunges", "Calf Raises"],
      },
      {
        day: "Shoulder Day",
        exercises: ["Overhead Press", "Lateral Raises", "Front Raises", "Arnold Press", "Reverse Flys", "Shrugs"],
      },
      {
        day: "Arm Day",
        exercises: ["Barbell Curls", "Tricep Pushdowns", "Hammer Curls", "Skull Crushers", "Preacher Curls", "Tricep Dips"],
      },
    ],
  },
  {
    id: "cardio_hiit",
    name: "HIIT Cardio Program",
    description: "High-intensity interval training for fat loss and endurance",
    difficulty: "intermediate",
    frequency: "4 days/week",
    split: "Cardio/HIIT",
    duration: "30-40 min",
    goal: "Fat Loss & Endurance",
    workouts: [
      {
        day: "HIIT Day 1",
        exercises: ["Burpees", "Mountain Climbers", "Jump Rope", "Running", "Planks"],
      },
      {
        day: "HIIT Day 2",
        exercises: ["Jump Rope", "Burpees", "Mountain Climbers", "Running", "Russian Twists"],
      },
      {
        day: "Cardio Day",
        exercises: ["Running", "Jump Rope", "Burpees", "Mountain Climbers"],
      },
      {
        day: "HIIT Day 3",
        exercises: ["Burpees", "Jump Rope", "Mountain Climbers", "Running", "Leg Raises"],
      },
    ],
  },
];

// Exercise Library (simplified for selection)
const EXERCISE_LIBRARY = {
  chest: ["Bench Press", "Incline Bench Press", "Dumbbell Press", "Cable Flys", "Push-ups", "Dips"],
  back: ["Deadlifts", "Pull-ups", "Barbell Rows", "Lat Pulldowns", "Dumbbell Rows", "Face Pulls"],
  legs: ["Squats", "Leg Press", "Romanian Deadlifts", "Leg Curls", "Lunges", "Calf Raises", "Front Squats", "Walking Lunges"],
  shoulders: ["Overhead Press", "Lateral Raises", "Front Raises", "Arnold Press", "Reverse Flys", "Shrugs"],
  arms: ["Barbell Curls", "Tricep Pushdowns", "Hammer Curls", "Skull Crushers", "Preacher Curls", "Tricep Dips"],
  core: ["Planks", "Crunches", "Russian Twists", "Leg Raises"],
  cardio: ["Running", "Jump Rope", "Burpees", "Mountain Climbers"],
};

export default function CreatePage() {
  const [darkMode, setDarkMode] = useState(false);

  // API state
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  // Custom workout state
  const [customWorkoutName, setCustomWorkoutName] = useState("");
  const [customWorkoutDay, setCustomWorkoutDay] = useState("monday");
  const [customWorkoutMuscleGroup, setCustomWorkoutMuscleGroup] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [exerciseLibraryCategory, setExerciseLibraryCategory] = useState("all");
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    const handleDarkModeToggle = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeToggle", handleDarkModeToggle);
    return () => window.removeEventListener("darkModeToggle", handleDarkModeToggle);
  }, []);

  // Fetch workout templates from API
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkoutTemplates();

        // Transform API data to component format
        const transformedTemplates = data.map((template: WorkoutTemplate) => ({
          id: template.id.toString(),
          name: template.name,
          description: template.description,
          difficulty: template.difficulty,
          frequency: template.frequency,
          split: template.split,
          duration: template.duration,
          goal: template.goal,
          workouts: template.workouts.map((workout: any) => ({
            day: workout.name || `Day ${workout.day}`,
            exercises: workout.exercises.map((ex: any) =>
              typeof ex === 'string' ? ex : ex.name
            ),
          })),
        }));

        setTemplates(transformedTemplates as any);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load workout templates. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  function getDifficultyColor(difficulty: string) {
    if (difficulty === "beginner") return "text-green-600";
    if (difficulty === "intermediate") return "text-yellow-600";
    return "text-red-600";
  }

  function openTemplatePreview(template: any) {
    setSelectedTemplate(template);
    setShowTemplatePreview(true);
  }

  function activateTemplate(template: any) {
    // TODO: Implement API call to activate template
    console.log("Activating template:", template);
    alert(`Template "${template.name}" will be activated!`);
    setShowTemplatePreview(false);
  }

  function addExerciseToWorkout(exerciseName: string) {
    if (selectedExercises.find(e => e.name === exerciseName)) {
      return; // Already added
    }
    setSelectedExercises([
      ...selectedExercises,
      {
        name: exerciseName,
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

  async function handleSaveCustomWorkout() {
    if (!customWorkoutName || selectedExercises.length === 0) {
      alert("Please enter a workout name and add at least one exercise");
      return;
    }

    // TODO: Implement API call to save custom workout
    console.log("Saving custom workout:", {
      name: customWorkoutName,
      day: customWorkoutDay,
      muscleGroup: customWorkoutMuscleGroup,
      exercises: selectedExercises,
    });

    alert("Custom workout saved successfully!");
    resetCustomWorkout();
  }

  function resetCustomWorkout() {
    setCustomWorkoutName("");
    setCustomWorkoutDay("monday");
    setCustomWorkoutMuscleGroup("");
    setSelectedExercises([]);
    setExerciseLibraryCategory("all");
    setExerciseSearchQuery("");
  }

  // Get all exercises for selection
  const allExercises = Object.entries(EXERCISE_LIBRARY).flatMap(([category, exercises]) =>
    exercises.map(name => ({ name, category }))
  );

  const filteredExercises = allExercises.filter(exercise => {
    const matchesCategory = exerciseLibraryCategory === "all" || exercise.category === exerciseLibraryCategory;
    const matchesSearch = exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-200 pt-24 px-6 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Plus className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Create Workout
          </h1>
        </div>

        {/* Workout Templates Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className={`w-6 h-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
            <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Workout Templates
            </h2>
            {!loading && (
              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                ({templates.length} programs)
              </span>
            )}
          </div>

          <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Choose from pre-designed workout programs and start training immediately
          </p>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Loading workout templates...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`border rounded-lg p-6 max-w-md ${
                darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
              }`}>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-red-400" : "text-red-800"}`}>
                  Error Loading Templates
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? "text-red-300" : "text-red-600"}`}>
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Templates Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => openTemplatePreview(template)}
                className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500"
                    : "bg-white border-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-semibold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {template.name}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    template.difficulty === "beginner"
                      ? "bg-green-100 text-green-700"
                      : template.difficulty === "intermediate"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {template.difficulty}
                  </span>
                </div>

                <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {template.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{template.frequency}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <Clock className="w-4 h-4" />
                    <span>{template.duration}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <Target className="w-4 h-4" />
                    <span>{template.goal}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
                  <div className={`flex items-center justify-between text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                    <span className="font-medium">View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </div>

        {/* Custom Workout Builder Section */}
        <div className={`border rounded-lg p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-6">
            <Dumbbell className={`w-6 h-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
            <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Custom Workout Builder
            </h2>
          </div>

          <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Build your own workout by selecting exercises from the library
          </p>

          {/* Workout Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
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

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Muscle Group Focus
              </label>
              <input
                type="text"
                value={customWorkoutMuscleGroup}
                onChange={(e) => setCustomWorkoutMuscleGroup(e.target.value)}
                placeholder="e.g., Chest & Triceps"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          {/* Exercise Library */}
          <div className={`border rounded-lg p-4 mb-6 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Exercise Library
            </h3>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={exerciseSearchQuery}
                    onChange={(e) => setExerciseSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {["all", "chest", "back", "legs", "shoulders", "arms", "core", "cardio"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setExerciseLibraryCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      exerciseLibraryCategory === category
                        ? "bg-blue-600 text-white"
                        : darkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {filteredExercises.map((exercise, index) => (
                <button
                  key={index}
                  onClick={() => addExerciseToWorkout(exercise.name)}
                  disabled={selectedExercises.some(e => e.name === exercise.name)}
                  className={`p-3 rounded-lg text-left text-sm transition-all ${
                    selectedExercises.some(e => e.name === exercise.name)
                      ? darkMode
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : darkMode
                      ? "bg-gray-800 text-white hover:bg-gray-600"
                      : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{exercise.name}</span>
                    {selectedExercises.some(e => e.name === exercise.name) && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {exercise.category}
                  </div>
                </button>
              ))}
            </div>

            {filteredExercises.length === 0 && (
              <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                No exercises found
              </div>
            )}
          </div>

          {/* Selected Exercises */}
          {selectedExercises.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Selected Exercises ({selectedExercises.length})
              </h3>

              <div className="space-y-3">
                {selectedExercises.map((exercise, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {index + 1}. {exercise.name}
                      </h4>
                      <button
                        onClick={() => removeExerciseFromWorkout(index)}
                        className={`p-1 rounded transition-all ${
                          darkMode ? "hover:bg-gray-600 text-red-400" : "hover:bg-gray-200 text-red-600"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={exercise.sets}
                          onChange={(e) => updateExerciseDetails(index, "sets", parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? "bg-gray-800 border-gray-600 text-white"
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
                          min="1"
                          max="50"
                          value={exercise.reps}
                          onChange={(e) => updateExerciseDetails(index, "reps", parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? "bg-gray-800 border-gray-600 text-white"
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
                          min="30"
                          max="300"
                          step="15"
                          value={exercise.rest}
                          onChange={(e) => updateExerciseDetails(index, "rest", parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={resetCustomWorkout}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              Reset
            </button>
            <button
              onClick={handleSaveCustomWorkout}
              disabled={!customWorkoutName || selectedExercises.length === 0}
              className={`flex-1 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                !customWorkoutName || selectedExercises.length === 0
                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Save Custom Workout
            </button>
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {showTemplatePreview && selectedTemplate && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplatePreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedTemplate.name}
                  </h2>
                  <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {selectedTemplate.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                </button>
              </div>

              {/* Template Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-3 rounded-lg text-center ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Difficulty</div>
                  <div className={`font-semibold mt-1 ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                    {selectedTemplate.difficulty}
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Frequency</div>
                  <div className={`font-semibold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedTemplate.frequency}
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Duration</div>
                  <div className={`font-semibold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedTemplate.duration}
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Goal</div>
                  <div className={`font-semibold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedTemplate.goal}
                  </div>
                </div>
              </div>

              {/* Workouts */}
              <div className="mb-6">
                <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Workout Schedule
                </h3>
                <div className="space-y-3">
                  {selectedTemplate.workouts.map((workout: any, index: number) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                    >
                      <h4 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {workout.day}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.map((exercise: string, exIndex: number) => (
                          <span
                            key={exIndex}
                            className={`text-xs px-2 py-1 rounded ${
                              darkMode ? "bg-gray-600 text-gray-200" : "bg-white text-gray-700 border border-gray-300"
                            }`}
                          >
                            {exercise}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => activateTemplate(selectedTemplate)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Activate Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
