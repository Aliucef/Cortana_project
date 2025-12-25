# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cortana AI Assistant** - A multi-agent personal AI system built with FastAPI that manages finances, news, workouts, and mood tracking through conversational interfaces (Telegram bot, voice commands).

This is a staged development project following an 8-stage roadmap from basic backend to full orchestration. Currently implemented: Core backend, Finance Agent, News Agent, Scheduler, and Telegram integration.

## Development Commands

### Environment Setup
```bash
# From cortana/ directory
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### Database Setup
```bash
# PostgreSQL must be running
# Create database: CREATE DATABASE cortana_db;
# Update .env with DATABASE_URL
```

### Running the Application
```bash
# From cortana/ directory with venv activated
python main.py
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Testing
```bash
# Test Telegram bot
python start_bot.py

# Test Ollama AI integration
python test_ollama.py

# Test Twilio voice/SMS
python test_twilio.py

# Update user data
python update_user_name.py
python update_user_phone.py
```

### Database Migrations
```bash
# Run migrations from project root
python cortana/run_migration.py
```

## Architecture

### Core Stack
- **FastAPI** - Async REST API framework
- **SQLAlchemy** - ORM with PostgreSQL
- **APScheduler** - Background job scheduling
- **python-telegram-bot** - Telegram integration
- **Pandas** - Financial data analysis

### Project Structure
```
cortana/
├── main.py              # FastAPI app + startup logic
├── config/              # Database & settings (Pydantic Settings)
├── models/              # SQLAlchemy ORM models
├── routes/              # API endpoints (users, finance, news, etc.)
├── services/            # Business logic & agent implementations
│   ├── finance_agent.py         # Budget analysis & summaries
│   ├── news_aggregator_enhanced.py  # RSS news fetching
│   ├── scheduler_service.py     # Automated tasks
│   ├── telegram_service.py      # Bot message handling
│   └── personality/             # Conversational AI logic
└── migrations/          # Database schema updates
```

### Multi-Agent System

**Finance Agent** (`services/finance_agent.py`)
- Tracks income/expenses with category analysis
- Generates weekly/monthly summaries with trend comparisons
- Budget monitoring with progress bars & alerts
- Supports recurring expenses tracking
- Export reports as PDF/Excel

**News Agent** (`services/news_aggregator_enhanced.py`)
- Fetches Lebanese & global news via RSS feeds
- Category-based filtering (tech, business, sports, etc.)
- Daily briefing delivery at 8 AM
- Supports location filtering & search queries

**Scheduler Service** (`services/scheduler_service.py`)
- Daily expense reminders (default 8 PM)
- Daily news briefing (8 AM)
- Weekly financial summary (Sunday 6 PM)
- User-configurable schedules via UserSchedulePreference model

**Telegram Bot** (`services/telegram_service.py`)
- Conversational expense logging with NLP parsing
- Voice message transcription
- Receipt photo scanning & OCR
- Natural language commands (e.g., "I spent $50 on lunch")

### Database Models

**Core Models:**
- `User` - User accounts with phone/Telegram IDs
- `FinanceRecord` - Transactions (income/expense) with categories
- `Budget` - Overall budget limits (weekly/monthly)
- `CategoryGoal` - Per-category spending goals
- `RecurringExpense` - Subscriptions & recurring charges
- `NewsPreference` - User news interests & sources
- `UserSchedulePreference` - Notification timing preferences
- `WorkoutPlan` - Gym routine tracking

All models inherit from `Base` (declarative_base) in `config/database.py`.

### API Design Patterns

**Database Sessions:**
```python
from config.database import get_db
# Use dependency injection in routes
def endpoint(db: Session = Depends(get_db)):
```

**Settings Management:**
```python
from config.settings import get_settings
settings = get_settings()  # Cached with @lru_cache
```

**Async Event Loop (Telegram):**
- Scheduler runs in background thread → use `asyncio.run()` for Telegram bot calls
- Main app uses `asyncio.create_task()` for startup tasks

## Key Implementation Details

### Financial Analysis
- Uses Pandas for trend analysis
- Week-over-week percentage change tracking
- Text-based bar charts for category visualization
- Budget progress bars with emoji status indicators

### News Aggregation
- RSS feed parsing with BeautifulSoup
- Message chunking for Telegram's 4096 char limit
- Default 8 Lebanese sources + global sources (BBC, Reuters, etc.)
- AI-powered summarization (optional with Gemini/Ollama)

### Telegram Integration
- Duplicate message prevention via `processed_updates` set
- Supports text, voice (transcribed), and photos (receipt OCR)
- Context storage in `context.user_data` for multi-turn conversations
- Markdown formatting with proper escaping

### Scheduled Tasks
- APScheduler with CronTrigger for time-based jobs
- Default user ID hardcoded to 1 (single-user system initially)
- Job rescheduling via `replace_existing=True`

## Environment Configuration

Required `.env` variables (see `.env.example`):
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/cortana_db
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_USER_ID=your_telegram_user_id
GEMINI_API_KEY=optional_for_ai_features
NEWS_API_KEY=optional_for_newsapi
TWILIO_ACCOUNT_SID=optional_for_voice
TWILIO_AUTH_TOKEN=optional_for_voice
```

## Development Roadmap Context

This project follows an 8-stage plan (see `readme.txt`):
1. ✅ Core Backend - FastAPI + SQLAlchemy + CRUD
2. ✅ Finance Agent - Budget tracking + Twilio notifications
3. ✅ News Agent - RSS aggregation + TTS
4. 🚧 Health Agent - Workout routines (partial)
5. ⏳ Mood Tracker - Sentiment analysis (planned)
6. ⏳ Knowledge Agent - Vector memory with FAISS (planned)
7. ⏳ Orchestrator - Multi-agent coordination (planned)
8. ⏳ Dashboard - React/Flutter UI (planned)

Current focus: Stages 1-3 complete, Stage 4 partially implemented.

## Common Patterns

**Adding a New Agent:**
1. Create service class in `services/` with DB session + user_id init
2. Add corresponding model in `models/` if needed
3. Create routes in `routes/` using `APIRouter`
4. Register router in `main.py` via `app.include_router()`
5. Add scheduled tasks in `scheduler_service.py` if needed

**Adding Telegram Commands:**
1. Add handler in `telegram_service.py` (CommandHandler or MessageHandler)
2. Implement logic in `telegram_message_handler.py` for message parsing
3. Update help text in `help_command()` method

**Database Changes:**
1. Create migration script in `migrations/`
2. Run via `python cortana/run_migration.py`
3. Update model in `models/` to reflect schema

## Testing Endpoints

Key API endpoints (see `/docs` for full list):
- `POST /finance/` - Log expense/income
- `GET /finance/summary/{user_id}?period=weekly` - Get summary
- `POST /budget/` - Set budget
- `POST /news/preferences` - Configure news interests
- `POST /scheduler/trigger-reminder` - Test scheduled jobs
- `POST /ai/chat` - Conversational AI interface

## Notes

- System currently designed for single user (user_id=1 hardcoded in many places)
- Telegram bot requires network access (may need VPN in restricted regions)
- Receipt OCR requires Pillow and sufficient image quality
- Voice transcription uses Whisper (local or API-based)
- All services use unified logging via Python's logging module
