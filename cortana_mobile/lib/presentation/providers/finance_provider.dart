import 'package:flutter/foundation.dart';
import '../../data/repositories/finance_repository.dart';
import '../../data/models/finance_summary_model.dart';
import '../../data/models/finance_record_model.dart';
import '../../data/models/budget_model.dart';
import '../../data/models/category_goal_model.dart';

enum FinanceState { initial, loading, loaded, error }

class FinanceProvider with ChangeNotifier {
  final FinanceRepository _financeRepository;

  FinanceProvider(this._financeRepository);

  FinanceState _state = FinanceState.initial;
  FinanceSummaryModel? _weeklySummary;
  FinanceSummaryModel? _monthlySummary;
  List<FinanceRecordModel> _recentTransactions = [];
  BudgetModel? _budget;
  List<CategoryGoalModel> _categoryGoals = [];
  String? _errorMessage;
  DateTime? _lastFetchTime;

  // Cache duration: 5 minutes
  static const Duration _cacheDuration = Duration(minutes: 5);

  // Getters
  FinanceState get state => _state;
  FinanceSummaryModel? get weeklySummary => _weeklySummary;
  FinanceSummaryModel? get monthlySummary => _monthlySummary;
  List<FinanceRecordModel> get recentTransactions => _recentTransactions;
  BudgetModel? get budget => _budget;
  List<CategoryGoalModel> get categoryGoals => _categoryGoals;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == FinanceState.loading;
  bool get hasData => _weeklySummary != null && _monthlySummary != null;

  // Check if cached data is stale
  bool get _isCacheStale {
    if (_lastFetchTime == null) return true;
    return DateTime.now().difference(_lastFetchTime!) > _cacheDuration;
  }

  // Fetch all finance data
  Future<void> fetchFinanceData({bool force = false}) async {
    // If not forcing and we have cached data that's not stale, skip fetch
    if (!force && hasData && !_isCacheStale) {
      // Make sure state is set to loaded for cached data
      if (_state != FinanceState.loaded) {
        _state = FinanceState.loaded;
        notifyListeners();
      }
      return;
    }

    _state = FinanceState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      // Fetch in parallel
      final results = await Future.wait([
        _financeRepository.getFinanceSummary(period: 'weekly'),
        _financeRepository.getFinanceSummary(period: 'monthly'),
        _financeRepository.getFinanceRecords(),
        _financeRepository.getBudget(),
        _financeRepository.getCategoryGoals(),
      ]);

      _weeklySummary = results[0] as FinanceSummaryModel;
      _monthlySummary = results[1] as FinanceSummaryModel;
      final allRecords = results[2] as List<FinanceRecordModel>;
      _budget = results[3] as BudgetModel?;
      _categoryGoals = results[4] as List<CategoryGoalModel>;

      // Get 5 most recent transactions
      _recentTransactions = allRecords.take(5).toList();

      _lastFetchTime = DateTime.now();
      _state = FinanceState.loaded;
      notifyListeners();

      // Debug log
      print('✅ Finance data loaded successfully');
      print('Weekly Summary: ${_weeklySummary?.totalExpenses}');
      print('Monthly Summary: ${_monthlySummary?.totalExpenses}');
      print('Transactions: ${_recentTransactions.length}');
      print('Budget: ${_budget?.amount}');
      print('Goals: ${_categoryGoals.length}');
    } catch (e, stackTrace) {
      print('❌ Finance data fetch failed: $e');
      print('Stack trace: $stackTrace');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = FinanceState.error;
      notifyListeners();
    }
  }

  // Refresh data (force fetch)
  Future<void> refresh() async {
    await fetchFinanceData(force: true);
  }

  // Get balance (monthly net balance)
  double get balance => _monthlySummary?.netBalance ?? 0.0;

  // Get weekly income
  double get weeklyIncome => _weeklySummary?.totalIncome ?? 0.0;

  // Get weekly expenses
  double get weeklyExpenses => _weeklySummary?.totalExpenses ?? 0.0;

  // Get monthly income
  double get monthlyIncome => _monthlySummary?.totalIncome ?? 0.0;

  // Get monthly expenses
  double get monthlyExpenses => _monthlySummary?.totalExpenses ?? 0.0;

  // Add transaction
  Future<bool> addTransaction({
    required String type,
    required double amount,
    required String category,
    String? description,
  }) async {
    try {
      await _financeRepository.addFinanceRecord(
        type: type,
        amount: amount,
        category: category,
        description: description,
      );

      // Force refresh data after adding (bypass cache)
      await fetchFinanceData(force: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Set budget
  Future<bool> setBudget({
    required double amount,
    required String period,
  }) async {
    try {
      await _financeRepository.createBudget(
        amount: amount,
        period: period,
      );

      // Force refresh data after setting budget (bypass cache)
      await fetchFinanceData(force: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Create category goal
  Future<bool> createCategoryGoal({
    required String category,
    required double goalAmount,
    required String period,
    double alertThreshold = 0.8,
  }) async {
    try {
      await _financeRepository.createCategoryGoal(
        category: category,
        goalAmount: goalAmount,
        period: period,
        alertThreshold: alertThreshold,
      );

      // Force refresh data after creating goal (bypass cache)
      await fetchFinanceData(force: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Update category goal
  Future<bool> updateCategoryGoal({
    required int goalId,
    required double goalAmount,
    double? alertThreshold,
  }) async {
    try {
      await _financeRepository.updateCategoryGoal(
        goalId: goalId,
        goalAmount: goalAmount,
        alertThreshold: alertThreshold,
      );

      // Force refresh data after updating goal (bypass cache)
      await fetchFinanceData(force: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Delete category goal
  Future<bool> deleteCategoryGoal(int goalId) async {
    try {
      await _financeRepository.deleteCategoryGoal(goalId);

      // Force refresh data after deleting goal (bypass cache)
      await fetchFinanceData(force: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Delete transaction
  Future<bool> deleteTransaction(int recordId) async {
    try {
      await _financeRepository.deleteFinanceRecord(recordId);

      // Force refresh data after deleting (bypass cache)
      await fetchFinanceData(force: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Update transaction
  Future<bool> updateTransaction({
    required int recordId,
    required String type,
    required double amount,
    required String category,
    String? description,
  }) async {
    try {
      await _financeRepository.updateFinanceRecord(
        recordId: recordId,
        type: type,
        amount: amount,
        category: category,
        description: description,
      );

      // Force refresh data after updating (bypass cache)
      await fetchFinanceData(force: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Delete budget
  Future<bool> deleteBudget() async {
    try {
      if (_budget == null) return false;

      await _financeRepository.deleteBudget(_budget!.id);

      // Force refresh data after deleting budget (bypass cache)
      await fetchFinanceData(force: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
