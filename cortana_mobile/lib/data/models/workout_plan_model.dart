import 'package:json_annotation/json_annotation.dart';

part 'workout_plan_model.g.dart';

@JsonSerializable(explicitToJson: true, includeIfNull: false)
class WorkoutPlanModel {
  final int? id;
  @JsonKey(name: 'user_id')
  final int? userId;
  @JsonKey(name: 'day_of_week')
  final String day;
  @JsonKey(name: 'week_number', defaultValue: 1)
  final int weekNumber;
  @JsonKey(name: 'muscle_group')
  final String workoutType;
  final List<ExerciseDetail> exercises;
  @JsonKey(name: 'completed', defaultValue: false)
  final bool isCompleted;
  @JsonKey(name: 'completed_at')
  final String? completedAt;
  @JsonKey(name: 'created_at')
  final String? createdAt;

  WorkoutPlanModel({
    this.id,
    this.userId,
    required this.day,
    this.weekNumber = 1,
    required this.workoutType,
    required this.exercises,
    this.isCompleted = false,
    this.completedAt,
    this.createdAt,
  });

  factory WorkoutPlanModel.fromJson(Map<String, dynamic> json) =>
      _$WorkoutPlanModelFromJson(json);

  Map<String, dynamic> toJson() => _$WorkoutPlanModelToJson(this);

  DateTime? get completedDateTime =>
      completedAt != null ? DateTime.parse(completedAt!) : null;
}

@JsonSerializable(explicitToJson: true, includeIfNull: false)
class ExerciseDetail {
  @JsonKey(name: 'exercise')
  final String? name;
  final int? sets;
  final String? reps;
  @JsonKey(name: 'rest_seconds')
  final int? rest;
  final String? notes;

  ExerciseDetail({
    this.name,
    this.sets,
    this.reps,
    this.rest,
    this.notes,
  });

  factory ExerciseDetail.fromJson(Map<String, dynamic> json) =>
      _$ExerciseDetailFromJson(json);

  Map<String, dynamic> toJson() => _$ExerciseDetailToJson(this);

  // Helper getter for display
  String? get restDisplay => rest != null ? '${rest}s' : null;
}
