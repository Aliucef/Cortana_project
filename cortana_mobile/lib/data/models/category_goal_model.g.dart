// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_goal_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CategoryGoalModel _$CategoryGoalModelFromJson(Map<String, dynamic> json) =>
    CategoryGoalModel(
      id: (json['id'] as num).toInt(),
      userId: (json['user_id'] as num).toInt(),
      category: json['category'] as String,
      goalAmount: (json['goal_amount'] as num).toDouble(),
      period: json['period'] as String,
      alertThreshold: (json['alert_threshold'] as num).toDouble(),
      createdAt: json['created_at'] as String?,
    );

Map<String, dynamic> _$CategoryGoalModelToJson(CategoryGoalModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'category': instance.category,
      'goal_amount': instance.goalAmount,
      'period': instance.period,
      'alert_threshold': instance.alertThreshold,
      'created_at': instance.createdAt,
    };
