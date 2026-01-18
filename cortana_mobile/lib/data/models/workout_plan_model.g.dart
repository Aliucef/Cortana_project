// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workout_plan_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WorkoutPlanModel _$WorkoutPlanModelFromJson(Map<String, dynamic> json) =>
    WorkoutPlanModel(
      id: (json['id'] as num?)?.toInt(),
      userId: (json['user_id'] as num?)?.toInt(),
      day: json['day_of_week'] as String,
      weekNumber: (json['week_number'] as num?)?.toInt() ?? 1,
      workoutType: json['muscle_group'] as String,
      exercises:
          (json['exercises'] as List<dynamic>)
              .map((e) => ExerciseDetail.fromJson(e as Map<String, dynamic>))
              .toList(),
      isCompleted: json['completed'] as bool? ?? false,
      completedAt: json['completed_at'] as String?,
      createdAt: json['created_at'] as String?,
    );

Map<String, dynamic> _$WorkoutPlanModelToJson(WorkoutPlanModel instance) =>
    <String, dynamic>{
      if (instance.id case final value?) 'id': value,
      if (instance.userId case final value?) 'user_id': value,
      'day_of_week': instance.day,
      'week_number': instance.weekNumber,
      'muscle_group': instance.workoutType,
      'exercises': instance.exercises.map((e) => e.toJson()).toList(),
      'completed': instance.isCompleted,
      if (instance.completedAt case final value?) 'completed_at': value,
      if (instance.createdAt case final value?) 'created_at': value,
    };

ExerciseDetail _$ExerciseDetailFromJson(Map<String, dynamic> json) =>
    ExerciseDetail(
      name: json['exercise'] as String?,
      sets: (json['sets'] as num?)?.toInt(),
      reps: json['reps'] as String?,
      rest: (json['rest_seconds'] as num?)?.toInt(),
      notes: json['notes'] as String?,
    );

Map<String, dynamic> _$ExerciseDetailToJson(ExerciseDetail instance) =>
    <String, dynamic>{
      if (instance.name case final value?) 'exercise': value,
      if (instance.sets case final value?) 'sets': value,
      if (instance.reps case final value?) 'reps': value,
      if (instance.rest case final value?) 'rest_seconds': value,
      if (instance.notes case final value?) 'notes': value,
    };
