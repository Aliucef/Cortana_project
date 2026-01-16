// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recurring_expense_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RecurringExpenseModel _$RecurringExpenseModelFromJson(
  Map<String, dynamic> json,
) => RecurringExpenseModel(
  id: (json['id'] as num).toInt(),
  userId: (json['user_id'] as num).toInt(),
  name: json['name'] as String,
  amount: (json['amount'] as num).toDouble(),
  category: json['category'] as String,
  frequency: json['frequency'] as String,
  nextDueDate: json['next_due_date'] as String,
  reminderDaysBefore: (json['reminder_days_before'] as num).toInt(),
  isActive: json['is_active'] as bool,
  createdAt: json['created_at'] as String,
);

Map<String, dynamic> _$RecurringExpenseModelToJson(
  RecurringExpenseModel instance,
) => <String, dynamic>{
  'id': instance.id,
  'user_id': instance.userId,
  'name': instance.name,
  'amount': instance.amount,
  'category': instance.category,
  'frequency': instance.frequency,
  'next_due_date': instance.nextDueDate,
  'reminder_days_before': instance.reminderDaysBefore,
  'is_active': instance.isActive,
  'created_at': instance.createdAt,
};
