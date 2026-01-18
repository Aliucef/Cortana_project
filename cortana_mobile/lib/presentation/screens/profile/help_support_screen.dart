import 'package:flutter/material.dart';
import '../../widgets/common/glass_card.dart';
import '../../../core/constants/app_colors.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

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
          'Help & Support',
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
            // Quick Help
            const Text(
              'Quick Help',
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
                  _HelpOption(
                    icon: Icons.question_answer_outlined,
                    title: 'FAQs',
                    subtitle: 'Find answers to common questions',
                    onTap: () {
                      _showFAQs(context);
                    },
                  ),
                  const Divider(height: 1),
                  _HelpOption(
                    icon: Icons.menu_book_outlined,
                    title: 'User Guide',
                    subtitle: 'Learn how to use Cortana effectively',
                    onTap: () {
                      _showUserGuide(context);
                    },
                  ),
                  const Divider(height: 1),
                  _HelpOption(
                    icon: Icons.tips_and_updates_outlined,
                    title: 'Tips & Tricks',
                    subtitle: 'Get the most out of your AI assistant',
                    onTap: () {
                      _showTips(context);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Contact Support
            const Text(
              'Contact Support',
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
                  _HelpOption(
                    icon: Icons.email_outlined,
                    title: 'Email Support',
                    subtitle: 'support@cortana-ai.com',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Opening email client...')),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  _HelpOption(
                    icon: Icons.chat_bubble_outline,
                    title: 'Live Chat',
                    subtitle: 'Available Mon-Fri, 9 AM - 6 PM',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Connecting to live chat...')),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  _HelpOption(
                    icon: Icons.phone_outlined,
                    title: 'Phone Support',
                    subtitle: '+961 1 234 567',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Calling support...')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Resources
            const Text(
              'Resources',
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
                  _HelpOption(
                    icon: Icons.policy_outlined,
                    title: 'Privacy Policy',
                    subtitle: 'How we handle your data',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Opening privacy policy...')),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  _HelpOption(
                    icon: Icons.gavel_outlined,
                    title: 'Terms of Service',
                    subtitle: 'Terms and conditions',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Opening terms of service...')),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  _HelpOption(
                    icon: Icons.info_outlined,
                    title: 'About Cortana',
                    subtitle: 'Version 1.0.0',
                    onTap: () {
                      _showAbout(context);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Feedback
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primaryBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.feedback_outlined,
                          color: AppColors.primaryBlue,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Send Feedback',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppColors.lightText,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Help us improve Cortana',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        _showFeedbackDialog(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        'Share Your Thoughts',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFAQs(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.8,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.lightBorder)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Frequently Asked Questions',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.lightText,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(16),
                children: const [
                  _FAQItem(
                    question: 'How do I add a transaction?',
                    answer: 'You can add transactions in multiple ways:\n\n1. Go to Finance tab and tap the + button\n2. Chat with Cortana: "I spent \$50 on groceries"\n3. Send a voice message describing the expense\n4. Take a photo of your receipt',
                  ),
                  _FAQItem(
                    question: 'Can I use voice commands?',
                    answer: 'Yes! Cortana supports voice messages in the chat. Just tap the microphone icon and describe your expense or ask a question. The AI will understand and process your request.',
                  ),
                  _FAQItem(
                    question: 'How does budget tracking work?',
                    answer: 'Set a monthly or weekly budget in the Finance section. Cortana will track your spending and send alerts when you\'re approaching your limit. You can also set category-specific goals.',
                  ),
                  _FAQItem(
                    question: 'Is my data secure?',
                    answer: 'Absolutely! We use bank-level encryption (AES-256) to protect your data. All communications are encrypted end-to-end, and we never share your information with third parties.',
                  ),
                  _FAQItem(
                    question: 'How do I connect Telegram?',
                    answer: 'Go to Profile > Telegram Integration, generate a linking code, then send that code to @CortanaAIBot on Telegram. You\'ll receive notifications and can interact with Cortana via Telegram.',
                  ),
                  _FAQItem(
                    question: 'Can I export my financial data?',
                    answer: 'Yes! Go to Finance > Reports and you can export your transactions as CSV or PDF. Perfect for tax preparation or sharing with your accountant.',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showUserGuide(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('User Guide'),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Getting Started',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              SizedBox(height: 8),
              Text('1. Complete your profile setup\n2. Set your monthly budget\n3. Start logging expenses\n4. Chat with Cortana for insights'),
              SizedBox(height: 16),
              Text(
                'Finance Management',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              SizedBox(height: 8),
              Text('Track income and expenses, set budgets, view analytics, and get AI-powered financial advice.'),
              SizedBox(height: 16),
              Text(
                'Health & Fitness',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              SizedBox(height: 8),
              Text('Generate personalized workout plans, log workouts, track weight progress, and get AI coaching.'),
              SizedBox(height: 16),
              Text(
                'AI Chat',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              SizedBox(height: 8),
              Text('Ask questions, log expenses conversationally, get insights, and receive personalized recommendations.'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }

  void _showTips(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tips & Tricks'),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('💡 Use voice messages for quick expense logging'),
              SizedBox(height: 12),
              Text('💡 Take photos of receipts - Cortana will extract the details'),
              SizedBox(height: 12),
              Text('💡 Ask Cortana "What did I spend on food this month?"'),
              SizedBox(height: 12),
              Text('💡 Set category-specific budgets for better control'),
              SizedBox(height: 12),
              Text('💡 Enable notifications for budget alerts'),
              SizedBox(height: 12),
              Text('💡 Connect Telegram for on-the-go access'),
              SizedBox(height: 12),
              Text('💡 Review your weekly summary every Sunday'),
              SizedBox(height: 12),
              Text('💡 Use natural language: "I bought coffee for \$5"'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Thanks!'),
          ),
        ],
      ),
    );
  }

  void _showAbout(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('About Cortana'),
        content: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Cortana AI Assistant',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            SizedBox(height: 8),
            Text('Version 1.0.0 (Build 100)'),
            SizedBox(height: 16),
            Text(
              'Your personal AI-powered assistant for finance, health, and productivity.',
              style: TextStyle(color: AppColors.lightTextSecondary),
            ),
            SizedBox(height: 16),
            Text('© 2024 Cortana AI. All rights reserved.'),
            SizedBox(height: 8),
            Text(
              'Developed with ❤️ using Flutter',
              style: TextStyle(fontSize: 12, color: AppColors.lightTextSecondary),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showFeedbackDialog(BuildContext context) {
    final feedbackController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Send Feedback'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('We value your feedback! Let us know how we can improve.'),
            const SizedBox(height: 16),
            TextField(
              controller: feedbackController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: 'Type your feedback here...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Thank you for your feedback!'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
            ),
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }
}

class _HelpOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _HelpOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
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
      trailing: const Icon(Icons.chevron_right, color: AppColors.lightTextSecondary),
      onTap: onTap,
    );
  }
}

class _FAQItem extends StatefulWidget {
  final String question;
  final String answer;

  const _FAQItem({
    required this.question,
    required this.answer,
  });

  @override
  State<_FAQItem> createState() => _FAQItemState();
}

class _FAQItemState extends State<_FAQItem> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.lightBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          ListTile(
            title: Text(
              widget.question,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppColors.lightText,
              ),
            ),
            trailing: Icon(
              _isExpanded ? Icons.expand_less : Icons.expand_more,
              color: AppColors.primaryBlue,
            ),
            onTap: () => setState(() => _isExpanded = !_isExpanded),
          ),
          if (_isExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                widget.answer,
                style: const TextStyle(
                  color: AppColors.lightTextSecondary,
                  height: 1.5,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
