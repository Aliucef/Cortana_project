"""
Telegram Message Handler - Process messages and integrate with AI services
"""
from sqlalchemy.orm import Session
from services.ai_service import AIService
from services.budget_monitor import BudgetMonitor
from services.personality.conversation_memory import ConversationMemory
from services.personality.proactive_suggestions import ProactiveSuggestions
from models.user import User
from models.finance import FinanceRecord, TransactionType
from models.budget import Budget, CategoryGoal, BudgetPeriod
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)


def split_long_message(message: str, max_length: int = 3500) -> list:
    """
    Split a long message into chunks for Telegram's 4096 character limit

    Args:
        message: The message to split
        max_length: Maximum characters per chunk (default 3500 to be safe)

    Returns:
        List of message chunks
    """
    if len(message) <= max_length:
        return [message]

    chunks = []
    current_chunk = ""

    # Split by paragraphs (double newline)
    paragraphs = message.split("\n\n")

    for paragraph in paragraphs:
        # If this single paragraph is too long, split it by sentences
        if len(paragraph) > max_length:
            sentences = paragraph.split(". ")
            for sentence in sentences:
                if len(current_chunk) + len(sentence) + 2 > max_length:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                        current_chunk = ""
                current_chunk += sentence + ". "
        # If adding this paragraph exceeds limit, start new chunk
        elif len(current_chunk) + len(paragraph) + 2 > max_length:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = ""
            current_chunk += paragraph + "\n\n"
        else:
            current_chunk += paragraph + "\n\n"

    # Add remaining chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks


def parse_and_log_expense(db: Session, user_id: int, message_text: str) -> str:
    """
    Parse expense from natural language and log it to database

    Args:
        db: Database session
        user_id: User ID
        message_text: Natural language expense message

    Returns:
        Response message confirming the logging
    """
    try:
        ai_service = AIService()

        # Use AI to extract amount and category
        parse_prompt = f"""Extract the expense amount and category from this message:
"{message_text}"

Valid categories: food, transportation, entertainment, shopping, bills, health, other

Respond in this exact format:
AMOUNT: <number>
CATEGORY: <category>
DESCRIPTION: <brief description>

Example:
For "I spent $50 on groceries"
AMOUNT: 50
CATEGORY: food
DESCRIPTION: groceries"""

        ai_response = ai_service._generate(parse_prompt).strip()

        # Parse the AI response
        amount = None
        category = "other"
        description = message_text[:50]

        for line in ai_response.split("\n"):
            if line.startswith("AMOUNT:"):
                try:
                    amount = float(line.split(":", 1)[1].strip().replace("$", "").replace(",", ""))
                except:
                    pass
            elif line.startswith("CATEGORY:"):
                category = line.split(":", 1)[1].strip().lower()
            elif line.startswith("DESCRIPTION:"):
                description = line.split(":", 1)[1].strip()

        if amount is None:
            return "Sorry, I couldn't understand the amount. Try again like: 'I spent $50 on groceries'"

        # Validate category
        valid_categories = ['food', 'transportation', 'entertainment', 'shopping', 'bills', 'health', 'other']
        if category not in valid_categories:
            # Try to infer from common phrases
            if any(word in message_text.lower() for word in ['friend', 'out', 'social', 'party', 'movie', 'game']):
                category = 'entertainment'
            elif any(word in message_text.lower() for word in ['eat', 'food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'grocery', 'groceries']):
                category = 'food'
            else:
                category = 'other'

        # Create the transaction
        transaction = FinanceRecord(
            user_id=user_id,
            amount=amount,
            transaction_type=TransactionType.EXPENSE,
            category=category,
            description=description,
            transaction_date=datetime.now()
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        # Auto-vectorize: Update personal context after expense is logged
        try:
            from services.personal_context_service import PersonalContextService
            personal_context = PersonalContextService(db, user_id)
            # Regenerate expense insights with new data
            personal_context.generate_expense_insights(days=30)
            logger.info(f"Auto-vectorized expense for user {user_id}")
        except Exception as e:
            # Don't fail the request if vectorization fails
            logger.warning(f"Failed to auto-vectorize expense: {e}")

        # Check for overspending
        budget_monitor = BudgetMonitor(db)
        alert = budget_monitor.check_category_goal(user_id, category)

        response = f"✅ Got it! Logged ${amount:.2f} as {category}."

        if alert:
            response += f"\n\n⚠️ {category}: ${alert['current_spending']:.2f} / ${alert['goal_amount']:.2f} ({alert['percentage']:.0f}%)"

        return response

    except Exception as e:
        logger.error(f"Error parsing and logging expense: {e}")
        return "Sorry, I couldn't log that expense. Try again like: 'I spent $50 on groceries'"


async def process_telegram_message(user_id: int, message_text: str, db: Session, context_data: dict = None) -> str:
    """
    Process a Telegram message and return response

    Args:
        user_id: Telegram user ID
        message_text: Message text
        db: Database session

    Returns:
        Response text to send back
    """
    # Start timing
    start_time = time.time()
    # Check if there's a pending expense clarification
    if context_data and 'pending_expense' in context_data:
        pending = context_data['pending_expense']
        ai_service = AIService()

        # Try to extract category from user's response
        # Use AI to parse just the category from their answer
        category_prompt = f"""
        User was asked: "{pending['question']}"
        User responded: "{message_text}"

        Extract the category from their response. Choose from: food, transport, utilities, entertainment, shopping, health, other

        Return ONLY the category name in lowercase, nothing else.
        """

        try:
            category = ai_service.generate(category_prompt, max_tokens=20).strip().lower()

            # Validate category
            valid_categories = ['food', 'transport', 'utilities', 'entertainment', 'shopping', 'health', 'other']
            if category not in valid_categories:
                # Try to infer from common phrases
                if any(word in message_text.lower() for word in ['friend', 'out', 'social', 'party', 'movie', 'game']):
                    category = 'entertainment'
                elif any(word in message_text.lower() for word in ['eat', 'food', 'lunch', 'dinner', 'breakfast', 'restaurant']):
                    category = 'food'
                else:
                    category = 'other'

            # Create the transaction with the clarified category
            user = db.query(User).filter(User.id == user_id).first()
            transaction = FinanceRecord(
                user_id=user.id,
                amount=pending['amount'],
                transaction_type=TransactionType.EXPENSE,
                category=category,
                description=pending.get('description', message_text[:50]),
                transaction_date=datetime.now()
            )

            db.add(transaction)
            db.commit()

            # Clear pending expense
            context_data.pop('pending_expense', None)

            # Check for overspending
            budget_monitor = BudgetMonitor(db)
            alert = budget_monitor.check_category_goal(user.id, category)

            response = f"✅ Got it! Logged ${pending['amount']:.2f} as {category}."

            if alert:
                response += f"\n\n⚠️ {category}: ${alert['current_spending']:.2f} / ${alert['goal_amount']:.2f} ({alert['percentage']:.0f}%)"

            # Save to conversation memory
            memory = ConversationMemory(db, user.id)
            memory.add_conversation(
                user_message=message_text,
                bot_response=response,
                intent="expense_logging",
                context_tags=[category]
            )

            return response

        except Exception as e:
            logger.error(f"Error processing expense clarification: {e}")
            context_data.pop('pending_expense', None)
            return "Sorry, I couldn't process that. Could you log the expense again? For example: 'I spent $50 on entertainment'"

    # Check if there's a pending receipt confirmation
    if context_data and 'pending_receipt' in context_data:
        if message_text.lower() in ['yes', 'y', 'confirm', 'ok', 'yeah', 'yep', 'sure']:
            # Add the pending receipt as an expense
            receipt_data = context_data['pending_receipt']

            transaction = FinanceRecord(
                user_id=1,  # Your user ID
                amount=receipt_data['amount'],
                transaction_type=TransactionType.EXPENSE,
                category=receipt_data['category'],
                description=receipt_data['description'],
                transaction_date=datetime.now()
            )

            db.add(transaction)
            db.commit()

            # Check for overspending
            budget_monitor = BudgetMonitor(db)
            budget_monitor.check_after_transaction(1, receipt_data['category'])

            # Clear pending receipt
            context_data.pop('pending_receipt', None)

            return f"✅ Receipt logged!\n\n${receipt_data['amount']:.2f} added to {receipt_data['category']}.\n\nNice work keeping track! 📊"

    # Find user in database using the authenticated user_id
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return "Your account is not set up yet. Please register first."

    # Get conversation memory for context
    memory = ConversationMemory(db, user.id)
    recent_convos = memory.get_recent_conversations(limit=5)

    # Build context string for AI
    context_for_ai = ""
    if recent_convos:
        context_for_ai = "Recent conversation:\n"
        for convo in recent_convos:
            context_for_ai += f"User: {convo['user_message']}\nCortana: {convo['bot_response'][:100]}...\n"

    # PRIORITY CHECK 1: Handle acknowledgments/thanks BEFORE anything else
    # This prevents "thank you" from being treated as a greeting
    import re
    import random

    message_lower = message_text.lower()
    acknowledgment_words = ["thanks", "thank", "thx", "ty", "tysm", "appreciate", "appreciated"]
    positive_words = ["great", "good", "nice", "awesome", "perfect", "excellent", "amazing"]

    # Check for acknowledgments
    has_acknowledgment = any(word in message_lower for word in acknowledgment_words)
    has_positive = any(word in message_lower for word in positive_words)

    if has_acknowledgment or (has_positive and len(message_text.split()) <= 3):
        # Short, professional acknowledgments
        acknowledgment_responses = [
            "Anytime, Chief. 😎",
            "You got it. 👍",
            "Happy to help!",
            "Always at your service.",
            "Glad I could help! 💙",
            "My pleasure!"
        ]

        response = random.choice(acknowledgment_responses)

        # Save to conversation memory
        memory = ConversationMemory(db, user.id)
        memory.add_conversation(
            user_message=message_text,
            bot_response=response,
            intent="acknowledgment",
            context_tags=["thanks", "positive"]
        )

        return response

    # PRIORITY CHECK 2: Gym Onboarding Flow (must be before AI agent)
    # Check if user is in onboarding or wants to start
    from services.health_agent import HealthAgent

    health_agent = HealthAgent(db, user.id)

    # FIRST: Check if user is currently in onboarding (HIGHEST PRIORITY)
    if health_agent.is_onboarding_in_progress():
        response = health_agent.process_onboarding_answer(message_text)

        # Save to conversation memory
        memory.add_conversation(
            user_message=message_text,
            bot_response=response,
            intent="gym_onboarding_answer",
            context_tags=["gym", "onboarding"]
        )

        # If onboarding just completed, generate workout plan
        if "Profile Saved!" in response:
            from services.workout_program_generator import WorkoutProgramGenerator

            generator = WorkoutProgramGenerator(db)
            try:
                workout_plans = generator.generate_program(user.id, weeks=4)
                response += f"\n\n✅ Generated {len(workout_plans)} workout sessions for your first 4 weeks!"
                response += "\n\nAsk 'show my workout plan' to see this week's workouts! 💪"
            except Exception as e:
                logger.error(f"Error generating workout program: {e}")
                response += "\n\n⚠️ I'll generate your workout plan shortly!"

        return response

    # SECOND: Check for workout plan viewing (BEFORE gym onboarding check)
    workout_view_keywords = ["show my workout", "today's workout", "this week's workout",
                            "workout schedule", "weekly schedule", "workout setup",
                            "show workout", "my workout plan", "what are the exercises"]
    if any(keyword in message_lower for keyword in workout_view_keywords):
        from services.health_agent import HealthAgent
        health_agent = HealthAgent(db, user.id)

        # Check if user has a profile
        profile = health_agent.get_user_profile()
        if not profile:
            response = "You haven't set up your gym profile yet! 🏋️\n\nSay 'start gym onboarding' to get started!"
        elif "weekly" in message_lower or "week" in message_lower:
            # Show weekly overview
            response = health_agent.get_weekly_overview()
        else:
            # Show today's workout by default
            response = health_agent.get_daily_workout()

        # Save to conversation memory
        memory.add_conversation(
            user_message=message_text,
            bot_response=response,
            intent="view_workout_plan",
            context_tags=["gym", "workout", "schedule"]
        )

        return response

    # THIRD: Check if starting gym onboarding
    gym_keywords = ["gym onboarding", "start gym", "gym profile", "fitness profile"]
    if any(keyword in message_lower for keyword in gym_keywords):
        if "restart" in message_lower:
            # Delete existing profile and restart
            from models.workout import UserGymProfile
            existing_profile = db.query(UserGymProfile).filter(
                UserGymProfile.user_id == user.id
            ).first()
            if existing_profile:
                db.delete(existing_profile)
                db.commit()

        response = health_agent.start_onboarding()

        # Save to conversation memory
        memory.add_conversation(
            user_message=message_text,
            bot_response=response,
            intent="gym_onboarding_start",
            context_tags=["gym", "onboarding"]
        )

        return response

    # PRIORITY CHECK 3: AI-Based Intent Classification for intelligent routing
    from services.intent_classifier import IntentClassifier
    from services.rag_service import RAGService

    try:
        intent_classifier = IntentClassifier()
        intent = intent_classifier.classify_intent(message_text)
        logger.info(f"Message intent classified as: {intent}")

        # Route based on intent
        if intent in ["workout_progress", "exercise_form", "nutrition"]:
            # Use RAG system (with personal context for workout_progress)
            try:
                rag_service = RAGService(db, user.id)
                response = rag_service.query(message_text)

                # Split long messages for Telegram's 4096 char limit
                if len(response) > 3500:
                    chunks = split_long_message(response)
                    response = chunks  # Return list for telegram service to handle
                    logger.info(f"Split RAG response into {len(chunks)} chunks")

                # Save to conversation memory
                memory.add_conversation(
                    user_message=message_text,
                    bot_response=response if isinstance(response, str) else response[0],  # Save first chunk
                    intent=f"rag_{intent}",
                    context_tags=["rag", intent, "knowledge"]
                )

                # Log response time
                elapsed_ms = (time.time() - start_time) * 1000
                logger.info(f"[TIMING] Response time: {elapsed_ms:.0f}ms | Query: '{message_text[:50]}' | Handler: RAG ({intent})")

                return response
            except Exception as e:
                logger.error(f"RAG service error: {e}")
                # Fall through to intelligent agent if RAG fails

        elif intent == "expense_logging":
            # Parse and log expense using helper function
            response = parse_and_log_expense(db, user.id, message_text)

            # Save to conversation memory
            memory.add_conversation(
                user_message=message_text,
                bot_response=response,
                intent="expense_logging",
                context_tags=["finance", "expense", "logging"]
            )

            # Log response time
            elapsed_ms = (time.time() - start_time) * 1000
            logger.info(f"[TIMING] Response time: {elapsed_ms:.0f}ms | Query: '{message_text[:50]}' | Handler: parse_and_log_expense")

            return response

        elif intent == "spending_analysis":
            # Use intelligent agent for financial analysis
            from services.intelligent_agent import IntelligentAgent

            # Build conversation context
            context_summary = ""
            if recent_convos:
                context_summary = "Recent conversation:\n"
                for convo in recent_convos[-3:]:
                    context_summary += f"User: {convo['user_message']}\n"
                    context_summary += f"Cortana: {convo['bot_response']}\n\n"

            intelligent_ai = IntelligentAgent(db, user.id, recent_conversation=context_summary)
            response = intelligent_ai.process(message_text)

            if response and not response.startswith("Sorry, I encountered an error"):
                # Save to conversation memory
                memory.add_conversation(
                    user_message=message_text,
                    bot_response=response,
                    intent="spending_analysis",
                    context_tags=["finance", "spending", "intelligent"]
                )

                # Log response time
                elapsed_ms = (time.time() - start_time) * 1000
                logger.info(f"[TIMING] Response time: {elapsed_ms:.0f}ms | Query: '{message_text[:50]}' | Handler: IntelligentAgent (spending)")

                return response

        elif intent == "workout_viewing":
            # Use health agent to show workout schedule from DB
            from services.health_agent import HealthAgent
            health_agent = HealthAgent(db, user.id)

            # Check if user has a profile
            profile = health_agent.get_user_profile()
            if not profile:
                response = "You haven't set up your gym profile yet! 🏋️\n\nSay 'start gym onboarding' to get started!"
            elif "weekly" in message_lower or "week" in message_lower or "full" in message_lower:
                # Show weekly overview
                response = health_agent.get_weekly_overview()
            else:
                # Parse day from message if specified
                day_keywords = {
                    "monday": "monday", "mon": "monday",
                    "tuesday": "tuesday", "tue": "tuesday", "tues": "tuesday",
                    "wednesday": "wednesday", "wed": "wednesday",
                    "thursday": "thursday", "thu": "thursday", "thur": "thursday", "thurs": "thursday",
                    "friday": "friday", "fri": "friday",
                    "saturday": "saturday", "sat": "saturday",
                    "sunday": "sunday", "sun": "sunday",
                    "tomorrow": "tomorrow"
                }

                specified_day = None
                for keyword, day_name in day_keywords.items():
                    if keyword in message_lower:
                        specified_day = day_name
                        break

                # Get workout for specified day or today
                response = health_agent.get_daily_workout(day=specified_day)

            # Save to conversation memory
            memory.add_conversation(
                user_message=message_text,
                bot_response=response,
                intent="workout_viewing",
                context_tags=["gym", "workout", "schedule"]
            )

            # Log response time
            elapsed_ms = (time.time() - start_time) * 1000
            logger.info(f"[TIMING] Response time: {elapsed_ms:.0f}ms | Query: '{message_text[:50]}' | Handler: HealthAgent (workout_viewing)")

            return response

        # If intent is "general" or other handlers failed, fall through to default intelligent agent

    except Exception as e:
        logger.error(f"Intent classification error: {e}")
        # Fall through to default intelligent agent

    # PRIORITY CHECK 4: Intelligent AI Agent (handles general queries and fallback)
    # Skip only for expense logging (which needs structured parsing)
    from services.intelligent_agent import IntelligentAgent

    # Build recent conversation context for AI - include FULL responses for better context
    context_summary = ""
    if recent_convos:
        context_summary = "Recent conversation:\n"
        for convo in recent_convos[-3:]:  # Last 3 messages
            context_summary += f"User: {convo['user_message']}\n"
            # Include full response (not truncated) so AI can see exact amounts/data mentioned
            context_summary += f"Cortana: {convo['bot_response']}\n\n"

    # Let intelligent AI handle the request
    intelligent_ai = IntelligentAgent(db, user.id, recent_conversation=context_summary)

    # Let intelligent AI handle ALL requests first (it knows when it's expense logging)
    try:
        response = intelligent_ai.process(message_text)

        # If response is None, it means DEFER_TO_EXPENSE_LOGGING - fall through to old system
        if response is None:
            logger.info("IntelligentAgent deferred to expense logging system")
            pass  # Continue to old expense logging system below
        # If the IntelligentAgent returns a valid response, use it
        elif response and not response.startswith("Sorry, I encountered an error"):
            # Save to conversation memory
            memory.add_conversation(
                user_message=message_text,
                bot_response=response,
                intent="ai_handled",
                context_tags=["intelligent", "ai"]
            )

            # Log response time
            elapsed_ms = (time.time() - start_time) * 1000
            logger.info(f"[TIMING] Response time: {elapsed_ms:.0f}ms | Query: '{message_text[:50]}' | Handler: IntelligentAgent")

            return response

    except Exception as e:
        logger.error(f"Intelligent AI error: {str(e)}")
        # Fall back to old system if something fails

    # OLD SYSTEM: Detect user intent with conversation context (ONLY for expense logging now)
    ai_service = AIService()

    # Check if message might be referring to previous conversation (e.g., "change that to 30")
    message_lower = message_text.lower()
    contextual_words = ["that", "it", "change", "update", "edit", "last", "previous"]
    has_contextual_reference = any(word in message_lower for word in contextual_words)

    # If user is referring to context and we have recent expenses, enhance the message
    enhanced_message = message_text
    if has_contextual_reference and recent_convos:
        # Check if last conversation was about an expense
        last_convo = recent_convos[-1] if recent_convos else None
        if last_convo and last_convo.get('intent') == 'expense_logging':
            # Add context to help AI understand "that" refers to last expense
            enhanced_message = f"{message_text}\n[Context: User just logged an expense in previous message: '{last_convo['user_message']}']"

    intent_result = ai_service.detect_command_intent(enhanced_message)

    # Handle different intents
    if intent_result["intent"] == "weekly_summary":
        from services.finance_agent import FinanceAgent
        agent = FinanceAgent(db, user.id)
        summary_message = agent.format_summary_message(summary_type="weekly")
        return f"Hey {user.full_name}! 👋\n\n{summary_message}"

    elif intent_result["intent"] == "monthly_summary":
        from services.finance_agent import FinanceAgent
        agent = FinanceAgent(db, user.id)
        summary_message = agent.format_summary_message(summary_type="monthly")
        return f"Hey {user.full_name}! 👋\n\n{summary_message}"

    elif intent_result["intent"] == "detailed_report":
        from services.finance_agent import FinanceAgent
        agent = FinanceAgent(db, user.id)
        report = agent.get_detailed_report(period="weekly")
        return report

    elif intent_result["intent"] == "insights" or intent_result["intent"] == "predictions":
        from services.spending_insights import SpendingInsights
        insights = SpendingInsights(db, user.id)
        insights_message = insights.format_insights_message()
        return insights_message

    elif intent_result["intent"] == "export_pdf" or intent_result["intent"] == "export_excel":
        # Handle in telegram_service.py with file sending
        return {"type": "export", "format": "pdf" if intent_result["intent"] == "export_pdf" else "excel"}

    elif intent_result["intent"] == "news_briefing":
        from services.news_aggregator_enhanced import NewsAggregatorEnhanced
        news_agent = NewsAggregatorEnhanced(db, user.id)
        news_message = news_agent.get_daily_briefing()

        # Split message if too long for Telegram
        chunks = news_agent.split_message(news_message)
        return chunks if len(chunks) > 1 else news_message

    elif intent_result["intent"] == "global_news":
        from services.news_aggregator_enhanced import NewsAggregatorEnhanced
        news_agent = NewsAggregatorEnhanced(db, user.id)
        # For global news, use the new global news method
        news_message = news_agent.get_global_news()

        # Split message if too long for Telegram
        chunks = news_agent.split_message(news_message)
        return chunks if len(chunks) > 1 else news_message

    elif intent_result["intent"] == "news_category":
        news_query = ai_service.parse_news_query(message_text)

        if not news_query.get("success"):
            return "Sorry, I couldn't understand. Try: 'Give me tech news', 'News from Beirut', or 'Business news'"

        from services.news_aggregator_enhanced import NewsAggregatorEnhanced
        news_agent = NewsAggregatorEnhanced(db, user.id)

        # Handle location queries
        if news_query.get("query_type") == "location":
            location = news_query.get("location", "lebanon")
            news_message = news_agent.get_location_news(location)

            # Split message if too long for Telegram
            chunks = news_agent.split_message(news_message)
            return chunks if len(chunks) > 1 else news_message

        # Handle category queries
        category = news_query.get("category", "general")
        if category != "general":
            news_message = news_agent.get_category_news(category)
        else:
            news_message = news_agent.get_daily_briefing()

        # Split message if too long for Telegram
        chunks = news_agent.split_message(news_message)
        return chunks if len(chunks) > 1 else news_message

    elif intent_result["intent"] == "news_search":
        news_query = ai_service.parse_news_query(message_text)

        if not news_query.get("success"):
            return "Sorry, I couldn't understand what to search for. Try: 'Search news about AI' or 'Find articles about SpaceX'"

        from services.news_agent import NewsAgent
        news_agent = NewsAgent(db, user.id)
        keywords = news_query.get("keywords", "")
        news_message = news_agent.search_news(keywords)
        return news_message

    elif intent_result["intent"] == "set_news_preferences":
        news_query = ai_service.parse_news_query(message_text)

        if not news_query.get("success"):
            return "Sorry, I couldn't understand your news preferences. Try: 'I'm interested in technology and business'"

        from models.news import NewsPreference

        prefs = db.query(NewsPreference).filter(NewsPreference.user_id == user.id).first()

        interests = news_query.get("interests", "")

        if prefs:
            prefs.categories = interests
            db.commit()
            message = f"✅ Updated your news preferences!\n\n📰 You'll now get news about: {interests}"
        else:
            new_prefs = NewsPreference(
                user_id=user.id,
                categories=interests,
                keywords="",
                country="us",
                language="en",
                morning_summary_enabled=True,
                preferred_time="08:00"
            )
            db.add(new_prefs)
            db.commit()
            message = f"✅ Set up your news preferences!\n\n📰 You'll get news about: {interests}"

        message += "\n\nI'll send you a personalized news briefing every morning! 🌅"
        return message

    elif intent_result["intent"] == "add_recurring":
        recurring_info = ai_service.parse_recurring_expense_message(message_text)

        if not recurring_info.get("success"):
            return recurring_info.get("error_message")

        from services.recurring_expense_service import RecurringExpenseService

        recurring_service = RecurringExpenseService(db)
        recurring_expense = recurring_service.add_recurring_expense(
            user_id=user.id,
            name=recurring_info["name"],
            amount=recurring_info["amount"],
            category=recurring_info["category"],
            frequency=recurring_info["frequency"]
        )

        message = f"✅ Added recurring expense: {recurring_info['name']}\n\n"
        message += f"💰 Amount: ${recurring_info['amount']:.2f}\n"
        message += f"📁 Category: {recurring_info['category']}\n"
        message += f"🔄 Frequency: {recurring_info['frequency']}\n\n"
        message += f"I'll automatically track this expense and remind you before it's due! 📅"

        return message

    elif intent_result["intent"] == "list_recurring":
        from services.recurring_expense_service import RecurringExpenseService

        recurring_service = RecurringExpenseService(db)
        message = recurring_service.format_recurring_expenses_message(user.id)

        return message

    elif intent_result["intent"] == "cancel_recurring":
        # Parse subscription name from message
        message_lower = message_text.lower()
        from models.recurring_expense import RecurringExpense

        # Find matching subscription
        recurring_expenses = db.query(RecurringExpense).filter(
            RecurringExpense.user_id == user.id,
            RecurringExpense.is_active == 1
        ).all()

        match = None
        for expense in recurring_expenses:
            if expense.name.lower() in message_lower:
                match = expense
                break

        if match:
            from services.recurring_expense_service import RecurringExpenseService
            recurring_service = RecurringExpenseService(db)
            recurring_service.delete_recurring_expense(user.id, match.id)

            return f"✅ Cancelled recurring expense: {match.name}\n\nI'll no longer automatically track this expense."
        else:
            return "I couldn't find that subscription. Try saying 'Show my subscriptions' to see what's active."

    elif intent_result["intent"] == "set_budget":
        budget_info = ai_service.parse_budget_message(message_text)

        if not budget_info.get("success"):
            return budget_info.get("error_message")

        # Validate period value
        try:
            period_value = budget_info["period"].lower()
            if period_value not in ["weekly", "monthly"]:
                return "Please specify a weekly or monthly budget. For example: 'Set my weekly budget to $500' or 'Set my monthly budget to $2000'"

            period = BudgetPeriod(period_value)
        except (ValueError, KeyError) as e:
            logger.error(f"Invalid budget period: {budget_info.get('period')} - {str(e)}")
            return "Please specify a weekly or monthly budget. For example: 'Set my weekly budget to $500'"

        existing_budget = db.query(Budget).filter(
            Budget.user_id == user.id,
            Budget.period == period
        ).first()

        if existing_budget:
            existing_budget.amount = budget_info["amount"]
            db.commit()
            message = f"✅ Updated your {budget_info['period']} budget to ${budget_info['amount']:.2f}!"
        else:
            new_budget = Budget(
                user_id=user.id,
                amount=budget_info["amount"],
                period=BudgetPeriod(budget_info["period"])
            )
            db.add(new_budget)
            db.commit()
            message = f"✅ Set your {budget_info['period']} budget to ${budget_info['amount']:.2f}!"

        message += "\n\nI'll alert you if you're getting close to this limit! 💰"
        return message

    elif intent_result["intent"] == "set_goal":
        goal_info = ai_service.parse_goal_message(message_text)

        if not goal_info.get("success"):
            return goal_info.get("error_message")

        existing_goal = db.query(CategoryGoal).filter(
            CategoryGoal.user_id == user.id,
            CategoryGoal.category == goal_info["category"],
            CategoryGoal.period == BudgetPeriod(goal_info["period"])
        ).first()

        if existing_goal:
            existing_goal.goal_amount = goal_info["amount"]
            db.commit()
            message = f"✅ Updated your {goal_info['category']} goal to ${goal_info['amount']:.2f} per {goal_info['period']}!"
        else:
            new_goal = CategoryGoal(
                user_id=user.id,
                category=goal_info["category"],
                goal_amount=goal_info["amount"],
                period=BudgetPeriod(goal_info["period"]),
                alert_threshold=0.8
            )
            db.add(new_goal)
            db.commit()
            message = f"✅ Set your {goal_info['category']} goal to ${goal_info['amount']:.2f} per {goal_info['period']}!"

        message += f"\n\nI'll alert you when you reach 80% of your {goal_info['category']} budget! 🎯"
        return message

    elif intent_result["intent"] == "update_schedule":
        schedule_info = ai_service.parse_schedule_message(message_text)

        if not schedule_info.get("success"):
            return schedule_info.get("error_message")

        from main import scheduler

        day_of_week = schedule_info.get("day_of_week")
        scheduler.update_user_schedule(
            user_id=user.id,
            schedule_type=schedule_info["schedule_type"],
            hour=schedule_info["hour"],
            minute=schedule_info["minute"],
            day_of_week=day_of_week
        )

        hour_12 = schedule_info["hour"] % 12 or 12
        am_pm = "AM" if schedule_info["hour"] < 12 else "PM"
        time_str = f"{hour_12}:{schedule_info['minute']:02d} {am_pm}"

        if schedule_info["schedule_type"] == "daily_reminder":
            message = f"✅ Updated your daily reminder to {time_str}!"
            message += f"\n\nI'll remind you every day at this time to log your expenses! ⏰"
        else:
            day_name = day_of_week.capitalize() if day_of_week else "Sunday"
            message = f"✅ Updated your weekly summary to {day_name} at {time_str}!"
            message += f"\n\nI'll send your financial summary every {day_name} at this time! 📊"

        return message

    elif intent_result["intent"] == "delete_expense":
        last_expense = db.query(FinanceRecord).filter(
            FinanceRecord.user_id == user.id,
            FinanceRecord.transaction_type == TransactionType.EXPENSE
        ).order_by(FinanceRecord.transaction_date.desc()).first()

        if not last_expense:
            return "You don't have any expenses to delete!"

        amount = last_expense.amount
        category = last_expense.category
        description = last_expense.description

        db.delete(last_expense)
        db.commit()

        return f"✅ Deleted your last expense:\n${amount:.2f} - {category} ({description})"

    elif intent_result["intent"] == "edit_expense":
        # Use enhanced_message with context so AI understands "that" refers to last expense
        edit_info = ai_service.parse_expense_edit_message(enhanced_message)

        if not edit_info.get("success"):
            return edit_info.get("error_message")

        if edit_info["target"] == "last":
            expense = db.query(FinanceRecord).filter(
                FinanceRecord.user_id == user.id
            ).order_by(FinanceRecord.transaction_date.desc()).first()
        else:
            old_amount = edit_info.get("old_amount")
            expense = db.query(FinanceRecord).filter(
                FinanceRecord.user_id == user.id,
                FinanceRecord.amount == old_amount
            ).order_by(FinanceRecord.transaction_date.desc()).first()

        if not expense:
            return "Couldn't find that expense. Try being more specific!"

        old_amount = expense.amount
        expense.amount = edit_info["new_amount"]
        db.commit()

        return f"✅ Updated expense:\nChanged from ${old_amount:.2f} to ${edit_info['new_amount']:.2f}\nCategory: {expense.category}"

    elif intent_result["intent"] == "greeting":
        # Check conversation memory - if we already greeted recently, continue conversation
        memory = ConversationMemory(db, user.id)
        recent_convos = memory.get_recent_conversations(limit=5)

        # Check if we greeted in the last 5 messages
        recently_greeted = any(
            convo['intent'] == "greeting"
            for convo in recent_convos
            if (datetime.now() - convo['timestamp'].replace(tzinfo=None)).total_seconds() < 300  # 5 minutes
        )

        if recently_greeted:
            # Continue conversation instead of greeting again
            recent_context = memory.get_context_summary()
            response = ai_service.generate_conversational_response(message_text, context=recent_context)

            memory.add_conversation(
                user_message=message_text,
                bot_response=response,
                intent="general_conversation",
                context_tags=["casual", "chat", "follow_up"]
            )

            return response
        else:
            # First greeting - give smart greeting
            proactive = ProactiveSuggestions(db, user.id)
            smart_greeting = proactive.get_smart_greeting()

            memory.add_conversation(
                user_message=message_text,
                bot_response=smart_greeting,
                intent="greeting",
                context_tags=["greeting", "casual"]
            )

            return smart_greeting

    elif intent_result["intent"] == "expense_logging":
        parsed_result = ai_service.parse_expense_message(message_text)

        if parsed_result.get("needs_clarification"):
            # Check if we have partial transaction data (e.g., amount but no category)
            if parsed_result.get("transactions") and len(parsed_result.get("transactions")) > 0:
                # Store pending expense data for next message
                if not context_data:
                    context_data = {}

                partial_transaction = parsed_result["transactions"][0]
                context_data['pending_expense'] = {
                    'amount': partial_transaction.get('amount', 0),
                    'description': partial_transaction.get('description', message_text[:50]),
                    'question': parsed_result.get("clarification_question")
                }

                logger.info(f"Stored pending expense: ${partial_transaction.get('amount', 0)} - awaiting category clarification")

            return parsed_result.get("clarification_question")

        transactions_added = []
        for transaction_data in parsed_result.get("transactions", []):
            transaction = FinanceRecord(
                user_id=user.id,
                amount=transaction_data["amount"],
                transaction_type=TransactionType.INCOME if transaction_data["type"] == "income" else TransactionType.EXPENSE,
                category=transaction_data["category"],
                description=transaction_data["description"],
                transaction_date=datetime.now()
            )

            db.add(transaction)
            transactions_added.append(transaction_data)

        db.commit()

        # Check for overspending
        budget_monitor = BudgetMonitor(db)
        alerts = []
        for transaction_data in transactions_added:
            if transaction_data["type"] == "expense":
                alert = budget_monitor.check_category_goal(user.id, transaction_data["category"])
                if alert:
                    alerts.append(f"⚠️ {transaction_data['category']}: ${alert['current_spending']:.2f} / ${alert['goal_amount']:.2f} ({alert['percentage']:.0f}%)")

        # Get proactive suggestions after logging expense
        proactive = ProactiveSuggestions(db, user.id)
        proactive_warnings = proactive.get_all_suggestions()

        # Simple, direct confirmation - no chattiness when executing commands
        if len(transactions_added) == 1:
            trans = transactions_added[0]
            response = f"✅ Logged ${trans['amount']:.2f} - {trans['category']}"
        else:
            total = sum(t['amount'] for t in transactions_added)
            response = f"✅ Logged {len(transactions_added)} transactions (${total:.2f} total)"

        # Add budget alerts
        if alerts:
            response += "\n\n🎯 *Budget Alerts:*\n" + "\n".join(alerts)

        # Add proactive suggestions (limit to 1 to avoid overwhelming)
        if proactive_warnings and not alerts:  # Only if no budget alerts
            response += f"\n\n💡 {proactive_warnings[0]}"

        # Save conversation to memory
        memory = ConversationMemory(db, user.id)
        memory.add_conversation(
            user_message=message_text,
            bot_response=response,
            intent="expense_logging",
            context_tags=[t["category"] for t in transactions_added]
        )

        return response

    else:
        # Handle general queries with better context
        from services.finance_agent import FinanceAgent

        # Check if asking about schedules
        message_lower = message_text.lower()

        if any(word in message_lower for word in ["schedule", "reminder", "when", "time"]):
            from models.user_preferences import UserSchedulePreference

            prefs = db.query(UserSchedulePreference).filter(
                UserSchedulePreference.user_id == user.id
            ).first()

            if prefs:
                if "daily" in message_lower or "reminder" in message_lower:
                    hour_12 = prefs.daily_reminder_hour % 12 or 12
                    am_pm = "AM" if prefs.daily_reminder_hour < 12 else "PM"
                    return f"Your daily expense reminder is set for {hour_12}:{prefs.daily_reminder_minute:02d} {am_pm} every day. 📅\n\nI'll remind you to log your expenses at that time!"

                elif "weekly" in message_lower or "summary" in message_lower:
                    hour_12 = prefs.weekly_summary_hour % 12 or 12
                    am_pm = "AM" if prefs.weekly_summary_hour < 12 else "PM"
                    day = prefs.weekly_summary_day.capitalize()
                    return f"Your weekly financial summary is set for every {day} at {hour_12}:{prefs.weekly_summary_minute:02d} {am_pm}. 📊\n\nWant to change it? Just say: 'Change weekly summary to Friday at 6 PM'"
            else:
                return "You haven't set up any schedules yet! Want me to set them up?\n\nJust say:\n• 'Set daily reminder to 8 PM'\n• 'Send weekly summary on Sunday at 6 PM'"

        # Check if asking about last transaction
        elif any(word in message_lower for word in ["last", "recent", "latest"]) and any(word in message_lower for word in ["spend", "expense", "transaction", "purchase"]):
            last_expense = db.query(FinanceRecord).filter(
                FinanceRecord.user_id == user.id
            ).order_by(FinanceRecord.transaction_date.desc()).first()

            if last_expense:
                trans_type = "income" if last_expense.transaction_type == TransactionType.INCOME else "expense"

                # Handle timezone-aware datetime comparison
                now = datetime.now()
                trans_date = last_expense.transaction_date

                # Make both timezone-naive for comparison
                if trans_date.tzinfo is not None:
                    trans_date = trans_date.replace(tzinfo=None)

                time_ago = (now - trans_date).total_seconds() / 3600  # hours

                if time_ago < 1:
                    time_str = f"{int(time_ago * 60)} minutes ago"
                elif time_ago < 24:
                    time_str = f"{int(time_ago)} hours ago"
                else:
                    time_str = f"{int(time_ago / 24)} days ago"

                return f"Scanning financial records... Found it.\n\n💰 ${last_expense.amount:.2f} - {last_expense.category}\n📝 {last_expense.description}\n🕐 {time_str}\n\nNeed me to delete this? Or did you finally remember tracking your expenses? 😏"
            else:
                return "Your transaction history is emptier than space itself. 🌌\n\nStart tracking by saying:\n• 'I spent $50 on groceries'\n• 'Got paid $3000 today'\n\nI can't help if you don't give me data to work with!"

        # Check if asking about spending in a category
        elif any(cat in message_lower for cat in ["food", "transport", "utilities", "entertainment", "shopping", "health"]):
            from services.finance_agent import FinanceAgent
            agent = FinanceAgent(db, user.id)
            summary = agent.get_weekly_summary()

            for cat in ["food", "transport", "utilities", "entertainment", "shopping", "health"]:
                if cat in message_lower:
                    spent = summary['expenses_by_category'].get(cat, 0)

                    # Check if there's a goal
                    goal = db.query(CategoryGoal).filter(
                        CategoryGoal.user_id == user.id,
                        CategoryGoal.category == cat
                    ).first()

                    if goal:
                        percentage = (spent / goal.goal_amount * 100) if goal.goal_amount > 0 else 0
                        remaining = goal.goal_amount - spent

                        if percentage >= 100:
                            return f"🚨 You've spent ${spent:.2f} on {cat} this week.\n\nThat's ${abs(remaining):.2f} OVER your ${goal.goal_amount:.2f} goal! ({percentage:.0f}%)\n\nTime to cut back! 💪"
                        elif percentage >= 80:
                            return f"⚠️ You've spent ${spent:.2f} on {cat} this week.\n\nYou're at {percentage:.0f}% of your ${goal.goal_amount:.2f} goal.\nRemaining: ${remaining:.2f}\n\nWatch your spending! 👀"
                        else:
                            return f"✅ You've spent ${spent:.2f} on {cat} this week.\n\nThat's {percentage:.0f}% of your ${goal.goal_amount:.2f} goal.\nRemaining: ${remaining:.2f}\n\nYou're doing great! Keep it up! 💪"
                    else:
                        if spent > 0:
                            return f"You've spent ${spent:.2f} on {cat} this week.\n\nWant to set a budget for this category? Just say:\n'I want to spend max $500 on {cat} per month'"
                        else:
                            return f"You haven't spent anything on {cat} this week yet!"
                    break

        # Generic conversational response - be a companion, not just finance
        # Get conversation context from memory
        memory = ConversationMemory(db, user.id)
        recent_context = memory.get_context_summary()

        # Generate response with memory context
        response = ai_service.generate_conversational_response(message_text, context=recent_context)

        # Save to memory
        memory.add_conversation(
            user_message=message_text,
            bot_response=response,
            intent="general_conversation",
            context_tags=["casual", "chat"]
        )

        return response
