import '../datasources/remote/api_client.dart';
import '../datasources/local/secure_storage_service.dart';
import '../models/finance_record_model.dart';
import '../models/finance_summary_model.dart';
import '../models/budget_model.dart';
import '../models/category_goal_model.dart';
import '../models/recurring_expense_model.dart';
import '../../core/constants/api_constants.dart';

class FinanceRepository {
  final ApiClient _apiClient;
  final SecureStorageService _secureStorage;

  FinanceRepository(this._apiClient, this._secureStorage);

  Future<int> _getCurrentUserId() async {
    final userId = await _secureStorage.getCurrentUserId();
    if (userId == null) throw Exception('User not authenticated');
    return userId;
  }

  // Get Finance Summary
  Future<FinanceSummaryModel> getFinanceSummary({
    required String period, // "weekly", "monthly", or "custom"
    String? startDate,
    String? endDate,
  }) async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.get(
      ApiConstants.getFinanceSummary(userId),
      queryParameters: {
        'period': period,
        if (startDate != null) 'start_date': startDate,
        if (endDate != null) 'end_date': endDate,
      },
    );
    return FinanceSummaryModel.fromJson(response.data);
  }

  // Get All Finance Records
  Future<List<FinanceRecordModel>> getFinanceRecords() async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.get(
      ApiConstants.getUserFinanceRecords(userId),
    );
    return (response.data as List)
        .map((json) => FinanceRecordModel.fromJson(json))
        .toList();
  }

  // Add Finance Record
  Future<FinanceRecordModel> addFinanceRecord({
    required String type, // "income" or "expense"
    required double amount,
    required String category,
    String? description,
    String? date,
  }) async {
    final transactionDate = date ?? DateTime.now().toIso8601String();

    final response = await _apiClient.post(
      ApiConstants.addFinanceRecord,
      data: {
        'transaction_type': type,
        'amount': amount,
        'category': category,
        'description': description,
        'transaction_date': transactionDate,
      },
    );
    return FinanceRecordModel.fromJson(response.data);
  }

  // Delete Finance Record
  Future<void> deleteFinanceRecord(int recordId) async {
    await _apiClient.delete(
      ApiConstants.deleteFinanceRecord(recordId),
    );
  }

  // Get Budget
  Future<BudgetModel?> getBudget() async {
    try {
      final userId = await _getCurrentUserId();
      final response = await _apiClient.get(
        ApiConstants.getBudget(userId),
      );
      return BudgetModel.fromJson(response.data);
    } catch (e) {
      // No budget set - return null
      return null;
    }
  }

  // Create/Update Budget
  Future<BudgetModel> createBudget({
    required double amount,
    required String period, // "weekly" or "monthly"
  }) async {
    final response = await _apiClient.post(
      ApiConstants.createBudget,
      data: {
        'amount': amount,
        'period': period,
      },
    );
    return BudgetModel.fromJson(response.data);
  }

  // Get Category Goals
  Future<List<CategoryGoalModel>> getCategoryGoals() async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.get(
      ApiConstants.getCategoryGoals(userId),
    );
    return (response.data as List)
        .map((json) => CategoryGoalModel.fromJson(json))
        .toList();
  }

  // Create Category Goal
  Future<CategoryGoalModel> createCategoryGoal({
    required String category,
    required double goalAmount,
    required String period,
    double alertThreshold = 0.8,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.createCategoryGoal,
      data: {
        'category': category,
        'goal_amount': goalAmount,
        'period': period,
        'alert_threshold': alertThreshold,
      },
    );
    return CategoryGoalModel.fromJson(response.data);
  }

  // Update Category Goal
  Future<CategoryGoalModel> updateCategoryGoal({
    required int goalId,
    required double goalAmount,
    double? alertThreshold,
  }) async {
    final response = await _apiClient.put(
      ApiConstants.updateCategoryGoal(goalId),
      data: {
        'goal_amount': goalAmount,
        if (alertThreshold != null) 'alert_threshold': alertThreshold,
      },
    );
    return CategoryGoalModel.fromJson(response.data);
  }

  // Delete Category Goal
  Future<void> deleteCategoryGoal(int goalId) async {
    await _apiClient.delete(
      ApiConstants.deleteCategoryGoal(goalId),
    );
  }

  // Get Recurring Expenses
  Future<List<RecurringExpenseModel>> getRecurringExpenses() async {
    final userId = await _getCurrentUserId();
    final response = await _apiClient.get(
      ApiConstants.getRecurringExpenses(userId),
    );
    return (response.data as List)
        .map((json) => RecurringExpenseModel.fromJson(json))
        .toList();
  }

  // Create Recurring Expense
  Future<RecurringExpenseModel> createRecurringExpense({
    required String name,
    required double amount,
    required String category,
    required String frequency,
    required String nextDueDate,
    int reminderDaysBefore = 1,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.createRecurringExpense,
      data: {
        'name': name,
        'amount': amount,
        'category': category,
        'frequency': frequency,
        'next_due_date': nextDueDate,
        'reminder_days_before': reminderDaysBefore,
      },
    );
    return RecurringExpenseModel.fromJson(response.data);
  }

  // Update Recurring Expense
  Future<RecurringExpenseModel> updateRecurringExpense({
    required int expenseId,
    String? name,
    double? amount,
    String? nextDueDate,
  }) async {
    final response = await _apiClient.put(
      ApiConstants.updateRecurringExpense(expenseId),
      data: {
        if (name != null) 'name': name,
        if (amount != null) 'amount': amount,
        if (nextDueDate != null) 'next_due_date': nextDueDate,
      },
    );
    return RecurringExpenseModel.fromJson(response.data);
  }

  // Delete Recurring Expense
  Future<void> deleteRecurringExpense(int expenseId) async {
    await _apiClient.delete(
      ApiConstants.deleteRecurringExpense(expenseId),
    );
  }
}
