import 'package:intl/intl.dart';

class CurrencyFormatter {
  static String format(double amount, {String symbol = '\$'}) {
    final formatter = NumberFormat('#,##0.00');
    return '$symbol${formatter.format(amount)}';
  }

  static String formatCompact(double amount, {String symbol = '\$'}) {
    if (amount >= 1000000) {
      return '$symbol${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      return '$symbol${(amount / 1000).toStringAsFixed(1)}K';
    }
    return format(amount, symbol: symbol);
  }

  static String formatWithSign(double amount, {String symbol = '\$'}) {
    final formatted = format(amount.abs(), symbol: symbol);
    if (amount >= 0) {
      return '+$formatted';
    }
    return '-$formatted';
  }

  static double parse(String amountString) {
    // Remove currency symbols and commas
    final cleanString = amountString.replaceAll(RegExp(r'[^\d.-]'), '');
    return double.tryParse(cleanString) ?? 0.0;
  }
}
