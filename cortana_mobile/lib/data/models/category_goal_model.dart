import 'package:json_annotation/json_annotation.dart';

part 'category_goal_model.g.dart';

@JsonSerializable()
class CategoryGoalModel {
  final int id;
  @JsonKey(name: 'user_id')
  final int userId;
  final String category;
  @JsonKey(name: 'goal_amount')
  final double goalAmount;
  final String period; // "weekly", "monthly", or "yearly"
  @JsonKey(name: 'alert_threshold')
  final double alertThreshold; // 0.0 to 1.0 (e.g., 0.8 = 80%)
  @JsonKey(name: 'created_at')
  final String createdAt;

  CategoryGoalModel({
    required this.id,
    required this.userId,
    required this.category,
    required this.goalAmount,
    required this.period,
    required this.alertThreshold,
    required this.createdAt,
  });

  factory CategoryGoalModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryGoalModelFromJson(json);

  Map<String, dynamic> toJson() => _$CategoryGoalModelToJson(this);

  DateTime get createdDateTime => DateTime.parse(createdAt);

  // Helper to get threshold percentage
  int get thresholdPercentage => (alertThreshold * 100).round();
}
