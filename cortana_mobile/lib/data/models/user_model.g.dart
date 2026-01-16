// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserModel _$UserModelFromJson(Map<String, dynamic> json) => UserModel(
  id: (json['id'] as num).toInt(),
  username: json['username'] as String,
  email: json['email'] as String,
  fullName: json['full_name'] as String?,
  phoneNumber: json['phone_number'] as String?,
  telegramUserId: json['telegram_user_id'] as String?,
  createdAt: json['created_at'] as String,
  lastLogin: json['last_login'] as String?,
);

Map<String, dynamic> _$UserModelToJson(UserModel instance) => <String, dynamic>{
  'id': instance.id,
  'username': instance.username,
  'email': instance.email,
  'full_name': instance.fullName,
  'phone_number': instance.phoneNumber,
  'telegram_user_id': instance.telegramUserId,
  'created_at': instance.createdAt,
  'last_login': instance.lastLogin,
};
