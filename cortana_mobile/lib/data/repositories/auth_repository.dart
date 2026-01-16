import '../datasources/remote/api_client.dart';
import '../datasources/local/secure_storage_service.dart';
import '../models/auth_response_model.dart';
import '../../core/constants/api_constants.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final SecureStorageService _secureStorage;

  AuthRepository(this._apiClient, this._secureStorage);

  // Login
  Future<AuthResponseModel> login({
    required String username,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.login,
      data: {
        'username': username,
        'password': password,
      },
    );

    final authResponse = AuthResponseModel.fromJson(response.data);

    // Save auth data to secure storage
    await _secureStorage.saveAuthToken(authResponse.accessToken);
    await _secureStorage.saveCurrentUser(authResponse.user.toJson());

    return authResponse;
  }

  // Signup
  Future<void> signup({
    required String username,
    required String email,
    required String password,
    String? fullName,
    String? phoneNumber,
  }) async {
    await _apiClient.post(
      ApiConstants.register,
      data: {
        'username': username,
        'email': email,
        'password': password,
        if (fullName != null) 'full_name': fullName,
        if (phoneNumber != null) 'phone_number': phoneNumber,
      },
    );

    // Note: Backend returns user + telegram_linking_code, but we auto-login after signup
    // So the login method will save the auth data
  }

  // Logout
  Future<void> logout() async {
    await _secureStorage.clearAuth();
  }

  // Check if authenticated
  Future<bool> isAuthenticated() async {
    return await _secureStorage.isAuthenticated();
  }

  // Get current user ID
  Future<int?> getCurrentUserId() async {
    return await _secureStorage.getCurrentUserId();
  }
}
