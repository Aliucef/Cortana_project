import 'package:flutter/foundation.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/user_repository.dart';

enum UserState { idle, loading, success, error }

class UserProvider with ChangeNotifier {
  final UserRepository _userRepository;

  UserProvider(this._userRepository);

  // State
  UserState _state = UserState.idle;
  String? _errorMessage;
  String? _successMessage;
  bool _isTelegramLinked = false;
  String? _telegramLinkingCode;

  // Getters
  UserState get state => _state;
  String? get errorMessage => _errorMessage;
  String? get successMessage => _successMessage;
  bool get isLoading => _state == UserState.loading;
  bool get isTelegramLinked => _isTelegramLinked;
  String? get telegramLinkingCode => _telegramLinkingCode;

  /// Update user profile
  Future<bool> updateProfile({
    String? fullName,
    String? email,
    String? phoneNumber,
  }) async {
    _state = UserState.loading;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      await _userRepository.updateProfile(
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
      );

      _state = UserState.success;
      _successMessage = 'Profile updated successfully!';
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Update profile error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = UserState.error;
      notifyListeners();
      return false;
    }
  }

  /// Change password
  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    _state = UserState.loading;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      await _userRepository.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );

      _state = UserState.success;
      _successMessage = 'Password changed successfully!';
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Change password error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = UserState.error;
      notifyListeners();
      return false;
    }
  }

  /// Check Telegram link status
  Future<void> checkTelegramLinkStatus() async {
    try {
      _isTelegramLinked = await _userRepository.getTelegramLinkStatus();
      notifyListeners();
    } catch (e) {
      print('❌ Check Telegram status error: $e');
    }
  }

  /// Generate Telegram linking code
  Future<bool> generateTelegramLinkingCode() async {
    _state = UserState.loading;
    _errorMessage = null;
    _successMessage = null;
    _telegramLinkingCode = null;
    notifyListeners();

    try {
      _telegramLinkingCode = await _userRepository.generateTelegramLinkingCode();
      _state = UserState.success;
      _successMessage = 'Linking code generated!';
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Generate linking code error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = UserState.error;
      notifyListeners();
      return false;
    }
  }

  /// Unlink Telegram
  Future<bool> unlinkTelegram() async {
    _state = UserState.loading;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      await _userRepository.unlinkTelegram();
      _isTelegramLinked = false;
      _telegramLinkingCode = null;
      _state = UserState.success;
      _successMessage = 'Telegram unlinked successfully!';
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Unlink Telegram error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = UserState.error;
      notifyListeners();
      return false;
    }
  }

  /// Clear messages
  void clearMessages() {
    _errorMessage = null;
    _successMessage = null;
    _state = UserState.idle;
    notifyListeners();
  }
}
