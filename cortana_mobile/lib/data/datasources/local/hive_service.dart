import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import '../../../core/constants/storage_keys.dart';

class HiveService {
  late Box<String> _chatBox;

  Future<void> init() async {
    await Hive.initFlutter();
    _chatBox = await Hive.openBox<String>(StorageKeys.chatMessagesBox);
  }

  // Save chat messages for a specific user
  Future<void> saveChatMessages(int userId, List<Map<String, dynamic>> messages) async {
    final key = 'user_${userId}_messages';
    final messagesJson = jsonEncode(messages);
    await _chatBox.put(key, messagesJson);
  }

  // Load chat messages for a user
  List<Map<String, dynamic>> loadChatMessages(int userId) {
    final key = 'user_${userId}_messages';
    final messagesJson = _chatBox.get(key);

    if (messagesJson != null && messagesJson.isNotEmpty) {
      try {
        final List<dynamic> decoded = jsonDecode(messagesJson);
        return decoded.cast<Map<String, dynamic>>();
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  // Clear chat messages for a user
  Future<void> clearChatMessages(int userId) async {
    final key = 'user_${userId}_messages';
    await _chatBox.delete(key);
  }

  // Clear all data
  Future<void> clearAll() async {
    await _chatBox.clear();
  }

  // Close the box
  Future<void> close() async {
    await _chatBox.close();
  }
}
