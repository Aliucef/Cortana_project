# Cortana AI Assistant - Complete Sequence Diagrams

This document contains comprehensive sequence diagrams for all major workflows in the Cortana AI Assistant project.

---

## Table of Contents

1. [User Authentication Flow](#1-user-authentication-flow)
2. [Manual Transaction Entry](#2-manual-transaction-entry)
3. [Voice Transaction Entry (Twilio)](#3-voice-transaction-entry-twilio)
4. [OCR Receipt Scanning](#4-ocr-receipt-scanning)
5. [AI Chat with Context Retrieval](#5-ai-chat-with-context-retrieval)
6. [Budget Alert System](#6-budget-alert-system)
7. [Telegram Bot Integration](#7-telegram-bot-integration)
8. [News Aggregation and Delivery](#8-news-aggregation-and-delivery)
9. [Workout Plan Generation](#9-workout-plan-generation)
10. [Weekly Financial Summary](#10-weekly-financial-summary)
11. [Complete System Architecture](#11-complete-system-architecture)

---

## 1. User Authentication Flow

### Registration and Login

```mermaid
sequenceDiagram
    participant U as User (Web/Mobile)
    participant F as Frontend<br/>(React/Flutter)
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant JWT as JWT Service

    Note over U,JWT: User Registration Flow

    U->>F: Enter registration details<br/>(username, email, password)
    F->>F: Validate form inputs
    F->>API: POST /users/register<br/>{username, email, password, full_name, phone}

    API->>API: Hash password (bcrypt)
    API->>DB: INSERT INTO users<br/>(username, email, hashed_password)
    DB-->>API: User created (user_id: 42)

    API->>JWT: Generate JWT token<br/>(user_id: 42, expires: 7 days)
    JWT-->>API: access_token

    API-->>F: 201 Created<br/>{access_token, user: {...}}
    F->>F: Store token in secure storage
    F-->>U: Redirect to dashboard

    Note over U,JWT: User Login Flow

    U->>F: Enter login credentials<br/>(username, password)
    F->>API: POST /auth/login<br/>{username, password}

    API->>DB: SELECT * FROM users<br/>WHERE username = ?
    DB-->>API: User record

    API->>API: Verify password<br/>bcrypt.checkpw()

    alt Password Valid
        API->>JWT: Generate JWT token<br/>(user_id: 42)
        JWT-->>API: access_token
        API-->>F: 200 OK<br/>{access_token, token_type, user}
        F->>F: Store token securely
        F-->>U: Navigate to dashboard
    else Invalid Credentials
        API-->>F: 401 Unauthorized<br/>{detail: "Invalid credentials"}
        F-->>U: Show error message
    end

    Note over U,JWT: Protected Route Access

    U->>F: Navigate to /finance
    F->>API: GET /finance/summary/42<br/>Authorization: Bearer {token}

    API->>JWT: Verify token

    alt Token Valid
        JWT-->>API: Decoded payload {user_id: 42}
        API->>DB: Query user data
        DB-->>API: Data
        API-->>F: 200 OK {data}
        F-->>U: Display content
    else Token Expired/Invalid
        API-->>F: 401 Unauthorized
        F->>F: Clear stored token
        F-->>U: Redirect to login
    end
```

---

## 2. Manual Transaction Entry

### Adding Income/Expense via Dashboard

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant ST as Sentence Transformer<br/>(all-MiniLM-L6-v2)
    participant FAISS as FAISS Index
    participant Meta as metadata.json

    U->>F: Click "Add Transaction" button
    F->>F: Show transaction form

    U->>F: Fill form:<br/>- Type: Expense<br/>- Amount: $45.00<br/>- Category: Food<br/>- Description: "Dinner at Italian restaurant"<br/>- Date: 2024-01-20

    U->>F: Submit form
    F->>F: Validate inputs

    F->>API: POST /finance/<br/>Authorization: Bearer {token}<br/>{<br/>  transaction_type: "expense",<br/>  amount: 45.00,<br/>  category: "Food",<br/>  description: "Dinner at Italian restaurant",<br/>  transaction_date: "2024-01-20"<br/>}

    API->>API: Verify JWT token<br/>Extract user_id: 42

    API->>DB: BEGIN TRANSACTION

    API->>DB: INSERT INTO finance_records<br/>(user_id, transaction_type, amount,<br/> category, description, transaction_date)
    DB-->>API: Record created<br/>transaction_id: 100

    Note over API,Meta: Auto-Vectorization Process

    API->>ST: Encode description<br/>"Dinner at Italian restaurant"
    ST->>ST: Generate 384-dim embedding
    ST-->>API: Vector [0.234, -0.891, 0.567, ...]

    API->>FAISS: Load index for user_42<br/>from data/personal_context/user_42/faiss.index
    FAISS-->>API: Index loaded (current: n vectors)

    API->>FAISS: Add vector at position n<br/>index.add(vector)
    FAISS-->>API: Vector added at index n

    API->>Meta: Load metadata.json
    Meta-->>API: Current metadata array

    API->>Meta: Append new entry:<br/>{<br/>  transaction_id: 100,<br/>  user_id: 42,<br/>  description: "Dinner...",<br/>  category: "Food",<br/>  amount: 45.00,<br/>  transaction_date: "2024-01-20"<br/>}

    API->>FAISS: Save index<br/>faiss.write_index()
    API->>Meta: Save metadata.json

    API->>API: Verify: index.ntotal == len(metadata)

    alt Synchronization OK
        API->>DB: COMMIT TRANSACTION
        DB-->>API: Success
        API-->>F: 201 Created<br/>{id: 100, message: "Transaction added"}
        F-->>U: Show success message<br/>Refresh dashboard
    else Synchronization Failed
        API->>DB: ROLLBACK TRANSACTION
        API-->>F: 500 Error<br/>{error: "Vector sync failed"}
        F-->>U: Show error message
    end
```

---

## 3. Voice Transaction Entry (Twilio)

### Logging Expense via Phone Call

```mermaid
sequenceDiagram
    participant U as User (Phone)
    participant Twilio as Twilio Voice API
    participant API as FastAPI Backend<br/>/voice endpoint
    participant Whisper as Whisper STT
    participant NLP as NLP Parser
    participant DB as PostgreSQL
    participant FAISS as FAISS + Metadata
    participant SMS as Twilio SMS

    U->>Twilio: Call Cortana number<br/>(+1-XXX-XXX-XXXX)
    Twilio->>API: POST /voice/incoming-call<br/>{CallSid, From, CallStatus}

    API-->>Twilio: TwiML Response:<br/><Say>Hello! Please describe your expense</Say><br/><Record maxLength="30" transcribe="false"/>

    U->>Twilio: Voice message:<br/>"I just spent fifty dollars on groceries at Walmart"

    Twilio->>API: POST /voice/recording-status<br/>{RecordingUrl, RecordingSid}

    API->>Twilio: Download audio file<br/>GET {RecordingUrl}
    Twilio-->>API: Audio file (WAV/MP3)

    API->>Whisper: Transcribe audio
    Whisper->>Whisper: Speech-to-Text processing
    Whisper-->>API: Transcription:<br/>"I just spent fifty dollars on groceries at Walmart"

    API->>NLP: Parse expense from text
    NLP->>NLP: Extract:<br/>- Amount: $50.00<br/>- Category: "Shopping" (inferred)<br/>- Description: "Groceries at Walmart"<br/>- Merchant: "Walmart"
    NLP-->>API: Parsed data

    API->>DB: INSERT INTO finance_records<br/>(user_id: 42, transaction_type: "expense",<br/> amount: 50.00, category: "Shopping",<br/> description: "Groceries at Walmart")
    DB-->>API: transaction_id: 101

    API->>FAISS: Vectorize and store<br/>"Groceries at Walmart"
    FAISS-->>API: Stored at index n+1

    API->>SMS: Send confirmation SMS<br/>To: {From number}<br/>Body: "✅ Logged: $50.00 expense for Shopping (Groceries at Walmart)"
    SMS-->>U: SMS received

    API-->>Twilio: TwiML Response:<br/><Say>Transaction recorded. You will receive an SMS confirmation.</Say><br/><Hangup/>

    Twilio-->>U: Call ends
```

---

## 4. OCR Receipt Scanning

### Scanning Receipt from Mobile App

```mermaid
sequenceDiagram
    participant U as User (Mobile)
    participant App as Flutter App
    participant Camera as Device Camera
    participant API as FastAPI Backend
    participant OCR as Tesseract OCR
    participant NLP as NLP Parser
    participant DB as PostgreSQL
    participant FAISS as FAISS + Metadata

    U->>App: Open Finance Dashboard
    U->>App: Tap "Scan Receipt" button

    App->>Camera: Request camera permission
    Camera-->>App: Permission granted

    App->>Camera: Open camera interface
    U->>Camera: Capture receipt photo
    Camera-->>App: Image captured (JPEG)

    App->>App: Compress image<br/>(reduce size if > 5MB)

    App->>API: POST /finance/ocr-receipt<br/>Authorization: Bearer {token}<br/>Content-Type: multipart/form-data<br/>{image: receipt.jpg}

    API->>API: Save temporary file<br/>temp_receipt_123.jpg

    API->>OCR: Extract text from image<br/>pytesseract.image_to_string()

    OCR->>OCR: Perform OCR processing<br/>Detect text regions<br/>Recognize characters

    OCR-->>API: Raw text:<br/>"WALMART<br/>Store #1234<br/>-----------<br/>Milk         $3.99<br/>Bread        $2.50<br/>Eggs         $4.25<br/>-----------<br/>Total       $10.74<br/>01/20/2024"

    API->>NLP: Parse receipt text

    NLP->>NLP: Extract information:<br/>- Merchant: "Walmart"<br/>- Total: $10.74<br/>- Date: 2024-01-20<br/>- Items: [Milk, Bread, Eggs]<br/>- Category: "Food" (inferred)

    NLP-->>API: Parsed data

    API->>API: Generate description:<br/>"Walmart groceries (Milk, Bread, Eggs)"

    API->>DB: INSERT INTO finance_records<br/>(user_id: 42, transaction_type: "expense",<br/> amount: 10.74, category: "Food",<br/> description: "Walmart groceries...",<br/> transaction_date: "2024-01-20")

    DB-->>API: transaction_id: 102

    API->>FAISS: Vectorize description<br/>"Walmart groceries (Milk, Bread, Eggs)"
    FAISS->>FAISS: Encode to 384-dim vector<br/>Store at index n+2<br/>Add metadata entry
    FAISS-->>API: Success

    API->>API: Delete temporary image<br/>os.remove(temp_receipt_123.jpg)

    API-->>App: 201 Created<br/>{<br/>  id: 102,<br/>  merchant: "Walmart",<br/>  amount: 10.74,<br/>  category: "Food",<br/>  items: ["Milk", "Bread", "Eggs"],<br/>  confidence: 0.92<br/>}

    App->>App: Show preview dialog:<br/>"Transaction detected:<br/>$10.74 at Walmart (Food)"

    U->>App: Confirm or Edit

    alt User Confirms
        App-->>U: Show success message<br/>Refresh transaction list
    else User Edits
        App->>App: Show edit form<br/>(pre-filled with OCR data)
        U->>App: Modify fields
        App->>API: PUT /finance/102<br/>{updated data}
        API->>DB: UPDATE finance_records
        DB-->>API: Success
        API-->>App: 200 OK
        App-->>U: Transaction updated
    end
```

---

## 5. AI Chat with Context Retrieval

### Conversational Finance Query with RAG

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Chat Interface<br/>(Web/Mobile)
    participant API as FastAPI Backend<br/>/ai-chat/chat
    participant ST as Sentence Transformer
    participant FAISS as FAISS Index
    participant Meta as metadata.json
    participant DB as PostgreSQL
    participant LLM as LLM (Ollama/Gemini)

    U->>UI: Type message:<br/>"How much did I spend on food last week?"

    UI->>API: POST /ai-chat/chat<br/>Authorization: Bearer {token}<br/>{message: "How much did I spend on food last week?"}

    API->>API: Extract user_id: 42 from JWT

    Note over API,LLM: Step 1: Semantic Search for Context

    API->>ST: Encode query<br/>"How much did I spend on food last week?"
    ST-->>API: Query vector [0.123, 0.456, ...]

    API->>FAISS: Load user_42 index
    FAISS-->>API: Index loaded (500 vectors)

    API->>FAISS: Search for top-k similar vectors<br/>index.search(query_vector, k=5)

    FAISS->>FAISS: Compute cosine similarity<br/>across all 500 vectors

    FAISS-->>API: Results:<br/>Indices: [45, 123, 8, 67, 234]<br/>Distances: [0.89, 0.85, 0.82, 0.78, 0.75]

    API->>Meta: Retrieve metadata at indices<br/>[45, 123, 8, 67, 234]

    Meta-->>API: Metadata entries:<br/>[<br/>  {transaction_id: 46, category: "Food", ...},<br/>  {transaction_id: 124, category: "Food", ...},<br/>  {transaction_id: 9, category: "Food", ...},<br/>  {transaction_id: 68, category: "Restaurant", ...},<br/>  {transaction_id: 235, category: "Groceries", ...}<br/>]

    API->>DB: SELECT * FROM finance_records<br/>WHERE id IN (46, 124, 9, 68, 235)<br/>AND user_id = 42<br/>ORDER BY transaction_date DESC

    DB-->>API: Full transaction records

    Note over API,LLM: Step 2: Context Enhancement

    API->>DB: Get date range context<br/>SELECT SUM(amount), COUNT(*)<br/>FROM finance_records<br/>WHERE user_id = 42<br/>  AND category IN ('Food', 'Restaurant')<br/>  AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'

    DB-->>API: Weekly food spending:<br/>Total: $156.50<br/>Count: 12 transactions

    API->>DB: Get budget info<br/>SELECT * FROM budgets<br/>WHERE user_id = 42 AND period = 'weekly'

    DB-->>API: Weekly budget: $200.00<br/>Remaining: $43.50

    Note over API,LLM: Step 3: LLM Generation

    API->>API: Build prompt with context:<br/>"User asked: 'How much did I spend on food last week?'<br/><br/>Relevant transactions:<br/>1. $15.50 - Starbucks coffee (2024-01-18)<br/>2. $28.00 - Grocery shopping (2024-01-17)<br/>3. $12.00 - McDonald's lunch (2024-01-16)<br/>...<br/><br/>Summary:<br/>- Total food spending last week: $156.50<br/>- Number of transactions: 12<br/>- Weekly budget: $200.00<br/>- Remaining: $43.50<br/><br/>Provide a helpful, conversational response."

    API->>LLM: Generate response<br/>POST http://localhost:11434/api/generate<br/>(Ollama) or Gemini API

    LLM->>LLM: Process prompt with context<br/>Generate natural language response

    LLM-->>API: Response:<br/>"Last week, you spent $156.50 on food across 12 transactions. Here's the breakdown:\n\n• Restaurants & Coffee: $67.50 (5 transactions)\n• Grocery Shopping: $89.00 (7 transactions)\n\nYou're doing well with your weekly food budget of $200! You still have $43.50 remaining for this week. Your largest expense was the grocery trip on Jan 17th at $28.00.\n\nWould you like me to suggest ways to reduce food expenses?"

    API-->>UI: 200 OK<br/>{<br/>  response: "Last week, you spent...",<br/>  context_used: 5,<br/>  sources: [46, 124, 9, 68, 235]<br/>}

    UI->>UI: Display AI response<br/>with typing animation

    UI-->>U: Show response with:<br/>- Formatted text<br/>- Context sources (expandable)<br/>- Follow-up suggestions
```

---

## 6. Budget Alert System

### Automatic Budget Threshold Notifications

```mermaid
sequenceDiagram
    participant Scheduler as APScheduler
    participant Service as Budget Alert Service
    participant DB as PostgreSQL
    participant Telegram as Telegram Bot API
    participant SMS as Twilio SMS
    participant Email as Email Service

    Note over Scheduler,Email: Triggered every 1 hour

    Scheduler->>Service: Execute check_budget_alerts()

    Service->>DB: SELECT user_id, amount, period<br/>FROM budgets<br/>WHERE active = true

    DB-->>Service: All active budgets:<br/>[<br/>  {user_id: 42, amount: 200, period: "weekly"},<br/>  {user_id: 43, amount: 1500, period: "monthly"}<br/>]

    loop For each budget

        Service->>DB: Calculate current spending:<br/>SELECT SUM(amount)<br/>FROM finance_records<br/>WHERE user_id = 42<br/>  AND transaction_type = 'expense'<br/>  AND transaction_date >= {period_start}

        DB-->>Service: Current spending: $178.50

        Service->>Service: Calculate percentage:<br/>$178.50 / $200.00 = 89.25%

        alt Spending >= 90% (Critical)
            Service->>Service: Create alert:<br/>Level: CRITICAL<br/>Message: "⚠️ Budget Alert: You've spent $178.50 (89%) of your $200 weekly budget!"

            Service->>DB: Check if alert already sent:<br/>SELECT * FROM budget_alerts<br/>WHERE user_id = 42<br/>  AND alert_type = 'critical_90'<br/>  AND sent_at >= {period_start}

            DB-->>Service: No recent alert found

            Service->>DB: INSERT INTO budget_alerts<br/>(user_id, alert_type, spending_amount, budget_amount, percentage)
            DB-->>Service: Alert logged

            Service->>Telegram: Send message to user_42<br/>bot.send_message(<br/>  chat_id=user_42_telegram_id,<br/>  text="⚠️ Budget Alert: You've spent $178.50 (89%) of your $200 weekly budget! Only $21.50 remaining."<br/>)
            Telegram-->>Service: Message sent

            Service->>SMS: Send SMS alert<br/>(if phone number configured)
            SMS-->>Service: SMS sent

        else Spending >= 80% (Warning)
            Service->>Service: Create warning:<br/>"⚡ You've reached 80% of your weekly budget ($160/$200)"

            Service->>DB: Check for existing warning
            DB-->>Service: Not sent yet

            Service->>Telegram: Send warning message
            Telegram-->>Service: Sent

        else Spending >= 50% (Info)
            Service->>Service: Log info notification<br/>(no immediate alert)

        else Spending < 50%
            Service->>Service: No action needed
        end

    end

    Service-->>Scheduler: All budgets checked<br/>Alerts sent: 3
```

---

## 7. Telegram Bot Integration

### Conversational Expense Logging via Telegram

```mermaid
sequenceDiagram
    participant U as User
    participant TG as Telegram Client
    participant Bot as Telegram Bot<br/>(python-telegram-bot)
    participant Handler as Message Handler
    participant NLP as NLP Parser
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant FAISS as FAISS + Metadata

    U->>TG: Open chat with @CortanaBot
    U->>TG: Send message:<br/>"I spent 25 dollars on lunch at Chipotle"

    TG->>Bot: Update received:<br/>{<br/>  message: {<br/>    text: "I spent 25 dollars...",<br/>    from: {id: telegram_user_123}<br/>  }<br/>}

    Bot->>Bot: Check for duplicate<br/>(update_id in processed_set)

    Bot->>Handler: process_message(update)

    Handler->>DB: Map telegram_user_id to user_id:<br/>SELECT user_id FROM users<br/>WHERE telegram_user_id = 'telegram_user_123'

    DB-->>Handler: user_id: 42

    Handler->>NLP: Parse expense message<br/>"I spent 25 dollars on lunch at Chipotle"

    NLP->>NLP: Apply regex patterns:<br/>- Amount: r'\$?(\d+(?:\.\d{2})?)'<br/>- Keywords: "spent", "paid", "bought"<br/>- Merchant: "at (\w+)"<br/>- Category inference

    NLP-->>Handler: Parsed:<br/>{<br/>  amount: 25.00,<br/>  description: "Lunch at Chipotle",<br/>  category: "Food",<br/>  merchant: "Chipotle"<br/>}

    Handler->>API: POST /finance/<br/>Internal API call (bypass auth)<br/>{<br/>  user_id: 42,<br/>  transaction_type: "expense",<br/>  amount: 25.00,<br/>  category: "Food",<br/>  description: "Lunch at Chipotle"<br/>}

    API->>DB: INSERT INTO finance_records
    DB-->>API: transaction_id: 103

    API->>FAISS: Vectorize and store
    FAISS-->>API: Success

    API-->>Handler: 201 Created<br/>{id: 103, success: true}

    Handler->>Bot: Prepare response message

    Bot->>TG: send_message(<br/>  chat_id=telegram_user_123,<br/>  text="✅ *Transaction Logged*\n\n💰 Amount: $25.00\n🏷️ Category: Food\n📝 Description: Lunch at Chipotle\n📅 Date: Jan 20, 2024\n\n_View your dashboard for more details._",<br/>  parse_mode="Markdown"<br/>)

    TG-->>U: Message displayed

    Note over U,FAISS: Voice Message Support

    U->>TG: Send voice message<br/>(15 seconds audio)

    TG->>Bot: Voice message update:<br/>{<br/>  voice: {file_id: "abc123", duration: 15}<br/>}

    Bot->>TG: Download voice file<br/>get_file(file_id)
    TG-->>Bot: Voice file (OGG)

    Bot->>Handler: process_voice_message()

    Handler->>Handler: Transcribe with Whisper<br/>whisper.transcribe(audio_file)

    Handler-->>Handler: Transcription:<br/>"I just bought coffee for five dollars"

    Handler->>NLP: Parse transcription
    NLP-->>Handler: Parsed data

    Handler->>API: POST /finance/
    API-->>Handler: Success

    Bot->>TG: send_message:<br/>"🎤 Voice message processed!\n✅ Logged: $5.00 for Coffee"

    TG-->>U: Confirmation received

    Note over U,FAISS: Receipt Photo Support

    U->>TG: Send photo<br/>(receipt image)

    TG->>Bot: Photo update:<br/>{photo: [{file_id: "xyz789"}]}

    Bot->>TG: Download photo
    TG-->>Bot: Image file (JPEG)

    Bot->>Handler: process_photo()

    Handler->>API: POST /finance/ocr-receipt<br/>{image: receipt.jpg}

    API->>API: OCR processing<br/>(Tesseract)

    API-->>Handler: Extracted data:<br/>{amount: 45.50, merchant: "Target"}

    Handler->>API: POST /finance/
    API-->>Handler: Success

    Bot->>TG: send_message:<br/>"📸 Receipt scanned!\n✅ Logged: $45.50 at Target"

    TG-->>U: Receipt processed
```

---

## 8. News Aggregation and Delivery

### Daily News Briefing via RSS Feeds

```mermaid
sequenceDiagram
    participant Scheduler as APScheduler
    participant Service as News Aggregator
    participant RSS as RSS Feeds<br/>(BBC, Reuters, Local)
    participant DB as PostgreSQL
    participant LLM as LLM (Gemini)<br/>(Optional Summarization)
    participant Telegram as Telegram Bot
    participant User as User

    Note over Scheduler,User: Scheduled daily at 8:00 AM

    Scheduler->>Service: Execute daily_news_briefing()

    Service->>DB: SELECT user_id, categories, sources<br/>FROM news_preferences<br/>WHERE enabled = true

    DB-->>Service: User preferences:<br/>[<br/>  {user_id: 42, categories: ["tech", "business"],<br/>   sources: ["BBC", "Reuters"], language: "en"}<br/>]

    loop For each user preference

        Service->>RSS: Fetch feeds for user_42

        par Parallel Feed Fetching
            Service->>RSS: GET https://feeds.bbci.co.uk/news/technology/rss.xml
            RSS-->>Service: Tech articles (XML)
        and
            Service->>RSS: GET https://www.reuters.com/business/rss
            RSS-->>Service: Business articles (XML)
        and
            Service->>RSS: GET https://local-news-lebanon.com/rss
            RSS-->>Service: Local news (XML)
        end

        Service->>Service: Parse RSS XML:<br/>Extract title, description, link,<br/>pubDate, category

        Service->>Service: Filter articles:<br/>- Published in last 24 hours<br/>- Match user categories<br/>- Deduplicate by title<br/>- Sort by relevance

        Service-->>Service: 15 articles found

        opt AI Summarization Enabled
            loop For top 5 articles
                Service->>LLM: Summarize article<br/>POST /api/generate<br/>{<br/>  prompt: "Summarize this news article in 2-3 sentences: {article_text}"<br/>}
                LLM-->>Service: Summary
            end
        end

        Service->>Service: Format briefing:<br/>"📰 *Your Daily News Briefing*\n\n🔹 *Technology*\n\n1️⃣ **AI Breakthrough in Healthcare**\nResearchers develop new AI model...\n🔗 [Read more](link)\n\n2️⃣ **Tesla Announces New EV**\n...\n\n🔹 *Business*\n..."

        Service->>Service: Split into chunks<br/>(Telegram 4096 char limit)

        Service->>Telegram: Send briefing messages

        loop For each message chunk
            Service->>Telegram: bot.send_message(<br/>  chat_id=user_42_telegram_id,<br/>  text=chunk,<br/>  parse_mode="Markdown",<br/>  disable_web_page_preview=True<br/>)
            Telegram-->>User: News briefing received
        end

        Service->>DB: INSERT INTO news_delivery_log<br/>(user_id, articles_sent, delivered_at)
        DB-->>Service: Logged

    end

    Service-->>Scheduler: Briefing sent to 15 users<br/>Total articles: 87
```

---

## 9. Workout Plan Generation

### AI-Generated Personalized Workout Plans

```mermaid
sequenceDiagram
    participant U as User (Mobile)
    participant App as Flutter App
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant LLM as LLM (Gemini/Ollama)

    U->>App: Navigate to Health Dashboard
    U->>App: Tap "Generate Workout Plan"

    App->>App: Check if gym profile exists

    alt No Gym Profile
        App->>App: Navigate to profile setup
        U->>App: Fill profile form:<br/>- Weight: 75 kg<br/>- Height: 175 cm<br/>- Experience: Intermediate<br/>- Goal: Muscle Gain<br/>- Days/week: 4<br/>- Equipment: Full Gym<br/>- Split: Push/Pull/Legs

        App->>API: POST /health/profile?user_id=42<br/>{weight, height, experience_level, ...}
        API->>DB: INSERT INTO gym_profiles
        DB-->>API: Profile created
        API-->>App: Profile saved
    end

    App->>API: POST /health/workout-plan/generate/42?weeks=4

    API->>DB: SELECT * FROM gym_profiles<br/>WHERE user_id = 42
    DB-->>API: Profile data

    API->>API: Build workout prompt:<br/>"Generate a 4-week workout plan for:<br/>- Experience: Intermediate<br/>- Goal: Muscle Gain<br/>- Training days: 4 per week<br/>- Split: Push/Pull/Legs<br/>- Equipment: Full gym access<br/><br/>Format: JSON with weekly schedules"

    API->>LLM: POST /api/generate<br/>{model: "gemini-pro", prompt: ...}

    LLM->>LLM: Generate structured workout plan<br/>Week 1-4, each with 4 workouts<br/>Exercise selection based on:<br/>- User experience level<br/>- Available equipment<br/>- Training split preference<br/>- Progressive overload principles

    LLM-->>API: Generated plan (JSON):<br/>{<br/>  "weeks": [<br/>    {<br/>      "week_number": 1,<br/>      "workouts": [<br/>        {<br/>          "day": "Monday",<br/>          "focus": "Push (Chest, Shoulders, Triceps)",<br/>          "exercises": [<br/>            {<br/>              "name": "Barbell Bench Press",<br/>              "sets": 4,<br/>              "reps": "8-10",<br/>              "rest_seconds": 90,<br/>              "notes": "Focus on controlled eccentric"<br/>            },<br/>            ...<br/>          ]<br/>        },<br/>        ...<br/>      ]<br/>    },<br/>    ...<br/>  ]<br/>}

    API->>API: Parse and validate LLM output

    API->>DB: BEGIN TRANSACTION

    loop For each week (1-4)
        loop For each workout day
            API->>DB: INSERT INTO workout_plans<br/>(user_id, week_number, day_of_week,<br/> focus_area, exercises_json, is_completed)
            DB-->>API: workout_plan_id
        end
    end

    API->>DB: COMMIT TRANSACTION
    DB-->>API: 16 workout plans created<br/>(4 weeks × 4 days)

    API-->>App: 201 Created<br/>{<br/>  message: "Workout plan generated!",<br/>  weeks: 4,<br/>  total_workouts: 16<br/>}

    App->>API: GET /health/workout-plan/current/42

    API->>DB: SELECT * FROM workout_plans<br/>WHERE user_id = 42<br/>  AND week_number = {current_week}<br/>ORDER BY day_of_week

    DB-->>API: This week's 4 workouts

    API-->>App: 200 OK<br/>[workout1, workout2, workout3, workout4]

    App->>App: Display workout cards:<br/>- Monday: Push (Chest/Shoulders)<br/>- Wednesday: Pull (Back/Biceps)<br/>- Friday: Legs<br/>- Saturday: Upper Body

    App-->>U: Workout plan loaded

    U->>App: Tap on "Monday - Push" workout

    App->>App: Show workout details:<br/>- 6 exercises<br/>- Sets, reps, rest times<br/>- Form videos (if available)<br/>- Progress tracking

    U->>App: Complete workout
    U->>App: Tap "Mark as Complete"

    App->>API: PATCH /health/workout-plan/{id}/complete

    API->>DB: UPDATE workout_plans<br/>SET is_completed = true,<br/>    completed_at = NOW()<br/>WHERE id = {workout_id}

    DB-->>API: Updated

    API-->>App: 200 OK<br/>{message: "Workout marked as complete!"}

    App-->>U: Show celebration animation<br/>"Great job! 💪"
```

---

## 10. Weekly Financial Summary

### Automated Weekly Report Generation

```mermaid
sequenceDiagram
    participant Scheduler as APScheduler
    participant Service as Finance Agent
    participant DB as PostgreSQL
    participant Analyzer as Pandas Analyzer
    participant Telegram as Telegram Bot
    participant User as User

    Note over Scheduler,User: Scheduled: Every Sunday at 6:00 PM

    Scheduler->>Service: Execute generate_weekly_summary()

    Service->>DB: SELECT user_id FROM users<br/>WHERE active = true<br/>  AND weekly_summary_enabled = true

    DB-->>Service: Active users: [42, 43, 44, ...]

    loop For each user

        Service->>DB: Query weekly transactions:<br/>SELECT * FROM finance_records<br/>WHERE user_id = 42<br/>  AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'<br/>ORDER BY transaction_date DESC

        DB-->>Service: This week's transactions (35 records)

        Service->>Analyzer: Load data into DataFrame<br/>df = pd.DataFrame(transactions)

        Analyzer->>Analyzer: Calculate statistics:<br/>- Total income: df[type=='income'].sum()<br/>- Total expenses: df[type=='expense'].sum()<br/>- Net change: income - expenses<br/>- Category breakdown: df.groupby('category').sum()<br/>- Daily spending trend<br/>- Top 5 expenses

        Analyzer->>DB: Get previous week data<br/>for comparison
        DB-->>Analyzer: Last week's data

        Analyzer->>Analyzer: Calculate week-over-week changes:<br/>- Income change: +12.5%<br/>- Expense change: -8.3%<br/>- Savings improvement: +$45.00

        Analyzer-->>Service: Analysis complete

        Service->>DB: Get budget info<br/>SELECT * FROM budgets<br/>WHERE user_id = 42 AND period = 'weekly'
        DB-->>Service: Weekly budget: $200

        Service->>Service: Format summary report:<br/><br/>"📊 *Weekly Financial Summary*<br/>Week of Jan 14-20, 2024<br/><br/>💰 *Income*<br/>Total: $1,250.00 (↑ 12.5%)<br/>  • Salary: $1,200.00<br/>  • Freelance: $50.00<br/><br/>💸 *Expenses*<br/>Total: $178.50 (↓ 8.3%)<br/>  • Food: $67.50<br/>  • Transport: $45.00<br/>  • Entertainment: $35.00<br/>  • Other: $31.00<br/><br/>📈 *Net Savings*<br/>+$1,071.50 (↑ $45 vs last week)<br/><br/>🎯 *Budget Status*<br/>Weekly budget: $200.00<br/>Spent: $178.50 (89%)<br/>Remaining: $21.50<br/><br/>⭐ *Highlights*<br/>• Great job staying under budget!<br/>• Food spending decreased by 15%<br/>• Largest expense: Grocery trip ($28)<br/><br/>💡 *Insights*<br/>You saved 85.7% of your income this week. Consider increasing your entertainment budget if you feel restricted."

        Service->>Service: Generate spending chart<br/>(text-based bar chart):<br/>"📊 Spending by Category<br/>Food        ▓▓▓▓▓▓▓▓░░ $67.50<br/>Transport   ▓▓▓▓▓░░░░░ $45.00<br/>Entertainment ▓▓▓░░░░░░░ $35.00<br/>Other       ▓▓░░░░░░░░ $31.00"

        Service->>Telegram: Send summary to user<br/>bot.send_message(<br/>  chat_id=user_42_telegram_id,<br/>  text=formatted_summary,<br/>  parse_mode="Markdown"<br/>)

        Telegram-->>User: Weekly summary received

        Service->>DB: INSERT INTO summary_delivery_log<br/>(user_id, report_type, period_start, period_end)
        DB-->>Service: Logged

        opt User has email configured
            Service->>Service: Generate PDF report<br/>with charts and graphs

            Service->>Service: Send email with attachment<br/>Subject: "Your Weekly Financial Summary"
        end

    end

    Service-->>Scheduler: Summaries sent to 15 users<br/>Execution time: 12.3 seconds
```

---

## 11. Complete System Architecture

### End-to-End System Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend<br/>(React/Flutter/Telegram)
    participant API as FastAPI Backend
    participant Auth as JWT Auth Service
    participant DB as PostgreSQL
    participant FAISS as FAISS Vector DB
    participant LLM as LLM<br/>(Ollama/Gemini)
    participant Scheduler as APScheduler
    participant Ext as External APIs<br/>(Twilio, RSS, etc.)

    Note over U,Ext: Complete Request Flow

    U->>FE: User action (login, transaction, chat, etc.)

    FE->>API: HTTP Request<br/>Authorization: Bearer {token}

    API->>Auth: Verify JWT token

    alt Token Valid
        Auth-->>API: user_id: 42

        alt Read Operation (GET)
            API->>DB: Query data
            DB-->>API: Results

            opt Context-aware query
                API->>FAISS: Semantic search
                FAISS-->>API: Relevant context
            end

            opt AI Enhancement
                API->>LLM: Generate insights
                LLM-->>API: AI response
            end

            API-->>FE: 200 OK {data}
            FE-->>U: Display results

        else Write Operation (POST/PUT/DELETE)
            API->>DB: BEGIN TRANSACTION

            API->>DB: Write to database
            DB-->>API: Success

            opt Auto-vectorization
                API->>FAISS: Add/update vectors
                FAISS-->>API: Indexed
            end

            API->>DB: COMMIT TRANSACTION
            DB-->>API: Committed

            opt Trigger notifications
                API->>Scheduler: Schedule background task
                Scheduler->>Ext: Send notifications
                Ext-->>U: SMS/Email/Telegram
            end

            API-->>FE: 201 Created {data}
            FE-->>U: Show success
        end

    else Token Invalid/Expired
        Auth-->>API: 401 Unauthorized
        API-->>FE: 401 Unauthorized
        FE->>FE: Clear stored token
        FE-->>U: Redirect to login
    end

    Note over U,Ext: Background Scheduled Tasks

    loop Every Hour/Day/Week
        Scheduler->>Scheduler: Check scheduled tasks

        alt Budget Alert Check
            Scheduler->>DB: Check budget thresholds
            DB-->>Scheduler: Users over budget
            Scheduler->>Ext: Send alerts (Telegram/SMS)
            Ext-->>U: Alert received
        end

        alt News Aggregation
            Scheduler->>Ext: Fetch RSS feeds
            Ext-->>Scheduler: News articles
            Scheduler->>LLM: Summarize articles
            LLM-->>Scheduler: Summaries
            Scheduler->>Ext: Send via Telegram
            Ext-->>U: Daily briefing
        end

        alt Weekly Summary
            Scheduler->>DB: Aggregate weekly data
            DB-->>Scheduler: Transaction data
            Scheduler->>Scheduler: Generate report
            Scheduler->>Ext: Send summary
            Ext-->>U: Weekly report
        end
    end
```

---

## System Component Details

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React.js (Web) | Dashboard, analytics, visualizations |
| **Mobile** | Flutter | iOS/Android native experience |
| **Backend** | FastAPI (Python) | RESTful API, async operations |
| **Database** | PostgreSQL | Relational data storage |
| **Vector DB** | FAISS | Semantic search over transactions |
| **Embedding** | Sentence Transformers | Text to 384-dim vectors |
| **LLM** | Ollama (local) / Gemini (cloud) | AI chat, summarization, insights |
| **Scheduler** | APScheduler | Background tasks, cron jobs |
| **Voice** | Twilio + Whisper | Phone calls, speech-to-text |
| **OCR** | Tesseract | Receipt scanning |
| **Messaging** | Telegram Bot API | Chat interface, notifications |
| **SMS/Voice** | Twilio API | Alerts, voice transactions |
| **News** | RSS Feeds | News aggregation |

### API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | User authentication |
| `/users/register` | POST | New user signup |
| `/finance/` | POST | Add transaction |
| `/finance/summary/{user_id}` | GET | Get financial summary |
| `/finance/ocr-receipt` | POST | Process receipt image |
| `/ai-chat/chat` | POST | AI conversation |
| `/budget/` | POST | Set/update budget |
| `/budget/category-goal` | POST | Set category goals |
| `/health/profile` | POST | Create gym profile |
| `/health/workout-plan/generate/{user_id}` | POST | Generate workout plan |
| `/voice/incoming-call` | POST | Handle Twilio voice |
| `/telegram/webhook` | POST | Telegram bot updates |

### Data Models

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| **User** | id, username, email, telegram_user_id | → finance_records, budgets |
| **FinanceRecord** | id, user_id, transaction_type, amount, category, description | user ← |
| **Budget** | id, user_id, amount, period | user ← |
| **CategoryGoal** | id, user_id, category, target_amount | user ← |
| **GymProfile** | id, user_id, weight, height, experience_level | user ← |
| **WorkoutPlan** | id, user_id, week_number, day_of_week, exercises_json | user ← |
| **WorkoutLog** | id, user_id, exercise_name, sets, reps, weight | user ← |

---

## Rendering Instructions

### For Mermaid Live Editor
1. Visit https://mermaid.live
2. Copy each diagram code block
3. Paste and preview
4. Export as PNG/SVG/PDF

### For VS Code
1. Install "Markdown Preview Mermaid Support"
2. Open this file
3. Press Ctrl+Shift+V (Markdown Preview)
4. Right-click diagram → Export

### For Command Line
```bash
npm install -g @mermaid-js/mermaid-cli

mmdc -i diagram.mmd -o output.png -w 1920 -H 1080
```

### For LaTeX
```latex
\begin{figure}[H]
    \centering
    \includegraphics[width=0.95\textwidth]{sequence_diagram.pdf}
    \caption{Complete System Sequence Diagram}
    \label{fig:sequence_complete}
\end{figure}
```

---

## Additional Notes

- All diagrams use consistent color coding
- Participants are clearly labeled with their roles
- Alternative flows (alt/else) show error handling
- Parallel operations (par) show concurrent processing
- Loop constructs show iterative operations
- Notes provide contextual information
- Database transactions show ACID compliance

---

**Document Version**: 1.0
**Last Updated**: January 2026
**Total Diagrams**: 11 comprehensive sequence diagrams
**Coverage**: Complete system workflows from authentication to AI-powered features
