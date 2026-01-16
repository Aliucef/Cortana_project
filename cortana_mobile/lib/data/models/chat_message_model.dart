import 'package:json_annotation/json_annotation.dart';

part 'chat_message_model.g.dart';

@JsonSerializable()
class ChatMessageModel {
  final String role; // "user" or "assistant"
  final String content;
  final String timestamp; // ISO 8601 string
  final List<String>? sources;
  final List<String>? suggestions;

  ChatMessageModel({
    required this.role,
    required this.content,
    required this.timestamp,
    this.sources,
    this.suggestions,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) =>
      _$ChatMessageModelFromJson(json);

  Map<String, dynamic> toJson() => _$ChatMessageModelToJson(this);

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';

  DateTime get timestampDateTime => DateTime.parse(timestamp);

  // Factory constructor for creating a user message
  factory ChatMessageModel.userMessage(String content) {
    return ChatMessageModel(
      role: 'user',
      content: content,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  // Factory constructor for creating an assistant message
  factory ChatMessageModel.assistantMessage(
    String content, {
    List<String>? sources,
    List<String>? suggestions,
  }) {
    return ChatMessageModel(
      role: 'assistant',
      content: content,
      timestamp: DateTime.now().toIso8601String(),
      sources: sources,
      suggestions: suggestions,
    );
  }
}
