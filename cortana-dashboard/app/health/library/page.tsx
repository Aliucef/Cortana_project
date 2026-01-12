"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Search,
  Filter,
  X,
  Info,
  Star,
  Grid3x3,
  List,
  Heart,
  Loader2,
} from "lucide-react";
import { getExercises, Exercise } from "@/lib/health-api";
import { isAuthenticated } from "@/lib/api";

// OLD: Comprehensive Exercise Library (REPLACED WITH API)
const EXERCISE_LIBRARY_OLD = {
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

export default function LibraryPage() {
  const router = useRouter();
  // State
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // NEW: API State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    const handleDarkModeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);

    const savedFavorites = localStorage.getItem("favoriteExercises");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    return () => window.removeEventListener("darkModeChange", handleDarkModeChange);
  }, []);

  // NEW: Fetch exercises from API
  useEffect(() => {
    async function fetchExercises() {
      try {
        setLoading(true);
        setError(null);
        const data = await getExercises();
        setExercises(data);
      } catch (err) {
        console.error("Error fetching exercises:", err);
        setError("Failed to load exercises. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, []);

  // Map API exercises to component format
  const allExercises = exercises.map((ex) => ({
    name: ex.name,
    category: ex.category,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    primaryMuscles: ex.primary_muscles || [],
    secondaryMuscles: ex.secondary_muscles || [],
    instructions: ex.instructions,
    tips: ex.tips,
    video_url: ex.video_url,
    id: ex.id,
  }));

  const equipmentTypes = Array.from(new Set(allExercises.map((ex) => ex.equipment)));

  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primaryMuscles.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    const matchesEquipment = equipmentFilter === "all" || exercise.equipment === equipmentFilter;
    const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesEquipment && matchesDifficulty;
  });

  function openExerciseDetail(exercise: any) {
    setSelectedExercise(exercise);
    setShowDetailModal(true);
  }

  function toggleFavorite(exerciseName: string) {
    const newFavorites = favorites.includes(exerciseName)
      ? favorites.filter((name) => name !== exerciseName)
      : [...favorites, exerciseName];

    setFavorites(newFavorites);
    localStorage.setItem("favoriteExercises", JSON.stringify(newFavorites));
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-yellow-600";
      case "advanced":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Loading exercises...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-red-800 font-semibold mb-2">Error Loading Exercises</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Exercise Library
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Browse {allExercises.length} exercises to build your perfect workout
          </p>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-xl p-6 mb-8 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="mb-4">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search exercises by name or muscle group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                    darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="all">All Categories</option>
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="legs">Legs</option>
                <option value="shoulders">Shoulders</option>
                <option value="arms">Arms</option>
                <option value="core">Core</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Equipment
              </label>
              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="all">All Equipment</option>
                {equipmentTypes.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq.charAt(0).toUpperCase() + eq.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Difficulty
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                View Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4 inline mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <List className="w-4 h-4 inline mr-2" />
                  List
                </button>
              </div>
            </div>
          </div>

          {(searchTerm || categoryFilter !== "all" || equipmentFilter !== "all" || difficultyFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Active filters:
              </span>
              {searchTerm && (
                <span className={`px-3 py-1 rounded-full text-sm ${darkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                  Search: "{searchTerm}"
                </span>
              )}
              {categoryFilter !== "all" && (
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${darkMode ? "bg-purple-900/50 text-purple-300" : "bg-purple-100 text-purple-700"}`}>
                  {categoryFilter}
                </span>
              )}
              {equipmentFilter !== "all" && (
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700"}`}>
                  {equipmentFilter}
                </span>
              )}
              {difficultyFilter !== "all" && (
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${darkMode ? "bg-orange-900/50 text-orange-300" : "bg-orange-100 text-orange-700"}`}>
                  {difficultyFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setEquipmentFilter("all");
                  setDifficultyFilter("all");
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
              >
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        <div className="mb-4">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Showing {filteredExercises.length} of {allExercises.length} exercises
          </p>
        </div>

        {filteredExercises.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`border rounded-xl p-12 text-center ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <Dumbbell className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              No exercises found
            </h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Try adjusting your filters or search term
            </p>
          </motion.div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise, index) => (
              <motion.div
                key={exercise.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-xl p-5 transition-all hover:shadow-lg cursor-pointer ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => openExerciseDetail(exercise)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {exercise.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(exercise.name);
                    }}
                    className="p-1.5 rounded-lg transition-all hover:scale-110"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(exercise.name)
                          ? "fill-red-500 text-red-500"
                          : darkMode
                          ? "text-gray-400 hover:text-red-400"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                      darkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
                    }`}>
                      {exercise.category}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {exercise.equipment}
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${getDifficultyColor(exercise.difficulty)} capitalize`}>
                    {exercise.difficulty}
                  </p>
                </div>

                <div className="mb-4">
                  <p className={`text-xs font-semibold mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Primary Muscles:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.primaryMuscles.map((muscle: string) => (
                      <span
                        key={muscle}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openExerciseDetail(exercise);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm rounded-lg transition-all hover:scale-105"
                >
                  <Info className="w-4 h-4 inline mr-2" />
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExercises.map((exercise, index) => (
              <motion.div
                key={exercise.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer flex items-center justify-between ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => openExerciseDetail(exercise)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {exercise.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(exercise.name);
                      }}
                      className="transition-all hover:scale-110"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(exercise.name)
                            ? "fill-red-500 text-red-500"
                            : darkMode
                            ? "text-gray-400 hover:text-red-400"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      darkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
                    }`}>
                      {exercise.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {exercise.equipment}
                    </span>
                    <span className={`text-xs font-medium capitalize ${getDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                    <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      • {exercise.primaryMuscles.join(", ")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openExerciseDetail(exercise);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all"
                >
                  Details
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Exercise Detail Modal */}
        {showDetailModal && selectedExercise && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl p-6 max-w-2xl w-full shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedExercise.name}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${
                      darkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
                    }`}>
                      {selectedExercise.category}
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {selectedExercise.equipment}
                    </span>
                    <span className={`text-sm font-bold capitalize ${getDifficultyColor(selectedExercise.difficulty)}`}>
                      {selectedExercise.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(selectedExercise.name);
                    }}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        favorites.includes(selectedExercise.name)
                          ? "fill-red-500 text-red-500"
                          : darkMode
                          ? "text-gray-400 hover:text-red-400"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className={`p-2 rounded-lg transition-all ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`text-sm font-bold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  PRIMARY MUSCLES
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedExercise.primaryMuscles.map((muscle: string) => (
                    <span
                      key={muscle}
                      className={`px-3 py-1.5 rounded-lg font-medium ${
                        darkMode ? "bg-purple-900/50 text-purple-300" : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {muscle}
                    </span>
                  ))}
                </div>

                {selectedExercise.secondaryMuscles.length > 0 && (
                  <>
                    <h3 className={`text-sm font-bold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      SECONDARY MUSCLES
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondaryMuscles.map((muscle: string) => (
                        <span
                          key={muscle}
                          className={`px-3 py-1.5 rounded-lg font-medium ${
                            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="mb-6">
                <h3 className={`text-sm font-bold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  INSTRUCTIONS
                </h3>
                <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {selectedExercise.instructions}
                </p>
              </div>

              <div className={`rounded-lg p-8 mb-6 text-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <Dumbbell className={`w-12 h-12 mx-auto mb-2 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Exercise demonstration video/image coming soon
                </p>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
