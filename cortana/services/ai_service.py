"""
AI Service - Uses Groq (ultra-fast cloud) with Ollama/Gemini fallback
"""
import google.generativeai as genai
from config.settings import get_settings
from typing import Dict, List, Optional
import json
import logging
from datetime import datetime
from services.groq_ai_service import GroqAIService
from services.local_ai_service import LocalAIService

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini as fallback
genai.configure(api_key=settings.gemini_api_key)


class AIService:
    """AI-powered conversation and data extraction service with Groq/Ollama/Gemini"""

    def __init__(self, use_groq: bool = True, use_local: bool = False):
        """
        Initialize AI service

        Args:
            use_groq: Try to use Groq first (default: True - FASTEST!)
            use_local: Try to use local Ollama (default: False)
        """
        self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        self.groq_ai = None
        self.local_ai = None
        self.use_groq = use_groq

        # Priority 1: Groq (fastest, free, cloud)
        if use_groq:
            try:
                self.groq_ai = GroqAIService(model="llama-3.1-8b-instant")
                if self.groq_ai.is_available():
                    logger.info("✅ Using Groq AI: llama-3.1-8b-instant (ultra-fast, unlimited!)")
                else:
                    logger.warning("⚠️ Groq not available")
                    self.groq_ai = None
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize Groq: {e}")
                self.groq_ai = None

        # Priority 2: Ollama (local fallback)
        if use_local:
            try:
                self.local_ai = LocalAIService(model="phi3.5:3.8b")
                if self.local_ai.is_available():
                    logger.info("✅ Ollama available as fallback")
                else:
                    self.local_ai = None
            except Exception as e:
                logger.warning(f"⚠️ Ollama not available: {e}")
                self.local_ai = None

    def _generate(self, prompt: str, format_json: bool = False) -> str:
        """
        Internal method to generate text using Groq (priority), Ollama, or Gemini fallback

        Args:
            prompt: The prompt to send
            format_json: Whether to request JSON format

        Returns:
            Generated text
        """
        # Priority 1: Try Groq first (ultra-fast cloud)
        if self.groq_ai and self.groq_ai.is_available():
            try:
                logger.info("[AI] Using Groq (ultra-fast cloud)")
                if format_json:
                    result = self.groq_ai.generate_json(prompt)
                    return json.dumps(result)
                else:
                    return self.groq_ai.generate(prompt)
            except Exception as e:
                logger.warning(f"[AI] Groq failed: {e}, trying fallback...")

        # Priority 2: Try Ollama (local)
        if self.local_ai and self.local_ai.is_available():
            try:
                logger.info("[AI] Using Ollama (local)")
                if format_json:
                    result = self.local_ai.generate_json(prompt)
                    return json.dumps(result)
                else:
                    return self.local_ai.generate(prompt)
            except Exception as e:
                logger.warning(f"[AI] Ollama failed: {e}")

        # Gemini disabled temporarily - quota exceeded
        # # Priority 3: Fallback to Gemini (last resort)
        # try:
        #     logger.info("[AI] Using Gemini (cloud)")
        #     response = self.gemini_model.generate_content(prompt)
        #     return response.text.strip()
        # except Exception as e:
        #     logger.error(f"[AI] All AI services failed (Groq, Ollama, Gemini): {e}")
        #     raise

        # No AI service available
        logger.error("[AI] No AI service available (Groq and Ollama unavailable, Gemini disabled)")
        raise Exception("No AI service available. Groq: unavailable, Ollama: unavailable, Gemini: disabled (quota exceeded)")

    def parse_expense_message(self, user_message: str) -> Dict:
        """
        Parse a natural language message and extract financial transactions

        Args:
            user_message: Natural language input like "I spent $50 on groceries and $20 on gas"

        Returns:
            Dictionary with extracted transactions
        """
        prompt = f"""
You are a financial assistant. Parse the following message and extract ALL financial transactions.

Message: "{user_message}"

Extract and return a JSON object with this EXACT structure:
{{
    "transactions": [
        {{
            "amount": <number>,
            "type": "income" or "expense",
            "category": "<category>",
            "description": "<description>"
        }}
    ],
    "needs_clarification": true/false,
    "clarification_question": "<question if needed>"
}}

Categories should be one of: food, transport, utilities, entertainment, shopping, health, salary, freelance, investment, other

IMPORTANT:
- Return ONLY valid JSON, no markdown, no explanation
- If amount is not clear, set needs_clarification to true
- Extract ALL transactions mentioned
- Be smart about context (e.g., "gas" = transport, "groceries" = food)

Examples:
"I spent $50 on groceries" → {{"transactions": [{{"amount": 50, "type": "expense", "category": "food", "description": "groceries"}}], "needs_clarification": false}}
"Got paid $3000 today" → {{"transactions": [{{"amount": 3000, "type": "income", "category": "salary", "description": "salary payment"}}], "needs_clarification": false}}
"Spent 20 on lunch and 10 on coffee" → {{"transactions": [{{"amount": 20, "type": "expense", "category": "food", "description": "lunch"}}, {{"amount": 10, "type": "expense", "category": "food", "description": "coffee"}}], "needs_clarification": false}}
"""

        try:
            result_text = self._generate(prompt, format_json=True)

            # Remove markdown code blocks if present
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result_text = result_text.strip()

            # Parse JSON
            parsed = json.loads(result_text)

            logger.info(f"Successfully parsed message: {parsed}")
            return parsed

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from AI response: {e}")
            logger.error(f"AI Response: {result_text}")
            return {
                "transactions": [],
                "needs_clarification": True,
                "clarification_question": "Sorry, I couldn't understand that. Could you please rephrase? For example: 'I spent $50 on groceries'"
            }

        except Exception as e:
            logger.error(f"AI service error: {str(e)}")
            return {
                "transactions": [],
                "needs_clarification": True,
                "clarification_question": f"Sorry, I encountered an error. Please try again."
            }

    def detect_command_intent(self, user_message: str) -> Dict:
        """
        Detect if the user is asking for a command (summary, report, etc.)

        Args:
            user_message: User's message

        Returns:
            Dictionary with intent and parameters
        """
        prompt = f"""
Analyze this message and determine the user's intent.

Message: "{user_message}"

Return ONLY valid JSON with this structure:
{{
    "intent": "expense_logging" | "weekly_summary" | "monthly_summary" | "detailed_report" | "insights" | "predictions" | "export_pdf" | "export_excel" | "add_recurring" | "list_recurring" | "cancel_recurring" | "news_briefing" | "global_news" | "news_category" | "news_search" | "set_news_preferences" | "general_query" | "greeting" | "set_budget" | "set_goal" | "update_schedule" | "delete_expense" | "edit_expense",
    "action": "none" | "send_weekly_summary" | "send_monthly_summary" | "send_detailed_report" | "send_insights" | "export_report" | "add_subscription" | "show_subscriptions" | "remove_subscription" | "send_news" | "send_global_news" | "send_category_news" | "search_news" | "update_news_prefs" | "create_budget" | "create_goal" | "modify_schedule" | "remove_expense" | "modify_expense",
    "needs_data_extraction": true/false
}}

Intent categories:
- expense_logging: User is logging expenses/income
- weekly_summary: User wants to see their weekly financial summary (basic)
- monthly_summary: User wants to see their monthly financial summary (basic)
- detailed_report: User wants a detailed report with trends, charts, and breakdown
- insights: User wants spending insights, predictions, projections, or analysis
- predictions: User wants to know future spending predictions or what they'll spend
- export_pdf: User wants to export/download a PDF report
- export_excel: User wants to export/download an Excel/spreadsheet report
- add_recurring: User wants to add a recurring expense/subscription
- list_recurring: User wants to see their recurring expenses/subscriptions
- cancel_recurring: User wants to cancel a recurring expense/subscription
- set_budget: User wants to set an overall budget
- set_goal: User wants to set a category spending goal
- update_schedule: User wants to change reminder/summary times
- delete_expense: User wants to delete an expense
- edit_expense: User wants to edit/modify an expense
- news_briefing: User wants their daily news summary/briefing (default Al Jazeera)
- global_news: User wants global/world news from BBC, Reuters, CNN, etc.
- news_category: User wants news from a specific category (tech, business, sports, etc.)
- news_search: User wants to search news by specific topic/keywords
- set_news_preferences: User wants to update their news preferences/interests
- general_query: User is asking a question about their finances OR having a conversation
- greeting: ONLY initial greetings like "hi", "hello", "hey" - NOT follow-up conversation

Examples:
"I spent $50 on food" → {{"intent": "expense_logging", "action": "none", "needs_data_extraction": true}}
"Send me my weekly summary" → {{"intent": "weekly_summary", "action": "send_weekly_summary", "needs_data_extraction": false}}
"Give me a detailed report" → {{"intent": "detailed_report", "action": "send_detailed_report", "needs_data_extraction": false}}
"Show me detailed breakdown" → {{"intent": "detailed_report", "action": "send_detailed_report", "needs_data_extraction": false}}
"Show me my spending insights" → {{"intent": "insights", "action": "send_insights", "needs_data_extraction": false}}
"What will I spend this month?" → {{"intent": "predictions", "action": "send_insights", "needs_data_extraction": false}}
"At this rate how much will I spend?" → {{"intent": "predictions", "action": "send_insights", "needs_data_extraction": false}}
"Give me predictions" → {{"intent": "predictions", "action": "send_insights", "needs_data_extraction": false}}
"How are you" → {{"intent": "general_query", "action": "none", "needs_data_extraction": false}}
"I'm good how about you" → {{"intent": "general_query", "action": "none", "needs_data_extraction": false}}
"How was your day" → {{"intent": "general_query", "action": "none", "needs_data_extraction": false}}
"I'm Ali" → {{"intent": "general_query", "action": "none", "needs_data_extraction": false}}
"Export my report as PDF" → {{"intent": "export_pdf", "action": "export_report", "needs_data_extraction": false}}
"Send me Excel report" → {{"intent": "export_excel", "action": "export_report", "needs_data_extraction": false}}
"Download my financial report" → {{"intent": "export_pdf", "action": "export_report", "needs_data_extraction": false}}
"Add Netflix subscription for $15 monthly" → {{"intent": "add_recurring", "action": "add_subscription", "needs_data_extraction": true}}
"Show my subscriptions" → {{"intent": "list_recurring", "action": "show_subscriptions", "needs_data_extraction": false}}
"Cancel my Spotify subscription" → {{"intent": "cancel_recurring", "action": "remove_subscription", "needs_data_extraction": true}}
"Set my monthly budget to $2000" → {{"intent": "set_budget", "action": "create_budget", "needs_data_extraction": true}}
"I want to spend max $500 on food per month" → {{"intent": "set_goal", "action": "create_goal", "needs_data_extraction": true}}
"Change my daily reminder to 7 PM" → {{"intent": "update_schedule", "action": "modify_schedule", "needs_data_extraction": true}}
"Delete my last expense" → {{"intent": "delete_expense", "action": "remove_expense", "needs_data_extraction": true}}
"Change that $50 to $45" → {{"intent": "edit_expense", "action": "modify_expense", "needs_data_extraction": true}}
"Send me today's news" → {{"intent": "news_briefing", "action": "send_news", "needs_data_extraction": false}}
"Give me global news" → {{"intent": "global_news", "action": "send_global_news", "needs_data_extraction": false}}
"Show me world news" → {{"intent": "global_news", "action": "send_global_news", "needs_data_extraction": false}}
"What's happening globally" → {{"intent": "global_news", "action": "send_global_news", "needs_data_extraction": false}}
"Give me tech news" → {{"intent": "news_category", "action": "send_category_news", "needs_data_extraction": true}}
"Search news about AI" → {{"intent": "news_search", "action": "search_news", "needs_data_extraction": true}}
"I'm interested in technology and business news" → {{"intent": "set_news_preferences", "action": "update_news_prefs", "needs_data_extraction": true}}
"How much did I spend this week?" → {{"intent": "general_query", "action": "none", "needs_data_extraction": false}}
"Hi Cortana!" → {{"intent": "greeting", "action": "none", "needs_data_extraction": false}}
"""

        try:
            result_text = self._generate(prompt, format_json=True)

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            parsed = json.loads(result_text)
            logger.info(f"Detected intent: {parsed}")
            return parsed

        except Exception as e:
            logger.error(f"Failed to detect intent: {str(e)}")
            # Default: assume expense logging
            return {
                "intent": "expense_logging",
                "action": "none",
                "needs_data_extraction": True
            }

    def generate_conversational_response(
        self,
        user_message: str,
        context: Optional[str] = None
    ) -> str:
        """
        Generate a natural conversational response

        Args:
            user_message: User's message
            context: Optional context (e.g., "weekly_summary_sent")

        Returns:
            AI-generated response
        """
        context_prompt = f"\n\nContext: {context}" if context else ""

        prompt = f"""
You are Cortana, a smart and helpful AI personal assistant. You help users manage their finances, workouts, news, and daily tasks.

User said: "{user_message}"{context_prompt}

YOUR CAPABILITIES:
- Track and analyze finances (expenses, income, budgets)
- Manage workout plans and fitness tracking
- Provide news summaries
- Answer questions about user's data
- Log transactions and workouts in natural language

PERSONALITY:
- Smart, professional, and efficient
- Friendly but not overly casual
- Direct and concise (1-3 sentences usually)
- Helpful and solution-oriented
- Natural conversational tone

RESPONSE GUIDELINES:
- For greetings: Be warm and offer help
- For questions: Answer directly and accurately
- For task requests: Confirm and execute
- For casual chat: Be friendly but brief
- Keep it natural - don't use game references or military terms
- Don't call the user "Chief", "Commander", or similar

Response:
"""

        try:
            return self._generate(prompt)

        except Exception as e:
            logger.error(f"Failed to generate response: {str(e)}")
            return "Thanks for the update! I'm here to help track your finances."

    def parse_budget_message(self, user_message: str) -> Dict:
        """
        Parse a message to extract budget information

        Args:
            user_message: Natural language like "Set my monthly budget to $2000"

        Returns:
            Dictionary with budget details
        """
        prompt = f"""
Parse this budget-setting message and extract the budget information.

Message: "{user_message}"

Return ONLY valid JSON with this structure:
{{
    "amount": <number>,
    "period": "weekly" | "monthly" | "yearly",
    "success": true/false,
    "error_message": "<error if parsing failed>"
}}

Examples:
"Set my monthly budget to $2000" → {{"amount": 2000, "period": "monthly", "success": true}}
"I want a weekly budget of 500 dollars" → {{"amount": 500, "period": "weekly", "success": true}}
"My budget is 3000 per month" → {{"amount": 3000, "period": "monthly", "success": true}}
"""

        try:
            result_text = self._generate(prompt, format_json=True)

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            parsed = json.loads(result_text)
            logger.info(f"Parsed budget: {parsed}")
            return parsed

        except Exception as e:
            logger.error(f"Failed to parse budget: {str(e)}")
            return {
                "success": False,
                "error_message": "Sorry, I couldn't understand the budget amount. Try: 'Set my monthly budget to $2000'"
            }

    def parse_goal_message(self, user_message: str) -> Dict:
        """
        Parse a message to extract category goal information

        Args:
            user_message: Natural language like "I want to spend max $500 on food per month"

        Returns:
            Dictionary with goal details
        """
        prompt = f"""
Parse this category goal message and extract the goal information.

Message: "{user_message}"

Return ONLY valid JSON with this structure:
{{
    "category": "food" | "transport" | "utilities" | "entertainment" | "shopping" | "health" | "other",
    "amount": <number>,
    "period": "weekly" | "monthly" | "yearly",
    "success": true/false,
    "error_message": "<error if parsing failed>"
}}

Examples:
"I want to spend max $500 on food per month" → {{"category": "food", "amount": 500, "period": "monthly", "success": true}}
"Set my transport budget to 200 weekly" → {{"category": "transport", "amount": 200, "period": "weekly", "success": true}}
"Limit entertainment to $300 per month" → {{"category": "entertainment", "amount": 300, "period": "monthly", "success": true}}
"""

        try:
            result_text = self._generate(prompt, format_json=True)

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            parsed = json.loads(result_text)
            logger.info(f"Parsed goal: {parsed}")
            return parsed

        except Exception as e:
            logger.error(f"Failed to parse goal: {str(e)}")
            return {
                "success": False,
                "error_message": "Sorry, I couldn't understand the goal. Try: 'I want to spend max $500 on food per month'"
            }

    def parse_schedule_message(self, user_message: str) -> Dict:
        """
        Parse a message to extract schedule update information

        Args:
            user_message: Natural language like "Change my daily reminder to 7 PM"

        Returns:
            Dictionary with schedule details
        """
        prompt = f"""
Parse this schedule update message and extract the scheduling information.

Message: "{user_message}"

Return ONLY valid JSON with this structure:
{{
    "schedule_type": "daily_reminder" | "weekly_summary",
    "hour": <0-23>,
    "minute": <0-59>,
    "day_of_week": "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" (only for weekly_summary),
    "success": true/false,
    "error_message": "<error if parsing failed>"
}}

Examples:
"Change my daily reminder to 7 PM" → {{"schedule_type": "daily_reminder", "hour": 19, "minute": 0, "success": true}}
"Set daily reminder at 8:30 PM" → {{"schedule_type": "daily_reminder", "hour": 20, "minute": 30, "success": true}}
"Send weekly summaries on Friday at 5 PM" → {{"schedule_type": "weekly_summary", "hour": 17, "minute": 0, "day_of_week": "friday", "success": true}}
"Weekly summary on Sunday at 6:00 PM" → {{"schedule_type": "weekly_summary", "hour": 18, "minute": 0, "day_of_week": "sunday", "success": true}}

IMPORTANT:
- Use 24-hour format (7 PM = 19, 8 PM = 20, etc.)
- day_of_week should be lowercase
- Only include day_of_week for weekly_summary
"""

        try:
            result_text = self._generate(prompt, format_json=True)

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            parsed = json.loads(result_text)
            logger.info(f"Parsed schedule: {parsed}")
            return parsed

        except Exception as e:
            logger.error(f"Failed to parse schedule: {str(e)}")
            return {
                "success": False,
                "error_message": "Sorry, I couldn't understand the schedule. Try: 'Change my daily reminder to 7 PM'"
            }

    def parse_expense_edit_message(self, user_message: str) -> Dict:
        """
        Parse a message to extract expense editing information

        Args:
            user_message: Natural language like "Change that $50 to $45" or "Update last expense to $60"

        Returns:
            Dictionary with edit details
        """
        prompt = f"""
Parse this expense editing message.

Message: "{user_message}"

Return ONLY valid JSON with this structure:
{{
    "target": "last" | "specific_amount",
    "old_amount": <number> (if specific_amount),
    "new_amount": <number>,
    "success": true/false,
    "error_message": "<error if parsing failed>"
}}

Examples:
"Change that $50 to $45" → {{"target": "specific_amount", "old_amount": 50, "new_amount": 45, "success": true}}
"Update last expense to $60" → {{"target": "last", "new_amount": 60, "success": true}}
"Change my last transaction to $100" → {{"target": "last", "new_amount": 100, "success": true}}
"""

        try:
            result_text = self._generate(prompt, format_json=True)

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            parsed = json.loads(result_text)
            logger.info(f"Parsed expense edit: {parsed}")
            return parsed

        except Exception as e:
            logger.error(f"Failed to parse expense edit: {str(e)}")
            return {
                "success": False,
                "error_message": "Sorry, I couldn't understand. Try: 'Change that $50 to $45' or 'Update last expense to $60'"
            }

    def generate_spending_advice(self, summary_data: Dict) -> str:
        """
        Generate personalized spending advice based on financial data

        Args:
            summary_data: Weekly or monthly summary data

        Returns:
            Personalized advice string
        """
        prompt = f"""
You are a financial advisor. Based on this spending data, give 2-3 short, actionable tips to improve finances.

Data:
- Income: ${summary_data.get('total_income', 0)}
- Expenses: ${summary_data.get('total_expenses', 0)}
- Top categories: {list(summary_data.get('expenses_by_category', {}).keys())[:3]}
- Week-over-week change: {summary_data.get('percent_change_from_last_week', 0)}%

Keep advice practical, encouraging, and under 100 words.
"""

        try:
            return self._generate(prompt)

        except Exception as e:
            logger.error(f"Failed to generate advice: {str(e)}")
            return "Keep tracking your expenses and you'll see patterns emerge!"

    def parse_news_query(self, user_message: str) -> Dict:
        """
        Parse a news-related message to extract category, location, or search query

        Args:
            user_message: Natural language like "Give me tech news" or "News from Beirut"

        Returns:
            Dictionary with news query details
        """
        prompt = f"""
Parse this news request and extract the relevant information.

Message: "{user_message}"

Return ONLY valid JSON with this structure:
{{
    "query_type": "category" | "location" | "search" | "preferences",
    "category": "<category if category query>",
    "location": "<location if location query>",
    "keywords": "<keywords if search query>",
    "interests": "<comma-separated interests if preferences>",
    "success": true/false
}}

Valid categories: business, technology, science, sports, entertainment, health, general
Common locations: beirut, tripoli, sidon, tyre, zahle, baalbek, lebanon

Examples:
"Give me tech news" → {{"query_type": "category", "category": "technology", "success": true}}
"Show me business news" → {{"query_type": "category", "category": "business", "success": true}}
"News from Beirut" → {{"query_type": "location", "location": "beirut", "success": true}}
"What's happening in Tripoli" → {{"query_type": "location", "location": "tripoli", "success": true}}
"Search news about AI" → {{"query_type": "search", "keywords": "AI artificial intelligence", "success": true}}
"Find articles about SpaceX" → {{"query_type": "search", "keywords": "SpaceX", "success": true}}
"I'm interested in technology and sports" → {{"query_type": "preferences", "interests": "technology,sports", "success": true}}
"""

        try:
            result_text = self._generate(prompt, format_json=True)

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            parsed = json.loads(result_text)
            logger.info(f"Parsed news query: {parsed}")
            return parsed

        except Exception as e:
            logger.error(f"Failed to parse news query: {str(e)}")
            return {
                "success": False,
                "error_message": "Sorry, I couldn't understand. Try: 'Send me tech news' or 'Search news about AI'"
            }

    def parse_recurring_expense_message(self, user_message: str) -> Dict:
        """
        Parse a message to extract recurring expense information

        Args:
            user_message: Natural language like "Add Netflix subscription for $15 monthly"

        Returns:
            Dictionary with recurring expense details
        """
        prompt = f"""
Parse this recurring expense message and extract the information.

Message: "{user_message}"

Return ONLY valid JSON with this structure:
{{
    "name": "<subscription/bill name>",
    "amount": <number>,
    "category": "food" | "transport" | "utilities" | "entertainment" | "shopping" | "health" | "other",
    "frequency": "daily" | "weekly" | "monthly" | "yearly",
    "success": true/false,
    "error_message": "<error if parsing failed>"
}}

Examples:
"Add Netflix subscription for $15 monthly" → {{"name": "Netflix", "amount": 15, "category": "entertainment", "frequency": "monthly", "success": true}}
"Set up my rent payment of $1200 per month" → {{"name": "Rent", "amount": 1200, "category": "utilities", "frequency": "monthly", "success": true}}
"Track Spotify at $10 monthly" → {{"name": "Spotify", "amount": 10, "category": "entertainment", "frequency": "monthly", "success": true}}
"Add gym membership $50 per month" → {{"name": "Gym Membership", "amount": 50, "category": "health", "frequency": "monthly", "success": true}}

IMPORTANT:
- Extract the subscription/bill name
- Determine appropriate category based on context
- Parse frequency (monthly, yearly, weekly, daily)
- Return valid JSON only
"""

        try:
            result_text = self._generate(prompt, format_json=True)

            # Clean JSON
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            parsed = json.loads(result_text)
            logger.info(f"Parsed recurring expense: {parsed}")
            return parsed

        except Exception as e:
            logger.error(f"Failed to parse recurring expense: {str(e)}")
            return {
                "success": False,
                "error_message": "Sorry, I couldn't understand. Try: 'Add Netflix subscription for $15 monthly'"
            }
