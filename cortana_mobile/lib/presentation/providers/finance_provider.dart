import 'package:flutter/foundation.dart';
import '../../data/repositories/finance_repository.dart';
import '../../data/models/finance_summary_model.dart';
import '../../data/models/finance_record_model.dart';
import '../../data/models/budget_model.dart';

enum FinanceState { initial, loading, loaded, error }

class FinanceProvider with ChangeNotifier {
  final FinanceRepository _financeRepository;

  FinanceProvider(this._financeRepository);

  FinanceState _state = FinanceState.initial;
  FinanceSummaryModel? _weeklySummary;
  FinanceSummaryModel? _monthlySummary;
  List<FinanceRecordModel> _recentTransactions = [];
  BudgetModel? _budget;
  String? _errorMessage;

  // Getters
  FinanceState get state => _state;
  FinanceSummaryModel? get weeklySummary => _weeklySummary;
  FinanceSummaryModel? get monthlySummary => _monthlySummary;
  List<FinanceRecordModel> get recentTransactions => _recentTransactions;
  BudgetModel? get budget => _budget;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == FinanceState.loading;

  // Fetch all finance data
  Future<void> fetchFinanceData() async {
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
      ]);

      _weeklySummary = results[0] as FinanceSummaryModel;
      _monthlySummary = results[1] as FinanceSummaryModel;
      final allRecords = results[2] as List<FinanceRecordModel>;
      _budget = results[3] as BudgetModel?;

      // Get 5 most recent transactions
      _recentTransactions = allRecords.take(5).toList();

      _state = FinanceState.loaded;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = FinanceState.error;
      notifyListeners();
    }
  }

  // Refresh data
  Future<void> refresh() async {
    await fetchFinanceData();
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

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
