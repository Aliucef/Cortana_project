import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final int id;
  final String username;
  final String email;
  @JsonKey(name: 'full_name')
  final String? fullName;
  @JsonKey(name: 'phone_number')
  final String? phoneNumber;
  @JsonKey(name: 'telegram_user_id')
  final String? telegramUserId;
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @JsonKey(name: 'last_login')
  final String? lastLogin;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.fullName,
    this.phoneNumber,
    this.telegramUserId,
    this.createdAt,
    this.lastLogin,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  // Helper getter for display name
  String get displayName => fullName ?? username;
}
