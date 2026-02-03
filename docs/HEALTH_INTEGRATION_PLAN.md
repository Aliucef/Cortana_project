# Health Dashboard Integration & AI Plan

## Current State

### Frontend Pages (Completed)
1. **Main Health Page** (`/health`) - Overview with stats cards and timer
2. **Workouts Page** (`/health/workouts`) - Weekly workout schedule
3. **Library Page** (`/health/library`) - Exercise library with filters
4. **History Page** (`/health/history`) - Workout history with search/filter
5. **Create Page** (`/health/create`) - Custom workout builder + templates
6. **Goals Page** (`/health/goals`) - Fitness goals (weight, frequency, strength)
7. **Progress Page** (`/health/progress`) - PRs, measurements, calendar, notes
8. **Rest Page** (`/health/rest`) - Rest day scheduler + recovery activities

### Backend Status
- **Database Models**: `WorkoutPlan`, `WorkoutLog`, `WorkoutGoal` exist
- **API Routes**: Basic CRUD in `/cortana/routes/health.py`
- **Services**: `workout_program_generator.py` exists with AI capabilities
- **Agent**: Health agent has conversational interface

---

## Phase 1: Backend Integration (Data Flow)

### 1.1 Database Schema Review & Updates

**Current Models** (in `/cortana/models/health.py`):
```python
- WorkoutPlan (id, user_id, day_of_week, muscle_group, exercises, created_at)
- WorkoutLog (id, user_id, workout_plan_id, exercise_name, sets, reps, weight, duration_minutes, logged_at, notes)
- WorkoutGoal (id, user_id, goal_type, target_value, current_value, deadline, created_at)
```

**New Models Needed**:
```python
# Personal Records
PersonalRecord:
  - id, user_id, exercise_name, max_weight, max_reps, date, type (weight/reps)

# Body Measurements
BodyMeasurement:
  - id, user_id, date, weight, body_fat, chest, waist, hips, arms, legs

# Workout Notes
WorkoutNote:
  - id, user_id, date, workout_name, note, difficulty, energy, tags (JSON)

# Rest Days
RestDay:
  - id, user_id, date, is_scheduled, recovery_activities (JSON)

# Exercise Library (pre-populated)
Exercise:
  - id, name, category, equipment, difficulty, primary_muscles (JSON),
    secondary_muscles (JSON), instructions

# Workout Templates
WorkoutTemplate:
  - id, name, description, difficulty, frequency, split, duration,
    goal, workouts (JSON), is_system (bool)
```

### 1.2 API Endpoints Needed

**Stats & Overview** (`GET /health/stats/{user_id}`):
```json
{
  "totalWorkouts": 142,
  "currentStreak": 7,
  "completedThisWeek": 4,
  "totalThisWeek": 6,
  "currentWeight": 75.5,
  "weightChange": -2.5
}
```

**Workouts**:
- `GET /health/workouts/current-week/{user_id}` - Get this week's workouts
- `POST /health/workouts` - Create custom workout
- `PUT /health/workouts/{id}` - Update workout
- `DELETE /health/workouts/{id}` - Delete workout
- `POST /health/workouts/{id}/complete` - Mark complete
- `POST /health/workouts/log` - Log workout session

**Exercise Library**:
- `GET /health/exercises` - Get all exercises (with filters)
- `GET /health/exercises/{id}` - Get exercise details
- `POST /health/exercises/favorite/{user_id}` - Toggle favorite

**History**:
- `GET /health/history/{user_id}` - Get workout history (paginated, filtered)
- `GET /health/history/{log_id}` - Get specific workout log details
- `DELETE /health/history/{log_id}` - Delete workout log

**Templates**:
- `GET /health/templates` - Get all workout templates
- `GET /health/templates/{id}` - Get template details
- `POST /health/templates/apply/{user_id}` - Apply template to user's schedule

**Goals**:
- `GET /health/goals/{user_id}` - Get all goals
- `POST /health/goals` - Create new goal
- `PUT /health/goals/{id}` - Update goal progress
- `DELETE /health/goals/{id}` - Delete goal

**Personal Records**:
- `GET /health/records/{user_id}` - Get all PRs
- `POST /health/records` - Add new PR
- `DELETE /health/records/{id}` - Delete PR

**Body Measurements**:
- `GET /health/measurements/{user_id}` - Get all measurements
- `POST /health/measurements` - Add new measurement
- `GET /health/measurements/latest/{user_id}` - Get latest measurement

**Calendar**:
- `GET /health/calendar/{user_id}?month=1&year=2024` - Get calendar data

**Workout Notes**:
- `GET /health/notes/{user_id}` - Get all workout notes
- `POST /health/notes` - Add new note
- `DELETE /health/notes/{id}` - Delete note

**Rest Days**:
- `GET /health/rest-days/{user_id}` - Get all rest days
- `POST /health/rest-days` - Schedule rest day
- `DELETE /health/rest-days/{id}` - Remove rest day

---

## Phase 2: AI Integration Opportunities

### 2.1 Current AI Capabilities

**Existing** (`workout_program_generator.py`):
- Uses Ollama (Llama 3.1) for workout program generation
- Natural language input for workout preferences
- Generates structured workout plans with exercises

### 2.2 AI Enhancement Features

#### **Feature 1: Intelligent Workout Planning**
**Location**: Create page + Workouts page
**AI Task**: Generate personalized workout plans based on:
- User goals (weight loss, muscle gain, strength)
- Available equipment
- Fitness level
- Time availability
- Previous workout history

**Implementation**:
```python
# /health/ai/generate-plan
POST {
  "user_id": 1,
  "goals": ["muscle gain", "upper body focus"],
  "equipment": ["barbell", "dumbbells", "bench"],
  "fitness_level": "intermediate",
  "days_per_week": 5,
  "duration_per_session": 60
}

# AI generates personalized 5-day split with exercises
```

#### **Feature 2: Exercise Form & Technique Tips**
**Location**: Library page
**AI Task**: Provide detailed form cues and common mistakes for each exercise

**Implementation**:
```python
# When user views exercise detail, AI generates:
- Step-by-step form breakdown
- Common mistakes to avoid
- Progression tips
- Alternative exercises
```

#### **Feature 3: Workout Log Analysis & Insights**
**Location**: History page + Progress page
**AI Task**: Analyze workout logs and provide insights

**Implementation**:
```python
# /health/ai/analyze-progress
POST {
  "user_id": 1,
  "date_range": "last_30_days"
}

# AI analyzes:
- Volume trends (sets x reps x weight)
- Muscle group balance
- Recovery patterns
- Strength progression
- Potential overtraining signs

# Returns insights like:
- "Your chest volume has increased 25% this month"
- "Consider adding more back work to balance push/pull ratio"
- "You've been consistent with 5 workouts/week - great job!"
```

#### **Feature 4: Smart Goal Suggestions**
**Location**: Goals page
**AI Task**: Suggest realistic goals based on user's current progress

**Implementation**:
```python
# /health/ai/suggest-goals
POST {
  "user_id": 1,
  "current_stats": {
    "bench_press_max": 100,
    "weight": 75,
    "body_fat": 18
  }
}

# AI suggests:
- "Based on your progression, aim for 110kg bench press in 8 weeks"
- "Your weight loss rate is healthy at -0.5kg/week"
```

#### **Feature 5: Conversational Workout Assistant**
**Location**: All pages (chat widget)
**AI Task**: Answer fitness questions and provide guidance

**Implementation**:
- Floating chat button on all health pages
- Ask questions like:
  - "What exercises target lower chest?"
  - "How do I fix my squat form?"
  - "What's a good warmup for deadlifts?"
  - "Am I overtraining?"

#### **Feature 6: Automatic Workout Logging (Voice/Text)**
**Location**: Workouts page
**AI Task**: Parse natural language workout logs

**Implementation**:
```python
# User says/types: "Did 4 sets of 10 reps bench press at 80kg"
# AI extracts:
{
  "exercise": "Bench Press",
  "sets": 4,
  "reps": 10,
  "weight": 80
}
```

#### **Feature 7: Recovery & Rest Day Recommendations**
**Location**: Rest page
**AI Task**: Suggest when to take rest days based on workout load

**Implementation**:
```python
# Analyzes:
- Workout frequency
- Volume per muscle group
- Workout difficulty ratings
- Energy levels from notes

# Recommends:
- "Consider taking a rest day tomorrow - you've trained 5 consecutive days"
- "Your legs might need an extra day - high volume this week"
```

#### **Feature 8: Nutrition Integration (Future)**
**AI Task**: Suggest meal timing and macros based on workouts
- Pre-workout nutrition
- Post-workout meals
- Daily calorie targets based on goals

---

## Phase 3: Implementation Roadmap

### **Step 1: Database Setup** (Week 1)
- [ ] Create migration script for new models
- [ ] Add models to SQLAlchemy
- [ ] Populate exercise library with comprehensive data
- [ ] Add 5 system workout templates (PPL, Upper/Lower, etc.)
- [ ] Run migrations on database

### **Step 2: Core API Development** (Week 1-2)
- [ ] Implement all CRUD endpoints for each model
- [ ] Add pagination, filtering, sorting
- [ ] Input validation with Pydantic
- [ ] Error handling
- [ ] Test all endpoints

### **Step 3: Frontend Integration** (Week 2-3)
- [ ] Update `lib/health-api.ts` with all API functions
- [ ] Replace mock data with real API calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success/error notifications
- [ ] Test data flow end-to-end

### **Step 4: AI Service Setup** (Week 3)
- [ ] Extend `workout_program_generator.py`
- [ ] Add new AI service: `health_ai_assistant.py`
- [ ] Create AI endpoints in `/health/ai/*`
- [ ] Integrate Ollama model calls
- [ ] Add prompt templates for each AI feature

### **Step 5: AI Feature Integration** (Week 4-5)
Priority order:
1. **Intelligent Workout Planning** (Create page)
2. **Workout Log Analysis** (Progress page)
3. **Conversational Assistant** (Global chat widget)
4. **Smart Goal Suggestions** (Goals page)
5. **Exercise Form Tips** (Library page)
6. **Natural Language Logging** (Workouts page)
7. **Rest Day Recommendations** (Rest page)

### **Step 6: Testing & Refinement** (Week 6)
- [ ] End-to-end testing
- [ ] AI prompt optimization
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] UI/UX refinements

---

## Technical Architecture

### Data Flow Example (Logging a Workout)

```
Frontend (Workouts Page)
    ↓ User clicks "Log Workout"
    ↓ Opens workout log modal
    ↓ Enters: Sets, Reps, Weight for each exercise
    ↓
POST /health/workouts/log
    ↓
Backend (FastAPI)
    ↓ Validates input
    ↓ Creates WorkoutLog records
    ↓ Updates personal records if new PR
    ↓ Updates workout stats
    ↓ Marks WorkoutPlan as completed
    ↓
Database (PostgreSQL)
    ↓ Saves all data
    ↓
Response
    ↓ Returns updated stats
    ↓
Frontend
    ↓ Updates UI with new data
    ↓ Shows "Workout logged!" notification
    ↓ If PR: Shows celebration modal
```

### AI Flow Example (Generate Workout Plan)

```
Frontend (Create Page)
    ↓ User clicks "Generate AI Plan"
    ↓ Fills form: goals, equipment, days/week
    ↓
POST /health/ai/generate-plan
    ↓
Backend (health_ai_assistant.py)
    ↓ Fetches user's workout history
    ↓ Fetches user's current stats
    ↓ Builds context for AI
    ↓
Ollama (Llama 3.1)
    ↓ Receives prompt with context
    ↓ Generates structured workout plan
    ↓
Backend
    ↓ Parses AI response
    ↓ Validates exercises exist in library
    ↓ Creates WorkoutPlan records
    ↓
Database
    ↓ Saves generated workouts
    ↓
Frontend
    ↓ Shows generated plan
    ↓ User can review/edit before confirming
```

---

## AI Prompt Templates

### Workout Plan Generation
```
You are a professional fitness trainer. Generate a {days_per_week}-day workout plan.

User Profile:
- Goals: {goals}
- Fitness Level: {fitness_level}
- Available Equipment: {equipment}
- Session Duration: {duration} minutes
- Recent Workouts: {recent_history}

Provide a structured weekly plan with:
- Day name (e.g., "Push Day - Chest & Triceps")
- 5-8 exercises per day
- Sets and rep ranges
- Rest periods

Format as JSON:
{
  "workouts": [
    {
      "day": "Monday",
      "name": "Push Day - Chest & Triceps",
      "muscle_group": "Chest, Triceps",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest": 120
        }
      ]
    }
  ]
}
```

### Progress Analysis
```
Analyze this user's workout data from the past {days} days.

Workout Logs: {logs}
Goals: {goals}
Current Stats: {stats}

Provide:
1. Key achievements (2-3 bullet points)
2. Areas for improvement (1-2 bullet points)
3. Specific recommendation (1 actionable item)

Keep it motivating and concise.
```

---

## Questions to Discuss

1. **Database Priority**: Should we implement all new models at once or phase them?
2. **AI Model Choice**: Continue with Ollama/Llama or explore alternatives (OpenAI, Claude API)?
3. **Caching Strategy**: How should we cache AI responses to reduce latency?
4. **Exercise Library**: Manually curate or use external API (e.g., ExerciseDB)?
5. **Real-time Updates**: Do we need WebSockets for live workout tracking?
6. **Mobile Considerations**: Plan for responsive design or separate mobile app later?
7. **Data Privacy**: How to handle sensitive health data (weight, body measurements)?
8. **Offline Support**: Should workouts be loggable offline with sync later?

---

## Success Metrics

### Backend Integration
- ✅ All 8 pages fully connected to backend
- ✅ Sub-200ms response times for most endpoints
- ✅ Zero data loss on workout logs
- ✅ Proper error handling and validation

### AI Integration
- ✅ AI workout plans generate in <10 seconds
- ✅ 90%+ accuracy on natural language parsing
- ✅ Users find AI insights helpful (feedback survey)
- ✅ Chat assistant answers 80%+ questions correctly

---

## Next Steps

**Immediate Actions**:
1. Review this plan together
2. Decide on AI model (Ollama vs API-based)
3. Start with database migrations
4. Build core API endpoints
5. Test with one page (Workouts) before expanding

**Questions for You**:
- Do you want to use the existing Ollama setup or integrate with OpenAI/Claude API?
- Should we prioritize backend integration first, then AI? Or do both in parallel?
- Which AI feature excites you most? (We can start with that)
