import 'package:flutter/material.dart';
import '../../widgets/common/glass_card.dart';
import '../../../core/constants/app_colors.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _pushNotifications = true;
  bool _emailNotifications = false;
  bool _smsNotifications = true;
  bool _financeAlerts = true;
  bool _budgetWarnings = true;
  bool _workoutReminders = false;
  bool _newsDigest = true;
  bool _weeklyReports = true;
  bool _promotionalEmails = false;
  String _quietHoursStart = '22:00';
  String _quietHoursEnd = '08:00';

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
          'Notifications',
          style: TextStyle(
            color: AppColors.lightText,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // General Notifications
            const Text(
              'General',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.lightText,
              ),
            ),
            const SizedBox(height: 12),
            GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _NotificationToggle(
                    icon: Icons.notifications_active_outlined,
                    title: 'Push Notifications',
                    subtitle: 'Receive push notifications on this device',
                    value: _pushNotifications,
                    onChanged: (value) => setState(() => _pushNotifications = value),
                  ),
                  const Divider(height: 1),
                  _NotificationToggle(
                    icon: Icons.email_outlined,
                    title: 'Email Notifications',
                    subtitle: 'Receive updates via email',
                    value: _emailNotifications,
                    onChanged: (value) => setState(() => _emailNotifications = value),
                  ),
                  const Divider(height: 1),
                  _NotificationToggle(
                    icon: Icons.sms_outlined,
                    title: 'SMS Notifications',
                    subtitle: 'Receive important alerts via SMS',
                    value: _smsNotifications,
                    onChanged: (value) => setState(() => _smsNotifications = value),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Finance Notifications
            const Text(
              'Finance',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.lightText,
              ),
            ),
            const SizedBox(height: 12),
            GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _NotificationToggle(
                    icon: Icons.account_balance_wallet_outlined,
                    title: 'Finance Alerts',
                    subtitle: 'Daily expense reminders and summaries',
                    value: _financeAlerts,
                    onChanged: (value) => setState(() => _financeAlerts = value),
                  ),
                  const Divider(height: 1),
                  _NotificationToggle(
                    icon: Icons.warning_amber_outlined,
                    title: 'Budget Warnings',
                    subtitle: 'Get notified when approaching budget limits',
                    value: _budgetWarnings,
                    onChanged: (value) => setState(() => _budgetWarnings = value),
                  ),
                  const Divider(height: 1),
                  _NotificationToggle(
                    icon: Icons.assessment_outlined,
                    title: 'Weekly Reports',
                    subtitle: 'Financial summary every Sunday at 6 PM',
                    value: _weeklyReports,
                    onChanged: (value) => setState(() => _weeklyReports = value),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Health & Fitness
            const Text(
              'Health & Fitness',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.lightText,
              ),
            ),
            const SizedBox(height: 12),
            GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _NotificationToggle(
                    icon: Icons.fitness_center_outlined,
                    title: 'Workout Reminders',
                    subtitle: 'Daily reminders for scheduled workouts',
                    value: _workoutReminders,
                    onChanged: (value) => setState(() => _workoutReminders = value),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // News & Updates
            const Text(
              'News & Updates',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.lightText,
              ),
            ),
            const SizedBox(height: 12),
            GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _NotificationToggle(
                    icon: Icons.newspaper_outlined,
                    title: 'Daily News Digest',
                    subtitle: 'Personalized news briefing every morning at 8 AM',
                    value: _newsDigest,
                    onChanged: (value) => setState(() => _newsDigest = value),
                  ),
                  const Divider(height: 1),
                  _NotificationToggle(
                    icon: Icons.campaign_outlined,
                    title: 'Promotional Emails',
                    subtitle: 'Updates about new features and offers',
                    value: _promotionalEmails,
                    onChanged: (value) => setState(() => _promotionalEmails = value),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Quiet Hours
            const Text(
              'Quiet Hours',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.lightText,
              ),
            ),
            const SizedBox(height: 12),
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Do Not Disturb',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.lightText,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Mute non-urgent notifications during these hours',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Start Time',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: AppColors.lightText,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              decoration: BoxDecoration(
                                border: Border.all(color: AppColors.lightBorder),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _quietHoursStart,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.lightText,
                                    ),
                                  ),
                                  const Icon(Icons.access_time, size: 20, color: AppColors.lightTextSecondary),
                                ],
                              ),
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
                              'End Time',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: AppColors.lightText,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              decoration: BoxDecoration(
                                border: Border.all(color: AppColors.lightBorder),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _quietHoursEnd,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.lightText,
                                    ),
                                  ),
                                  const Icon(Icons.access_time, size: 20, color: AppColors.lightTextSecondary),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _NotificationToggle extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _NotificationToggle({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primaryBlue),
      title: Text(
        title,
        style: const TextStyle(
          color: AppColors.lightText,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          fontSize: 12,
          color: AppColors.lightTextSecondary,
        ),
      ),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primaryBlue,
      ),
    );
  }
}
