-- Migration: Add conversation history table for memory system
-- Created: 2025-10-11
-- Purpose: Enable context-aware responses and conversation tracking

CREATE TABLE IF NOT EXISTS conversation_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    intent VARCHAR(100),
    context_tags VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_timestamp ON conversation_history(user_id, timestamp DESC);

-- Comments
COMMENT ON TABLE conversation_history IS 'Stores conversation history for context-aware AI responses';
COMMENT ON COLUMN conversation_history.intent IS 'Detected intent (expense_logging, news, greeting, etc.)';
COMMENT ON COLUMN conversation_history.context_tags IS 'Comma-separated tags for context search';
