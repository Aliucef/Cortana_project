import 'package:flutter/foundation.dart';
import '../../data/models/gym_profile_model.dart';
import '../../data/models/workout_plan_model.dart';
import '../../data/models/workout_log_model.dart';
import '../../data/repositories/health_repository.dart';

enum HealthState { idle, loading, loaded, error }

class HealthProvider with ChangeNotifier {
  final HealthRepository _healthRepository;

  HealthProvider(this._healthRepository);

  // State
  HealthState _state = HealthState.idle;
  GymProfileModel? _gymProfile;
  List<WorkoutPlanModel> _currentWeekWorkouts = [];
  List<WorkoutPlanModel> _allWorkouts = [];
  List<WorkoutLogModel> _workoutLogs = [];
  List<WeightLogModel> _weightLogs = [];
  String? _errorMessage;
  DateTime? _lastFetchTime;

  // Getters
  HealthState get state => _state;
  GymProfileModel? get gymProfile => _gymProfile;
  List<WorkoutPlanModel> get currentWeekWorkouts => List.unmodifiable(_currentWeekWorkouts);
  List<WorkoutPlanModel> get allWorkouts => List.unmodifiable(_allWorkouts);
  List<WorkoutLogModel> get workoutLogs => List.unmodifiable(_workoutLogs);
  List<WeightLogModel> get weightLogs => List.unmodifiable(_weightLogs);
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == HealthState.loading;
  bool get hasProfile => _gymProfile != null;
  bool get hasWorkoutPlan => _currentWeekWorkouts.isNotEmpty;

  // Computed stats
  int get completedWorkoutsThisWeek =>
      _currentWeekWorkouts.where((w) => w.isCompleted).length;
  int get totalWorkoutsThisWeek => _currentWeekWorkouts.length;
  double get weeklyProgress =>
      totalWorkoutsThisWeek > 0
          ? (completedWorkoutsThisWeek / totalWorkoutsThisWeek) * 100
          : 0;

  /// Fetch all health data
  Future<void> fetchHealthData({bool force = false}) async {
    if (!force && _lastFetchTime != null) {
      final diff = DateTime.now().difference(_lastFetchTime!);
      if (diff.inMinutes < 5) {
        // Data is fresh (less than 5 minutes old)
        return;
      }
    }

    _state = HealthState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      // Fetch data sequentially with better error handling
      try {
        print('🔄 Fetching gym profile...');
        _gymProfile = await _healthRepository.getGymProfile();
        print('✅ Gym profile loaded');
      } catch (e) {
        print('❌ Gym profile error: $e');
        _gymProfile = null;
      }

      try {
        print('🔄 Fetching current workout plan...');
        _currentWeekWorkouts = await _healthRepository.getCurrentWorkoutPlan();
        print('✅ Current workout plan loaded: ${_currentWeekWorkouts.length} workouts');
      } catch (e) {
        print('❌ Current workout plan error: $e');
        _currentWeekWorkouts = [];
      }

      try {
        print('🔄 Fetching workout logs...');
        _workoutLogs = await _healthRepository.getWorkoutLogs();
        print('✅ Workout logs loaded: ${_workoutLogs.length} logs');
      } catch (e) {
        print('❌ Workout logs error: $e');
        _workoutLogs = [];
      }

      try {
        print('🔄 Fetching weight logs...');
        _weightLogs = await _healthRepository.getWeightLogs();
        print('✅ Weight logs loaded: ${_weightLogs.length} logs');
      } catch (e) {
        print('❌ Weight logs error: $e');
        _weightLogs = [];
      }

      _lastFetchTime = DateTime.now();
      _state = HealthState.loaded;
      notifyListeners();
    } catch (e) {
      print('❌ Fetch health data error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = HealthState.error;
      notifyListeners();
    }
  }

  /// Create or update gym profile
  Future<bool> createOrUpdateGymProfile({
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
    _state = HealthState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      _gymProfile = await _healthRepository.createOrUpdateGymProfile(
        weight: weight,
        height: height,
        experienceLevel: experienceLevel,
        primaryGoal: primaryGoal,
        trainingDaysPerWeek: trainingDaysPerWeek,
        equipmentAccess: equipmentAccess,
        trainingSplit: trainingSplit,
        preferredTime: preferredTime,
        injuriesNotes: injuriesNotes,
      );

      _state = HealthState.loaded;
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Create/update gym profile error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = HealthState.error;
      notifyListeners();
      return false;
    }
  }

  /// Generate new workout plan
  Future<bool> generateWorkoutPlan({int weeks = 4}) async {
    _state = HealthState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final plans = await _healthRepository.generateWorkoutPlan(weeks: weeks);
      _allWorkouts = plans;
      
      // Also fetch current week workouts
      await fetchHealthData(force: true);
      
      _state = HealthState.loaded;
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Generate workout plan error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = HealthState.error;
      notifyListeners();
      return false;
    }
  }

  /// Complete a workout
  Future<bool> completeWorkout(int planId) async {
    try {
      await _healthRepository.completeWorkoutPlan(planId);

      // Update local state
      final index = _currentWeekWorkouts.indexWhere((w) => w.id == planId);
      if (index != -1) {
        // Refresh data to get updated completion status
        await fetchHealthData(force: true);
      }

      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Complete workout error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  /// Delete a workout
  Future<bool> deleteWorkout(int planId) async {
    try {
      final success = await _healthRepository.deleteWorkoutPlan(planId);

      if (success) {
        // Remove from local state
        _currentWeekWorkouts.removeWhere((w) => w.id == planId);
        notifyListeners();
      }

      return success;
    } catch (e) {
      print('❌ Delete workout error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  /// Log a workout
  Future<bool> logWorkout({
    int? workoutPlanId,
    required String exerciseName,
    int? sets,
    int? reps,
    double? weight,
    int? durationMinutes,
    String? notes,
  }) async {
    try {
      final log = await _healthRepository.logWorkout(
        workoutPlanId: workoutPlanId,
        exerciseName: exerciseName,
        sets: sets,
        reps: reps,
        weight: weight,
        durationMinutes: durationMinutes,
        notes: notes,
      );

      _workoutLogs.insert(0, log);
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Log workout error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  /// Log weight
  Future<bool> logWeight({
    required double weight,
    double? bodyFatPercentage,
    required DateTime weighInDate,
    String? notes,
  }) async {
    try {
      final log = await _healthRepository.logWeight(
        weight: weight,
        bodyFatPercentage: bodyFatPercentage,
        weighInDate: weighInDate,
        notes: notes,
      );

      _weightLogs.insert(0, log);
      
      // Update gym profile weight if it's current
      if (_gymProfile != null && weighInDate.isAfter(DateTime.now().subtract(const Duration(days: 7)))) {
        await fetchHealthData(force: true);
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Log weight error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  /// Refresh data
  Future<void> refresh() async {
    await fetchHealthData(force: true);
  }
}
