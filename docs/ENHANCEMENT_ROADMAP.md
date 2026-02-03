# Cortana Enhancement Roadmap

**Date:** October 24, 2025
**Current Status:** Auto-vectorization system operational, fixes applied for intent classification and RAG responses

---

## ✅ COMPLETED FEATURES

### Phase 1: Core Infrastructure
- FastAPI backend with async support
- PostgreSQL database with comprehensive schema
- RESTful API endpoints
- User authentication system

### Phase 2: Finance Agent
- Expense tracking with natural language parsing
- Budget monitoring with category goals
- Spending analysis and reports
- Auto-vectorization on expense logging ✨

### Phase 3: Fitness Agent
- Gym profile onboarding
- Template-based workout program generation
- Workout schedule viewing (daily/weekly)
- Injury-aware exercise recommendations
- Auto-vectorization on workout logging ✨

### Phase 4: News Agent
- RSS aggregation from Lebanese and international sources
- Category-based filtering
- Daily news briefings (8 AM)
- AI-powered summarization

### Phase 5: RAG System
- FAISS vector store for general knowledge
- Personal context layer for user-specific data
- Dual-layer retrieval prioritizing personal data
- Progress query detection for concise responses ✨

### Phase 6: AI Intent Classification
- 7 intent types with 95% accuracy
- Natural language routing to appropriate agents
- Separates expense logging from spending analysis ✨

### Phase 7: Scheduler System
- Daily expense reminders (8 PM)
- Daily news briefings (8 AM)
- Weekly financial summary (Sunday 6 PM)
- Weekly workout summary (Sunday 7 PM)
- Weekly progress summary (Sunday 10 AM) ✨
- Gym workout reminders
- Weekly weigh-in reminders

---

## 🚀 ENHANCEMENT PRIORITIES

### Priority 1: More Auto-Vectorization Triggers (1-2 hours) 🔥
**Status:** NEXT UP
**Value:** Makes personal context comprehensive and always up-to-date

#### Triggers to Add:
1. **Weight Logging Auto-Vectorization**
   - Trigger when weight/body comp is logged
   - Update progress reports automatically
   - **File:** `routes/health.py` (weight logging endpoint)

2. **Workout Plan Generation Auto-Vectorization**
   - When new 4-week program is created
   - Vectorize the plan for RAG queries
   - **File:** `services/workout_program_generator.py`

3. **Budget Update Auto-Vectorization**
   - When budget limits or category goals are set/updated
   - Keep financial context current
   - **File:** `routes/budget.py`

4. **Daily Consolidation Job**
   - Runs at midnight
   - Consolidates all changes from the day
   - Regenerates all summaries
   - **File:** New `services/daily_consolidation_service.py`

#### Implementation Steps:
```python
# 1. Weight logging (routes/health.py)
from services.personal_context_service import PersonalContextService

# After weight log is created:
personal_context = PersonalContextService(db, user_id)
personal_context.vectorize_weight_log(weight_log)
personal_context.generate_progress_report()

# 2. Workout plan generation (services/workout_program_generator.py)
# After creating 4-week plan:
personal_context.vectorize_workout_plan(workout_plan)

# 3. Budget updates (routes/budget.py)
# After budget/goal update:
personal_context.vectorize_budget_context(budget)

# 4. Daily consolidation (new scheduler job)
def daily_consolidation():
    # Run at midnight
    for user in active_users:
        personal_context = PersonalContextService(db, user.id)
        personal_context.consolidate_daily_changes()
```

---

### Priority 2: Enhanced Weekly Summary (1 hour) 📊
**Status:** Pending
**Value:** Makes Sunday summary truly insightful and actionable

#### Enhancements:
1. **Spending vs. Budget Comparison**
   ```
   💰 **Financial Health:**
   - Week spending: $250 / $350 budget (71% - On track!)
   - Biggest category: Food $120 (48%)
   - Savings this week: $100
   - vs. Last week: -15% (Good job!)
   ```

2. **Workout Consistency Trends**
   ```
   💪 **Workout Consistency:**
   - This week: 3/4 workouts (75%)
   - Last week: 2/4 workouts (50%)
   - Trend: ↗️ +25% improvement!
   - Streak: 2 weeks consistent
   ```

3. **Goal Progress Tracking**
   ```
   🎯 **Goal Progress:**
   - Weight loss: -2 lbs this month (Target: -8 lbs total)
   - On track to reach goal by: December 15
   - Days until goal: 52 days
   ```

4. **Motivational Messages**
   - Based on performance: Amazing/Great/Good/NeedsWork
   - Personalized to user's actual data
   - Encouraging without being pushy

5. **Actionable Suggestions**
   ```
   💡 **Suggestions for Next Week:**
   - You're close to your food budget limit. Try meal prepping!
   - You missed Friday's workout twice this month. Set a reminder?
   - Great consistency! Consider increasing weights next week.
   ```

#### Implementation:
**File:** `services/scheduler_service.py:459-529` (weekly_progress_summary method)

---

### Priority 3: Proactive Notifications (1-2 hours) 🔔
**Status:** Pending
**Value:** System actively helps user stay on track

#### Notification Types:

1. **Workout Reminder Anomaly**
   - Detects: User usually works out Monday, but hasn't logged it yet
   - Trigger: 8 PM on workout day if no log
   - Message: "Hey Chief! I noticed you haven't logged Monday's workout yet. Everything okay? 💪"

2. **Spending Anomaly**
   - Detects: 20%+ increase in category spending vs. average
   - Trigger: Real-time after expense
   - Message: "⚠️ Heads up: You're spending 25% more on food this week than usual ($150 vs. $120 average)"

3. **Goal Milestone**
   - Detects: User on track to hit goal soon
   - Trigger: Weekly check
   - Message: "🎉 You're crushing it! On track to hit your weight loss goal by Dec 15. Keep it up!"

4. **Reminder Nudge**
   - Detects: 3+ days without expense logging
   - Trigger: Daily check at 9 PM
   - Message: "It's been 3 days since you logged expenses. Don't forget to track your spending! 📊"

5. **Consistency Praise**
   - Detects: User hit workout goal for 2+ weeks straight
   - Trigger: Weekly check
   - Message: "🔥 TWO WEEKS of hitting your workout goal! Your consistency is incredible, Chief!"

#### Implementation:
```python
# services/proactive_notifications_service.py
class ProactiveNotifications:
    def __init__(self, db: Session):
        self.db = db

    def check_workout_anomalies(self, user_id: int):
        # Get user's typical workout days
        # Check if today is a workout day
        # Check if workout logged
        # Send notification if not

    def check_spending_anomalies(self, user_id: int, category: str, amount: float):
        # Get average spending for category
        # Compare with current week
        # If >20% increase, send alert

    def check_goal_progress(self, user_id: int):
        # Calculate trajectory
        # Estimate completion date
        # Send milestone notifications

    def check_logging_consistency(self, user_id: int):
        # Check last expense log date
        # If >3 days, send reminder

# Add to scheduler (runs daily at 9 PM)
def daily_proactive_checks():
    notification_service = ProactiveNotifications(db)
    for user in active_users:
        notification_service.check_workout_anomalies(user.id)
        notification_service.check_logging_consistency(user.id)
        notification_service.check_goal_progress(user.id)
```

---

### Priority 4: Additional Auto-Vectorization Enhancements (30 min) ⚡
**Status:** Pending
**Value:** Improve vectorization quality and speed

#### Enhancements:
1. **Batch Vectorization**
   - Instead of vectorizing one item at a time
   - Batch multiple logs together
   - Faster and more efficient

2. **Selective Vectorization**
   - Only re-vectorize changed data
   - Cache embeddings when possible
   - Reduce redundant processing

3. **Vectorization Queue**
   - Async queue for vectorization tasks
   - Don't block user requests
   - Process in background

4. **Error Recovery**
   - Retry failed vectorizations
   - Log errors for debugging
   - Fallback to manual regeneration

---

### Priority 5: Meal Logging Intent (2 hours) 🍽️
**Status:** Future Enhancement
**Value:** Expands system capabilities, shows multi-domain coordination

#### Features:
1. **New Intent: meal_logging**
   ```python
   # Add to intent_classifier.py
   IntentType = Literal[
       ...,
       "meal_logging",  # "I ate chicken and rice for lunch"
   ]
   ```

2. **Meal Parser**
   - Extract meal details with AI
   - Parse foods, portions, meal type
   - Estimate calories/macros

3. **Meal Database Model**
   ```python
   class MealLog(Base):
       __tablename__ = "meal_logs"
       id = Column(Integer, primary_key=True)
       user_id = Column(Integer, ForeignKey("users.id"))
       meal_type = Column(Enum("breakfast", "lunch", "dinner", "snack"))
       foods = Column(JSON)  # List of foods
       estimated_calories = Column(Float)
       estimated_protein = Column(Float)
       meal_time = Column(DateTime)
   ```

4. **Meal Auto-Vectorization**
   - Vectorize after each meal log
   - Enable nutrition RAG queries
   - "What did I eat yesterday?"
   - "Am I eating enough protein?"

---

### Priority 6: Dashboard/Visualization (3 hours) 📈
**Status:** Future Enhancement
**Value:** Visual representation of data

#### Features:
1. **Spending Breakdown** - Pie chart by category
2. **Workout Consistency** - Heatmap calendar
3. **Weight Progress** - Line chart over time
4. **Budget vs. Actual** - Bar charts

#### Tech Stack:
- FastAPI static file serving
- Simple HTML/CSS/JS
- Chart.js for visualizations
- Mobile-responsive design

---

### Priority 7: Voice Command Optimization (1 hour) 🎤
**Status:** Future Enhancement
**Value:** Better UX for voice users

#### Enhancements:
1. Test voice transcription quality
2. Optimize prompts for spoken language
3. Handle filler words ("um", "uh")
4. Support casual phrasing

---

### Priority 8: Error Handling & Recovery (1 hour) 🛡️
**Status:** Future Enhancement
**Value:** System robustness

#### Improvements:
1. Retry logic for failed vectorizations
2. Better error messages for users
3. Fallback responses when AI fails
4. Comprehensive logging

---

## 📋 IMMEDIATE ACTION ITEMS

1. **Restart Server** - Apply fixes for intent classification and RAG
2. **Test Fixes:**
   - "Am I overspending?" → Should analyze, not log
   - "How's my workout progress?" → Should be concise, no exercise instructions
3. **Implement Priority 1** - More auto-vectorization triggers
4. **Implement Priority 2** - Enhanced weekly summary
5. **Implement Priority 3** - Proactive notifications

---

## 📊 PROJECT METRICS

### Current State:
- **Total Lines of Code:** ~8,000+
- **API Endpoints:** 40+
- **Database Tables:** 15+
- **AI Models Integrated:** 3 (Groq, Ollama, Gemini)
- **Intent Types:** 7
- **Scheduled Jobs:** 7
- **Auto-Vectorization Triggers:** 2 (expenses, workouts)

### Target State (After Enhancements):
- **Auto-Vectorization Triggers:** 6 (expenses, workouts, weight, plans, budgets, daily consolidation)
- **Proactive Notifications:** 5 types
- **Intent Types:** 8 (adding meal_logging)
- **Enhanced Summaries:** 3x more insightful

---

## 🎯 SUCCESS METRICS

1. **User Engagement:**
   - Daily active usage
   - Expense logging frequency
   - Workout logging frequency

2. **System Performance:**
   - RAG response time <2s
   - Vectorization time <5s
   - Intent classification accuracy >95%

3. **Value Delivered:**
   - Users reporting better fitness progress
   - Users reporting better financial awareness
   - Users finding proactive notifications helpful

---

## 🔮 FUTURE VISION (3-6 months)

1. **Mobile App** - Flutter cross-platform
2. **Wearable Integration** - Fitbit, Apple Watch
3. **Bank Account Linking** - Automatic expense tracking
4. **Social Features** - Workout buddies, challenges
5. **Advanced Analytics** - Predictive insights
6. **Multi-Language Support** - Arabic, French
7. **Family Accounts** - Shared budgets, family goals

---

**Ready to start with Priority 1 (More Auto-Vectorization Triggers)?**
