"""
Create sample workout data for user_id = 1
"""
import requests
import json

API_BASE = "http://localhost:8000"

# Step 1: Create gym profile
profile_data = {
    "weight": 75.0,
    "height": 175.0,
    "experience_level": "intermediate",
    "primary_goal": "muscle_gain",
    "training_days_per_week": 4,
    "equipment_access": "full_gym",
    "training_split": "push_pull_legs",
    "preferred_time": "morning",
    "injuries_notes": None
}

print("Creating gym profile for user_id=1...")
response = requests.post(
    f"{API_BASE}/health/profile?user_id=1",
    json=profile_data
)

if response.status_code == 200:
    print("[OK] Gym profile created successfully!")
    print(json.dumps(response.json(), indent=2))
else:
    print(f"[FAIL] Failed to create profile: {response.status_code}")
    print(response.text)
    exit(1)

# Step 2: Generate workout plans
print("\nGenerating 4-week workout plan...")
response = requests.post(f"{API_BASE}/health/workout-plan/generate/1?weeks=4")

if response.status_code == 200:
    print("[OK] Workout plans generated successfully!")
    print(json.dumps(response.json(), indent=2))
else:
    print(f"[FAIL] Failed to generate workout plans: {response.status_code}")
    print(response.text)
    exit(1)

# Step 3: Get current week workouts to verify
print("\nFetching current week workouts...")
response = requests.get(f"{API_BASE}/health/workout-plan/current/1")

if response.status_code == 200:
    data = response.json()
    print(f"[OK] Found {data['total_workouts']} workouts for this week!")
    for workout in data['workouts']:
        print(f"  - {workout['day_of_week']}: {workout['muscle_group']} ({len(workout['exercises'])} exercises)")
else:
    print(f"[FAIL] Failed to fetch workouts: {response.status_code}")
    print(response.text)

print("\n[SUCCESS] Sample data created successfully! You can now view it in the Health Dashboard at http://localhost:3001/health")
