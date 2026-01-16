import 'package:json_annotation/json_annotation.dart';

part 'finance_record_model.g.dart';

@JsonSerializable()
class FinanceRecordModel {
  final int id;
  @JsonKey(name: 'user_id')
  final int userId;
  @JsonKey(name: 'transaction_type')
  final String transactionType; // "income" or "expense"
  final double amount;
  final String category;
  final String? description;
  @JsonKey(name: 'transaction_date')
  final String transactionDate; // ISO 8601 string
  @JsonKey(name: 'created_at')
  final String createdAt;

  FinanceRecordModel({
    required this.id,
    required this.userId,
    required this.transactionType,
    required this.amount,
    required this.category,
    this.description,
    required this.transactionDate,
    required this.createdAt,
  });

  factory FinanceRecordModel.fromJson(Map<String, dynamic> json) =>
      _$FinanceRecordModelFromJson(json);

  Map<String, dynamic> toJson() => _$FinanceRecordModelToJson(this);

  // Helper getters
  bool get isIncome => transactionType == 'income';
  bool get isExpense => transactionType == 'expense';

  DateTime get transactionDateTime => DateTime.parse(transactionDate);
  DateTime get createdDateTime => DateTime.parse(createdAt);
}
