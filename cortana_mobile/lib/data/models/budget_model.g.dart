// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'budget_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BudgetModel _$BudgetModelFromJson(Map<String, dynamic> json) => BudgetModel(
  id: (json['id'] as num).toInt(),
  userId: (json['user_id'] as num).toInt(),
  amount: (json['amount'] as num).toDouble(),
  period: json['period'] as String,
  createdAt: json['created_at'] as String?,
);

Map<String, dynamic> _$BudgetModelToJson(BudgetModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'amount': instance.amount,
      'period': instance.period,
      'created_at': instance.createdAt,
    };
