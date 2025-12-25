"""
RAG Service - Retrieval-Augmented Generation
Combines vector search with AI to provide context-aware responses
"""

from services.vector_store import VectorStore
from services.ai_service import AIService
from services.personal_context_service import PersonalContextService
from sqlalchemy.orm import Session
from models.workout import UserGymProfile
from models.user import User
from typing import Optional, Dict, List
import logging
import os

logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG service that retrieves relevant context and generates AI responses

    Workflow:
    1. User asks a question
    2. Retrieve relevant context from general knowledge (exercise guides, injury info, etc.)
    3. Retrieve relevant context from personal data (workout logs, progress)
    4. Retrieve user's profile
    5. Combine all context + question
    6. Send to AI for personalized answer
    """

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        # General knowledge store
        self.vector_store = VectorStore(store_path="data/vector_store")
        # Personal context store
        personal_store_path = f"data/personal_context/user_{user_id}"
        self.personal_context = None
        if os.path.exists(personal_store_path):
            self.personal_context = VectorStore(store_path=personal_store_path)
        self.ai_service = AIService()

    def query(self, question: str, top_k: int = 3) -> str:
        """
        Answer a question using RAG

        Args:
            question: User's question
            top_k: Number of relevant documents to retrieve

        Returns:
            AI-generated answer with retrieved context
        """
        try:
            logger.info(f"RAG query from user {self.user_id}: {question}")

            # Step 1: Retrieve relevant knowledge from general knowledge store
            general_docs = self.vector_store.search(question, top_k=top_k)

            # Step 2: Retrieve relevant personal context (if available)
            personal_docs = []
            if self.personal_context:
                try:
                    personal_docs = self.personal_context.search(question, top_k=2)
                    logger.info(f"Retrieved {len(personal_docs)} personal context documents")
                except Exception as e:
                    logger.warning(f"Could not retrieve personal context: {e}")

            # Combine documents (personal docs first for priority)
            retrieved_docs = personal_docs + general_docs

            if not retrieved_docs:
                logger.warning("No relevant documents found in vector stores")
                return self._fallback_response(question)

            # Step 3: Get user's profile context
            user_context = self._get_user_context()

            # Step 4: Build RAG prompt
            prompt = self._build_rag_prompt(question, retrieved_docs, user_context, has_personal_data=len(personal_docs) > 0)

            # Step 4: Get AI response
            response = self.ai_service._generate(prompt)

            logger.info(f"RAG response generated successfully")
            return response

        except Exception as e:
            logger.error(f"RAG query error: {e}")
            return self._fallback_response(question)

    def _get_user_context(self) -> Dict:
        """Get user's personal context (profile, recent workouts, etc.)"""
        context = {}

        # Get user info
        user = self.db.query(User).filter(User.id == self.user_id).first()
        if user:
            context['name'] = user.full_name or "Chief"

        # Get gym profile
        profile = self.db.query(UserGymProfile).filter(
            UserGymProfile.user_id == self.user_id
        ).first()

        if profile:
            context['has_gym_profile'] = True
            context['goal'] = profile.primary_goal.value if profile.primary_goal else None
            context['experience'] = profile.experience_level.value if profile.experience_level else None
            context['equipment'] = profile.equipment_access.value if profile.equipment_access else None
            context['injuries'] = profile.injuries_notes
            context['training_days'] = profile.training_days_per_week
        else:
            context['has_gym_profile'] = False

        return context

    def _build_rag_prompt(self, question: str, retrieved_docs: List[Dict], user_context: Dict, has_personal_data: bool = False) -> str:
        """Build the prompt for AI with retrieved context"""

        # Detect if this is a progress/tracking question vs. a "how-to" question
        progress_keywords = ['progress', 'how am i doing', 'how have i', 'my workout', 'my training',
                            'how many', 'workouts logged', 'consistency', 'tracking']
        is_progress_query = any(keyword in question.lower() for keyword in progress_keywords)

        prompt = "You are Cortana, a personal AI fitness assistant. Answer the user's question using the provided context.\n\n"

        # Add user's personal context
        prompt += "**USER PROFILE:**\n"
        if user_context.get('has_gym_profile'):
            prompt += f"- Name: {user_context.get('name', 'User')}\n"
            prompt += f"- Goal: {user_context.get('goal', 'Not set')}\n"
            prompt += f"- Experience: {user_context.get('experience', 'Unknown')}\n"
            prompt += f"- Equipment: {user_context.get('equipment', 'Not specified')}\n"
            prompt += f"- Training Days: {user_context.get('training_days', 'Not specified')} days/week\n"

            injuries = user_context.get('injuries')
            if injuries and injuries.strip():
                prompt += f"- **Injuries/Limitations:** {injuries}\n"
        else:
            prompt += "- User hasn't completed gym profile yet\n"

        prompt += "\n**RETRIEVED CONTEXT:**\n\n"

        # Separate personal data from general knowledge
        personal_docs = [doc for doc in retrieved_docs if doc.get('metadata', {}).get('type') in
                        ['workout_log', 'weight_log', 'weekly_summary', 'expense_insights', 'progress_report']]
        general_docs = [doc for doc in retrieved_docs if doc not in personal_docs]

        # Add personal data first (more relevant)
        if personal_docs:
            prompt += "**YOUR PERSONAL DATA:**\n"
            for i, doc in enumerate(personal_docs, 1):
                doc_type = doc.get('metadata', {}).get('type', 'unknown')
                prompt += f"**Personal Data {i}** (Type: {doc_type}, relevance: {doc['similarity']:.2f}):\n"
                prompt += f"{doc['text']}\n\n"
                prompt += "---\n\n"

        # Only add general knowledge if NOT a progress query, or if there's no personal data
        if not is_progress_query or not personal_docs:
            if general_docs:
                prompt += "**GENERAL KNOWLEDGE:**\n"
                for i, doc in enumerate(general_docs, 1):
                    prompt += f"**Source {i}** (relevance: {doc['similarity']:.2f}):\n"
                    prompt += f"{doc['text']}\n\n"
                    prompt += "---\n\n"

        # Add the question
        prompt += f"**USER QUESTION:** {question}\n\n"

        # Add instructions (adapted based on query type)
        prompt += "**INSTRUCTIONS:**\n"
        if is_progress_query and personal_docs:
            prompt += "1. This is a PROGRESS TRACKING question - focus ONLY on their actual data\n"
            prompt += "2. Keep response SHORT and concise (3-5 sentences max)\n"
            prompt += "3. Reference specific numbers from their personal data\n"
            prompt += "4. Be encouraging about their progress\n"
            prompt += "5. DO NOT provide exercise instructions unless specifically asked\n"
            prompt += "6. If they have zero workouts logged, mention it briefly and encourage them to start\n"
        else:
            prompt += "1. Answer the question directly and concisely\n"
            prompt += "2. Use the user's profile to personalize your answer\n"
            prompt += "3. **PRIORITIZE personal data** (workout logs, progress) over general knowledge when available\n"
            prompt += "4. Reference specific past workouts or progress when relevant\n"
            prompt += "5. If the user has injuries, prioritize safety and mention modifications\n"
            prompt += "6. Be encouraging and supportive - acknowledge their actual progress\n"
            prompt += "7. Use markdown formatting for readability\n"
            prompt += "8. Keep response concise but COMPLETE - finish your thoughts\n"
            prompt += "9. If explaining exercises, include all steps\n"

        prompt += "\n**YOUR COMPLETE ANSWER:**"

        return prompt

    def _fallback_response(self, question: str) -> str:
        """Fallback response when RAG fails"""
        prompt = f"""You are Cortana, a personal AI fitness assistant.

The user asked: "{question}"

The knowledge base is not available right now. Provide a helpful response based on your general knowledge, but mention that you don't have access to the full knowledge base.

Keep it concise and helpful."""

        try:
            return self.ai_service._generate(prompt)
        except:
            return ("I'm having trouble accessing my knowledge base right now. "
                   "Please try again in a moment, or ask me something else!")

    def search_exercises(self, query: str, equipment: Optional[str] = None,
                        category: Optional[str] = None, top_k: int = 5) -> List[Dict]:
        """
        Search for exercises based on criteria

        Args:
            query: Search query (e.g., "chest exercises")
            equipment: Filter by equipment (e.g., "dumbbells")
            category: Filter by muscle group (e.g., "chest")
            top_k: Number of results

        Returns:
            List of matching exercises
        """
        # Build metadata filters
        filters = {"type": "exercise"}
        if equipment:
            filters["equipment"] = equipment.lower()
        if category:
            filters["category"] = category.lower()

        # Search
        results = self.vector_store.search(query, top_k=top_k, filter_metadata=filters)

        return results

    def get_injury_guidance(self, injury: str) -> str:
        """Get guidance for specific injury"""
        query = f"training with {injury}"
        results = self.vector_store.search(query, top_k=1, filter_metadata={"type": "injury_guide"})

        if results:
            return results[0]['text']
        else:
            return f"No specific guidance found for {injury}. Please consult with a healthcare professional."

    def get_nutrition_advice(self, goal: str) -> str:
        """Get nutrition advice based on goal"""
        query = f"nutrition for {goal}"
        results = self.vector_store.search(query, top_k=1, filter_metadata={"type": "nutrition"})

        if results:
            return results[0]['text']
        else:
            return "No specific nutrition guidance found. General advice: eat adequate protein, stay in appropriate calorie range for your goal."
