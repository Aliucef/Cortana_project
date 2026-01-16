// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finance_summary_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FinanceSummaryModel _$FinanceSummaryModelFromJson(Map<String, dynamic> json) =>
    FinanceSummaryModel(
      totalIncome: (json['total_income'] as num).toDouble(),
      totalExpenses: (json['total_expenses'] as num).toDouble(),
      netBalance: (json['net_balance'] as num).toDouble(),
      categoryBreakdown: (json['category_breakdown'] as Map<String, dynamic>)
          .map((k, e) => MapEntry(k, (e as num).toDouble())),
    );

Map<String, dynamic> _$FinanceSummaryModelToJson(
  FinanceSummaryModel instance,
) => <String, dynamic>{
  'total_income': instance.totalIncome,
  'total_expenses': instance.totalExpenses,
  'net_balance': instance.netBalance,
  'category_breakdown': instance.categoryBreakdown,
};
