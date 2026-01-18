import '../datasources/remote/api_client.dart';
import '../../core/constants/api_constants.dart';

class ChatRepository {
  final ApiClient _apiClient;

  ChatRepository(this._apiClient);

  /// Send a message to Cortana AI and get response
  Future<String> sendMessage(String message) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.chatEndpoint,
        data: {
          'message': message,
        },
      );

      // Backend returns {"response": "AI response text"}
      if (response.data != null && response.data['response'] != null) {
        return response.data['response'] as String;
      }

      throw Exception('Invalid response format from server');
    } catch (e) {
      print('❌ Chat error: $e');
      throw Exception('Failed to send message: ${e.toString()}');
    }
  }
}
