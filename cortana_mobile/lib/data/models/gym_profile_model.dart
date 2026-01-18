import 'package:json_annotation/json_annotation.dart';

part 'gym_profile_model.g.dart';

@JsonSerializable(explicitToJson: true, includeIfNull: false)
class GymProfileModel {
  final int? id;
  @JsonKey(name: 'user_id')
  final int? userId;
  @JsonKey(fromJson: _numFromJson)
  final num weight;
  @JsonKey(fromJson: _numFromJson)
  final num height;
  @JsonKey(name: 'experience_level')
  final String experienceLevel;
  @JsonKey(name: 'primary_goal')
  final String primaryGoal;
  @JsonKey(name: 'training_days_per_week')
  final int trainingDaysPerWeek;
  @JsonKey(name: 'equipment_access')
  final String equipmentAccess;
  @JsonKey(name: 'training_split')
  final String trainingSplit;
  @JsonKey(name: 'preferred_time')
  final String preferredTime;
  @JsonKey(name: 'injuries_notes')
  final String? injuriesNotes;
  @JsonKey(name: 'created_at')
  final String? createdAt;

  static num _numFromJson(dynamic value) {
    if (value == null) return 0;
    if (value is num) return value;
    if (value is String) return num.tryParse(value) ?? 0;
    return 0;
  }

  GymProfileModel({
    this.id,
    this.userId,
    required this.weight,
    required this.height,
    required this.experienceLevel,
    required this.primaryGoal,
    required this.trainingDaysPerWeek,
    required this.equipmentAccess,
    required this.trainingSplit,
    required this.preferredTime,
    this.injuriesNotes,
    this.createdAt,
  });

  factory GymProfileModel.fromJson(Map<String, dynamic> json) =>
      _$GymProfileModelFromJson(json);

  Map<String, dynamic> toJson() => _$GymProfileModelToJson(this);

  // Calculate BMI
  double get bmi => weight.toDouble() / ((height.toDouble() / 100) * (height.toDouble() / 100));

  // Get experience level display text
  String get experienceLevelDisplay {
    switch (experienceLevel.toLowerCase()) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return experienceLevel;
    }
  }

  // Get primary goal display text
  String get primaryGoalDisplay {
    switch (primaryGoal.toLowerCase()) {
      case 'muscle_gain':
        return 'Muscle Gain';
      case 'strength':
        return 'Strength';
      case 'fat_loss':
        return 'Fat Loss';
      case 'general_fitness':
        return 'General Fitness';
      default:
        return primaryGoal;
    }
  }
}
