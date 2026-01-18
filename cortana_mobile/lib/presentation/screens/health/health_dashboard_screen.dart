import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/health_provider.dart';
import '../../widgets/common/app_drawer.dart';
import '../../../core/constants/app_colors.dart';

class HealthDashboardScreen extends StatefulWidget {
  const HealthDashboardScreen({super.key});

  @override
  State<HealthDashboardScreen> createState() => _HealthDashboardScreenState();
}

class _HealthDashboardScreenState extends State<HealthDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HealthProvider>(context, listen: false).fetchHealthData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded,
                color: AppColors.primaryBlue, size: 28),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text(
          'Health & Fitness',
          style: TextStyle(
            color: AppColors.lightText,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline,
                color: AppColors.primaryBlue, size: 24),
            onPressed: () {
              // Navigate to chat with health context
              context.push('/chat');
              // TODO: Pre-fill chat with health question
            },
          ),
          IconButton(
            icon: const Icon(Icons.fitness_center_rounded,
                color: AppColors.primaryBlue, size: 26),
            onPressed: () {
              context.push('/health/workouts');
            },
          ),
        ],
      ),
      drawer: const AppDrawer(currentRoute: '/health'),
      body: Consumer<HealthProvider>(
        builder: (context, healthProvider, child) {
          if (healthProvider.isLoading && !healthProvider.hasProfile) {
            return const Center(child: CircularProgressIndicator());
          }

          // No profile - show onboarding
          if (!healthProvider.hasProfile) {
            return _buildOnboarding(context);
          }

          return RefreshIndicator(
            onRefresh: () => healthProvider.refresh(),
            color: AppColors.primaryBlue,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Overview Card
                  _buildProfileCard(context, healthProvider),
                  const SizedBox(height: 20),

                  // Weekly Progress
                  _buildWeeklyProgress(context, healthProvider),
                  const SizedBox(height: 20),

                  // Quick Actions
                  const Text(
                    'Quick Actions',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.lightText,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _QuickActionCard(
                          icon: Icons.add_circle_rounded,
                          label: 'Log Workout',
                          gradient: const LinearGradient(
                            colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                          ),
                          onTap: () => context.push('/health/log-workout'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickActionCard(
                          icon: Icons.calendar_today_rounded,
                          label: 'View Plans',
                          gradient: const LinearGradient(
                            colors: [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
                          ),
                          onTap: () => context.push('/health/workouts'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickActionCard(
                          icon: Icons.monitor_weight_rounded,
                          label: 'Log Weight',
                          gradient: const LinearGradient(
                            colors: [Color(0xFF10B981), Color(0xFF059669)],
                          ),
                          onTap: () => context.push('/health/log-weight'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickActionCard(
                          icon: Icons.psychology_rounded,
                          label: 'Ask AI',
                          gradient: const LinearGradient(
                            colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
                          ),
                          onTap: () => context.push('/chat'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // This Week's Workouts
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "This Week's Workouts",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.lightText,
                        ),
                      ),
                      if (healthProvider.hasWorkoutPlan)
                        TextButton(
                          onPressed: () => context.push('/health/workouts'),
                          child: const Text('View All'),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  healthProvider.hasWorkoutPlan
                      ? Column(
                          children: healthProvider.currentWeekWorkouts
                              .map((workout) => _WorkoutCard(
                                    workout: workout,
                                    onTap: () => context.push(
                                        '/health/workout/${workout.id}'),
                                    onComplete: () async {
                                      if (workout.id == null) return;
                                      final success = await healthProvider
                                          .completeWorkout(workout.id!);
                                      if (success && context.mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                                'Workout completed! 🎉'),
                                            backgroundColor: Color(0xFF10B981),
                                          ),
                                        );
                                      }
                                    },
                                  ))
                              .toList(),
                        )
                      : _buildNoWorkouts(context),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildOnboarding(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFEF4444).withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.fitness_center_rounded,
                color: Colors.white,
                size: 60,
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Start Your Fitness Journey',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.lightText,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            const Text(
              'Create your gym profile to get personalized workout plans and track your progress',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.lightTextSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                context.push('/health/setup-profile');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryBlue,
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Create Gym Profile',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard(
      BuildContext context, HealthProvider healthProvider) {
    final profile = healthProvider.gymProfile!;
    final bmi = profile.bmi;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFEF4444).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Your Profile',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                onPressed: () => context.push('/health/setup-profile'),
                icon: const Icon(Icons.edit, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _ProfileStat(
                  icon: Icons.monitor_weight_rounded,
                  label: 'Weight',
                  value: '${profile.weight.toStringAsFixed(1)} kg',
                ),
              ),
              Expanded(
                child: _ProfileStat(
                  icon: Icons.height_rounded,
                  label: 'Height',
                  value: '${profile.height.toStringAsFixed(0)} cm',
                ),
              ),
              Expanded(
                child: _ProfileStat(
                  icon: Icons.analytics_rounded,
                  label: 'BMI',
                  value: bmi.toStringAsFixed(1),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.track_changes_rounded,
                    color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Goal: ${profile.primaryGoalDisplay}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    profile.experienceLevelDisplay,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklyProgress(
      BuildContext context, HealthProvider healthProvider) {
    final progress = healthProvider.weeklyProgress;
    final completed = healthProvider.completedWorkoutsThisWeek;
    final total = healthProvider.totalWorkoutsThisWeek;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder),
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
              const Text(
                'Weekly Progress',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.lightText,
                ),
              ),
              Text(
                '$completed / $total',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryBlue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: progress / 100,
              minHeight: 12,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(
                progress == 100
                    ? const Color(0xFF10B981)
                    : AppColors.primaryBlue,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${progress.toStringAsFixed(0)}% Complete',
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.lightTextSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoWorkouts(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Column(
        children: [
          Icon(
            Icons.fitness_center_rounded,
            size: 64,
            color: AppColors.lightTextSecondary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text(
            'No Workout Plan',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.lightText,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Generate a personalized workout plan to get started',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.lightTextSecondary,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () async {
              final healthProvider =
                  Provider.of<HealthProvider>(context, listen: false);
              
              // Show loading
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (context) => const Center(
                  child: CircularProgressIndicator(),
                ),
              );

              final success = await healthProvider.generateWorkoutPlan();
              
              if (context.mounted) Navigator.pop(context);

              if (success && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Workout plan generated! 🎉'),
                    backgroundColor: Color(0xFF10B981),
                  ),
                );
              }
            },
            icon: const Icon(Icons.auto_awesome_rounded),
            label: const Text('Generate Plan'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ProfileStat({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Gradient gradient;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white, size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _WorkoutCard extends StatelessWidget {
  final dynamic workout;
  final VoidCallback onTap;
  final VoidCallback onComplete;

  const _WorkoutCard({
    required this.workout,
    required this.onTap,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = workout.isCompleted;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCompleted
              ? const Color(0xFF10B981).withOpacity(0.3)
              : AppColors.lightBorder,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isCompleted
                          ? [const Color(0xFF10B981), const Color(0xFF059669)]
                          : [const Color(0xFFEF4444), const Color(0xFFDC2626)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    isCompleted
                        ? Icons.check_circle_rounded
                        : Icons.fitness_center_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
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
                          letterSpacing: 0.5,
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
                      const SizedBox(height: 4),
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
                if (!isCompleted)
                  IconButton(
                    onPressed: onComplete,
                    icon: const Icon(Icons.check_circle_outline),
                    color: AppColors.primaryBlue,
                  )
                else
                  const Icon(
                    Icons.check_circle,
                    color: Color(0xFF10B981),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
