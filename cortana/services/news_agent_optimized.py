"""
News Agent - Optimized version with combined translation + summarization
"""
import requests
from config.settings import get_settings
from sqlalchemy.orm import Session
from models.news import NewsPreference
import google.generativeai as genai
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


class NewsAgentOptimized:
    """Optimized intelligent news fetching and summarization agent"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.api_key = settings.news_api_key
        self.base_url = "https://newsapi.org/v2"
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.executor = ThreadPoolExecutor(max_workers=5)

    def get_user_preferences(self) -> Optional[NewsPreference]:
        """Get user's news preferences"""
        prefs = self.db.query(NewsPreference).filter(
            NewsPreference.user_id == self.user_id
        ).first()

        if not prefs:
            # Create default preferences
            prefs = NewsPreference(
                user_id=self.user_id,
                categories="",
                keywords="",
                sources="al-jazeera-english",  # Default to Al Jazeera only
                country="us",
                language="ar",  # Arabic
                morning_summary_enabled=True,
                preferred_time="08:00"
            )
            self.db.add(prefs)
            self.db.commit()
            self.db.refresh(prefs)

        return prefs

    def fetch_from_sources(self, sources: str = None, limit: int = 10) -> List[Dict]:
        """
        Fetch news from specific sources

        Args:
            sources: Comma-separated source IDs
            limit: Number of articles

        Returns:
            List of articles
        """
        if not self.api_key:
            logger.error("NewsAPI key not configured")
            return []

        prefs = self.get_user_preferences()

        # Use user's preferred sources if not specified (default to Al Jazeera only)
        if not sources:
            sources = prefs.sources if prefs.sources else "al-jazeera-english"

        params = {
            "apiKey": self.api_key,
            "sources": sources,
            "sortBy": "publishedAt",
            "pageSize": limit
        }

        try:
            response = requests.get(f"{self.base_url}/top-headlines", params=params)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "ok":
                articles = data.get("articles", [])
                logger.info(f"Fetched {len(articles)} articles from sources: {sources}")
                return articles
            else:
                logger.error(f"NewsAPI error: {data.get('message')}")
                return []

        except Exception as e:
            logger.error(f"Error fetching news from sources: {str(e)}")
            return []

    def summarize_and_translate_article(self, article: Dict) -> Dict:
        """
        OPTIMIZED: Combine summarization AND translation in ONE Gemini call

        Args:
            article: Article dictionary from NewsAPI

        Returns:
            Dict with arabic_title and ai_summary
        """
        title = article.get("title", "")
        description = article.get("description", "")
        content = article.get("content", "")

        # Combine available text
        full_text = f"{title}\n\n{description}\n\n{content}"

        prompt = f"""
You are a news summarization expert. Process this news article:

Article Title: {title}
Content: {description} {content}

Provide a JSON response with:
1. "arabic_title": Translate the title to natural, fluent Arabic
2. "arabic_summary": Write a 2-3 sentence summary in Arabic, focusing on key facts

Output ONLY valid JSON in this format:
{{
    "arabic_title": "العنوان بالعربية",
    "arabic_summary": "الملخص بالعربية"
}}
"""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean JSON if needed
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            import json
            result = json.loads(result_text)

            return {
                "arabic_title": result.get("arabic_title", title),
                "ai_summary": result.get("arabic_summary", description or title)
            }

        except Exception as e:
            logger.error(f"Error processing article: {str(e)}")
            # Fallback to original
            return {
                "arabic_title": title,
                "ai_summary": description or title
            }

    def process_article_sync(self, article: Dict) -> Dict:
        """Wrapper for synchronous article processing"""
        result = self.summarize_and_translate_article(article)
        article["arabic_title"] = result["arabic_title"]
        article["ai_summary"] = result["ai_summary"]
        return article

    def get_personalized_news(self, num_articles: int = 3) -> List[Dict]:
        """
        Get personalized news based on user preferences (OPTIMIZED)

        Args:
            num_articles: Number of articles to return (default reduced to 3)

        Returns:
            List of articles with summaries
        """
        prefs = self.get_user_preferences()

        # Fetch from user's preferred sources only (Al Jazeera by default)
        articles = self.fetch_from_sources(limit=num_articles)

        # Process articles in parallel using ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=3) as executor:
            processed_articles = list(executor.map(self.process_article_sync, articles))

        return processed_articles

    def get_global_news(self, limit: int = 3) -> str:
        """
        Get news from global sources (BBC, Reuters, AP, etc.)

        Args:
            limit: Number of articles (default reduced to 3)

        Returns:
            Formatted news message in Arabic
        """
        logger.info(f"Fetching global news for user {self.user_id}")

        # Fetch from global sources
        global_sources = "bbc-news,reuters,associated-press"
        articles = self.fetch_from_sources(sources=global_sources, limit=limit)

        # Process in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:
            articles = list(executor.map(self.process_article_sync, articles))

        message = f"🌍 *الأخبار العالمية*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        if not articles:
            return "🌍 لا توجد أخبار عالمية متاحة حالياً. حاول مرة أخرى لاحقاً!"

        for i, article in enumerate(articles, 1):
            title = article.get("arabic_title", article.get("title", "بدون عنوان"))
            summary = article.get("ai_summary", article.get("description", ""))
            source = article.get("source", {}).get("name", "Unknown")
            url = article.get("url", "")

            message += f"*{i}. {title}*\n"
            message += f"📍 {source}\n"
            message += f"{summary}\n"
            if url:
                message += f"🔗 [اقرأ المزيد]({url})\n"
            message += "\n"

        return message

    def format_news_message(self, articles: List[Dict]) -> str:
        """
        Format articles into a readable message

        Args:
            articles: List of articles with summaries

        Returns:
            Formatted message string
        """
        if not articles:
            return "📰 No news found matching your preferences. Try updating your interests!"

        message = f"📰 *أخبار الجزيرة*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        for i, article in enumerate(articles, 1):
            title = article.get("arabic_title", article.get("title", "بدون عنوان"))
            summary = article.get("ai_summary", article.get("description", ""))
            source = article.get("source", {}).get("name", "Unknown")
            url = article.get("url", "")

            message += f"*{i}. {title}*\n"
            message += f"📍 {source}\n"
            message += f"{summary}\n"
            if url:
                message += f"🔗 [اقرأ المزيد]({url})\n"
            message += "\n"

        return message

    def get_daily_briefing(self) -> str:
        """
        Generate daily morning news briefing

        Returns:
            Formatted news message
        """
        logger.info(f"Generating daily news briefing for user {self.user_id}")
        articles = self.get_personalized_news(num_articles=3)
        return self.format_news_message(articles)
