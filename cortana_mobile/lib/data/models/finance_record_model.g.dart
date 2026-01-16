// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finance_record_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FinanceRecordModel _$FinanceRecordModelFromJson(Map<String, dynamic> json) =>
    FinanceRecordModel(
      id: (json['id'] as num).toInt(),
      userId: (json['user_id'] as num).toInt(),
      transactionType: json['transaction_type'] as String,
      amount: (json['amount'] as num).toDouble(),
      category: json['category'] as String,
      description: json['description'] as String?,
      transactionDate: json['transaction_date'] as String,
      createdAt: json['created_at'] as String,
    );

Map<String, dynamic> _$FinanceRecordModelToJson(FinanceRecordModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'transaction_type': instance.transactionType,
      'amount': instance.amount,
      'category': instance.category,
      'description': instance.description,
      'transaction_date': instance.transactionDate,
      'created_at': instance.createdAt,
    };
