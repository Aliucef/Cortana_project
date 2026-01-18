// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'gym_profile_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GymProfileModel _$GymProfileModelFromJson(Map<String, dynamic> json) =>
    GymProfileModel(
      id: (json['id'] as num?)?.toInt(),
      userId: (json['user_id'] as num?)?.toInt(),
      weight: GymProfileModel._numFromJson(json['weight']),
      height: GymProfileModel._numFromJson(json['height']),
      experienceLevel: json['experience_level'] as String,
      primaryGoal: json['primary_goal'] as String,
      trainingDaysPerWeek: (json['training_days_per_week'] as num).toInt(),
      equipmentAccess: json['equipment_access'] as String,
      trainingSplit: json['training_split'] as String,
      preferredTime: json['preferred_time'] as String,
      injuriesNotes: json['injuries_notes'] as String?,
      createdAt: json['created_at'] as String?,
    );

Map<String, dynamic> _$GymProfileModelToJson(GymProfileModel instance) =>
    <String, dynamic>{
      if (instance.id case final value?) 'id': value,
      if (instance.userId case final value?) 'user_id': value,
      'weight': instance.weight,
      'height': instance.height,
      'experience_level': instance.experienceLevel,
      'primary_goal': instance.primaryGoal,
      'training_days_per_week': instance.trainingDaysPerWeek,
      'equipment_access': instance.equipmentAccess,
      'training_split': instance.trainingSplit,
      'preferred_time': instance.preferredTime,
      if (instance.injuriesNotes case final value?) 'injuries_notes': value,
      if (instance.createdAt case final value?) 'created_at': value,
    };
