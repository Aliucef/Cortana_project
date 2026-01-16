import 'package:json_annotation/json_annotation.dart';

part 'recurring_expense_model.g.dart';

@JsonSerializable()
class RecurringExpenseModel {
  final int id;
  @JsonKey(name: 'user_id')
  final int userId;
  final String name;
  final double amount;
  final String category;
  final String frequency; // "daily", "weekly", "monthly", "yearly"
  @JsonKey(name: 'next_due_date')
  final String nextDueDate; // ISO 8601 string
  @JsonKey(name: 'reminder_days_before')
  final int reminderDaysBefore;
  @JsonKey(name: 'is_active')
  final bool isActive;
  @JsonKey(name: 'created_at')
  final String createdAt;

  RecurringExpenseModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.amount,
    required this.category,
    required this.frequency,
    required this.nextDueDate,
    required this.reminderDaysBefore,
    required this.isActive,
    required this.createdAt,
  });

  factory RecurringExpenseModel.fromJson(Map<String, dynamic> json) =>
      _$RecurringExpenseModelFromJson(json);

  Map<String, dynamic> toJson() => _$RecurringExpenseModelToJson(this);

  DateTime get nextDueDatetime => DateTime.parse(nextDueDate);
  DateTime get createdDateTime => DateTime.parse(createdAt);

  // Helper to check if due soon
  bool get isDueSoon {
    final now = DateTime.now();
    final due = nextDueDatetime;
    final daysUntilDue = due.difference(now).inDays;
    return daysUntilDue <= reminderDaysBefore && daysUntilDue >= 0;
  }

  // Helper to check if overdue
  bool get isOverdue {
    return nextDueDatetime.isBefore(DateTime.now());
  }
}
