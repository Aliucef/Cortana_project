import '../datasources/remote/api_client.dart';
import '../datasources/local/secure_storage_service.dart';
import '../models/gym_profile_model.dart';
import '../models/workout_plan_model.dart';
import '../models/workout_log_model.dart';

class HealthRepository {
  final ApiClient _apiClient;
  final SecureStorageService _secureStorage;

  HealthRepository(this._apiClient, this._secureStorage);

  Future<int> _getCurrentUserId() async {
    final userId = await _secureStorage.getCurrentUserId();
    if (userId == null) throw Exception('User not authenticated');
    return userId;
  }

  // ==================== Gym Profile ====================

  /// Get user's gym profile
  Future<GymProfileModel?> getGymProfile() async {
    try {
      final userId = await _getCurrentUserId();
      print('🔍 Fetching gym profile for user $userId from /health/profile/$userId');
      final response = await _apiClient.get('/health/profile/$userId');

      print('📦 Gym profile response data: ${response.data}');
      print('📦 Response data type: ${response.data.runtimeType}');

      if (response.data != null && response.data is Map && response.data.isNotEmpty) {
        print('✅ Parsing gym profile from JSON');
        return GymProfileModel.fromJson(response.data);
      }
      print('⚠️ Gym profile is null or empty');
      return null;
    } catch (e) {
      print('❌ Get gym profile error: $e');
      // Return null if 404 (no profile exists yet)
      return null;
    }
  }

  /// Create or update gym profile
  Future<GymProfileModel> createOrUpdateGymProfile({
    required double weight,
    required double height,
    required String experienceLevel,
    required String primaryGoal,
    required int trainingDaysPerWeek,
    required String equipmentAccess,
    required String trainingSplit,
    required String preferredTime,
    String? injuriesNotes,
  }) async {
    final userId = await _getCurrentUserId();

    print('📤 Creating/updating gym profile with data:');
    print('   weight: $weight');
    print('   height: $height');
    print('   experience_level: $experienceLevel');
    print('   primary_goal: $primaryGoal');
    print('   training_days_per_week: $trainingDaysPerWeek');

    final response = await _apiClient.post(
      '/health/profile',
      queryParameters: {'user_id': userId},
      data: {
        'weight': weight,
        'height': height,
        'experience_level': experienceLevel,
        'primary_goal': primaryGoal,
        'training_days_per_week': trainingDaysPerWeek,
        'equipment_access': equipmentAccess,
        'training_split': trainingSplit,
        'preferred_time': preferredTime,
        if (injuriesNotes != null) 'injuries_notes': injuriesNotes,
      },
    );

    print('📥 Create profile response: ${response.data}');
    print('📥 Response type: ${response.data.runtimeType}');

    return GymProfileModel.fromJson(response.data);
  }

  // ==================== Workout Plans ====================

  /// Generate workout plan
  Future<List<WorkoutPlanModel>> generateWorkoutPlan({int weeks = 4}) async {
    final userId = await _getCurrentUserId();

    print('📤 Generating workout plan for $weeks weeks...');
    final response = await _apiClient.post(
      '/health/workout-plan/generate/$userId',
      queryParameters: {'weeks': weeks},
    );

    print('📥 Generate workout plan response: ${response.data}');

    // Backend returns {message, weeks, total_workouts} on success
    // The workouts are not returned, we need to fetch them separately
    if (response.data is Map) {
      final data = response.data as Map<String, dynamic>;

      // Check if it's a success response with message
      if (data['message'] != null || data['total_workouts'] != null) {
        print('✅ Workout plan generated successfully, fetching workouts...');
        // Fetch the current workout plan after generation
        return await getCurrentWorkoutPlan();
      }

      // Try common wrapper keys if workouts are included
      if (data['plans'] != null) {
        return (data['plans'] as List)
            .map((json) => WorkoutPlanModel.fromJson(json))
            .toList();
      }
      if (data['workout_plans'] != null) {
        return (data['workout_plans'] as List)
            .map((json) => WorkoutPlanModel.fromJson(json))
            .toList();
      }
      if (data['workouts'] != null) {
        return (data['workouts'] as List)
            .map((json) => WorkoutPlanModel.fromJson(json))
            .toList();
      }
    }

    // If it's already a list, parse it directly
    if (response.data is List) {
      return (response.data as List)
          .map((json) => WorkoutPlanModel.fromJson(json))
          .toList();
    }

    // No workouts found, return empty list
    return [];
  }

  /// Get current workout plan (this week)
  Future<List<WorkoutPlanModel>> getCurrentWorkoutPlan() async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.get('/health/workout-plan/current/$userId');

    print('📦 Workout plan response type: ${response.data.runtimeType}');
    print('📦 Workout plan response data keys: ${response.data is Map ? (response.data as Map).keys : "Not a map"}');

    // Handle if backend returns wrapped response
    if (response.data is Map) {
      // Check all possible keys
      final data = response.data as Map<String, dynamic>;
      print('📦 Available keys: ${data.keys.toList()}');

      if (data['plans'] != null) {
        print('✅ Found plans key');
        return (data['plans'] as List)
            .map((json) => WorkoutPlanModel.fromJson(json))
            .toList();
      }
      if (data['workout_plans'] != null) {
        print('✅ Found workout_plans key');
        return (data['workout_plans'] as List)
            .map((json) => WorkoutPlanModel.fromJson(json))
            .toList();
      }
      if (data['workouts'] != null) {
        print('✅ Found workouts key');
        return (data['workouts'] as List)
            .map((json) => WorkoutPlanModel.fromJson(json))
            .toList();
      }

      // If it's a map with exercise data, it might be a single workout
      // Return empty list if no known keys found
      print('⚠️ No known workout list key found in response');
      return [];
    }

    return (response.data as List)
        .map((json) => WorkoutPlanModel.fromJson(json))
        .toList();
  }

  /// Get all workout plans for user
  Future<List<WorkoutPlanModel>> getAllWorkoutPlans() async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.get('/health/workout-plan/$userId');

    // Handle if backend returns wrapped response
    if (response.data is Map) {
      // Try common wrapper keys
      if (response.data['plans'] != null) {
        return (response.data['plans'] as List)
            .map((json) => WorkoutPlanModel.fromJson(json))
            .toList();
      }
      if (response.data['workout_plans'] != null) {
        return (response.data['workout_plans'] as List)
            .map((json) => WorkoutPlanModel.fromJson(json))
            .toList();
      }
    }

    return (response.data as List)
        .map((json) => WorkoutPlanModel.fromJson(json))
        .toList();
  }

  /// Mark workout plan as completed
  Future<bool> completeWorkoutPlan(int planId) async {
    try {
      print('📤 Completing workout plan $planId...');
      final response = await _apiClient.patch('/health/workout-plan/$planId/complete');

      print('📥 Complete workout response: ${response.data}');

      // Backend returns {message: "Workout marked as complete!", plan_id: 15}
      if (response.data is Map) {
        final data = response.data as Map<String, dynamic>;
        if (data['message'] != null || data['plan_id'] != null) {
          print('✅ Workout completed successfully');
          return true;
        }
      }

      return true;
    } catch (e) {
      print('❌ Complete workout error: $e');
      return false;
    }
  }

  /// Delete a single workout plan
  Future<bool> deleteWorkoutPlan(int planId) async {
    try {
      print('📤 Deleting workout plan $planId...');

      // Try different possible endpoints
      try {
        // Try DELETE with /delete/ prefix
        await _apiClient.delete('/health/workout-plan/delete/$planId');
        print('✅ Workout plan deleted successfully');
        return true;
      } catch (e1) {
        print('⚠️ First attempt failed, trying alternative endpoint...');

        try {
          // Try POST to delete endpoint
          await _apiClient.post('/health/workout-plan/$planId/delete');
          print('✅ Workout plan deleted successfully');
          return true;
        } catch (e2) {
          print('⚠️ Second attempt failed, trying PATCH...');

          // Try PATCH to mark as deleted
          await _apiClient.patch('/health/workout-plan/$planId/delete');
          print('✅ Workout plan deleted successfully');
          return true;
        }
      }
    } catch (e) {
      print('❌ Delete workout plan error: $e');
      print('💡 Backend may not support single workout deletion');
      print('💡 Consider using delete-all endpoint instead');
      return false;
    }
  }

  /// Delete all workout plans
  Future<void> deleteAllWorkoutPlans() async {
    final userId = await _getCurrentUserId();
    await _apiClient.delete('/health/workout-plan/delete-all/$userId');
  }

  // ==================== Workout Logs ====================

  /// Log a workout
  Future<WorkoutLogModel> logWorkout({
    int? workoutPlanId,
    required String exerciseName,
    int? sets,
    int? reps,
    double? weight,
    int? durationMinutes,
    String? notes,
  }) async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.post(
      '/health/workout-log',
      data: {
        'user_id': userId,
        if (workoutPlanId != null) 'workout_plan_id': workoutPlanId,
        'exercise_name': exerciseName,
        if (sets != null) 'sets': sets,
        if (reps != null) 'reps': reps,
        if (weight != null) 'weight': weight,
        if (durationMinutes != null) 'duration_minutes': durationMinutes,
        if (notes != null) 'notes': notes,
      },
    );

    return WorkoutLogModel.fromJson(response.data);
  }

  /// Get workout logs
  Future<List<WorkoutLogModel>> getWorkoutLogs() async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.get('/health/workout-log/$userId');

    // Handle if backend returns wrapped response
    if (response.data is Map && response.data['logs'] != null) {
      return (response.data['logs'] as List)
          .map((json) => WorkoutLogModel.fromJson(json))
          .toList();
    }

    // Fallback if it's already a list
    return (response.data as List)
        .map((json) => WorkoutLogModel.fromJson(json))
        .toList();
  }

  // ==================== Weight Logs ====================

  /// Log weight
  Future<WeightLogModel> logWeight({
    required double weight,
    double? bodyFatPercentage,
    required DateTime weighInDate,
    String? notes,
  }) async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.post(
      '/health/weight-log',
      data: {
        'user_id': userId,
        'weight': weight,
        if (bodyFatPercentage != null) 'body_fat_percentage': bodyFatPercentage,
        'weigh_in_date': weighInDate.toIso8601String().split('T')[0],
        if (notes != null) 'notes': notes,
      },
    );

    return WeightLogModel.fromJson(response.data);
  }

  /// Get weight logs
  Future<List<WeightLogModel>> getWeightLogs() async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.get('/health/weight-log/$userId');

    // Backend returns {user_id, total_logs, first_weight, current_weight, total_change_kg, logs: [...]}
    if (response.data is Map && response.data['logs'] != null) {
      return (response.data['logs'] as List)
          .map((json) => WeightLogModel.fromJson(json))
          .toList();
    }

    // Fallback if it's already a list
    return (response.data as List)
        .map((json) => WeightLogModel.fromJson(json))
        .toList();
  }
}
