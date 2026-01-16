import 'package:flutter/material.dart';
import '../../data/datasources/local/preferences_service.dart';

class ThemeProvider with ChangeNotifier {
  final PreferencesService _preferencesService;
  bool _isDarkMode = false;

  ThemeProvider(this._preferencesService) {
    _loadThemePreference();
  }

  bool get isDarkMode => _isDarkMode;

  ThemeMode get themeMode => _isDarkMode ? ThemeMode.dark : ThemeMode.light;

  Future<void> _loadThemePreference() async {
    _isDarkMode = _preferencesService.getDarkMode();
    notifyListeners();
  }

  Future<void> toggleTheme() async {
    _isDarkMode = !_isDarkMode;
    await _preferencesService.setDarkMode(_isDarkMode);
    notifyListeners();
  }

  Future<void> setDarkMode(bool isDark) async {
    if (_isDarkMode != isDark) {
      _isDarkMode = isDark;
      await _preferencesService.setDarkMode(_isDarkMode);
      notifyListeners();
    }
  }
}
