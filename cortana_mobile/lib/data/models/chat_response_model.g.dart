// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_response_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChatResponseModel _$ChatResponseModelFromJson(Map<String, dynamic> json) =>
    ChatResponseModel(
      response: json['response'] as String,
      aiPowered: json['ai_powered'] as bool?,
      sources:
          (json['sources'] as List<dynamic>?)?.map((e) => e as String).toList(),
      suggestions:
          (json['suggestions'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList(),
    );

Map<String, dynamic> _$ChatResponseModelToJson(ChatResponseModel instance) =>
    <String, dynamic>{
      'response': instance.response,
      'ai_powered': instance.aiPowered,
      'sources': instance.sources,
      'suggestions': instance.suggestions,
    };
