import '../datasources/remote/api_client.dart';
import '../datasources/local/secure_storage_service.dart';
import '../models/user_model.dart';
import '../../core/constants/api_constants.dart';

class UserRepository {
  final ApiClient _apiClient;
  final SecureStorageService _secureStorage;

  UserRepository(this._apiClient, this._secureStorage);

  // Get Current User Profile
  Future<UserModel> getCurrentUserProfile() async {
    final response = await _apiClient.get(ApiConstants.userProfile);
    final user = UserModel.fromJson(response.data);

    // Update stored user data
    await _secureStorage.saveCurrentUser(user.toJson());

    return user;
  }

  // Update Profile
  Future<UserModel> updateProfile({
    String? fullName,
    String? email,
    String? phoneNumber,
  }) async {
    final response = await _apiClient.put(
      ApiConstants.updateProfile,
      data: {
        if (fullName != null) 'full_name': fullName,
        if (email != null) 'email': email,
        if (phoneNumber != null) 'phone_number': phoneNumber,
      },
    );

    final user = UserModel.fromJson(response.data);

    // Update stored user data
    await _secureStorage.saveCurrentUser(user.toJson());

    return user;
  }

  // Change Password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _apiClient.post(
      ApiConstants.changePassword,
      data: {
        'current_password': currentPassword,
        'new_password': newPassword,
      },
    );
  }

  // Delete Account
  Future<void> deleteAccount() async {
    await _apiClient.delete(ApiConstants.deleteAccount);
    await _secureStorage.clearAuth();
  }

  // Telegram Integration

  // Check Telegram Link Status
  Future<bool> getTelegramLinkStatus() async {
    try {
      final response = await _apiClient.get(ApiConstants.telegramStatus);
      return response.data['is_linked'] ?? false;
    } catch (e) {
      return false;
    }
  }

  // Generate Telegram Linking Code
  Future<String> generateTelegramLinkingCode() async {
    final response = await _apiClient.post(ApiConstants.generateTelegramCode);
    return response.data['linking_code'] as String;
  }

  // Unlink Telegram
  Future<void> unlinkTelegram() async {
    await _apiClient.delete(ApiConstants.unlinkTelegram);

    // Refresh user profile to update telegram_user_id
    await getCurrentUserProfile();
  }
}
