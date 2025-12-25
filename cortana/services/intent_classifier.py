"""
Intent Classification Service - AI-powered message routing
Uses AI to classify user intent and route to appropriate handler
"""

from services.ai_service import AIService
from typing import Literal
import logging

logger = logging.getLogger(__name__)

IntentType = Literal[
    "workout_progress",    # Questions about personal workout progress/logs
    "exercise_form",       # How to do exercises, form, safety, alternatives
    "nutrition",          # Nutrition, diet, meal planning advice
    "expense_logging",    # Logging expenses (I spent, I bought, etc.)
    "spending_analysis",  # Questions about spending, budget, expenses
    "workout_viewing",    # Show me my workout, what's my plan today
    "general"            # General conversation, greetings, other
]


class IntentClassifier:
    """
    Classifies user message intent for intelligent routing

    Routes:
    - workout_progress → RAG with personal context
    - exercise_form → RAG with general knowledge
    - nutrition → RAG with general knowledge
    - expense_logging → Finance agent (create expense record)
    - spending_analysis → Intelligent agent (analyze spending)
    - workout_viewing → Health agent
    - general → Intelligent agent
    """

    def __init__(self):
        self.ai_service = AIService()

    def classify_intent(self, message: str) -> IntentType:
        """
        Classify the intent of a user message

        Args:
            message: User's message text

        Returns:
            Intent type (workout_progress, exercise_form, nutrition, expense_logging, spending_analysis, workout_viewing, general)
        """
        try:
            logger.info(f"Classifying intent for message: {message[:100]}...")

            # Build classification prompt
            prompt = self._build_classification_prompt(message)

            # Get AI classification
            response = self.ai_service._generate(prompt).strip().lower()

            # Parse response to extract intent
            intent = self._parse_intent_response(response)

            logger.info(f"Classified intent: {intent}")
            return intent

        except Exception as e:
            logger.error(f"Intent classification error: {e}")
            # Default to general on error
            return "general"

    def _build_classification_prompt(self, message: str) -> str:
        """Build the classification prompt for AI"""

        prompt = """You are an intent classifier for a personal AI assistant (Cortana).

Classify the user's message into ONE of these intents:

1. **workout_progress** - Questions about the user's personal workout performance, progress, or logged workouts
   Examples: "How's my workout progress?", "Am I making progress?", "How did I do on squats last week?", "What was my last bench press weight?"

2. **exercise_form** - Questions about how to perform exercises, form, safety, alternatives, or modifications
   Examples: "How do I do dumbbell squats?", "What exercises are safe for bad knees?", "Alternative to bench press?", "Proper squat form?"

3. **nutrition** - Questions about nutrition, diet, meal planning, or eating advice
   Examples: "What should I eat for muscle gain?", "How much protein do I need?", "Best foods for fat loss?", "Meal plan for cutting?"

4. **expense_logging** - User wants to LOG/RECORD an expense they made (past tense or present action with specific amount)
   Examples: "I spent $50 on groceries", "Bought lunch for $15", "Paid $100 for gym membership", "I just spent $30 on gas", "Expense: $25 coffee", "I bought a shirt for $30"

5. **spending_analysis** - Questions about ANALYZING personal spending, budget, expenses, or financial habits (asking for information, NO specific amount)
   Examples: "What did I spend on food?", "Where is my money going?", "Am I overspending?", "How much did I spend this month?", "How much did I buy?", "What's my budget status?"

6. **workout_viewing** - Requests to view/show workout plans or schedules
   Examples: "Show me my workout", "What's my workout today?", "Show my weekly plan", "What exercises am I doing tomorrow?", "What's today workout?", "Send my full training workout", "Show my workout schedule"

7. **general** - Greetings, general conversation, or anything that doesn't fit above categories
   Examples: "Hello", "Thanks", "How are you?", "Tell me a joke"

**USER MESSAGE:**
"{message}"

**INSTRUCTIONS:**
- Respond with ONLY the intent name (workout_progress, exercise_form, nutrition, expense_logging, spending_analysis, workout_viewing, or general)
- Do NOT include explanations, just the intent name
- CRITICAL DISTINCTION:
  - expense_logging = "I spent $X" or "I bought X for $Y" (HAS specific amount)
  - spending_analysis = "Am I overspending?" or "How much did I spend?" (NO specific amount, asking for analysis)
- If unsure between workout_progress and exercise_form:
  - workout_progress = asking about THEIR personal logs/progress
  - exercise_form = asking HOW TO do an exercise
- If unsure, choose "general"

**INTENT:**""".format(message=message)

        return prompt

    def _parse_intent_response(self, response: str) -> IntentType:
        """Parse AI response to extract intent"""

        # Clean response
        response = response.strip().lower()

        # Check for each intent (check expense_logging before spending_analysis to avoid conflicts)
        if "workout_progress" in response:
            return "workout_progress"
        elif "exercise_form" in response:
            return "exercise_form"
        elif "nutrition" in response:
            return "nutrition"
        elif "expense_logging" in response:
            return "expense_logging"
        elif "spending_analysis" in response:
            return "spending_analysis"
        elif "workout_viewing" in response:
            return "workout_viewing"
        elif "general" in response:
            return "general"
        else:
            # Default to general if unrecognized
            logger.warning(f"Could not parse intent from response: {response}")
            return "general"
