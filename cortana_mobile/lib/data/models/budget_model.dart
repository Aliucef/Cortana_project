import 'package:json_annotation/json_annotation.dart';

part 'budget_model.g.dart';

@JsonSerializable()
class BudgetModel {
  final int id;
  @JsonKey(name: 'user_id')
  final int userId;
  final double amount;
  final String period; // "weekly", "monthly", or "yearly"
  @JsonKey(name: 'created_at')
  final String? createdAt;

  BudgetModel({
    required this.id,
    required this.userId,
    required this.amount,
    required this.period,
    this.createdAt,
  });

  factory BudgetModel.fromJson(Map<String, dynamic> json) =>
      _$BudgetModelFromJson(json);

  Map<String, dynamic> toJson() => _$BudgetModelToJson(this);

  DateTime? get createdDateTime =>
      createdAt != null ? DateTime.parse(createdAt!) : null;
}
