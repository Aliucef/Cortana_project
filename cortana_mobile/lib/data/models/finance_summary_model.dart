import 'package:json_annotation/json_annotation.dart';

part 'finance_summary_model.g.dart';

@JsonSerializable()
class FinanceSummaryModel {
  @JsonKey(name: 'total_income')
  final double totalIncome;
  @JsonKey(name: 'total_expenses')
  final double totalExpenses;
  @JsonKey(name: 'net_balance')
  final double netBalance;
  @JsonKey(name: 'category_breakdown')
  final Map<String, double> categoryBreakdown;

  FinanceSummaryModel({
    required this.totalIncome,
    required this.totalExpenses,
    required this.netBalance,
    required this.categoryBreakdown,
  });

  factory FinanceSummaryModel.fromJson(Map<String, dynamic> json) =>
      _$FinanceSummaryModelFromJson(json);

  Map<String, dynamic> toJson() => _$FinanceSummaryModelToJson(this);

  // Helper method to get sorted categories by amount
  List<MapEntry<String, double>> get sortedCategories {
    final entries = categoryBreakdown.entries.toList();
    entries.sort((a, b) => b.value.compareTo(a.value));
    return entries;
  }

  // Get top N categories
  List<MapEntry<String, double>> getTopCategories(int count) {
    return sortedCategories.take(count).toList();
  }
}
