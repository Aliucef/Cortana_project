import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/health_provider.dart';
import '../../../core/constants/app_colors.dart';

class WorkoutsScreen extends StatelessWidget {
  const WorkoutsScreen({super.key});

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
          'Workout Plans',
          style: TextStyle(
            color: AppColors.lightText,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Consumer<HealthProvider>(
        builder: (context, healthProvider, child) {
          if (healthProvider.currentWeekWorkouts.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.fitness_center_rounded, size: 64,
                        color: AppColors.lightTextSecondary),
                    const SizedBox(height: 16),
                    const Text(
                      'No Workout Plans',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.lightText,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () async {
                        showDialog(
                          context: context,
                          barrierDismissible: false,
                          builder: (context) => const Center(
                            child: CircularProgressIndicator(),
                          ),
                        );

                        await healthProvider.generateWorkoutPlan();
                        
                        if (context.mounted) Navigator.pop(context);
                      },
                      child: const Text('Generate Plan'),
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: healthProvider.currentWeekWorkouts.length,
            itemBuilder: (context, index) {
              final workout = healthProvider.currentWeekWorkouts[index];
              return _WorkoutCard(
                workout: workout,
                onTap: () => context.push('/health/workout/${workout.id}'),
              );
            },
          );
        },
      ),
    );
  }
}

class _WorkoutCard extends StatelessWidget {
  final dynamic workout;
  final VoidCallback onTap;

  const _WorkoutCard({
    required this.workout,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.lightBorder),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.fitness_center_rounded,
                      color: Colors.white),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        workout.day.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.lightTextSecondary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        workout.workoutType,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.lightText,
                        ),
                      ),
                      Text(
                        '${workout.exercises.length} exercises',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  workout.isCompleted
                      ? Icons.check_circle
                      : Icons.chevron_right,
                  color: workout.isCompleted
                      ? const Color(0xFF10B981)
                      : AppColors.lightTextSecondary,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
