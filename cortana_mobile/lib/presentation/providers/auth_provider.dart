import 'package:flutter/foundation.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/models/user_model.dart';
import '../../data/datasources/local/secure_storage_service.dart';

enum AuthState { initial, authenticated, unauthenticated, loading }

class AuthProvider with ChangeNotifier {
  final AuthRepository _authRepository;
  final SecureStorageService _secureStorage;

  AuthState _state = AuthState.initial;
  UserModel? _currentUser;
  String? _errorMessage;

  AuthProvider(this._authRepository, this._secureStorage) {
    _checkAuthStatus();
  }

  // Getters
  AuthState get state => _state;
  UserModel? get currentUser => _currentUser;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _state == AuthState.authenticated;
  bool get isLoading => _state == AuthState.loading;

  // Check if user is already authenticated on app start
  Future<void> _checkAuthStatus() async {
    final isAuth = await _authRepository.isAuthenticated();
    if (isAuth) {
      final userData = await _secureStorage.getCurrentUser();
      if (userData != null) {
        _currentUser = UserModel.fromJson(userData);
        _state = AuthState.authenticated;
      } else {
        _state = AuthState.unauthenticated;
      }
    } else {
      _state = AuthState.unauthenticated;
    }
    notifyListeners();
  }

  // Login
  Future<bool> login(String username, String password) async {
    _state = AuthState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResponse = await _authRepository.login(
        username: username,
        password: password,
      );

      _currentUser = authResponse.user;
      _state = AuthState.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = AuthState.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  // Signup
  Future<bool> signup({
    required String username,
    required String email,
    required String password,
    String? fullName,
    String? phoneNumber,
  }) async {
    _state = AuthState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authRepository.signup(
        username: username,
        email: email,
        password: password,
        fullName: fullName,
        phoneNumber: phoneNumber,
      );

      // Auto-login after signup
      return await login(username, password);
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = AuthState.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await _authRepository.logout();
    _currentUser = null;
    _state = AuthState.unauthenticated;
    notifyListeners();
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Update current user (after profile edit)
  void updateCurrentUser(UserModel user) {
    _currentUser = user;
    notifyListeners();
  }

  // Refresh user profile from server
  Future<void> refreshUserProfile() async {
    try {
      final userData = await _secureStorage.getCurrentUser();
      if (userData != null) {
        _currentUser = UserModel.fromJson(userData);
        notifyListeners();
      }
    } catch (e) {
      print('❌ Failed to refresh user profile: $e');
    }
  }
}
