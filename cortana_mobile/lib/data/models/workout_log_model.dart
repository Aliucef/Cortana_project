import 'package:json_annotation/json_annotation.dart';

part 'workout_log_model.g.dart';

@JsonSerializable(explicitToJson: true, includeIfNull: false)
class WorkoutLogModel {
  final int? id;
  @JsonKey(name: 'user_id')
  final int? userId;
  @JsonKey(name: 'workout_plan_id')
  final int? workoutPlanId;
  @JsonKey(name: 'exercise_name')
  final String exerciseName;
  final int? sets;
  final int? reps;
  final num? weight;
  @JsonKey(name: 'duration_minutes')
  final int? durationMinutes;
  final String? notes;
  @JsonKey(name: 'logged_at')
  final String? loggedAt;

  WorkoutLogModel({
    this.id,
    this.userId,
    this.workoutPlanId,
    required this.exerciseName,
    this.sets,
    this.reps,
    this.weight,
    this.durationMinutes,
    this.notes,
    this.loggedAt,
  });

  factory WorkoutLogModel.fromJson(Map<String, dynamic> json) =>
      _$WorkoutLogModelFromJson(json);

  Map<String, dynamic> toJson() => _$WorkoutLogModelToJson(this);

  DateTime? get loggedDateTime => loggedAt != null ? DateTime.parse(loggedAt!) : null;
}

@JsonSerializable(explicitToJson: true, includeIfNull: false)
class WeightLogModel {
  final int? id;
  @JsonKey(name: 'user_id')
  final int? userId;
  final num weight;
  @JsonKey(name: 'body_fat_percentage')
  final num? bodyFatPercentage;
  @JsonKey(name: 'weigh_in_date')
  final String weighInDate;
  final String? notes;
  final Map<String, dynamic>? measurements;

  WeightLogModel({
    this.id,
    this.userId,
    required this.weight,
    this.bodyFatPercentage,
    required this.weighInDate,
    this.notes,
    this.measurements,
  });

  factory WeightLogModel.fromJson(Map<String, dynamic> json) =>
      _$WeightLogModelFromJson(json);

  Map<String, dynamic> toJson() => _$WeightLogModelToJson(this);

  DateTime get weighInDateTime => DateTime.parse(weighInDate);
}
