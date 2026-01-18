// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workout_log_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WorkoutLogModel _$WorkoutLogModelFromJson(Map<String, dynamic> json) =>
    WorkoutLogModel(
      id: (json['id'] as num?)?.toInt(),
      userId: (json['user_id'] as num?)?.toInt(),
      workoutPlanId: (json['workout_plan_id'] as num?)?.toInt(),
      exerciseName: json['exercise_name'] as String,
      sets: (json['sets'] as num?)?.toInt(),
      reps: (json['reps'] as num?)?.toInt(),
      weight: json['weight'] as num?,
      durationMinutes: (json['duration_minutes'] as num?)?.toInt(),
      notes: json['notes'] as String?,
      loggedAt: json['logged_at'] as String?,
    );

Map<String, dynamic> _$WorkoutLogModelToJson(WorkoutLogModel instance) =>
    <String, dynamic>{
      if (instance.id case final value?) 'id': value,
      if (instance.userId case final value?) 'user_id': value,
      if (instance.workoutPlanId case final value?) 'workout_plan_id': value,
      'exercise_name': instance.exerciseName,
      if (instance.sets case final value?) 'sets': value,
      if (instance.reps case final value?) 'reps': value,
      if (instance.weight case final value?) 'weight': value,
      if (instance.durationMinutes case final value?) 'duration_minutes': value,
      if (instance.notes case final value?) 'notes': value,
      if (instance.loggedAt case final value?) 'logged_at': value,
    };

WeightLogModel _$WeightLogModelFromJson(Map<String, dynamic> json) =>
    WeightLogModel(
      id: (json['id'] as num?)?.toInt(),
      userId: (json['user_id'] as num?)?.toInt(),
      weight: json['weight'] as num,
      bodyFatPercentage: json['body_fat_percentage'] as num?,
      weighInDate: json['weigh_in_date'] as String,
      notes: json['notes'] as String?,
      measurements: json['measurements'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$WeightLogModelToJson(WeightLogModel instance) =>
    <String, dynamic>{
      if (instance.id case final value?) 'id': value,
      if (instance.userId case final value?) 'user_id': value,
      'weight': instance.weight,
      if (instance.bodyFatPercentage case final value?)
        'body_fat_percentage': value,
      'weigh_in_date': instance.weighInDate,
      if (instance.notes case final value?) 'notes': value,
      if (instance.measurements case final value?) 'measurements': value,
    };
