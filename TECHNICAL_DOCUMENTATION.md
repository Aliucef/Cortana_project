# Cortana AI Assistant - Technical Documentation

## Project Overview

**Cortana AI** is a multi-agent personal AI assistant system built with FastAPI (Python) backend and Next.js 15 (React/TypeScript) frontend. The system manages finances, health/workouts, news aggregation, and provides intelligent conversational interfaces through Telegram bot integration and web dashboard.

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.11+** | Core backend language |
| **FastAPI** | Async REST API framework |
| **SQLAlchemy** | ORM for PostgreSQL |
| **PostgreSQL** | Primary database |
| **Pydantic** | Request/response validation |
| **python-jose** | JWT token handling |
| **bcrypt/passlib** | Password hashing |
| **APScheduler** | Background job scheduling |
| **FAISS** | Vector similarity search |
| **sentence-transformers** | Text embeddings (all-MiniLM-L6-v2) |
| **Google Gemini API** | LLM for AI chat responses |
| **python-telegram-bot** | Telegram bot integration |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |
| **Three.js** | 3D visualizations |
| **Recharts** | Data visualization charts |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **JWT (Bearer Tokens)** | Stateless authentication |
| **REST API** | Client-server communication |
| **WebSockets (planned)** | Real-time updates |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 15)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Finance  │  │  Health  │  │   Admin  │  │  Notifications   │ │
│  │Dashboard │  │ Tracker  │  │  Panel   │  │      Page        │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │           │
│       └─────────────┴─────────────┴──────────────────┘           │
│                              │                                    │
│                    JWT Authentication                             │
└──────────────────────────────┼────────────────────────────────────┘
                               │ REST API
┌──────────────────────────────┼────────────────────────────────────┐
│                        BACKEND (FastAPI)                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      API Routes Layer                        │ │
│  │  /auth  /finance  /budget  /health  /notifications  /admin  │ │
│  └─────────────────────────────┬───────────────────────────────┘ │
│                                │                                  │
│  ┌─────────────────────────────┼───────────────────────────────┐ │
│  │                      Services Layer                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │FinanceAgent  │  │ HealthAgent  │  │PersonalContext    │  │ │
│  │  │              │  │              │  │Service (RAG)      │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │NewsAggregator│  │ Scheduler    │  │TelegramService    │  │ │
│  │  │              │  │ Service      │  │                   │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                  │
│  ┌─────────────────────────────┼───────────────────────────────┐ │
│  │               Vector Store (FAISS) + PostgreSQL              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼────────────────────────────────────┐
│                      EXTERNAL SERVICES                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                  │
│  │  Telegram  │  │  Gemini    │  │  RSS Feeds │                  │
│  │    Bot     │  │    API     │  │  (News)    │                  │
│  └────────────┘  └────────────┘  └────────────┘                  │
└───────────────────────────────────────────────────────────────────┘
```

---

## RAG System & Vectorization

### How It Works

The **Retrieval-Augmented Generation (RAG)** system enhances AI responses by providing relevant personal context from the user's data.

#### 1. Vector Embeddings
```python
# Model: sentence-transformers/all-MiniLM-L6-v2
# Embedding dimension: 384
# Storage: FAISS index + pickle for documents

from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
embedding = model.encode(text)  # Returns 384-dim vector
```

#### 2. FAISS Index Structure
```
cortana/data/personal_context/user_{id}/
├── faiss.index      # FAISS vector index (L2 distance)
├── documents.pkl    # Pickled document metadata
└── (auto-generated on first vectorization)
```

#### 3. Document Types Vectorized
| Type | Content | Auto-Trigger |
|------|---------|--------------|
| `expense_insight` | Spending patterns, category analysis | On expense creation |
| `budget_context` | Budget limits, goals, thresholds | On budget/goal update |
| `health_profile` | Fitness goals, workout preferences | On profile update |
| `workout_insight` | Exercise patterns, progress | On workout log |

### Auto-Vectorization Flow

```
User Action (e.g., Add Expense)
         │
         ▼
┌─────────────────────────┐
│   API Endpoint          │
│   POST /finance/        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Save to PostgreSQL    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  PersonalContextService │
│  .generate_expense_     │
│   insights(days=30)     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Analyze last 30 days   │
│  - Category breakdown   │
│  - Spending trends      │
│  - Anomaly detection    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Generate embeddings    │
│  SentenceTransformer    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Update FAISS index     │
│  + documents.pkl        │
└─────────────────────────┘
```

### RAG Query Flow (AI Chat)

```python
# 1. User sends message
user_query = "How much did I spend on food this month?"

# 2. Generate query embedding
query_embedding = model.encode(user_query)

# 3. Search FAISS index (k=5 nearest neighbors)
distances, indices = faiss_index.search(query_embedding, k=5)

# 4. Retrieve relevant documents
relevant_docs = [documents[i] for i in indices[0]]

# 5. Build context-enhanced prompt
prompt = f"""
You are Cortana, a personal AI assistant.

USER CONTEXT:
{format_documents(relevant_docs)}

USER QUESTION: {user_query}

Provide a helpful response based on the user's personal data.
"""

# 6. Send to Gemini API
response = gemini_model.generate_content(prompt)
```

---

## Authentication System

### JWT Token Flow

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Client  │ ─────────────────────────▶│  Server  │
│          │   {username, password}    │          │
└──────────┘                           └────┬─────┘
                                            │
                                            ▼
                                   ┌────────────────┐
                                   │ Verify password│
                                   │ (bcrypt hash)  │
                                   └───────┬────────┘
                                           │
                                           ▼
                                   ┌────────────────┐
                                   │ Generate JWT   │
                                   │ payload: {     │
                                   │   sub: user_id,│
                                   │   exp: 24h     │
                                   │ }              │
                                   └───────┬────────┘
                                           │
┌──────────┐     {access_token, user}      │
│  Client  │ ◀─────────────────────────────┘
│          │
└────┬─────┘
     │
     │  Store in localStorage:
     │  - authToken
     │  - currentUser
     │
     ▼
┌──────────┐     Authorization: Bearer <token>    ┌──────────┐
│  Client  │ ────────────────────────────────────▶│  Server  │
│          │         (all API requests)           │          │
└──────────┘                                      └────┬─────┘
                                                       │
                                                       ▼
                                              ┌────────────────┐
                                              │ Verify JWT     │
                                              │ Extract user_id│
                                              │ from payload   │
                                              └────────────────┘
```

### Protected Endpoints Pattern
```python
from middleware.auth import get_current_user_id

@router.post("/finance/")
def create_record(
    record: FinanceRecordCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)  # JWT extraction
):
    # user_id comes from JWT, not request body
    db_record = FinanceRecord(user_id=current_user_id, ...)
```

---

## Database Schema

### Core Models

```sql
-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone_number VARCHAR(20),
    telegram_user_id VARCHAR(50) UNIQUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance Records
CREATE TABLE finance_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL, -- 'income'/'expense'
    category VARCHAR(50) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    period VARCHAR(20) NOT NULL -- 'weekly'/'monthly'/'yearly'
);

-- Category Goals
CREATE TABLE category_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(50) NOT NULL,
    goal_amount DECIMAL(10,2) NOT NULL,
    period VARCHAR(20) NOT NULL,
    alert_threshold DECIMAL(3,2) DEFAULT 0.8
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'finance'/'news'/'health'/'system'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Expenses
CREATE TABLE recurring_expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- 'daily'/'weekly'/'monthly'/'yearly'
    next_due_date TIMESTAMP WITH TIME ZONE,
    reminder_days_before INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1
);
```

---

## Feature Modules

### 1. Finance Agent

**Capabilities:**
- Track income/expenses with categories
- Budget management (weekly/monthly)
- Category-specific spending goals
- Recurring expense tracking
- PDF/Excel report export
- Trend analysis with week-over-week comparisons

**Key Endpoints:**
```
POST   /finance/                    # Create transaction (JWT auth)
GET    /finance/user/{id}           # Get user transactions
GET    /finance/summary/{id}        # Get financial summary
GET    /finance/admin/overview      # Admin: all users overview
POST   /budget/                     # Create/update budget
GET    /budget/{user_id}            # Get user budget
POST   /budget/category-goal        # Set category goal
GET    /finance/export/{id}/pdf     # Export PDF report
GET    /finance/export/{id}/excel   # Export Excel report
```

### 2. Health Agent

**Capabilities:**
- AI-powered workout plan generation
- Exercise library with muscle group targeting
- Weight tracking with progress visualization
- Workout logging and history
- Personalized fitness recommendations via RAG

**Key Endpoints:**
```
POST   /health/generate-plan        # AI workout generation
GET    /health/workout-plan/{id}    # Get workout plan
POST   /health/weight               # Log weight
GET    /health/weight/{id}          # Get weight history
POST   /health/workout-log          # Log completed workout
GET    /health/workout-logs/{id}    # Get workout history
POST   /health/chat                 # Fitness AI chat (RAG-enabled)
```

### 3. News Agent

**Capabilities:**
- RSS feed aggregation (Lebanese + global sources)
- Category filtering (tech, business, sports, etc.)
- Daily briefing delivery (8 AM scheduled)
- AI-powered summarization (optional)

**Sources:**
- Lebanese: NNA, Daily Star, L'Orient Today, MTV Lebanon, etc.
- Global: BBC, Reuters, Al Jazeera, TechCrunch

### 4. Notification System

**Features:**
- Database-persisted notifications
- Real-time unread count badge
- Mark as read (individual/all)
- Type-based filtering (finance/news/health/system)
- Pagination support

**Integration:**
- Scheduler creates notifications on scheduled events
- Telegram messages also saved as web notifications
- Auto-refresh every 30 seconds in header

### 5. Admin Dashboard

**Features:**
- User activity stats (active users, last login)
- Financial overview across all users
- CSV export of user data
- Telegram linking status
- User management (delete users)
- Recent signups tracking

---

## Telegram Bot Integration

### Features

| Command | Description |
|---------|-------------|
| `/start` | Initialize bot, link Telegram to account |
| `/help` | Show available commands |
| `/balance` | Get current financial balance |
| `/add` | Add expense via natural language |
| `/summary` | Get weekly/monthly summary |
| `/news` | Get latest news briefing |

### Natural Language Processing

```python
# Example: "I spent $50 on lunch today"
# Parsed to:
{
    "amount": 50.0,
    "category": "Food",
    "description": "lunch",
    "transaction_type": "expense",
    "transaction_date": "2026-01-15T12:00:00Z"
}
```

### Voice Message Support
- Whisper API integration for transcription
- Transcribed text processed as regular message

### Receipt OCR
- Photo upload support
- OCR extraction of amount and merchant
- Auto-categorization based on merchant

---

## Scheduled Tasks (APScheduler)

| Task | Schedule | Description |
|------|----------|-------------|
| Daily Expense Reminder | 8 PM daily | Reminds users to log expenses |
| Daily News Briefing | 8 AM daily | Sends curated news summary |
| Weekly Financial Summary | Sunday 6 PM | Weekly spending analysis |
| Recurring Expense Processing | Daily | Checks and logs due recurring expenses |

**Notification Integration:**
```python
# After sending Telegram message, save to DB
notif_service.create_finance_notification(
    db, user.id,
    "Daily Expense Reminder",
    "Don't forget to log your expenses!"
)
```

---

## API Response Patterns

### Success Response
```json
{
    "id": 1,
    "user_id": 2,
    "amount": 50.00,
    "category": "Food",
    "transaction_type": "expense",
    "transaction_date": "2026-01-15T12:30:00Z",
    "created_at": "2026-01-15T12:30:00Z"
}
```

### Error Response
```json
{
    "detail": "Not authorized to access this user's data"
}
```

### Paginated Response (Notifications)
```json
{
    "notifications": [...],
    "total": 50,
    "unread_count": 5
}
```

---

## Security Measures

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Expiration**: 24-hour token lifetime
3. **User Isolation**: All endpoints verify `current_user_id` matches requested resource
4. **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
5. **CORS**: Configured for frontend origin only
6. **Input Validation**: Pydantic models for all request bodies

---

## File Structure

```
cortana/
├── main.py                     # FastAPI app initialization
├── config/
│   ├── database.py             # SQLAlchemy setup
│   └── settings.py             # Environment config
├── models/
│   ├── user.py                 # User model
│   ├── finance.py              # FinanceRecord model
│   ├── budget.py               # Budget, CategoryGoal models
│   ├── notification.py         # Notification model
│   ├── recurring_expense.py    # RecurringExpense model
│   └── workout.py              # WorkoutPlan, WorkoutLog models
├── routes/
│   ├── auth.py                 # Authentication endpoints
│   ├── finance.py              # Finance CRUD + reports
│   ├── budget.py               # Budget management
│   ├── notifications.py        # Notification endpoints
│   ├── health.py               # Health/workout endpoints
│   └── recurring_expenses.py   # Recurring expense management
├── services/
│   ├── finance_agent.py        # Financial analysis logic
│   ├── health_agent.py         # Workout generation logic
│   ├── news_aggregator.py      # RSS feed processing
│   ├── scheduler_service.py    # APScheduler jobs
│   ├── telegram_service.py     # Telegram bot handlers
│   ├── notification_service.py # Notification helpers
│   └── personal_context_service.py  # RAG/vectorization
├── middleware/
│   └── auth.py                 # JWT verification
├── api/
│   └── schemas.py              # Pydantic schemas
├── data/
│   └── personal_context/       # FAISS indexes per user
└── migrations/                 # Database migrations

cortana-dashboard/
├── app/
│   ├── page.tsx                # Home dashboard
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Registration
│   ├── admin/page.tsx          # Admin dashboard
│   ├── notifications/page.tsx  # Notifications page
│   ├── profile/page.tsx        # User profile
│   ├── finance/
│   │   ├── dashboard/          # Finance overview
│   │   ├── transactions/       # Transaction list
│   │   ├── budget-goals/       # Budget management
│   │   └── recurring/          # Recurring expenses
│   └── health/
│       ├── page.tsx            # Health overview
│       ├── workouts/           # Today's workouts
│       ├── history/            # Workout history
│       └── progress/           # Progress tracking
├── components/
│   └── layout/
│       ├── Header.tsx          # App header with notifications
│       └── Sidebar.tsx         # Navigation sidebar
└── lib/
    └── api.ts                  # API client functions
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/cortana_db

# JWT
SECRET_KEY=your-secret-key-change-in-production

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_USER_ID=default_user_telegram_id

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Optional
NEWS_API_KEY=newsapi_key_if_using
TWILIO_ACCOUNT_SID=for_sms_features
TWILIO_AUTH_TOKEN=for_sms_features
```

---

## Development Roadmap Status

| Stage | Description | Status |
|-------|-------------|--------|
| 1 | Core Backend Setup | ✅ Complete |
| 2 | Finance Agent | ✅ Complete |
| 3 | News Agent | ✅ Complete |
| 4 | Health Agent | ✅ Complete |
| 5 | Mood Tracker | ⏳ Planned |
| 6 | Knowledge Agent (RAG) | ✅ Complete |
| 7 | Multi-Agent Orchestrator | ⏳ Planned |
| 8 | Dashboard UI | ✅ Complete |

---

## Recent Updates (January 2026)

### Admin Dashboard Expansion
- User activity tracking (last_login, active users)
- Financial overview across all users
- CSV export functionality
- Telegram linking status visibility

### Notification System
- Database-persisted notifications
- Web notification page with filtering
- Real-time unread count badge
- Scheduled tasks save to notifications

### Authentication Improvements
- All endpoints now use JWT for user identification
- Removed hardcoded DEFAULT_USER_ID
- User isolation enforced at API level

### Bug Fixes
- Transaction ordering (newest first)
- Multi-user support for all finance features
- Date/time handling for proper chronological sorting

---

*Documentation last updated: January 2026*
