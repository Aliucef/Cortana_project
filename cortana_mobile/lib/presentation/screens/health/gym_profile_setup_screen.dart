import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/health_provider.dart';
import '../../../core/constants/app_colors.dart';

class GymProfileSetupScreen extends StatefulWidget {
  const GymProfileSetupScreen({super.key});

  @override
  State<GymProfileSetupScreen> createState() => _GymProfileSetupScreenState();
}

class _GymProfileSetupScreenState extends State<GymProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _weightController = TextEditingController();
  final _heightController = TextEditingController();
  final _injuriesController = TextEditingController();

  String _experienceLevel = 'beginner';
  String _primaryGoal = 'muscle_gain';
  int _trainingDays = 4;
  String _equipmentAccess = 'full_gym';
  String _trainingSplit = 'push_pull_legs';
  String _preferredTime = 'morning';

  @override
  void initState() {
    super.initState();
    // Load existing profile if available
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final healthProvider =
          Provider.of<HealthProvider>(context, listen: false);
      if (healthProvider.hasProfile) {
        final profile = healthProvider.gymProfile!;
        _weightController.text = profile.weight.toString();
        _heightController.text = profile.height.toString();
        _experienceLevel = profile.experienceLevel;
        _primaryGoal = profile.primaryGoal;
        _trainingDays = profile.trainingDaysPerWeek;
        _equipmentAccess = profile.equipmentAccess;
        _trainingSplit = profile.trainingSplit;
        _preferredTime = profile.preferredTime;
        _injuriesController.text = profile.injuriesNotes ?? '';
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _weightController.dispose();
    _heightController.dispose();
    _injuriesController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final healthProvider = Provider.of<HealthProvider>(context, listen: false);

    final success = await healthProvider.createOrUpdateGymProfile(
      weight: double.parse(_weightController.text),
      height: double.parse(_heightController.text),
      experienceLevel: _experienceLevel,
      primaryGoal: _primaryGoal,
      trainingDaysPerWeek: _trainingDays,
      equipmentAccess: _equipmentAccess,
      trainingSplit: _trainingSplit,
      preferredTime: _preferredTime,
      injuriesNotes: _injuriesController.text.isEmpty
          ? null
          : _injuriesController.text,
    );

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile saved successfully!'),
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
          'Gym Profile',
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
                      colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.fitness_center_rounded,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Weight & Height
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
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
                          decoration: _inputDecoration('70.0'),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Required';
                            }
                            if (double.tryParse(value) == null) {
                              return 'Invalid';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Height (cm)',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.lightText,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _heightController,
                          keyboardType: TextInputType.number,
                          decoration: _inputDecoration('175'),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Required';
                            }
                            if (double.tryParse(value) == null) {
                              return 'Invalid';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Experience Level
              const Text(
                'Experience Level',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              _buildOptionButtons(
                selected: _experienceLevel,
                options: const [
                  ('beginner', 'Beginner'),
                  ('intermediate', 'Intermediate'),
                  ('advanced', 'Advanced'),
                ],
                onChanged: (value) => setState(() => _experienceLevel = value),
              ),
              const SizedBox(height: 20),

              // Primary Goal
              const Text(
                'Primary Goal',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              _buildOptionButtons(
                selected: _primaryGoal,
                options: const [
                  ('muscle_gain', 'Muscle Gain'),
                  ('strength', 'Strength'),
                  ('fat_loss', 'Fat Loss'),
                  ('general_fitness', 'Fitness'),
                ],
                onChanged: (value) => setState(() => _primaryGoal = value),
              ),
              const SizedBox(height: 20),

              // Training Days Per Week
              const Text(
                'Training Days Per Week',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: List.generate(
                  4,
                  (index) => Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        right: index < 3 ? 8 : 0,
                      ),
                      child: _buildDayButton(index + 3),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Equipment Access
              const Text(
                'Equipment Access',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              _buildOptionButtons(
                selected: _equipmentAccess,
                options: const [
                  ('full_gym', 'Full Gym'),
                  ('home_gym', 'Home Gym'),
                  ('minimal', 'Minimal'),
                ],
                onChanged: (value) => setState(() => _equipmentAccess = value),
              ),
              const SizedBox(height: 20),

              // Training Split
              const Text(
                'Training Split',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              _buildOptionButtons(
                selected: _trainingSplit,
                options: const [
                  ('full_body', 'Full Body'),
                  ('upper_lower', 'Upper/Lower'),
                  ('push_pull_legs', 'PPL'),
                  ('bro_split', 'Bro Split'),
                ],
                onChanged: (value) => setState(() => _trainingSplit = value),
              ),
              const SizedBox(height: 20),

              // Preferred Time
              const Text(
                'Preferred Time',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              _buildOptionButtons(
                selected: _preferredTime,
                options: const [
                  ('morning', 'Morning'),
                  ('afternoon', 'Afternoon'),
                  ('evening', 'Evening'),
                ],
                onChanged: (value) => setState(() => _preferredTime = value),
              ),
              const SizedBox(height: 20),

              // Injuries/Notes
              const Text(
                'Injuries or Notes (Optional)',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _injuriesController,
                decoration: _inputDecoration(
                    'Any injuries or limitations...'),
                maxLines: 3,
              ),
              const SizedBox(height: 32),

              // Save Button
              Consumer<HealthProvider>(
                builder: (context, healthProvider, child) {
                  return ElevatedButton(
                    onPressed: healthProvider.isLoading ? null : _handleSave,
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
                            'Save Profile',
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
    );
  }

  Widget _buildOptionButtons({
    required String selected,
    required List<(String, String)> options,
    required Function(String) onChanged,
  }) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options
          .map((option) => _buildOptionButton(
                label: option.$2,
                value: option.$1,
                isSelected: selected == option.$1,
                onTap: () => onChanged(option.$1),
              ))
          .toList(),
    );
  }

  Widget _buildOptionButton({
    required String label,
    required String value,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryBlue : Colors.grey[100],
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppColors.primaryBlue : AppColors.lightBorder,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.lightText,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildDayButton(int day) {
    final isSelected = _trainingDays == day;
    return GestureDetector(
      onTap: () => setState(() => _trainingDays = day),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryBlue : Colors.grey[100],
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppColors.primaryBlue : AppColors.lightBorder,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Text(
          '$day',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.lightText,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}
