// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_message_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChatMessageModel _$ChatMessageModelFromJson(Map<String, dynamic> json) =>
    ChatMessageModel(
      role: json['role'] as String,
      content: json['content'] as String,
      timestamp: json['timestamp'] as String,
      sources:
          (json['sources'] as List<dynamic>?)?.map((e) => e as String).toList(),
      suggestions:
          (json['suggestions'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList(),
    );

Map<String, dynamic> _$ChatMessageModelToJson(ChatMessageModel instance) =>
    <String, dynamic>{
      'role': instance.role,
      'content': instance.content,
      'timestamp': instance.timestamp,
      'sources': instance.sources,
      'suggestions': instance.suggestions,
    };
