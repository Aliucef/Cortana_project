# Cortana Backend Structure Guide

Quick reference for navigating the backend codebase.

---

## Directory Structure

```
cortana/
├── api/                    # API schemas and data models
├── config/                 # Configuration files
├── data/                   # Data storage (FAISS indexes, context)
├── knowledge/              # Knowledge base files
├── middleware/             # Middleware components
├── migrations/             # Database migrations (Alembic)
├── models/                 # SQLAlchemy database models
├── routes/                 # API route handlers (FastAPI)
├── scripts/                # Utility scripts
├── services/               # Business logic and AI services
├── main.py                 # Application entry point
└── database.py             # Database connection setup
```

---

## 🔐 Authentication & Users

**Location**: `routes/auth.py`, `routes/users.py`

**Models**: `models/user.py`

**Endpoints**:
- `/auth/signup` - User registration
- `/auth/login` - User login
- `/auth/me` - Get current user info
- `/users/{user_id}` - User profile management

**Features**:
- JWT token authentication
- Password hashing with bcrypt
- User session management

---

## 💰 Finance Module

**Routes**: `routes/finance.py`, `routes/finance_agent.py`

**Models**: `models/finance.py`

**Services**:
- `services/finance_agent.py` - AI-powered finance assistant
- `services/receipt_scanner.py` - OCR receipt scanning
- `services/spending_insights.py` - Analytics and insights

**Endpoints**:
- `/finance/transactions` - CRUD for transactions
- `/finance/summary/{user_id}` - Financial summaries
- `/finance/categories/{user_id}` - Category analytics
- `/finance/voice-transaction` - Voice input for transactions
- `/finance/receipt-scan` - OCR receipt scanning
- `/finance/insights/{user_id}` - AI-generated insights

**Features**:
- Manual transaction entry
- Voice-to-text transaction logging
- OCR receipt scanning
- Category-based analytics
- Budget tracking
- AI-powered insights

---

## 💪 Health & Fitness Module

**Routes**: `routes/health.py`, `routes/health_dashboard.py`, `routes/workout.py`

**Models**: `models/workout.py`

**Services**:
- `services/ai_workout_generator.py` - AI workout plan generation
- `services/workout_program_generator.py` - Program creation
- `services/workout_nlp_logger.py` - Natural language workout logging
- `services/ai_progress_analyzer.py` - Progress tracking
- `services/fitness_chat_assistant.py` - Fitness chatbot
- `services/health_agent.py` - Health AI agent

**Endpoints**:
- `/health/profile` - Gym profile CRUD
- `/health/workout-plan` - Workout plan generation
- `/health/workout-log` - Workout logging
- `/health/weight-log` - Weight tracking
- `/health/progress/{user_id}` - Progress analytics

**Features**:
- Personalized workout plan generation
- Natural language workout logging
- Weight tracking
- Progress analytics
- AI fitness assistant

---

## 💬 AI Chat

**Routes**: `routes/ai_chat.py`

**Services**:
- `services/ai_service.py` - Main AI service
- `services/groq_ai_service.py` - Groq LLM integration
- `services/local_ai_service.py` - Local LLM fallback
- `services/intelligent_agent.py` - Multi-agent orchestration
- `services/intent_classifier.py` - Intent detection
- `services/db_query_agent.py` - Database query agent
- `services/query_context_memory.py` - Conversation memory
- `services/rag_service.py` - RAG implementation
- `services/personal_context_service.py` - Personal context management
- `services/vector_store.py` - FAISS vector database

**Endpoints**:
- `/chat` - Main chat endpoint
- `/chat/history/{user_id}` - Conversation history

**Features**:
- Multi-modal AI chat (text, voice)
- RAG with FAISS vector search
- Personal context awareness
- Intent classification
- Multi-agent system (finance, health, news)
- Conversation memory

---

## 📰 News Module

**Routes**: `routes/news.py`

**Models**: `models/news.py`

**Services**:
- `services/news_aggregator.py` - News fetching
- `services/news_aggregator_enhanced.py` - Enhanced aggregation
- `services/news_agent.py` - AI news agent
- `services/news_agent_enhanced.py` - Enhanced news agent
- `services/news_agent_optimized.py` - Optimized version

**Endpoints**:
- `/news/{user_id}` - Fetch personalized news
- `/news/preferences/{user_id}` - News preferences

**Features**:
- Personalized news aggregation
- Category-based filtering
- AI-powered news summaries

---

## 📊 Budget & Recurring Expenses

**Routes**: `routes/budget.py`, `routes/recurring_expenses.py`

**Models**: `models/budget.py`, `models/recurring_expense.py`

**Services**:
- `services/budget_monitor.py` - Budget alerts
- `services/recurring_expense_service.py` - Recurring transaction handling

**Endpoints**:
- `/budget` - Budget CRUD
- `/budget/alerts/{user_id}` - Budget alerts
- `/recurring-expenses` - Recurring expense management

**Features**:
- Budget setting and tracking
- Overspending alerts
- Recurring expense automation

---

## 🔔 Notifications

**Routes**: `routes/notifications.py`

**Models**: `models/notification.py`

**Services**:
- `services/notification_service.py` - Notification management
- `services/proactive_notifications_service.py` - Proactive alerts

**Endpoints**:
- `/notifications/{user_id}` - User notifications
- `/notifications/mark-read` - Mark as read

**Features**:
- Budget alerts
- Workout reminders
- System notifications
- Proactive insights

---

## 📱 Telegram Integration

**Models**: `models/telegram_link.py`

**Services**:
- `services/telegram_service.py` - Telegram bot
- `services/telegram_message_handler.py` - Message handling
- `services/telegram_link_service.py` - Account linking

**Features**:
- Telegram bot commands
- Account linking
- Transaction logging via Telegram
- Voice input via Telegram
- Budget alerts via Telegram

---

## 🎙️ Audio & Voice

**Services**:
- `services/audio_transcription.py` - Speech-to-text

**Features**:
- Voice transaction input
- Voice workout logging
- Audio file transcription (Groq Whisper)

---

## 📅 Scheduler & Automation

**Routes**: `routes/scheduler.py`

**Services**:
- `services/scheduler_service.py` - Background job scheduler
- `services/daily_consolidation_service.py` - Daily data processing

**Features**:
- Daily summaries
- Recurring expense processing
- Proactive notifications
- Background data consolidation

---

## 🗄️ Database Models

**Location**: `models/`

| Model | File | Description |
|-------|------|-------------|
| User | `user.py` | User accounts |
| FinanceRecord | `finance.py` | Financial transactions |
| Budget | `budget.py` | User budgets |
| RecurringExpense | `recurring_expense.py` | Recurring transactions |
| WorkoutPlan | `workout.py` | Workout plans |
| WorkoutLog | `workout.py` | Workout logs |
| WeightLog | `workout.py` | Weight tracking |
| GymProfile | `workout.py` | Gym user profiles |
| News | `news.py` | News articles |
| UserPreferences | `user_preferences.py` | User preferences |
| Notification | `notification.py` | User notifications |
| TelegramLink | `telegram_link.py` | Telegram account links |

---

## 🤖 AI Services Architecture

### Main AI Service
**File**: `services/ai_service.py`
- Central AI orchestration
- Multi-agent routing
- Context management

### Specialized Agents
| Agent | File | Purpose |
|-------|------|---------|
| Finance Agent | `finance_agent.py` | Financial queries & insights |
| Health Agent | `health_agent.py` | Fitness guidance |
| News Agent | `news_agent.py` | News summarization |
| DB Query Agent | `db_query_agent.py` | Database queries |

### AI Infrastructure
- **Intent Classification**: `intent_classifier.py`
- **RAG Service**: `rag_service.py`
- **Vector Store**: `vector_store.py` (FAISS)
- **Personal Context**: `personal_context_service.py`
- **Query Memory**: `query_context_memory.py`

---

## 📂 Data Storage

**Location**: `data/personal_context/`

```
data/
└── personal_context/
    ├── user_1/
    │   ├── faiss.index        # Vector index
    │   ├── metadata.json      # Transaction metadata
    │   └── documents.pkl      # Document cache
    ├── user_2/
    └── user_n/
```

**Purpose**: Per-user FAISS indexes for semantic search over financial transactions

---

## ⚙️ Configuration

**Location**: `config/`

**Files**:
- Database configuration
- API keys
- AI model settings
- Service endpoints

---

## 🔄 Middleware

**Location**: `middleware/`

**Components**:
- CORS handling
- Request logging
- Error handling
- Authentication middleware

---

## 📝 API Schemas

**Location**: `api/schemas.py`

**Purpose**: Pydantic schemas for request/response validation

---

## 🚀 Entry Point

**File**: `main.py`

**Purpose**:
- FastAPI app initialization
- Route registration
- CORS configuration
- Startup/shutdown events

---

## 🗃️ Database Setup

**File**: `database.py`

**Purpose**:
- SQLAlchemy engine setup
- Session management
- Database connection pooling

---

## 📊 Migrations

**Location**: `migrations/`

**Purpose**: Alembic database migrations

**Commands**:
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🛠️ Scripts

**Location**: `scripts/`

**Purpose**: Utility scripts for maintenance and testing

---

## Quick Navigation Tips

### Finding Authentication Code
→ `routes/auth.py`, `models/user.py`

### Finding Finance Features
→ `routes/finance.py`, `services/finance_agent.py`

### Finding AI Chat Logic
→ `routes/ai_chat.py`, `services/ai_service.py`, `services/intelligent_agent.py`

### Finding Health/Fitness Code
→ `routes/health.py`, `services/ai_workout_generator.py`

### Finding Database Models
→ `models/*.py`

### Finding API Endpoints
→ `routes/*.py`

### Finding Business Logic
→ `services/*.py`

### Finding FAISS Vector Search
→ `services/vector_store.py`, `services/rag_service.py`

### Finding Telegram Bot
→ `services/telegram_service.py`

### Finding OCR/Receipt Scanning
→ `services/receipt_scanner.py`

### Finding Voice Transcription
→ `services/audio_transcription.py`

---

## Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **AI/LLM**: Groq (Llama 3.1, Whisper)
- **Vector DB**: FAISS
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)
- **Authentication**: JWT
- **Task Queue**: APScheduler
- **Telegram**: python-telegram-bot
- **OCR**: Groq Vision API
- **Migrations**: Alembic

---

## API Base URL

**Development**: `http://localhost:8000`

**API Docs**: `http://localhost:8000/docs` (Swagger UI)

---

## Common Workflows

### Adding a New Feature
1. Create model in `models/`
2. Create migration: `alembic revision --autogenerate`
3. Create route in `routes/`
4. Add business logic to `services/`
5. Update API schemas if needed

### Adding a New AI Agent
1. Create agent in `services/`
2. Register in `services/intelligent_agent.py`
3. Add intent patterns to `services/intent_classifier.py`

### Debugging Database Issues
1. Check `database.py` for connection
2. Check `models/` for schema
3. Check `migrations/` for recent changes
4. Use `/docs` endpoint to test APIs

---

**Last Updated**: February 2026
