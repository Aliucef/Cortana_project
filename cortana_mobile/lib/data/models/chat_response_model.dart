import 'package:json_annotation/json_annotation.dart';

part 'chat_response_model.g.dart';

@JsonSerializable()
class ChatResponseModel {
  final String response;
  @JsonKey(name: 'ai_powered')
  final bool? aiPowered;
  final List<String>? sources;
  final List<String>? suggestions;

  ChatResponseModel({
    required this.response,
    this.aiPowered,
    this.sources,
    this.suggestions,
  });

  factory ChatResponseModel.fromJson(Map<String, dynamic> json) =>
      _$ChatResponseModelFromJson(json);

  Map<String, dynamic> toJson() => _$ChatResponseModelToJson(this);
}
