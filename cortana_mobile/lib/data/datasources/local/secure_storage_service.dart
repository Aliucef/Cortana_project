import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/constants/storage_keys.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  // Auth Token Management
  Future<void> saveAuthToken(String token) async {
    await _storage.write(key: StorageKeys.authToken, value: token);
  }

  Future<String?> getAuthToken() async {
    return await _storage.read(key: StorageKeys.authToken);
  }

  // User Data Management
  Future<void> saveCurrentUser(Map<String, dynamic> user) async {
    final userJson = jsonEncode(user);
    await _storage.write(key: StorageKeys.currentUser, value: userJson);
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    final userJson = await _storage.read(key: StorageKeys.currentUser);
    if (userJson != null && userJson.isNotEmpty) {
      try {
        return jsonDecode(userJson) as Map<String, dynamic>;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Future<int?> getCurrentUserId() async {
    final user = await getCurrentUser();
    return user?['id'] as int?;
  }

  // Clear Auth Data (Logout)
  Future<void> clearAuth() async {
    await _storage.delete(key: StorageKeys.authToken);
    await _storage.delete(key: StorageKeys.currentUser);
  }

  // Check if Authenticated
  Future<bool> isAuthenticated() async {
    final token = await getAuthToken();
    return token != null && token.isNotEmpty;
  }

  // Clear All Data
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
