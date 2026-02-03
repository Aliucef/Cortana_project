# Health Dashboard Backend Integration - Mini Map

## Status: Database ✅ | API Routes ✅ | Data Population 🚧 | Frontend Connection ⏳

---

## Phase 1: Data Population (Now)

### Task 1: Populate Exercise Library ⏳
**Priority**: HIGH - Foundation for everything
**File**: `cortana/scripts/populate_exercises.py`
- Add 50-60 essential exercises
- Categories: Strength (chest, back, shoulders, legs, arms, core)
- Include: name, category, equipment, difficulty, muscles, instructions
- **Estimated**: 30-40 exercises is enough to start

### Task 2: Add Workout Templates ⏳
**Priority**: HIGH - Needed for Create page
**File**: `cortana/scripts/populate_templates.py`
- Template 1: Push/Pull/Legs (6 days)
- Template 2: Upper/Lower (4 days)
- Template 3: Full Body (3 days)
- **Estimated**: 3 templates is enough to start

### Task 3: Test API Endpoints ⏳
**Priority**: HIGH - Verify backend works
- Test GET /health/exercises (should return populated data)
- Test GET /health/templates (should return 3 templates)
- Test GET /health/stats/1 (should return user stats)
- Test POST /health/records (add a personal record)

---

## Phase 2: Frontend Connection (Next)

### Task 4: Update Frontend API Client ⏳
**Priority**: HIGH
**File**: `cortana-dashboard/lib/health-api.ts`
- Create API base URL constant
- Add functions for all 19 endpoints
- Add TypeScript types for requests/responses
- Add error handling

### Task 5: Connect Progress Page (First Page) ⏳
**Priority**: HIGH - Test with simplest page first
**File**: `cortana-dashboard/app/health/progress/page.tsx`
- Replace mock personal records with real API
- Replace mock measurements with real API
- Test CRUD operations (add, delete)
- Verify data persistence

### Task 6: Connect Library Page ⏳
**Priority**: MEDIUM
**File**: `cortana-dashboard/app/health/library/page.tsx`
- Fetch exercises from /health/exercises
- Test filters (category, equipment, difficulty)
- Test search functionality

### Task 7: Connect Create Page ⏳
**Priority**: MEDIUM
**File**: `cortana-dashboard/app/health/create/page.tsx`
- Fetch templates from /health/templates
- Test template application
- Test custom workout creation

### Task 8: Connect Remaining Pages ⏳
**Priority**: LOW - Do after above works
- Workouts page
- History page
- Goals page
- Rest page
- Main Health page (dashboard)

---

## Recommended Order:

1. **Populate Exercise Library** (15 min) - Add 30-40 exercises
2. **Add Workout Templates** (10 min) - Add 3 basic templates
3. **Test API with cURL** (5 min) - Verify data is accessible
4. **Update Frontend API Client** (10 min) - Create TypeScript API functions
5. **Connect Progress Page** (15 min) - First end-to-end test
6. **Connect Library Page** (10 min) - Test with real exercise data
7. **Connect Create Page** (10 min) - Test template system

**Total Estimated Time**: ~75 minutes for full integration

---

## Success Criteria:

- ✅ Exercise library has 30+ exercises
- ✅ 3 workout templates available
- ✅ All API endpoints return valid data
- ✅ At least 2 pages fully connected and working
- ✅ User can view exercises, add PRs, and see measurements
- ✅ No console errors in frontend
- ✅ Data persists across page refreshes

---

## Notes:

- **Start with quality over quantity**: 30-40 good exercises > 100 mediocre ones
- **Test incrementally**: Don't write all API functions at once
- **Use existing data structures**: Match frontend mock data structure for easier migration
- **Focus on core features first**: PRs, measurements, exercises, templates
