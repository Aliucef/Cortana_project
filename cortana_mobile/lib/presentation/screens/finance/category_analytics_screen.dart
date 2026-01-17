import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/finance_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';

class CategoryAnalyticsScreen extends StatefulWidget {
  const CategoryAnalyticsScreen({super.key});

  @override
  State<CategoryAnalyticsScreen> createState() =>
      _CategoryAnalyticsScreenState();
}

class _CategoryAnalyticsScreenState extends State<CategoryAnalyticsScreen> {
  String _selectedPeriod = 'monthly';

  // Category colors mapping
  final Map<String, Color> _categoryColors = {
    'food': const Color(0xFFEF4444),
    'transportation': const Color(0xFF3B82F6),
    'entertainment': const Color(0xFFF59E0B),
    'shopping': const Color(0xFF8B5CF6),
    'utilities': const Color(0xFF10B981),
    'health': const Color(0xFFEC4899),
    'education': const Color(0xFF14B8A6),
    'other': const Color(0xFF6B7280),
  };

  Color _getCategoryColor(String category, int index) {
    final normalizedCategory = category.toLowerCase();
    return _categoryColors[normalizedCategory] ??
        _getColorByIndex(index);
  }

  Color _getColorByIndex(int index) {
    final colors = [
      const Color(0xFFEF4444),
      const Color(0xFF3B82F6),
      const Color(0xFFF59E0B),
      const Color(0xFF8B5CF6),
      const Color(0xFF10B981),
      const Color(0xFFEC4899),
      const Color(0xFF14B8A6),
      const Color(0xFF6B7280),
    ];
    return colors[index % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.lightText),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Category Analytics',
          style: TextStyle(
            color: AppColors.lightText,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Consumer<FinanceProvider>(
        builder: (context, financeProvider, child) {
          final summary = _selectedPeriod == 'weekly'
              ? financeProvider.weeklySummary
              : financeProvider.monthlySummary;

          if (financeProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (summary == null) {
            return const Center(child: Text('No data available'));
          }

          final categoryBreakdown = summary.categoryBreakdown;
          final totalExpenses = summary.totalExpenses;

          if (categoryBreakdown.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.pie_chart_outline_rounded,
                    size: 80,
                    color: Colors.grey[300],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'No expense data',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Add some expenses to see analytics',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
            );
          }

          // Sort categories by amount
          final sortedCategories = categoryBreakdown.entries.toList()
            ..sort((a, b) => b.value.compareTo(a.value));

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Period Selector
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedPeriod = 'weekly';
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _selectedPeriod == 'weekly'
                                ? AppColors.primaryBlue
                                : Colors.grey[100],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Weekly',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: _selectedPeriod == 'weekly'
                                  ? Colors.white
                                  : AppColors.lightTextSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedPeriod = 'monthly';
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _selectedPeriod == 'monthly'
                                ? AppColors.primaryBlue
                                : Colors.grey[100],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Monthly',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: _selectedPeriod == 'monthly'
                                  ? Colors.white
                                  : AppColors.lightTextSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Total Expenses Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Total Expenses',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            CurrencyFormatter.format(totalExpenses.abs()),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.trending_down_rounded,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Category List
                const Text(
                  'Category Breakdown',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 16),
                ...sortedCategories.map((entry) {
                  final index = sortedCategories.indexOf(entry);
                  final category = entry.key;
                  final amount = entry.value.abs();
                  final percentage = (amount / totalExpenses.abs()) * 100;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.lightBorder),
                    ),
                    child: Row(
                      children: [
                        // Color indicator
                        Container(
                          width: 4,
                          height: 40,
                          decoration: BoxDecoration(
                            color: _getCategoryColor(category, index),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        const SizedBox(width: 16),
                        // Category info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                category,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.lightText,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${percentage.toStringAsFixed(1)}% of total',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.lightTextSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Amount
                        Text(
                          CurrencyFormatter.format(amount),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.lightText,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ],
            ),
          );
        },
      ),
    );
  }
}
