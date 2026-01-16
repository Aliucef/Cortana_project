import '../datasources/remote/api_client.dart';
import '../models/chat_response_model.dart';
import '../../core/constants/api_constants.dart';

class ChatRepository {
  final ApiClient _apiClient;

  ChatRepository(this._apiClient);

  // Send Chat Message
  // Note: User ID is automatically extracted from JWT token by backend
  Future<ChatResponseModel> sendChatMessage(String message) async {
    final response = await _apiClient.post(
      ApiConstants.chatEndpoint,
      data: {
        'message': message,
      },
    );
    return ChatResponseModel.fromJson(response.data);
  }
}
