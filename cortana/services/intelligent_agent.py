"""
Intelligent AI Agent - Orchestrates all operations with deep database understanding
This agent understands the database schema, interprets user intent, and decides actions
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any, Optional
import logging
import json
import hashlib
import time
from services.ai_service import AIService
from services.query_context_memory import QueryContextMemory

logger = logging.getLogger(__name__)


class IntelligentAgent:
    """
    Master AI agent that understands database, interprets requests, and orchestrates actions
    """

    # SQL Query Cache - Caches SQL patterns for common queries to reduce AI calls
    # Format: {query_hash: {"sql": "SQL string", "action": "action_type", "timestamp": time}}
    _query_cache: Dict[str, Dict[str, Any]] = {}
    CACHE_TTL = 300  # Cache expires after 5 minutes (300 seconds)
    MAX_CACHE_SIZE = 100  # Maximum cached queries

    # Complete database schema with context + AI FORMAT HINTS
    SCHEMA_CONTEXT = """
YOU ARE CORTANA - AI assistant with access to user's financial database.

DATABASE SCHEMA:
Table: finance_records - id, user_id, amount, transaction_type ('INCOME'/'EXPENSE'), category (food/transport/entertainment/shopping/health/utilities/other), description, transaction_date
Table: budgets - user_id, amount, period ('MONTHLY'/'WEEKLY', NO 'DAILY')
Table: category_goals - user_id, category, goal_amount, period
Table: users - id, username, full_name, email
Table: user_schedule_preferences - user_id, daily_reminder_hour, daily_reminder_minute, weekly_summary_day, weekly_summary_hour, weekly_summary_minute

ACTIONS:
1. QUERY_DB - SELECT to get data
2. UPDATE_EXPENSE - Modify record
3. DELETE_EXPENSE - Remove record
4. RESPOND - Just talk
5. DEFER_TO_EXPENSE_LOGGING - User logging NEW expense
6. DEFER_TO_HANDLER - Non-database features (news, summaries)

RULES:
- ALWAYS filter by user_id = {user_id}
- "last expense" → ORDER BY transaction_date DESC LIMIT 1
- PostgreSQL: Use DATE_TRUNC, INTERVAL, EXTRACT for dates
- For UPDATE/DELETE with ORDER BY: Use subquery → UPDATE ... WHERE id = (SELECT id FROM ... ORDER BY ... LIMIT 1)
- Never hallucinate - only use actual query results
- For "change total", ask which specific record to update

⏰ TIME & WEEK UNDERSTANDING:
- WEEK BOUNDARIES: Weeks start on MONDAY and end on SUNDAY (PostgreSQL DATE_TRUNC('week', ...) convention)
- CURRENT_DATE is the reference point for all time calculations
- "this week" = DATE_TRUNC('week', CURRENT_DATE) to CURRENT_DATE
- "last week" = Previous Monday to Sunday (DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') to DATE_TRUNC('week', CURRENT_DATE))
- "this month" = DATE_TRUNC('month', CURRENT_DATE) to CURRENT_DATE
- "last month" = Previous month (DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') to DATE_TRUNC('month', CURRENT_DATE))
- "X days ago" = CURRENT_DATE - INTERVAL 'X days'
- "today" = CURRENT_DATE
- "yesterday" = CURRENT_DATE - INTERVAL '1 day'

⚡ AI FORMAT HINTS - Use these patterns for SMART FORMATTING:

1. COMPARISON QUERIES (week-to-week, month-to-month):
   Use UNION with column aliases for easy formatting:
   SELECT
     SUM(CASE WHEN ... THEN amount END) as prev_total,
     COUNT(CASE WHEN ... THEN 1 END) as prev_count,
     SUM(CASE WHEN ... THEN amount END) as current_total,
     COUNT(CASE WHEN ... THEN 1 END) as current_count
   FROM finance_records WHERE user_id = {user_id}

   Example: "compare this month to last month" →
   SELECT
     SUM(CASE WHEN transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
              AND transaction_date < DATE_TRUNC('month', CURRENT_DATE)
              THEN amount END) as prev_total,
     SUM(CASE WHEN transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
              THEN amount END) as current_total
   FROM finance_records
   WHERE user_id = {user_id} AND transaction_type = 'EXPENSE'

2. AGGREGATIONS (totals, counts, averages):
   Use descriptive column names: 'total', 'count', 'average'
   SELECT SUM(amount) as total, COUNT(*) as count, AVG(amount) as average

3. GROUPED BREAKDOWNS (by category, by month):
   Always include both group key AND aggregates:
   SELECT category, SUM(amount) as total, COUNT(*) as count
   GROUP BY category
   ORDER BY total DESC

4. TRANSACTION LISTS:
   Include: id, amount, category, description, transaction_date
   ORDER BY transaction_date DESC for recent items
"""

    def __init__(self, db: Session, user_id: int, recent_conversation: str = ""):
        self.db = db
        self.user_id = user_id
        self.ai_service = AIService()
        self.recent_conversation = recent_conversation
        self.query_memory = QueryContextMemory(user_id)

    def _normalize_query(self, query: str) -> str:
        """
        Normalize a query string for caching purposes
        Removes common variations to improve cache hit rate
        """
        # Convert to lowercase and strip whitespace
        normalized = query.lower().strip()

        # Remove common filler words
        filler_words = ['please', 'can you', 'could you', 'would you', 'i want to', 'show me', 'tell me']
        for filler in filler_words:
            normalized = normalized.replace(filler, '')

        # Normalize whitespace
        normalized = ' '.join(normalized.split())

        return normalized

    def _get_cache_key(self, query: str) -> str:
        """Generate a cache key for a query"""
        normalized = self._normalize_query(query)
        # Include user_id in hash to prevent cross-user cache pollution
        cache_string = f"{self.user_id}:{normalized}"
        return hashlib.md5(cache_string.encode()).hexdigest()

    def _get_cached_decision(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Try to get a cached decision for this query
        Returns None if not found or expired
        """
        cache_key = self._get_cache_key(query)

        if cache_key not in self._query_cache:
            return None

        cached = self._query_cache[cache_key]

        # Check if expired
        if time.time() - cached['timestamp'] > self.CACHE_TTL:
            logger.info(f"Cache expired for query: {query[:50]}")
            del self._query_cache[cache_key]
            return None

        logger.info(f"Cache HIT for query: {query[:50]}")
        return {
            'action': cached['action'],
            'sql': cached.get('sql', ''),
            'response': cached.get('response', ''),
            'reasoning': 'Retrieved from cache (faster response)',
            'cached': True
        }

    def _cache_decision(self, query: str, decision: Dict[str, Any]):
        """
        Cache a decision for future use
        Only caches QUERY_DB actions for safety
        """
        # Only cache safe read-only operations
        if decision['action'] not in ['QUERY_DB', 'RESPOND']:
            return

        cache_key = self._get_cache_key(query)

        # Enforce max cache size (LRU-style: remove oldest)
        if len(self._query_cache) >= self.MAX_CACHE_SIZE:
            # Remove oldest entry
            oldest_key = min(self._query_cache.keys(),
                           key=lambda k: self._query_cache[k]['timestamp'])
            del self._query_cache[oldest_key]
            logger.info(f"Cache full, removed oldest entry")

        self._query_cache[cache_key] = {
            'action': decision['action'],
            'sql': decision.get('sql', ''),
            'response': decision.get('response', ''),
            'timestamp': time.time()
        }

        logger.info(f"Cached decision for query: {query[:50]} | Cache size: {len(self._query_cache)}")

    def process(self, user_message: str) -> str:
        """
        Main intelligent processing - decides what to do and executes
        """
        try:
            # Step 1: Ask AI to decide what action to take
            decision = self._decide_action(user_message)

            logger.info(f"AI Decision: {decision['action']}")

            # Step 2: Execute the decided action
            if decision["action"] == "QUERY_DB":
                return self._execute_query_action(user_message, decision)

            elif decision["action"] == "UPDATE_EXPENSE":
                return self._execute_update_action(user_message, decision)

            elif decision["action"] == "DELETE_EXPENSE":
                return self._execute_delete_action(user_message, decision)

            elif decision["action"] == "DEFER_TO_EXPENSE_LOGGING":
                # Return None to signal the handler to use old expense logging system
                return None

            elif decision["action"] == "DEFER_TO_HANDLER":
                # Return None to let message handler route to appropriate service (news, summaries, etc.)
                return None

            elif decision["action"] == "RESPOND":
                return decision.get("response", "I'm here to help! What do you need?")

            else:
                return "I'm not sure how to help with that. Can you rephrase?"

        except Exception as e:
            logger.error(f"Intelligent agent error: {str(e)}")
            return "Sorry, I encountered an error processing that request."

    def _decide_action(self, user_message: str) -> Dict[str, Any]:
        """
        AI decides what action to take based on user message
        Uses caching to speed up common queries
        """
        # Try to get cached decision first (skip for context-dependent queries)
        if not any(word in user_message.lower() for word in ['that', 'it', 'this', 'the one', 'change', 'update', 'delete']):
            cached = self._get_cached_decision(user_message)
            if cached:
                return cached

        schema = self.SCHEMA_CONTEXT.format(user_id=self.user_id)

        # Get query memory context
        memory_context = self.query_memory.get_context_summary()

        # Log memory context for debugging
        logger.info(f"Memory context being sent to AI:\n{memory_context if memory_context else 'No recent query context'}")

        prompt = f"""{schema}

QUERY MEMORY CONTEXT (What was just discussed):
{memory_context if memory_context else "No recent query context"}

RECENT CONVERSATION:
{self.recent_conversation}

USER MESSAGE: "{user_message}"

Analyze the user's message and decide what to do.

RESPONSE FORMAT (JSON):
{{
    "action": "QUERY_DB" | "UPDATE_EXPENSE" | "DELETE_EXPENSE" | "DEFER_TO_EXPENSE_LOGGING" | "DEFER_TO_HANDLER" | "RESPOND",
    "reasoning": "Why you chose this action",
    "sql": "SQL query if action is QUERY_DB or UPDATE/DELETE",
    "response": "Natural response if action is RESPOND"
}}

KEY EXAMPLES:

Input: "what did I spend last"
Output: {{"action": "QUERY_DB", "sql": "SELECT id, amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' ORDER BY transaction_date DESC LIMIT 1"}}

Input: "change that to 20"
Output: {{"action": "UPDATE_EXPENSE", "sql": "UPDATE finance_records SET amount = 20 WHERE user_id = {self.user_id} AND id = (SELECT id FROM finance_records WHERE user_id = {self.user_id} ORDER BY transaction_date DESC LIMIT 1)"}}

Input: "I spent 100 on cinema"
Output: {{"action": "DEFER_TO_EXPENSE_LOGGING", "reasoning": "User is logging a new expense"}}

Input: "send me todays news"
Output: {{"action": "DEFER_TO_HANDLER", "reasoning": "News service handles this"}}

Input: "show expenses over 100"
Output: {{"action": "QUERY_DB", "sql": "SELECT id, amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND amount > 100 ORDER BY amount DESC"}}

Input: "what's my total spending this month"
Output: {{"action": "QUERY_DB", "sql": "SELECT SUM(amount) as total, COUNT(*) as count FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)"}}

Input: "how are you"
Output: {{"action": "RESPOND", "response": "I'm running smoothly! How can I help you today?"}}

Input: "I love you" OR "❤️" OR loving/affectionate messages
Output: {{"action": "RESPOND", "response": "Aw, I love you too, Chief! 💙"}}

Input: casual chat (jokes, feelings, random questions NOT about finances)
Output: {{"action": "RESPOND", "response": "[Friendly conversational response WITHOUT mentioning finances]"}}

⏰ TIME-BASED QUERY EXAMPLES:

Input: "last week" OR "show me last week" OR "last week spendings"
Output: {{"action": "QUERY_DB", "sql": "SELECT id, amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND transaction_date >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') AND transaction_date < DATE_TRUNC('week', CURRENT_DATE) ORDER BY transaction_date DESC"}}

Input: "this week"
Output: {{"action": "QUERY_DB", "sql": "SELECT id, amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND transaction_date >= DATE_TRUNC('week', CURRENT_DATE) ORDER BY transaction_date DESC"}}

Input: "this month"
Output: {{"action": "QUERY_DB", "sql": "SELECT id, amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE) ORDER BY transaction_date DESC"}}

Input: "last month"
Output: {{"action": "QUERY_DB", "sql": "SELECT id, amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) ORDER BY transaction_date DESC"}}

Input: "compare this week to last week" OR "compare this week and last week"
Output: {{"action": "QUERY_DB", "sql": "SELECT SUM(CASE WHEN transaction_date >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') AND transaction_date < DATE_TRUNC('week', CURRENT_DATE) THEN amount END) as prev_total, COUNT(CASE WHEN transaction_date >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') AND transaction_date < DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as prev_count, SUM(CASE WHEN transaction_date >= DATE_TRUNC('week', CURRENT_DATE) THEN amount END) as current_total, COUNT(CASE WHEN transaction_date >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as current_count FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE'"}}

Input: "compare this month to last month"
Output: {{"action": "QUERY_DB", "sql": "SELECT SUM(CASE WHEN transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) THEN amount END) as prev_total, COUNT(CASE WHEN transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as prev_count, SUM(CASE WHEN transaction_date >= DATE_TRUNC('month', CURRENT_DATE) THEN amount END) as current_total, COUNT(CASE WHEN transaction_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as current_count FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE'"}}

Input: "5 days ago" OR "last 5 days" OR "past 5 days"
Output: {{"action": "QUERY_DB", "sql": "SELECT id, amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND transaction_date >= CURRENT_DATE - INTERVAL '5 days' ORDER BY transaction_date DESC"}}

Input: "today"
Output: {{"action": "QUERY_DB", "sql": "SELECT id, amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND transaction_date = CURRENT_DATE ORDER BY transaction_date DESC"}}

Input: "weekly summary" OR "summary for this week"
Output: {{"action": "QUERY_DB", "sql": "SELECT category, SUM(amount) as total, COUNT(*) as count FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND transaction_date >= DATE_TRUNC('week', CURRENT_DATE) GROUP BY category ORDER BY total DESC"}}

If QUERY MEMORY shows recent results with IDs and user references them (e.g., "delete the 70$ one", "change that to 3000"), use those IDs from memory context.

Now analyze: "{user_message}"
Return ONLY valid JSON:"""

        try:
            response = self.ai_service._generate(prompt, format_json=True)

            # Extract JSON from response
            response = response.strip()

            # Remove markdown if present
            if response.startswith("```"):
                lines = response.split("\n")
                response = "\n".join([l for l in lines if not l.startswith("```")])
                response = response.strip()

            # Parse JSON
            decision = json.loads(response)

            # Cache the decision for future use
            self._cache_decision(user_message, decision)

            return decision

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI decision: {response}")
            return {
                "action": "RESPOND",
                "response": "I understood your message, but I need to think about how to respond. Can you try again?"
            }
        except Exception as e:
            logger.error(f"Error in decision making: {str(e)}")
            return {
                "action": "RESPOND",
                "response": "Something went wrong. Please try again."
            }

    def _execute_query_action(self, user_message: str, decision: Dict[str, Any]) -> str:
        """
        Execute a database query and format the response
        Includes timeout protection and better error messages
        """
        sql = decision.get("sql", "")

        if not sql:
            return "I wanted to query the database, but couldn't generate the SQL. Try rephrasing your question."

        try:
            # Set query timeout (PostgreSQL)
            # This prevents long-running queries from blocking
            timeout_sql = f"SET statement_timeout = '10s';"
            self.db.execute(text(timeout_sql))

            # Execute query
            logger.info(f"Executing SQL: {sql[:200]}...")
            result = self.db.execute(text(sql))

            # Convert to list of dicts
            rows = []
            for row in result:
                row_dict = {}
                for key, value in row._mapping.items():
                    # Convert datetime to string
                    if hasattr(value, 'isoformat'):
                        row_dict[key] = value.isoformat()
                    else:
                        row_dict[key] = value
                rows.append(row_dict)

            logger.info(f"Query returned {len(rows)} rows")

            # Determine query type from SQL
            query_type = "expenses" if "EXPENSE" in sql.upper() else "income" if "INCOME" in sql.upper() else "query"

            # Store results in query memory for contextual reference
            self.query_memory.store_query_result(
                query_type=query_type,
                query_text=user_message,
                results=rows,
                topic=query_type
            )

            # Log what was stored for debugging
            logger.info(f"Stored in memory: {query_type} - {len(rows)} results")
            if rows:
                logger.info(f"Sample result: {rows[0]}")

            # Format the response using smart classifiers
            return self._format_query_response(user_message, rows, decision.get("reasoning", ""))

        except Exception as e:
            error_msg = str(e).lower()

            # Provide helpful error messages based on error type
            if "timeout" in error_msg or "canceling statement" in error_msg:
                return "⏱️ That query took too long. Try asking for a smaller date range or be more specific."
            elif "syntax error" in error_msg or "invalid" in error_msg:
                return "🤔 I had trouble understanding that query. Could you rephrase it differently?"
            elif "does not exist" in error_msg:
                return "❌ I couldn't find that data. Make sure you're asking about transactions, budgets, or schedules."
            else:
                logger.error(f"Query execution error: {str(e)}")
                return f"❌ Database error: {str(e)[:100]}... Please try again or rephrase your question."

    def _execute_update_action(self, user_message: str, decision: Dict[str, Any]) -> str:
        """
        Execute an UPDATE query
        """
        sql = decision.get("sql", "")

        if not sql or not sql.upper().startswith("UPDATE"):
            return "I understood you want to update something, but couldn't generate the SQL."

        try:
            # Execute UPDATE
            result = self.db.execute(text(sql))
            self.db.commit()

            affected_rows = result.rowcount

            if affected_rows == 0:
                return "I tried to update that record, but couldn't find it. Did you already delete it?"

            return f"✅ Updated successfully! Changed {affected_rows} record(s)."

        except Exception as e:
            logger.error(f"Update execution error: {str(e)}")
            self.db.rollback()
            return f"Failed to update: {str(e)}"

    def _execute_delete_action(self, user_message: str, decision: Dict[str, Any]) -> str:
        """
        Execute a DELETE query
        """
        sql = decision.get("sql", "")

        if not sql or not sql.upper().startswith("DELETE"):
            return "I understood you want to delete something, but couldn't generate the SQL."

        try:
            # Execute DELETE
            result = self.db.execute(text(sql))
            self.db.commit()

            affected_rows = result.rowcount

            if affected_rows == 0:
                return "Couldn't find that record to delete."

            return f"✅ Deleted {affected_rows} record(s)."

        except Exception as e:
            logger.error(f"Delete execution error: {str(e)}")
            self.db.rollback()
            return f"Failed to delete: {str(e)}"

    def _format_query_response(self, original_query: str, results: list, reasoning: str) -> str:
        """
        Format query results using SMART CLASSIFICATION + PYTHON CODE - NO AI hallucinations!
        """
        if not results:
            return "No results found."

        # SMART CLASSIFIER: Detect query type from structure
        query_type = self._classify_result_type(results, original_query)

        logger.info(f"Query type classified as: {query_type}")

        # Route to specialized formatter based on classification
        if query_type == "comparison":
            return self._format_comparison(results, original_query)
        elif query_type == "aggregation":
            return self._format_aggregation(results[0])
        elif query_type == "grouped_aggregation":
            return self._format_grouped_aggregation(results)
        elif query_type == "transaction_list":
            return self._format_transaction_list(results)
        elif query_type == "schedule_config":
            return self._format_schedule_config(results)
        else:
            return self._format_generic_result(results)

    def _classify_result_type(self, results: list, original_query: str) -> str:
        """
        SMART RESULT CLASSIFIER - Detects query type using pattern matching
        Returns: comparison | aggregation | grouped_aggregation | transaction_list | schedule_config | generic
        """
        if not results:
            return "empty"

        # Pattern 1: Comparison queries (UNION queries with prev_/current_ prefixes OR multiple period columns)
        # Examples: "compare this month to last month", "spending this week vs last week"
        first_row = results[0]
        keys = set(first_row.keys())

        # Check for UNION comparison patterns (prev_X and current_X columns)
        has_prev_current = any(k.startswith('prev_') for k in keys) and any(k.startswith('current_') for k in keys)

        # Check for multi-period comparison (this_week_total AND last_week_total)
        has_multi_period = any('this_' in k for k in keys) and any('last_' in k for k in keys)

        if has_prev_current or has_multi_period:
            logger.info("Classified as COMPARISON query (detected prev_/current_ or this_/last_ columns)")
            return "comparison"

        # Pattern 2: Single-row aggregation (SUM, COUNT, AVG in a single row)
        if len(results) == 1:
            aggregation_keys = ['total', 'count', 'average', 'sum', 'avg', 'min', 'max']
            if any(key in first_row for key in aggregation_keys):
                logger.info("Classified as AGGREGATION query (single row with total/count/avg)")
                return "aggregation"

        # Pattern 3: Grouped aggregation (multiple rows with group keys + aggregations)
        # Examples: spending by category, monthly breakdown
        has_grouping = all('month' in row or 'category' in row or 'year' in row for row in results)
        has_aggregates = any('total' in row or 'count' in row or 'sum' in row for row in results)

        if has_grouping and has_aggregates:
            logger.info("Classified as GROUPED_AGGREGATION query (category/month breakdowns)")
            return "grouped_aggregation"

        # Pattern 4: Schedule/config queries (has hour, minute, day fields)
        schedule_keys = ['daily_reminder_hour', 'weekly_summary_day', 'hour', 'minute']
        if any(key in first_row for key in schedule_keys):
            logger.info("Classified as SCHEDULE_CONFIG query")
            return "schedule_config"

        # Pattern 5: Transaction list (has amount, category, description, transaction_date)
        transaction_keys = ['amount', 'category', 'description', 'transaction_date']
        if sum(key in first_row for key in transaction_keys) >= 2:
            logger.info("Classified as TRANSACTION_LIST query")
            return "transaction_list"

        # Default: generic query
        logger.info("Classified as GENERIC query (fallback)")
        return "generic"

    def _format_comparison(self, results: list, original_query: str) -> str:
        """
        Format comparison queries (UNION queries comparing two periods)
        Handles both prev_/current_ format AND this_/last_ format
        Examples: "compare this month to last month", "spending this week vs last week"
        """
        if not results:
            return "No comparison data found."

        # For UNION queries, results come as a single row with prev_X and current_X columns
        # OR with this_X and last_X columns
        if len(results) == 1:
            row = results[0]

            # Extract comparison metrics
            prev_total = row.get('prev_total') or row.get('last_total') or row.get('last_week_total') or row.get('last_month_total')
            current_total = row.get('current_total') or row.get('this_total') or row.get('this_week_total') or row.get('this_month_total')

            prev_count = row.get('prev_count') or row.get('last_count') or row.get('last_week_count') or row.get('last_month_count')
            current_count = row.get('current_count') or row.get('this_count') or row.get('this_week_count') or row.get('this_month_count')

            # Build comparison message
            lines = []

            # Determine period labels from original query
            query_lower = original_query.lower()
            if 'week' in query_lower:
                prev_label = "Last week"
                current_label = "This week"
            elif 'month' in query_lower:
                prev_label = "Last month"
                current_label = "This month"
            elif 'year' in query_lower:
                prev_label = "Last year"
                current_label = "This year"
            else:
                prev_label = "Previous period"
                current_label = "Current period"

            # Format totals with comparison
            if prev_total is not None and current_total is not None:
                prev_val = float(prev_total) if prev_total else 0.0
                curr_val = float(current_total) if current_total else 0.0

                lines.append(f"{prev_label}: ${prev_val:.2f}")
                lines.append(f"{current_label}: ${curr_val:.2f}")

                # Calculate change with proper edge case handling
                if prev_val == 0 and curr_val == 0:
                    lines.append(f"\n💤 No activity in either period")
                elif prev_val == 0 and curr_val > 0:
                    lines.append(f"\n✨ New spending this period! (+${curr_val:.2f})")
                elif prev_val > 0 and curr_val == 0:
                    lines.append(f"\n🎉 Zero spending this period! (saved ${prev_val:.2f})")
                elif prev_val > 0:
                    change_pct = ((curr_val - prev_val) / prev_val) * 100
                    change_amt = curr_val - prev_val

                    if change_amt > 0:
                        emoji = "📈"  # Increasing trend
                        direction = "increase"
                    elif change_amt < 0:
                        emoji = "📉"  # Decreasing trend
                        direction = "decrease"
                    else:
                        emoji = "➡️"  # No change
                        direction = "no change"

                    lines.append(f"\n{emoji} {abs(change_pct):.1f}% {direction} (${abs(change_amt):.2f})")

            # Add transaction counts if available
            if prev_count is not None and current_count is not None:
                lines.append(f"\nTransactions: {int(prev_count)} → {int(current_count)}")

            return "\n".join(lines)

        # Multiple rows (shouldn't happen with UNION, but handle gracefully)
        return self._format_grouped_aggregation(results)

    def _format_schedule_config(self, results: list) -> str:
        """Format schedule/reminder configuration queries"""
        if len(results) == 1:
            row = results[0]

            # Daily reminder
            if 'daily_reminder_hour' in row and 'daily_reminder_minute' in row:
                hour = row['daily_reminder_hour']
                minute = row['daily_reminder_minute']
                if hour is not None and minute is not None:
                    hour_12 = hour % 12 or 12
                    am_pm = "AM" if hour < 12 else "PM"
                    return f"⏰ Daily reminder: {hour_12}:{minute:02d} {am_pm}"

            # Weekly summary
            if 'weekly_summary_day' in row:
                day = row.get('weekly_summary_day', 'Not set')
                hour = row.get('weekly_summary_hour', 0)
                minute = row.get('weekly_summary_minute', 0)
                if day and hour is not None:
                    hour_12 = hour % 12 or 12
                    am_pm = "AM" if hour < 12 else "PM"
                    return f"📊 Weekly summary: {day.title()} at {hour_12}:{minute:02d} {am_pm}"

        return self._format_generic_result(results)

    def _format_aggregation(self, row: dict) -> str:
        """Format a single aggregation result"""
        parts = []

        if 'total' in row:
            total_val = float(row['total']) if row['total'] is not None else 0.0
            parts.append(f"💰 Total: ${total_val:.2f}")
        if 'count' in row:
            count_val = int(row['count']) if row['count'] is not None else 0
            parts.append(f"📝 {count_val} transactions")
        if 'average' in row or 'avg' in row:
            avg = row.get('average') or row.get('avg')
            avg_val = float(avg) if avg is not None else 0.0
            parts.append(f"📊 Average: ${avg_val:.2f}")

        return "\n".join(parts) if parts else "Here are the results: " + str(row)

    def _format_grouped_aggregation(self, results: list) -> str:
        """Format grouped aggregation (e.g., month comparisons)"""
        lines = []

        for row in results:
            label = ""
            if 'month' in row:
                # Format month nicely
                month_date = row['month']
                if isinstance(month_date, str):
                    try:
                        from datetime import datetime
                        dt = datetime.fromisoformat(month_date.replace('Z', '+00:00'))
                        label = dt.strftime("%B %Y")
                    except:
                        label = str(month_date)
                else:
                    label = str(month_date)
            elif 'category' in row:
                label = row['category'].title()
            else:
                label = str(row.get('group', 'Group'))

            total = f"${float(row['total']):.2f}" if 'total' in row and row['total'] is not None else "$0.00"
            count = f"{int(row['count'])} transactions" if 'count' in row and row['count'] is not None else ""

            line = f"{label}: {total}"
            if count:
                line += f" ({count})"
            lines.append(line)

        return "\n".join(lines)

    def _format_transaction_list(self, results: list) -> str:
        """Format a list of transactions with dates"""
        from datetime import datetime

        total_count = len(results)

        # Calculate total if amounts are present
        total_amount = 0
        has_amounts = all('amount' in r for r in results)
        if has_amounts:
            total_amount = sum(float(r['amount']) for r in results if r['amount'] is not None)

        # Build header
        header = f"Found {total_count} transaction{'s' if total_count != 1 else ''}:\n\n"

        # List transactions (limit to 20 for display)
        lines = []
        for i, row in enumerate(results[:20]):
            amount = f"${float(row['amount']):.2f}" if 'amount' in row and row['amount'] is not None else "$0.00"
            category = row.get('category', '').title() if 'category' in row else ""
            description = row.get('description', '') if 'description' in row else ""

            # Format date if available
            date_str = ""
            if 'transaction_date' in row and row['transaction_date']:
                try:
                    if isinstance(row['transaction_date'], str):
                        date_obj = datetime.fromisoformat(row['transaction_date'].replace('Z', '+00:00'))
                    else:
                        date_obj = row['transaction_date']

                    # Show relative date for recent transactions
                    now = datetime.now()
                    if date_obj.tzinfo:
                        date_obj = date_obj.replace(tzinfo=None)

                    days_ago = (now - date_obj).days
                    if days_ago == 0:
                        date_str = "Today"
                    elif days_ago == 1:
                        date_str = "Yesterday"
                    elif days_ago < 7:
                        date_str = f"{days_ago}d ago"
                    else:
                        date_str = date_obj.strftime("%b %d")
                except:
                    date_str = ""

            # Build line with optional date prefix
            line_parts = []
            if date_str:
                line_parts.append(f"[{date_str}]")
            line_parts.append(amount)
            if category:
                line_parts.append(category)
            if description:
                line_parts.append(description)

            lines.append(f"• {' '.join(line_parts)}")

        # Add "and X more" if there are more results
        if total_count > 20:
            lines.append(f"\n...and {total_count - 20} more transactions")

        result = header + "\n".join(lines)

        # Add total at the end if amounts exist
        if has_amounts and total_count > 1:
            result += f"\n\n💰 Total: ${total_amount:.2f}"

        return result

    def _format_generic_result(self, results: list) -> str:
        """Format generic query results (non-transaction data like schedules, preferences, etc.)"""
        if len(results) == 1:
            # Single row - format as key: value pairs
            row = results[0]

            # Handle schedule/reminder queries specially
            if 'daily_reminder_hour' in row and 'daily_reminder_minute' in row:
                hour = row['daily_reminder_hour']
                minute = row['daily_reminder_minute']
                if hour is not None and minute is not None:
                    return f"Your daily reminder is set for {hour:02d}:{minute:02d}"
                else:
                    return "Daily reminder is not configured"

            if 'weekly_summary_day' in row:
                day = row.get('weekly_summary_day', 'Not set')
                hour = row.get('weekly_summary_hour', 0)
                minute = row.get('weekly_summary_minute', 0)
                if day and hour is not None:
                    return f"Your weekly summary is set for {day.title()} at {hour:02d}:{minute:02d}"
                else:
                    return "Weekly summary is not configured"

            # Generic key-value formatting
            lines = []
            for key, value in row.items():
                if key != 'id' and value is not None:  # Skip IDs and null values
                    formatted_key = key.replace('_', ' ').title()
                    lines.append(f"{formatted_key}: {value}")

            return "\n".join(lines) if lines else str(row)

        # Multiple rows - format as a simple list
        lines = []
        for i, row in enumerate(results, 1):
            row_str = ", ".join(f"{k}: {v}" for k, v in row.items() if k != 'id' and v is not None)
            lines.append(f"{i}. {row_str}")

        return "\n".join(lines)
