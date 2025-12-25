"""
Database Query Agent - Translates natural language to SQL using AI
Allows Cortana to answer complex financial queries intelligently
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, List, Any, Optional
import logging
import json
from services.ai_service import AIService

logger = logging.getLogger(__name__)


class DatabaseQueryAgent:
    """
    AI-powered database query agent that translates natural language to SQL
    """

    # Database schema for AI context
    DB_SCHEMA = """
DATABASE SCHEMA:

Table: finance_records
Columns:
- id (int): Primary key
- user_id (int): User ID (ALWAYS filter by this!)
- amount (decimal): Transaction amount
- transaction_type (enum): 'INCOME' or 'EXPENSE'
- category (string): Category (food, transport, entertainment, etc.)
- description (string): Transaction description
- transaction_date (datetime): When transaction occurred
- created_at (datetime): Record creation time

Table: users
Columns:
- id (int): User ID
- username (string): Username
- full_name (string): Full name
- email (string): Email address

Table: budgets
Columns:
- id (int): Primary key
- user_id (int): User ID
- category (string): Budget category
- limit_amount (decimal): Budget limit
- period (enum): 'DAILY', 'WEEKLY', 'MONTHLY'

Table: category_goals
Columns:
- id (int): Primary key
- user_id (int): User ID
- category (string): Category
- goal_amount (decimal): Goal amount
- period (string): Goal period

IMPORTANT RULES:
1. ALWAYS include "WHERE user_id = {user_id}" in queries
2. Use "transaction_type = 'EXPENSE'" for spending queries
3. Use "transaction_type = 'INCOME'" for income queries
4. Use ORDER BY transaction_date DESC for "last/recent" queries
5. Use LIMIT 1 for "last" or "most recent" queries
6. Format dates as YYYY-MM-DD
7. Category names are lowercase (food, transport, entertainment)
"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.ai_service = AIService()

    def query(self, natural_language_query: str) -> str:
        """
        Convert natural language to SQL, execute, and return formatted response

        Args:
            natural_language_query: User's question in natural language

        Returns:
            Formatted response with query results
        """
        try:
            # Step 1: Ask AI to generate SQL from natural language
            sql_query = self._generate_sql(natural_language_query)

            if not sql_query:
                return "I couldn't understand that query. Can you rephrase?"

            logger.info(f"Generated SQL: {sql_query}")

            # Step 2: Execute SQL query safely
            results = self._execute_query(sql_query)

            if results is None:
                return "Sorry, I encountered an error executing that query."

            # Step 3: Ask AI to format results into natural response
            response = self._format_response(natural_language_query, results)

            return response

        except Exception as e:
            logger.error(f"Database query error: {str(e)}")
            return "Sorry, I couldn't process that query right now."

    def _generate_sql(self, query: str) -> Optional[str]:
        """
        Use AI to generate SQL from natural language
        """
        prompt = f"""{self.DB_SCHEMA}

USER QUERY: "{query}"
USER ID: {self.user_id}

Generate a SINGLE SQL SELECT query to answer the user's question.
IMPORTANT:
- ALWAYS include "WHERE user_id = {self.user_id}" for security
- Return ONLY the SQL query, nothing else
- Use proper SQL syntax for PostgreSQL
- Do NOT use INSERT, UPDATE, DELETE, or DROP

Examples:
Query: "what did I spend last"
SQL: SELECT amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' ORDER BY transaction_date DESC LIMIT 1

Query: "how much did I spend on food this week"
SQL: SELECT SUM(amount) as total FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND category = 'food' AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'

Query: "show me all expenses over $100"
SQL: SELECT amount, category, description, transaction_date FROM finance_records WHERE user_id = {self.user_id} AND transaction_type = 'EXPENSE' AND amount > 100 ORDER BY amount DESC

Now generate SQL for: "{query}"
SQL:"""

        try:
            # Get SQL from AI
            sql = self.ai_service.chat(prompt)

            # Clean up response
            sql = sql.strip()

            # Remove markdown code blocks if present
            if sql.startswith("```"):
                lines = sql.split("\n")
                sql = "\n".join([line for line in lines if not line.startswith("```")])
                sql = sql.strip()

            # Remove "SQL:" prefix if present
            if sql.upper().startswith("SQL:"):
                sql = sql[4:].strip()

            # Validate it's a SELECT query
            if not sql.upper().startswith("SELECT"):
                logger.warning(f"AI generated non-SELECT query: {sql}")
                return None

            # Validate it includes user_id filter
            if f"user_id = {self.user_id}" not in sql:
                logger.warning(f"AI generated query without user_id filter: {sql}")
                return None

            return sql

        except Exception as e:
            logger.error(f"Error generating SQL: {str(e)}")
            return None

    def _execute_query(self, sql: str) -> Optional[List[Dict[str, Any]]]:
        """
        Execute SQL query safely and return results
        """
        try:
            # Execute query
            result = self.db.execute(text(sql))

            # Convert to list of dictionaries
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
            return rows

        except Exception as e:
            logger.error(f"Query execution error: {str(e)}")
            return None

    def _format_response(self, original_query: str, results: List[Dict[str, Any]]) -> str:
        """
        Use AI to format query results into natural language response
        """
        if not results:
            return "No results found for that query."

        # Convert results to JSON for AI
        results_json = json.dumps(results, indent=2)

        prompt = f"""The user asked: "{original_query}"

The database returned these results:
{results_json}

Format this into a natural, conversational response for the user. Be concise and friendly.

Examples:
Query: "what did I spend last"
Results: [{{"amount": 4.0, "category": "food", "description": "coffee", "transaction_date": "2025-10-12"}}]
Response: "Your last expense was $4.00 on food (coffee) on October 12th."

Query: "how much on food this week"
Results: [{{"total": 701.0}}]
Response: "You spent $701.00 on food this week."

Query: "show expenses over $100"
Results: [{{"amount": 200, "category": "string"}}, {{"amount": 150, "category": "food"}}]
Response: "Here are your expenses over $100:\n• $200.00 - String\n• $150.00 - Food"

Now format the response:"""

        try:
            response = self.ai_service.chat(prompt)
            return response.strip()

        except Exception as e:
            logger.error(f"Error formatting response: {str(e)}")
            # Fallback: return raw data
            return f"Found {len(results)} results:\n{results_json}"
