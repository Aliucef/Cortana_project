"""
Query Context Memory - Stores recent query results and context for intelligent referencing
This allows Cortana to understand "that", "it", "the X one" by remembering what was just discussed
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class QueryContextMemory:
    """
    Stores context about recent queries and their results so AI can reference them intelligently
    """

    # In-memory storage per user (in production, use Redis or database)
    _user_contexts: Dict[int, Dict[str, Any]] = {}

    def __init__(self, user_id: int):
        self.user_id = user_id

        # Initialize user context if not exists
        if user_id not in self._user_contexts:
            self._user_contexts[user_id] = {
                "last_query": None,
                "last_query_time": None,
                "last_query_type": None,  # "expenses", "income", "budget", etc.
                "last_results": [],  # List of records returned
                "last_result_ids": [],  # IDs of records returned
                "current_topic": None,  # What entity is currently being discussed
                "topic_id": None,  # ID of the entity being discussed
            }

    def store_query_result(
        self,
        query_type: str,
        query_text: str,
        results: List[Dict[str, Any]],
        topic: Optional[str] = None
    ):
        """
        Store the results of a query for future reference

        Args:
            query_type: Type of query (expenses, income, budget, etc.)
            query_text: The actual query text from user
            results: List of result records (as dicts)
            topic: Optional topic/entity being discussed (e.g., "income", "last expense")
        """
        context = self._user_contexts[self.user_id]

        context["last_query"] = query_text
        context["last_query_time"] = datetime.now()
        context["last_query_type"] = query_type
        context["last_results"] = results
        context["last_result_ids"] = [r.get("id") for r in results if "id" in r]
        context["current_topic"] = topic or query_type

        # If single result, store its ID as the topic ID
        if len(results) == 1 and "id" in results[0]:
            context["topic_id"] = results[0]["id"]
        else:
            context["topic_id"] = None

        logger.info(f"Stored query context: {query_type} with {len(results)} results, topic: {topic}")

    def get_context(self) -> Dict[str, Any]:
        """
        Get the current context for this user

        Returns:
            Dictionary with last query info and results
        """
        context = self._user_contexts[self.user_id]

        # Check if context is stale (older than 5 minutes)
        if context["last_query_time"]:
            time_since = datetime.now() - context["last_query_time"]
            if time_since > timedelta(minutes=5):
                logger.info(f"Context is stale ({time_since.seconds}s old), clearing")
                self.clear_context()
                return self._user_contexts[self.user_id]

        return context

    def get_last_topic(self) -> Optional[str]:
        """Get what the user was last talking about"""
        return self._user_contexts[self.user_id]["current_topic"]

    def get_last_query_type(self) -> Optional[str]:
        """Get the type of the last query"""
        return self._user_contexts[self.user_id]["last_query_type"]

    def get_last_results(self) -> List[Dict[str, Any]]:
        """Get the results of the last query"""
        return self._user_contexts[self.user_id]["last_results"]

    def get_last_result_ids(self) -> List[int]:
        """Get the IDs of records from the last query"""
        return self._user_contexts[self.user_id]["last_result_ids"]

    def get_topic_id(self) -> Optional[int]:
        """Get the ID of the entity being discussed (if single entity)"""
        return self._user_contexts[self.user_id]["topic_id"]

    def find_result_by_amount(self, amount: float) -> Optional[Dict[str, Any]]:
        """
        Find a specific result by amount from the last query

        Args:
            amount: Amount to search for

        Returns:
            Matching result dict or None
        """
        results = self.get_last_results()
        for result in results:
            if result.get("amount") == amount:
                return result
        return None

    def clear_context(self):
        """Clear the context for this user"""
        self._user_contexts[self.user_id] = {
            "last_query": None,
            "last_query_time": None,
            "last_query_type": None,
            "last_results": [],
            "last_result_ids": [],
            "current_topic": None,
            "topic_id": None,
        }
        logger.info(f"Cleared context for user {self.user_id}")

    def get_context_summary(self) -> str:
        """
        Get a human-readable summary of the current context

        Returns:
            String describing what was last discussed
        """
        context = self.get_context()

        if not context["last_query"]:
            return ""

        summary = f"Last query: '{context['last_query']}' ({context['last_query_type']})\n"

        if context["last_results"]:
            summary += f"Returned {len(context['last_results'])} results:\n"
            for result in context["last_results"][:3]:  # Show first 3
                if "amount" in result:
                    category = result.get("category", "")
                    description = result.get("description", "")
                    summary += f"  - ID {result.get('id')}: ${result['amount']} ({category}: {description})\n"

        if context["current_topic"]:
            summary += f"Current topic: {context['current_topic']}\n"

        if context["topic_id"]:
            summary += f"Topic ID: {context['topic_id']}\n"

        return summary
