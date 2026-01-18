import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/health_provider.dart';
import '../../../core/constants/app_colors.dart';

class LogWeightScreen extends StatefulWidget {
  const LogWeightScreen({super.key});

  @override
  State<LogWeightScreen> createState() => _LogWeightScreenState();
}

class _LogWeightScreenState extends State<LogWeightScreen> {
  final _formKey = GlobalKey<FormState>();
  final _weightController = TextEditingController();
  final _bodyFatController = TextEditingController();
  final _notesController = TextEditingController();
  DateTime _selectedDate = DateTime.now();

  @override
  void dispose() {
    _weightController.dispose();
    _bodyFatController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primaryBlue,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: AppColors.lightText,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final healthProvider = Provider.of<HealthProvider>(context, listen: false);

    final success = await healthProvider.logWeight(
      weight: double.parse(_weightController.text),
      bodyFatPercentage: _bodyFatController.text.isNotEmpty
          ? double.tryParse(_bodyFatController.text)
          : null,
      weighInDate: _selectedDate,
      notes: _notesController.text.trim().isEmpty
          ? null
          : _notesController.text.trim(),
    );

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Weight logged successfully!'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
    } else if (mounted && healthProvider.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(healthProvider.errorMessage!),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    }
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
          'Log Weight',
          style: TextStyle(
            color: AppColors.lightText,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Icon
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.monitor_weight_outlined,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Weight
              const Text(
                'Weight (kg)',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _weightController,
                keyboardType: TextInputType.number,
                decoration: _inputDecoration('70.5'),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Weight is required';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Invalid weight';
                  }
                  final weight = double.parse(value);
                  if (weight <= 0 || weight > 500) {
                    return 'Weight must be between 0 and 500 kg';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Body Fat Percentage (Optional)
              const Text(
                'Body Fat % (Optional)',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _bodyFatController,
                keyboardType: TextInputType.number,
                decoration: _inputDecoration('15.5'),
                validator: (value) {
                  if (value != null && value.isNotEmpty) {
                    final bodyFat = double.tryParse(value);
                    if (bodyFat == null) {
                      return 'Invalid percentage';
                    }
                    if (bodyFat < 0 || bodyFat > 100) {
                      return 'Must be between 0 and 100';
                    }
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Date
              const Text(
                'Weigh-In Date',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: () => _selectDate(context),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    border: Border.all(color: AppColors.lightBorder),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
                        style: const TextStyle(
                          fontSize: 16,
                          color: AppColors.lightText,
                        ),
                      ),
                      const Icon(Icons.calendar_today,
                          color: AppColors.lightTextSecondary, size: 20),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Notes
              const Text(
                'Notes (Optional)',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _notesController,
                decoration: _inputDecoration('Morning weight, after workout'),
                maxLines: 3,
              ),
              const SizedBox(height: 32),

              // Submit Button
              Consumer<HealthProvider>(
                builder: (context, healthProvider, child) {
                  return ElevatedButton(
                    onPressed: healthProvider.isLoading ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryBlue,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: healthProvider.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text(
                            'Log Weight',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: Colors.grey[50],
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.lightBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.lightBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primaryBlue, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFEF4444)),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFEF4444), width: 2),
      ),
    );
  }
}
