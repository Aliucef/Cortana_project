import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/storage_keys.dart';

class PreferencesService {
  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Dark Mode
  Future<void> setDarkMode(bool isDark) async {
    await _prefs.setBool(StorageKeys.isDarkMode, isDark);
  }

  bool getDarkMode() {
    return _prefs.getBool(StorageKeys.isDarkMode) ?? false;
  }

  // Onboarding
  Future<void> setHasSeenOnboarding(bool hasSeen) async {
    await _prefs.setBool(StorageKeys.hasSeenOnboarding, hasSeen);
  }

  bool getHasSeenOnboarding() {
    return _prefs.getBool(StorageKeys.hasSeenOnboarding) ?? false;
  }

  // Clear All Preferences
  Future<void> clearAll() async {
    await _prefs.clear();
  }
}
