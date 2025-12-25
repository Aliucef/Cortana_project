"""
Health & Gym Agent - Interactive Personal Trainer
Handles gym onboarding, workout planning, progress tracking, and motivation
"""

from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Tuple
import logging
from models.workout import (
    UserGymProfile, WorkoutPlan, WorkoutLog, WeightLog, GymSchedule,
    WorkoutGoal, ExperienceLevel, EquipmentAccess, TrainingSplit, PreferredTime
)
from models.user import User

logger = logging.getLogger(__name__)


class OnboardingState:
    """Tracks user's progress through the onboarding flow"""

    # Onboarding steps in order
    STEPS = [
        "START",
        "WEIGHT_HEIGHT",
        "EXPERIENCE",
        "GOAL",
        "TRAINING_DAYS",
        "EQUIPMENT",
        "INJURIES",
        "PREFERRED_TIME",
        "SPLIT_SELECTION",
        "CONFIRMATION",
        "COMPLETED"
    ]

    def __init__(self, user_id: int):
        self.user_id = user_id
        self.current_step = "START"
        self.data = {}  # Stores answers during onboarding

    def next_step(self):
        """Move to next step in onboarding"""
        current_index = self.STEPS.index(self.current_step)
        if current_index < len(self.STEPS) - 1:
            self.current_step = self.STEPS[current_index + 1]

    def is_complete(self) -> bool:
        return self.current_step == "COMPLETED"


class HealthAgent:
    """
    Interactive Personal Trainer Agent

    Features:
    - Conversational onboarding flow
    - Personalized workout program generation
    - Progress tracking & analytics
    - Proactive reminders & motivation
    - Weekly weight check-ins
    """

    # Class variable to persist onboarding states across all instances
    onboarding_states: Dict[int, OnboardingState] = {}  # user_id -> state

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def start_onboarding(self) -> str:
        """Initialize onboarding flow for a user"""
        # Check if user already has a profile
        existing_profile = self.db.query(UserGymProfile).filter(
            UserGymProfile.user_id == self.user_id
        ).first()

        if existing_profile and existing_profile.onboarding_completed:
            return (
                "Hey Chief! 💪 Looks like you already have a gym profile set up!\n\n"
                f"📊 **Current Profile:**\n"
                f"• Goal: {existing_profile.primary_goal.value.replace('_', ' ').title()}\n"
                f"• Experience: {existing_profile.experience_level.value.title()}\n"
                f"• Training Days: {existing_profile.training_days_per_week} days/week\n"
                f"• Split: {existing_profile.training_split.value.replace('_', ' ').title()}\n\n"
                "Want to restart onboarding and create a new profile? Reply 'restart gym profile'"
            )

        # Initialize new onboarding state
        state = OnboardingState(self.user_id)
        self.onboarding_states[self.user_id] = state
        state.next_step()  # Move to WEIGHT_HEIGHT

        return (
            "🏋️ **Welcome to Gym Onboarding, Chief!**\n\n"
            "I'm going to ask you a few questions to build your perfect workout program. "
            "This will take about 2-3 minutes.\n\n"
            "Let's start! 💪\n\n"
            "**Question 1/8:** What's your current weight and height?\n"
            "_(Example: 75kg, 180cm or 165 lbs, 5'11\")_"
        )

    def process_onboarding_answer(self, user_input: str) -> str:
        """Process user's answer based on current onboarding step"""
        state = self.onboarding_states.get(self.user_id)

        if not state:
            return "It looks like you haven't started onboarding yet. Send 'start gym onboarding' to begin!"

        if state.is_complete():
            return "Your onboarding is already complete! Want to view your profile? Ask 'show my gym profile'"

        # Check for cancel keywords - allow users to exit onboarding
        cancel_keywords = ['exit', 'quit', 'cancel', 'stop', 'abort', 'nevermind', 'none']
        if user_input.lower().strip() in cancel_keywords:
            del self.onboarding_states[self.user_id]
            return (
                "❌ Onboarding cancelled.\n\n"
                "No worries! If you want to start again later, just say:\n"
                "'start gym onboarding' or 'gym setup'"
            )

        # Route to appropriate handler based on current step
        handlers = {
            "WEIGHT_HEIGHT": self._handle_weight_height,
            "EXPERIENCE": self._handle_experience,
            "GOAL": self._handle_goal,
            "TRAINING_DAYS": self._handle_training_days,
            "EQUIPMENT": self._handle_equipment,
            "INJURIES": self._handle_injuries,
            "PREFERRED_TIME": self._handle_preferred_time,
            "SPLIT_SELECTION": self._handle_split_selection,
            "CONFIRMATION": self._handle_confirmation,
        }

        handler = handlers.get(state.current_step)
        if handler:
            return handler(user_input, state)

        return "Something went wrong with onboarding. Let's restart. Send 'start gym onboarding'"

    def _handle_weight_height(self, user_input: str, state: OnboardingState) -> str:
        """Parse weight and height from user input"""
        import re

        # FIXED: Search for weight and height separately by units, not by position
        # Weight patterns: Look for numbers followed by kg/lbs/pounds
        weight_match = re.search(r'(\d+\.?\d*)\s*(kg|lbs?|pounds?)', user_input.lower())

        # Height patterns: Look for numbers followed by cm/centimeters OR feet'inches format
        height_cm_match = re.search(r'(\d+\.?\d*)\s*(cm|centimeters?)', user_input.lower())
        height_ft_match = re.search(r'(\d+)[\'′](\d+)', user_input.lower())

        # Validation
        if not weight_match:
            return (
                "I couldn't find a weight with units in your message.\n"
                "Please tell me your weight (e.g., **85kg** or **165 lbs**)"
            )

        if not height_cm_match and not height_ft_match:
            return (
                "I couldn't find a height with units in your message.\n"
                "Please tell me your height (e.g., **182cm** or **5'11**)"
            )

        # Parse weight
        weight_value = float(weight_match.group(1))
        weight_unit = weight_match.group(2)

        # Convert lbs to kg if needed
        if "lb" in weight_unit or "pound" in weight_unit:
            weight_kg = weight_value * 0.453592
        else:
            weight_kg = weight_value

        # Parse height
        if height_ft_match:  # Feet and inches format (e.g., 5'11)
            feet = int(height_ft_match.group(1))
            inches = int(height_ft_match.group(2))
            height_cm = (feet * 12 + inches) * 2.54
        else:  # Centimeters format (e.g., 182cm)
            height_value = float(height_cm_match.group(1))
            height_cm = height_value

        # Calculate BMI
        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)

        # Store data
        state.data['weight'] = round(weight_kg, 1)
        state.data['height'] = round(height_cm, 1)
        state.data['bmi'] = round(bmi, 1)

        # BMI interpretation
        if bmi < 18.5:
            bmi_status = "underweight"
        elif bmi < 25:
            bmi_status = "normal weight"
        elif bmi < 30:
            bmi_status = "overweight"
        else:
            bmi_status = "obese"

        state.next_step()

        return (
            f"✅ Got it!\n"
            f"• Weight: {state.data['weight']}kg\n"
            f"• Height: {state.data['height']}cm\n"
            f"• BMI: {state.data['bmi']} ({bmi_status})\n\n"
            "**Question 2/8:** What's your gym experience level?\n\n"
            "1️⃣ **Beginner** (0-6 months of training)\n"
            "2️⃣ **Intermediate** (6 months - 2 years)\n"
            "3️⃣ **Advanced** (2+ years)\n\n"
            "_Reply with the number or name_"
        )

    def _handle_experience(self, user_input: str, state: OnboardingState) -> str:
        """Parse experience level"""
        input_lower = user_input.lower().strip()

        if "1" in input_lower or "beginner" in input_lower:
            state.data['experience_level'] = ExperienceLevel.BEGINNER
        elif "2" in input_lower or "intermediate" in input_lower:
            state.data['experience_level'] = ExperienceLevel.INTERMEDIATE
        elif "3" in input_lower or "advanced" in input_lower:
            state.data['experience_level'] = ExperienceLevel.ADVANCED
        else:
            return "Please choose 1 (Beginner), 2 (Intermediate), or 3 (Advanced)"

        state.next_step()

        return (
            f"✅ **{state.data['experience_level'].value.title()}** - Perfect!\n\n"
            "**Question 3/8:** What's your primary fitness goal?\n\n"
            "1️⃣ **Muscle Gain** (Bulk up, build mass)\n"
            "2️⃣ **Strength** (Lift heavier, get stronger)\n"
            "3️⃣ **Fat Loss** (Lean down, get shredded)\n"
            "4️⃣ **General Fitness** (Stay active, feel healthy)\n\n"
            "_Reply with the number or name_"
        )

    def _handle_goal(self, user_input: str, state: OnboardingState) -> str:
        """Parse primary goal"""
        input_lower = user_input.lower().strip()

        if "1" in input_lower or "muscle" in input_lower or "bulk" in input_lower:
            state.data['primary_goal'] = WorkoutGoal.MUSCLE_GAIN
        elif "2" in input_lower or "strength" in input_lower:
            state.data['primary_goal'] = WorkoutGoal.STRENGTH
        elif "3" in input_lower or "fat" in input_lower or "loss" in input_lower or "lean" in input_lower:
            state.data['primary_goal'] = WorkoutGoal.FAT_LOSS
        elif "4" in input_lower or "fitness" in input_lower or "general" in input_lower:
            state.data['primary_goal'] = WorkoutGoal.GENERAL_FITNESS
        else:
            return "Please choose 1 (Muscle Gain), 2 (Strength), 3 (Fat Loss), or 4 (General Fitness)"

        state.next_step()

        return (
            f"✅ **{state.data['primary_goal'].value.replace('_', ' ').title()}** - Let's crush it! 💪\n\n"
            "**Question 4/8:** How many days per week can you train?\n\n"
            "Choose between **3-6 days**\n"
            "_(More days = more volume & faster progress)_"
        )

    def _handle_training_days(self, user_input: str, state: OnboardingState) -> str:
        """Parse training days per week"""
        import re

        match = re.search(r'(\d+)', user_input)
        if not match:
            return "Please tell me a number between 3 and 6 days"

        days = int(match.group(1))

        if days < 3 or days > 6:
            return "Please choose between 3 and 6 days per week for optimal results"

        state.data['training_days_per_week'] = days
        state.next_step()

        return (
            f"✅ **{days} days/week** - Great commitment!\n\n"
            "**Question 5/8:** What equipment do you have access to?\n\n"
            "1️⃣ **Full Gym** (Barbells, machines, cables, everything)\n"
            "2️⃣ **Home Gym** (Dumbbells, bench, basic setup)\n"
            "3️⃣ **Minimal** (Bodyweight, resistance bands)\n\n"
            "_Reply with the number or name_"
        )

    def _handle_equipment(self, user_input: str, state: OnboardingState) -> str:
        """Parse equipment access"""
        input_lower = user_input.lower().strip()

        if "1" in input_lower or "full" in input_lower:
            state.data['equipment_access'] = EquipmentAccess.FULL_GYM
        elif "2" in input_lower or "home" in input_lower:
            state.data['equipment_access'] = EquipmentAccess.HOME_GYM
        elif "3" in input_lower or "minimal" in input_lower or "bodyweight" in input_lower:
            state.data['equipment_access'] = EquipmentAccess.MINIMAL
        else:
            return "Please choose 1 (Full Gym), 2 (Home Gym), or 3 (Minimal)"

        state.next_step()

        return (
            f"✅ **{state.data['equipment_access'].value.replace('_', ' ').title()}** - I'll build your program around that!\n\n"
            "**Question 6/8:** Do you have any injuries or limitations I should know about?\n\n"
            "_(e.g., \"bad knee\", \"shoulder issues\", \"lower back pain\")_\n"
            "If none, just say **'none'** or **'no'**"
        )

    def _handle_injuries(self, user_input: str, state: OnboardingState) -> str:
        """Parse injuries/limitations"""
        input_lower = user_input.lower().strip()

        if input_lower in ["none", "no", "nope", "nothing", "n/a", "na"]:
            state.data['injuries_notes'] = None
            injuries_msg = "✅ No injuries - Perfect!"
        else:
            state.data['injuries_notes'] = user_input
            injuries_msg = f"✅ Noted: {user_input}\nI'll adjust exercises accordingly."

        state.next_step()

        return (
            f"{injuries_msg}\n\n"
            "**Question 7/8:** When do you prefer to train?\n\n"
            "1️⃣ **Morning** (6am-10am)\n"
            "2️⃣ **Afternoon** (12pm-4pm)\n"
            "3️⃣ **Evening** (5pm-9pm)\n\n"
            "_Reply with the number or name_"
        )

    def _handle_preferred_time(self, user_input: str, state: OnboardingState) -> str:
        """Parse preferred training time"""
        input_lower = user_input.lower().strip()

        if "1" in input_lower or "morning" in input_lower:
            state.data['preferred_time'] = PreferredTime.MORNING
        elif "2" in input_lower or "afternoon" in input_lower:
            state.data['preferred_time'] = PreferredTime.AFTERNOON
        elif "3" in input_lower or "evening" in input_lower:
            state.data['preferred_time'] = PreferredTime.EVENING
        else:
            return "Please choose 1 (Morning), 2 (Afternoon), or 3 (Evening)"

        # Recommend training split based on training days
        days = state.data['training_days_per_week']

        if days == 3:
            recommended_split = TrainingSplit.FULL_BODY
            other_options = "Upper/Lower (2x per week)"
        elif days == 4:
            recommended_split = TrainingSplit.UPPER_LOWER
            other_options = "Full Body, Push/Pull/Legs"
        elif days == 5:
            recommended_split = TrainingSplit.PUSH_PULL_LEGS
            other_options = "Upper/Lower (with extra day), Bro Split"
        else:  # 6 days
            recommended_split = TrainingSplit.PUSH_PULL_LEGS
            other_options = "Bro Split (if you prefer)"

        state.data['recommended_split'] = recommended_split

        state.next_step()

        return (
            f"✅ **{state.data['preferred_time'].value.title()}** training - Got it!\n\n"
            "**Question 8/8:** Based on your **{days} days/week**, I recommend:\n\n"
            f"🎯 **{recommended_split.value.replace('_', ' ').title()}** (Recommended)\n\n"
            "**Training Split Options:**\n"
            "1️⃣ **Full Body** (3-4 days, great for beginners)\n"
            "2️⃣ **Upper/Lower** (4 days, balanced approach)\n"
            "3️⃣ **Push/Pull/Legs** (5-6 days, intermediate+)\n"
            "4️⃣ **Bro Split** (5-6 days, one muscle per day)\n\n"
            f"_Reply with the number or name, or just say 'recommended' for {recommended_split.value.replace('_', ' ').title()}_"
        )

    def _handle_split_selection(self, user_input: str, state: OnboardingState) -> str:
        """Parse training split selection"""
        input_lower = user_input.lower().strip()

        if "recommend" in input_lower:
            state.data['training_split'] = state.data['recommended_split']
        elif "1" in input_lower or "full body" in input_lower:
            state.data['training_split'] = TrainingSplit.FULL_BODY
        elif "2" in input_lower or "upper" in input_lower or "lower" in input_lower:
            state.data['training_split'] = TrainingSplit.UPPER_LOWER
        elif "3" in input_lower or "push" in input_lower or "pull" in input_lower or "ppl" in input_lower:
            state.data['training_split'] = TrainingSplit.PUSH_PULL_LEGS
        elif "4" in input_lower or "bro" in input_lower:
            state.data['training_split'] = TrainingSplit.BRO_SPLIT
        else:
            return "Please choose 1-4 or say 'recommended'"

        state.next_step()

        # Generate summary for confirmation
        return self._generate_confirmation_summary(state)

    def _generate_confirmation_summary(self, state: OnboardingState) -> str:
        """Generate summary for user confirmation"""
        data = state.data

        return (
            "🎉 **Onboarding Complete!** Here's your profile:\n\n"
            "📊 **Physical Stats:**\n"
            f"• Weight: {data['weight']}kg\n"
            f"• Height: {data['height']}cm\n"
            f"• BMI: {data['bmi']}\n\n"
            "🏋️ **Training Profile:**\n"
            f"• Experience: {data['experience_level'].value.title()}\n"
            f"• Goal: {data['primary_goal'].value.replace('_', ' ').title()}\n"
            f"• Training Days: {data['training_days_per_week']} days/week\n"
            f"• Equipment: {data['equipment_access'].value.replace('_', ' ').title()}\n"
            f"• Split: {data['training_split'].value.replace('_', ' ').title()}\n"
            f"• Preferred Time: {data['preferred_time'].value.title()}\n"
            f"• Injuries: {data['injuries_notes'] if data['injuries_notes'] else 'None'}\n\n"
            "Is this correct? Reply **'yes'** to save or **'restart'** to start over."
        )

    def _handle_confirmation(self, user_input: str, state: OnboardingState) -> str:
        """Handle final confirmation"""
        input_lower = user_input.lower().strip()

        if "yes" in input_lower or "correct" in input_lower or "confirm" in input_lower:
            # Save profile to database
            profile = UserGymProfile(
                user_id=self.user_id,
                weight=state.data['weight'],
                height=state.data['height'],
                bmi=state.data['bmi'],
                experience_level=state.data['experience_level'],
                primary_goal=state.data['primary_goal'],
                training_days_per_week=state.data['training_days_per_week'],
                equipment_access=state.data['equipment_access'],
                training_split=state.data['training_split'],
                preferred_time=state.data['preferred_time'],
                injuries_notes=state.data['injuries_notes'],
                onboarding_completed=True
            )

            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)

            state.current_step = "COMPLETED"

            logger.info(f"User {self.user_id} completed gym onboarding")

            return (
                "✅ **Profile Saved!** Welcome to your personal training program, Chief! 💪\n\n"
                "I'll now generate your customized workout plan. Give me a moment...\n\n"
                "Once ready, you can:\n"
                "• Ask 'show my workout plan'\n"
                "• Log workouts with 'log workout'\n"
                "• Track weight with 'log weight'\n"
                "• Get reminders for gym time\n\n"
                "Let's get those gains! 🔥"
            )
        elif "restart" in input_lower or "no" in input_lower:
            # Clear state and restart
            del self.onboarding_states[self.user_id]
            return self.start_onboarding()
        else:
            return "Please reply 'yes' to confirm or 'restart' to start over"

    def get_user_profile(self) -> Optional[UserGymProfile]:
        """Get user's gym profile"""
        return self.db.query(UserGymProfile).filter(
            UserGymProfile.user_id == self.user_id
        ).first()

    def is_onboarding_in_progress(self) -> bool:
        """Check if user is currently in onboarding"""
        state = self.onboarding_states.get(self.user_id)
        return state is not None and not state.is_complete()

    def get_daily_workout(self, day: str = None) -> str:
        """
        Get detailed workout plan for a specific day (or today)

        Args:
            day: Day of week (monday, tuesday, etc.) or None for today

        Returns:
            Formatted workout plan with exercises, sets, reps, rest
        """
        from datetime import datetime
        from models.workout import WorkoutPlan

        # Get current week number (simple calculation: weeks since Jan 1, mod 4 for 4-week cycle)
        week_of_year = datetime.now().isocalendar()[1]
        current_week = ((week_of_year - 1) % 4) + 1  # Cycle through weeks 1-4

        # Get day of week if not specified
        if day is None:
            day = datetime.now().strftime('%A').lower()
        elif day.lower() == "tomorrow":
            # Calculate tomorrow's day
            from datetime import timedelta
            tomorrow = datetime.now() + timedelta(days=1)
            day = tomorrow.strftime('%A').lower()
        else:
            day = day.lower()

        # Query workout plan for current week and day
        workout = self.db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id == self.user_id,
            WorkoutPlan.week_number == current_week,
            WorkoutPlan.day_of_week == day
        ).first()

        if not workout:
            return f"No workout scheduled for {day.title()} in week {current_week}. 🤔"

        # Format detailed workout
        import json
        exercises = json.loads(workout.exercises) if isinstance(workout.exercises, str) else workout.exercises

        response = f"🏋️ **{day.title()}'s Workout** - Week {current_week}\n"
        response += f"**Focus:** {workout.muscle_group}\n\n"

        for i, exercise in enumerate(exercises, 1):
            response += f"**{i}. {exercise['name']}**\n"
            response += f"   • Sets: {exercise['sets']} × {exercise['reps']} reps\n"
            response += f"   • Rest: {exercise['rest_seconds']}s\n"
            if exercise.get('notes'):
                response += f"   • Note: {exercise['notes']}\n"
            response += "\n"

        response += f"{'✅ Completed' if workout.completed else '⏳ Not completed yet'}"

        return response

    def get_weekly_overview(self, week: int = None) -> str:
        """
        Get weekly workout overview showing muscle groups

        Args:
            week: Week number (1-4) or None for current week

        Returns:
            Formatted weekly overview with muscle groups
        """
        from datetime import datetime
        from models.workout import WorkoutPlan

        # Get current week number if not specified
        if week is None:
            week_of_year = datetime.now().isocalendar()[1]
            week = ((week_of_year - 1) % 4) + 1  # Cycle through weeks 1-4

        # Query all workouts for this week
        workouts = self.db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id == self.user_id,
            WorkoutPlan.week_number == week
        ).order_by(WorkoutPlan.day_of_week).all()

        if not workouts:
            return f"No workouts found for week {week}. 🤔"

        # Format weekly overview
        response = f"📅 **Week {week} Overview**\n\n"

        # Group by day
        days_order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        workouts_by_day = {w.day_of_week: w for w in workouts}

        for day in days_order:
            if day in workouts_by_day:
                workout = workouts_by_day[day]
                status = "✅" if workout.completed else "⏳"
                response += f"{status} **{day.title()}**: {workout.muscle_group}\n"
            else:
                response += f"🔴 **{day.title()}**: Rest Day\n"

        # Add completion stats
        completed_count = sum(1 for w in workouts if w.completed)
        total_count = len(workouts)
        response += f"\n**Progress:** {completed_count}/{total_count} workouts completed"

        return response
