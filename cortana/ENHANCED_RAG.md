# Enhanced RAG System - Personal Context Layer

## 🎯 What's New?

The RAG system now has TWO layers:
1. **General Knowledge** - Exercise guides, injury tips, nutrition advice (static)
2. **Personal Context** - YOUR workout logs, progress, spending patterns (dynamic)

## 🚀 How to Set Up

### Step 1: Initialize Personal Context

Run this to vectorize your existing data:

```powershell
cd D:\Final-Project\cortana
python scripts/init_personal_context.py
```

This will:
- Generate weekly workout summary from your logs
- Generate expense insights from your spending
- Generate comprehensive progress report
- Vectorize everything for RAG retrieval

**Output:**
```
🧠 Initializing Personal Context RAG
📊 Generating weekly workout summary...
💰 Generating expense insights...
📈 Generating progress report...
✅ Personal Context Initialized!
```

### Step 2: Restart Server

```powershell
python main.py
```

### Step 3: Test in Telegram

Try these personalized queries:

**Progress Questions:**
- "How's my workout progress?"
- "Am I making progress?"
- "Show me my progress this month"

**Spending Questions:**
- "What did I spend on food?"
- "Where is my money going?"
- "Am I overspending?"

**Combined Questions:**
- "Should I increase weight on dumbbell press?" (uses workout logs)
- "Can I afford a gym membership?" (uses spending data)

## 📊 How It Works

### Before (Static RAG):
```
You: "Should I increase weight?"
RAG retrieves:
  - Exercise progression guide (general knowledge)
AI: "Increase weight when you can complete all sets easily"
```

### After (Personal Context RAG):
```
You: "Should I increase weight on dumbbell press?"
RAG retrieves:
  1. Your last 3 dumbbell press logs:
     - Week 1: 15kg, 3x10, struggled
     - Week 2: 15kg, 3x12, felt good
     - Week 3: 15kg, 4x12, too easy
  2. Exercise progression guide (general knowledge)

AI: "Yes! Your logs show you've mastered 15kg (completed 4x12 easily).
Time to progress to 17.5kg. Keep reps at 12-15 for fat loss."
```

## 🏗️ Architecture

```
cortana/
├── data/
│   ├── vector_store/               # General knowledge (exercises, nutrition)
│   └── personal_context/
│       └── user_1/                 # Your personal data (auto-created)
│           ├── faiss.index
│           └── documents.pkl
├── services/
│   ├── vector_store.py             # FAISS vector database
│   ├── personal_context_service.py # Vectorizes your data
│   └── rag_service.py              # Enhanced RAG (uses both stores)
└── scripts/
    └── init_personal_context.py    # Initializes personal context
```

## 📈 What Gets Vectorized?

### Automatically (Future):
When you complete a workout → vectorized immediately
When you log expenses → patterns generated weekly
When you track weight → progress calculated automatically

### Manually (Now):
Run `python scripts/init_personal_context.py` to generate summaries from existing data

## 💡 Example Queries

### Workout Progress:
```
You: "How's my squat progress?"

RAG finds:
- Your squat logs (Week 1: knee pain, Week 3: no pain!)
- Knee injury guide
- Your profile (bad knee)

AI: "Great progress! Week 1 you had knee pain, now in Week 3 you're pain-free.
Keep the controlled depth and box squats - they're working for your knee!"
```

### Spending Insights:
```
You: "Why am I spending so much?"

RAG finds:
- Your 30-day spending: $850
- Top category: Food ($400, 47%)
- Your expense insights

AI: "You spent $850 last month, with food being 47% ($400).
That's $13/day on food. Consider meal prep to reduce this category."
```

### Combined:
```
You: "Can I afford a personal trainer?"

RAG finds:
- Your spending: $850/month
- Your income logs
- Your current workout consistency: 83%

AI: "You're spending $850/month with good workout consistency (83%).
Before hiring a trainer, you're already doing well on your own.
Save that money or invest in home gym equipment instead!"
```

## 🔧 Customization

### Add More Personal Data Types:

Edit `personal_context_service.py` to vectorize:
- Sleep tracking
- Mood logs
- Meal logs
- Cardio sessions

### Adjust Vectorization Frequency:

Current: Manual (`init_personal_context.py`)
Future: Automatic (after each log entry)

### Modify Retrieval:

In `rag_service.py`, adjust:
- `top_k` for personal docs (currently 2)
- `top_k` for general docs (currently 3)
- Priority (personal docs shown first)

## 🎯 Benefits

✅ **Truly Personalized** - AI sees YOUR actual data, not generic advice
✅ **Progress Tracking** - "You've improved!" backed by real logs
✅ **Pattern Detection** - "You always skip leg day" from actual data
✅ **Accountability** - "You spent $400 on food" from real expenses
✅ **Motivation** - "You're on track!" based on real progress

## 🚧 Roadmap

**Phase 1 (Done):**
- [x] General knowledge RAG
- [x] Personal context service
- [x] Enhanced RAG with both layers
- [x] Manual initialization

**Phase 2 (Next):**
- [ ] Auto-vectorize on workout completion
- [ ] Auto-vectorize on expense logging
- [ ] Weekly auto-summary generation
- [ ] Real-time progress tracking

**Phase 3 (Future):**
- [ ] Predictive insights ("You'll hit your goal in 3 weeks")
- [ ] Anomaly detection ("You skipped 3 workouts this week")
- [ ] Recommendations ("Try increasing protein based on your progress")

## 🐛 Troubleshooting

### "No personal context found"
→ Run `python scripts/init_personal_context.py`

### "Not enough workout logs"
→ You need at least 1 week of workout data

### "Personal context not loading"
→ Check that `data/personal_context/user_1/` exists

### Slow queries
→ Normal on first query (model loads)
→ Subsequent queries are fast (~1 second)

## 🎉 You're Ready!

The enhanced RAG system is now live! It combines:
- ✅ General fitness knowledge
- ✅ YOUR personal workout logs
- ✅ YOUR spending patterns
- ✅ YOUR actual progress

Ask questions and get truly personalized answers based on YOUR data!
