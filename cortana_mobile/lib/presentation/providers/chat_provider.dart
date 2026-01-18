import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../data/models/chat_message_model.dart';
import '../../data/repositories/chat_repository.dart';

enum ChatState { idle, loading, error }

class ChatProvider with ChangeNotifier {
  final ChatRepository _chatRepository;
  static const String _chatHistoryBoxName = 'chat_history';
  Box? _chatHistoryBox;

  ChatProvider(this._chatRepository) {
    _initChatHistory();
  }

  // State
  ChatState _state = ChatState.idle;
  List<ChatMessageModel> _messages = [];
  String? _errorMessage;
  bool _isInitialized = false;

  // Getters
  ChatState get state => _state;
  List<ChatMessageModel> get messages => List.unmodifiable(_messages);
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == ChatState.loading;
  bool get hasMessages => _messages.isNotEmpty;
  bool get isInitialized => _isInitialized;

  /// Initialize chat history from Hive
  Future<void> _initChatHistory() async {
    try {
      _chatHistoryBox = await Hive.openBox(_chatHistoryBoxName);
      await _loadChatHistory();
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      print('❌ Failed to initialize chat history: $e');
      _isInitialized = true;
      notifyListeners();
    }
  }

  /// Load chat history from Hive
  Future<void> _loadChatHistory() async {
    try {
      final messagesJson = _chatHistoryBox?.get('messages') as List?;
      if (messagesJson != null && messagesJson.isNotEmpty) {
        _messages = messagesJson
            .map((json) => ChatMessageModel.fromJson(Map<String, dynamic>.from(json)))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      print('❌ Failed to load chat history: $e');
    }
  }

  /// Save chat history to Hive
  Future<void> _saveChatHistory() async {
    try {
      final messagesJson = _messages.map((msg) => msg.toJson()).toList();
      await _chatHistoryBox?.put('messages', messagesJson);
    } catch (e) {
      print('❌ Failed to save chat history: $e');
    }
  }

  /// Send a message to Cortana AI
  Future<void> sendMessage(String messageText) async {
    if (messageText.trim().isEmpty) return;

    // Add user message immediately
    final userMessage = ChatMessageModel.user(messageText);
    _messages.add(userMessage);
    _state = ChatState.loading;
    _errorMessage = null;
    notifyListeners();
    await _saveChatHistory();

    try {
      // Call backend API
      final response = await _chatRepository.sendMessage(messageText);

      // Add AI response
      final aiMessage = ChatMessageModel.ai(response);
      _messages.add(aiMessage);
      _state = ChatState.idle;
      notifyListeners();
      await _saveChatHistory();
    } catch (e) {
      print('❌ Send message error: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _state = ChatState.error;

      // Add error message from Cortana
      final errorMessage = ChatMessageModel.ai(
        'Sorry, I encountered an error. Please try again.',
      );
      _messages.add(errorMessage);
      notifyListeners();
      await _saveChatHistory();
    }
  }

  /// Clear all messages
  Future<void> clearMessages() async {
    _messages.clear();
    _state = ChatState.idle;
    _errorMessage = null;
    notifyListeners();
    await _saveChatHistory();
  }

  /// Add a welcome message from Cortana
  Future<void> addWelcomeMessage() async {
    if (_messages.isEmpty) {
      final welcomeMessage = ChatMessageModel.ai(
        "Hi! I'm Cortana, your personal AI assistant. I can help you track expenses, check your budget, get news updates, and answer questions about your finances. How can I help you today?",
      );
      _messages.add(welcomeMessage);
      notifyListeners();
      await _saveChatHistory();
    }
  }
}
