"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, Bot, User, MessageSquare, Loader2 } from "lucide-react";
import { sendChatMessage, isAuthenticated, getCurrentUser, type ChatMessage } from "@/lib/api";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check authentication and get user ID
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      const user = getCurrentUser();
      setCurrentUserId(user?.id || null);
    }
  }, [router]);

  // Dark mode listener
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    const handleDarkModeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);
    return () => window.removeEventListener("darkModeChange", handleDarkModeChange);
  }, []);

  // Load messages from localStorage on mount (user-specific)
  useEffect(() => {
    if (!currentUserId) return;

    const storageKey = `cortana-chat-messages-${currentUserId}`;
    const savedMessages = localStorage.getItem(storageKey);

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to load messages:", error);
        // If loading fails, set default welcome message
        setMessages([
          {
            role: "assistant",
            content: "Hi! I'm Cortana, your AI personal assistant. I can help you with finances, workouts, news, and much more. What would you like to know?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } else {
      // No saved messages, show welcome message
      setMessages([
        {
          role: "assistant",
          content: "Hi! I'm Cortana, your AI personal assistant. I can help you with finances, workouts, news, and much more. What would you like to know?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [currentUserId]);

  // Save messages to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (messages.length > 0 && currentUserId) {
      const storageKey = `cortana-chat-messages-${currentUserId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(input);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message || response.response || "I'm not sure how to respond to that.",
        timestamp: new Date().toISOString(),
        sources: response.sources,
        suggestions: response.suggestions,
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: "What's my spending this week?", icon: "💰" },
    { label: "Show my workout plan", icon: "💪" },
    { label: "How am I doing overall?", icon: "📊" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col pt-16 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      {/* Header */}
      <div className={`border-b p-4 sm:p-6 ${
        darkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}>
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
            <Image
              src="/cortana_face.jpg"
              alt="Cortana"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Chat with Cortana
            </h1>
            <p className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Your AI personal assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 sm:gap-3 ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex items-center justify-center ${
                message.role === "user"
                  ? darkMode
                    ? "bg-blue-900"
                    : "bg-blue-100"
                  : ""
              }`}
            >
              {message.role === "user" ? (
                <User className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`} />
              ) : (
                <Image
                  src="/cortana_face.jpg"
                  alt="Cortana"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[75%] sm:max-w-[70%] ${
                message.role === "user" ? "items-end" : "items-start"
              } flex flex-col gap-2`}
            >
              <div
                className={`px-4 py-3 rounded-lg border ${
                  message.role === "user"
                    ? darkMode
                      ? "bg-blue-900 text-blue-100 border-blue-800"
                      : "bg-blue-100 text-blue-900 border-blue-200"
                    : darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-white text-gray-900 border-gray-200"
                }`}
              >
                <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>

                {/* Sources (for assistant messages) */}
                {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                  <div className={`mt-3 pt-3 border-t ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}>
                    <p className={`text-xs font-semibold mb-1.5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>Sources:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {message.sources.map((source, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded border ${
                            darkMode
                              ? "bg-blue-900/30 text-blue-400 border-blue-800"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions (clickable follow-ups) */}
              {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(suggestion)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        darkMode
                          ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <span className={`text-xs px-2 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              <Image
                src="/cortana_face.jpg"
                alt="Cortana"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`px-4 py-3 rounded-lg border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}>
              <div className="flex gap-1.5">
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? "bg-gray-500" : "bg-gray-400"
                }`} style={{ animationDelay: "0ms" }} />
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? "bg-gray-500" : "bg-gray-400"
                }`} style={{ animationDelay: "150ms" }} />
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? "bg-gray-500" : "bg-gray-400"
                }`} style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 sm:px-6 pb-4 max-w-4xl mx-auto w-full">
          <p className={`text-sm mb-3 font-semibold ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            Quick actions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInput(action.label)}
                className={`flex items-center gap-3 px-4 py-3 border rounded-lg text-left transition-colors ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className={`text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`border-t p-4 sm:p-6 max-w-4xl mx-auto w-full ${
        darkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}>
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                darkMode
                  ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100"
              }`}
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 border ${
              !input.trim() || isTyping
                ? darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : darkMode
                ? "bg-blue-900 border-blue-800 text-blue-400 hover:bg-blue-800"
                : "bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
        <p className={`text-xs mt-3 text-center ${
          darkMode ? "text-gray-500" : "text-gray-500"
        }`}>
          Cortana can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
