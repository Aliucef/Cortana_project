import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/finance_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';

class CategoryGoalsScreen extends StatefulWidget {
  const CategoryGoalsScreen({super.key});

  @override
  State<CategoryGoalsScreen> createState() => _CategoryGoalsScreenState();
}

class _CategoryGoalsScreenState extends State<CategoryGoalsScreen> {
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
          'Category Goals',
          style: TextStyle(
            color: AppColors.lightText,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded,
                color: AppColors.primaryBlue, size: 28),
            onPressed: () {
              _showAddGoalDialog();
            },
          ),
        ],
      ),
      body: Consumer<FinanceProvider>(
        builder: (context, financeProvider, child) {
          if (financeProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final categoryGoals = financeProvider.categoryGoals;
          final monthlySummary = financeProvider.monthlySummary;

          return RefreshIndicator(
            onRefresh: () => financeProvider.refresh(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Info Card
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
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.track_changes_rounded,
                            color: Colors.white,
                            size: 32,
                          ),
                        ),
                        const SizedBox(width: 16),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Set Spending Goals',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Track spending limits for each category',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Goals List
                  if (categoryGoals.isEmpty)
                    Center(
                      child: Column(
                        children: [
                          const SizedBox(height: 60),
                          Icon(
                            Icons.track_changes_outlined,
                            size: 80,
                            color: Colors.grey[300],
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No category goals set',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: AppColors.lightTextSecondary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Set spending limits for specific categories',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.lightTextSecondary,
                            ),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: _showAddGoalDialog,
                            icon: const Icon(Icons.add_rounded),
                            label: const Text('Add Goal'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryBlue,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ...categoryGoals.map((goal) {
                      // Calculate spending for this category
                      final categorySpending = monthlySummary
                              ?.categoryBreakdown[goal.category]
                              ?.abs() ??
                          0.0;
                      final percentage =
                          (categorySpending / goal.goalAmount * 100)
                              .clamp(0, 100);
                      final isOverGoal = categorySpending > goal.goalAmount;
                      final isWarning = percentage >= (goal.alertThreshold * 100);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isOverGoal
                                ? const Color(0xFFEF4444).withOpacity(0.3)
                                : isWarning
                                    ? const Color(0xFFF59E0B).withOpacity(0.3)
                                    : AppColors.lightBorder,
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        goal.category,
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.lightText,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${CurrencyFormatter.format(categorySpending)} / ${CurrencyFormatter.format(goal.goalAmount)}',
                                        style: const TextStyle(
                                          fontSize: 14,
                                          color: AppColors.lightTextSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isOverGoal
                                            ? const Color(0xFFEF4444)
                                                .withOpacity(0.1)
                                            : isWarning
                                                ? const Color(0xFFF59E0B)
                                                    .withOpacity(0.1)
                                                : const Color(0xFF10B981)
                                                    .withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        isOverGoal
                                            ? 'Over Goal'
                                            : isWarning
                                                ? 'Warning'
                                                : 'On Track',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: isOverGoal
                                              ? const Color(0xFFEF4444)
                                              : isWarning
                                                  ? const Color(0xFFF59E0B)
                                                  : const Color(0xFF10B981),
                                        ),
                                      ),
                                    ),
                                    IconButton(
                                      onPressed: () {
                                        _showEditGoalDialog(goal);
                                      },
                                      icon: const Icon(Icons.edit_outlined),
                                      color: AppColors.lightTextSecondary,
                                      iconSize: 20,
                                    ),
                                    IconButton(
                                      onPressed: () {
                                        _showDeleteConfirmation(goal);
                                      },
                                      icon: const Icon(Icons.delete_outline),
                                      color: const Color(0xFFEF4444),
                                      iconSize: 20,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: LinearProgressIndicator(
                                value: percentage / 100,
                                minHeight: 10,
                                backgroundColor: Colors.grey[200],
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  isOverGoal
                                      ? const Color(0xFFEF4444)
                                      : isWarning
                                          ? const Color(0xFFF59E0B)
                                          : const Color(0xFF10B981),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${percentage.toStringAsFixed(0)}% used',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.lightTextSecondary,
                                  ),
                                ),
                                Text(
                                  'Alert at ${(goal.alertThreshold * 100).toStringAsFixed(0)}%',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.lightTextSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showAddGoalDialog() {
    showDialog(
      context: context,
      builder: (context) => _GoalDialog(
        title: 'Add Category Goal',
        onSave: (category, amount, threshold) async {
          final financeProvider =
              Provider.of<FinanceProvider>(context, listen: false);
          final success = await financeProvider.createCategoryGoal(
            category: category,
            goalAmount: amount,
            period: 'monthly',
            alertThreshold: threshold,
          );

          if (success) {
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Category goal added successfully!'),
                  backgroundColor: Color(0xFF10B981),
                ),
              );
            }
          } else {
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    financeProvider.errorMessage ?? 'Failed to add goal',
                  ),
                  backgroundColor: const Color(0xFFEF4444),
                ),
              );
            }
          }
        },
      ),
    );
  }

  void _showEditGoalDialog(goal) {
    showDialog(
      context: context,
      builder: (context) => _GoalDialog(
        title: 'Edit Category Goal',
        initialCategory: goal.category,
        initialAmount: goal.goalAmount,
        initialThreshold: goal.alertThreshold,
        onSave: (category, amount, threshold) async {
          final financeProvider =
              Provider.of<FinanceProvider>(context, listen: false);
          final success = await financeProvider.updateCategoryGoal(
            goalId: goal.id,
            goalAmount: amount,
            alertThreshold: threshold,
          );

          if (success) {
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Category goal updated successfully!'),
                  backgroundColor: Color(0xFF10B981),
                ),
              );
            }
          } else {
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    financeProvider.errorMessage ?? 'Failed to update goal',
                  ),
                  backgroundColor: const Color(0xFFEF4444),
                ),
              );
            }
          }
        },
      ),
    );
  }

  void _showDeleteConfirmation(goal) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Category Goal'),
        content: Text('Are you sure you want to delete the ${goal.category} goal?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              final financeProvider =
                  Provider.of<FinanceProvider>(context, listen: false);
              final success = await financeProvider.deleteCategoryGoal(goal.id);

              if (mounted) Navigator.pop(context);

              if (success) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Category goal deleted successfully!'),
                      backgroundColor: Color(0xFF10B981),
                    ),
                  );
                }
              } else {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        financeProvider.errorMessage ?? 'Failed to delete goal',
                      ),
                      backgroundColor: const Color(0xFFEF4444),
                    ),
                  );
                }
              }
            },
            child: const Text(
              'Delete',
              style: TextStyle(color: Color(0xFFEF4444)),
            ),
          ),
        ],
      ),
    );
  }
}

class _GoalDialog extends StatefulWidget {
  final String title;
  final String? initialCategory;
  final double? initialAmount;
  final double? initialThreshold;
  final Function(String category, double amount, double threshold) onSave;

  const _GoalDialog({
    required this.title,
    required this.onSave,
    this.initialCategory,
    this.initialAmount,
    this.initialThreshold,
  });

  @override
  State<_GoalDialog> createState() => _GoalDialogState();
}

class _GoalDialogState extends State<_GoalDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _amountController;
  late String _category;
  late double _threshold;

  final List<String> _categories = [
    'Food',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Health',
    'Education',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    _amountController = TextEditingController(
      text: widget.initialAmount?.toString() ?? '',
    );
    _category = widget.initialCategory ?? _categories.first;
    _threshold = widget.initialThreshold ?? 0.8;
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Category Dropdown
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(),
                ),
                items: _categories.map((cat) {
                  return DropdownMenuItem(value: cat, child: Text(cat));
                }).toList(),
                onChanged: widget.initialCategory == null
                    ? (value) {
                        setState(() {
                          _category = value!;
                        });
                      }
                    : null,
                validator: (value) =>
                    value == null ? 'Please select a category' : null,
              ),
              const SizedBox(height: 16),

              // Amount Input
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Goal Amount',
                  prefixText: '\$ ',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an amount';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Please enter a valid number';
                  }
                  if (double.parse(value) <= 0) {
                    return 'Amount must be greater than 0';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Alert Threshold Slider
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Alert Threshold: ${(_threshold * 100).toStringAsFixed(0)}%',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Slider(
                    value: _threshold,
                    min: 0.5,
                    max: 1.0,
                    divisions: 10,
                    label: '${(_threshold * 100).toStringAsFixed(0)}%',
                    onChanged: (value) {
                      setState(() {
                        _threshold = value;
                      });
                    },
                  ),
                  Text(
                    'Get notified when you reach ${(_threshold * 100).toStringAsFixed(0)}% of your goal',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              widget.onSave(
                _category,
                double.parse(_amountController.text),
                _threshold,
              );
            }
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
