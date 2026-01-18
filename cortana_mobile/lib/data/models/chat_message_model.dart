import 'package:json_annotation/json_annotation.dart';

part 'chat_message_model.g.dart';

@JsonSerializable()
class ChatMessageModel {
  final String id;
  final String message;
  final bool isUser;
  final DateTime timestamp;

  ChatMessageModel({
    required this.id,
    required this.message,
    required this.isUser,
    required this.timestamp,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) =>
      _$ChatMessageModelFromJson(json);

  Map<String, dynamic> toJson() => _$ChatMessageModelToJson(this);

  // Create a user message
  factory ChatMessageModel.user(String message) {
    return ChatMessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      message: message,
      isUser: true,
      timestamp: DateTime.now(),
    );
  }

  // Create an AI response message
  factory ChatMessageModel.ai(String response) {
    return ChatMessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      message: response,
      isUser: false,
      timestamp: DateTime.now(),
    );
  }
}
