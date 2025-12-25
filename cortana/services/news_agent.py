"""
News Agent - Fetches, filters, and summarizes personalized news
"""
import requests
from config.settings import get_settings
from sqlalchemy.orm import Session
from models.news import NewsPreference
import google.generativeai as genai
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


class NewsAgent:
    """Intelligent news fetching and summarization agent"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.api_key = settings.news_api_key
        self.base_url = "https://newsapi.org/v2"
        self.model = genai.GenerativeModel('gemini-2.5-flash')

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

    def fetch_top_headlines(self, category: str = None, limit: int = 10) -> List[Dict]:
        """
        Fetch top headlines from NewsAPI

        Args:
            category: News category (business, technology, sports, etc.)
            limit: Number of articles to fetch

        Returns:
            List of article dictionaries
        """
        if not self.api_key:
            logger.error("NewsAPI key not configured")
            return []

        prefs = self.get_user_preferences()

        params = {
            "apiKey": self.api_key,
            "country": prefs.country,
            "language": prefs.language,
            "pageSize": limit
        }

        if category:
            params["category"] = category

        try:
            response = requests.get(f"{self.base_url}/top-headlines", params=params)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "ok":
                articles = data.get("articles", [])
                logger.info(f"Fetched {len(articles)} headlines")
                return articles
            else:
                logger.error(f"NewsAPI error: {data.get('message')}")
                return []

        except Exception as e:
            logger.error(f"Error fetching news: {str(e)}")
            return []

    def fetch_from_sources(self, sources: str = None, limit: int = 10) -> List[Dict]:
        """
        Fetch news from specific sources

        Args:
            sources: Comma-separated source IDs (e.g., "al-jazeera-english,bbc-news")
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
            "language": prefs.language,
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

    def fetch_by_keywords(self, keywords: str = None, limit: int = 10) -> List[Dict]:
        """
        Fetch news by specific keywords

        Args:
            keywords: Search keywords
            limit: Number of articles

        Returns:
            List of articles
        """
        if not self.api_key:
            logger.error("NewsAPI key not configured")
            return []

        prefs = self.get_user_preferences()
        search_keywords = keywords if keywords else prefs.keywords

        if not search_keywords:
            return []

        # Search for articles from last 7 days
        from_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

        params = {
            "apiKey": self.api_key,
            "q": search_keywords,
            "language": prefs.language,
            "sortBy": "publishedAt",
            "from": from_date,
            "pageSize": limit
        }

        try:
            response = requests.get(f"{self.base_url}/everything", params=params)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "ok":
                articles = data.get("articles", [])
                logger.info(f"Fetched {len(articles)} articles for keywords: {search_keywords}")
                return articles
            else:
                logger.error(f"NewsAPI error: {data.get('message')}")
                return []

        except Exception as e:
            logger.error(f"Error fetching news by keywords: {str(e)}")
            return []

    def translate_to_arabic(self, text: str) -> str:
        """
        Translate text to Arabic using Gemini

        Args:
            text: Text to translate

        Returns:
            Translated Arabic text
        """
        prompt = f"""
Translate the following news text to Arabic. Keep it natural and fluent.

Text to translate:
{text}

Arabic translation:
"""

        try:
            response = self.model.generate_content(prompt)
            arabic_text = response.text.strip()
            return arabic_text

        except Exception as e:
            logger.error(f"Error translating to Arabic: {str(e)}")
            return text  # Return original if translation fails

    def summarize_article(self, article: Dict) -> str:
        """
        Use Gemini to summarize a news article

        Args:
            article: Article dictionary from NewsAPI

        Returns:
            Summarized text
        """
        title = article.get("title", "")
        description = article.get("description", "")
        content = article.get("content", "")

        # Combine available text
        full_text = f"{title}\n\n{description}\n\n{content}"

        prompt = f"""
Summarize this news article in 2-3 concise sentences. Focus on the key facts and impact.

Article:
{full_text}

Summary (2-3 sentences):
"""

        try:
            response = self.model.generate_content(prompt)
            summary = response.text.strip()
            return summary

        except Exception as e:
            logger.error(f"Error summarizing article: {str(e)}")
            # Fallback to description
            return description or title

    def get_personalized_news(self, num_articles: int = 5) -> List[Dict]:
        """
        Get personalized news based on user preferences

        Args:
            num_articles: Number of articles to return

        Returns:
            List of articles with summaries
        """
        prefs = self.get_user_preferences()
        all_articles = []

        # First, fetch from specific trusted sources (Al Jazeera, BBC, Reuters, etc.)
        source_articles = self.fetch_from_sources(limit=3)
        all_articles.extend(source_articles)

        # Fetch from preferred categories
        if prefs.categories:
            categories = [cat.strip() for cat in prefs.categories.split(",")]
            for category in categories[:2]:  # Limit to 2 categories
                articles = self.fetch_top_headlines(category=category, limit=2)
                all_articles.extend(articles)

        # Fetch by keywords
        if prefs.keywords:
            keyword_articles = self.fetch_by_keywords(limit=2)
            all_articles.extend(keyword_articles)

        # Remove duplicates by URL
        seen_urls = set()
        unique_articles = []
        for article in all_articles:
            url = article.get("url")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_articles.append(article)

        # Limit to requested number
        unique_articles = unique_articles[:num_articles]

        # Add summaries and translate to Arabic
        for article in unique_articles:
            summary = self.summarize_article(article)
            # Translate both title and summary to Arabic
            article["ai_summary"] = self.translate_to_arabic(summary)
            article["arabic_title"] = self.translate_to_arabic(article.get("title", ""))

        return unique_articles

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

        prefs = self.get_user_preferences()

        message = f"📰 *Your Personalized News Briefing*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        for i, article in enumerate(articles, 1):
            # Use Arabic title if available
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

        message += "─" * 35 + "\n"
        message += f"💡 Based on your interests: {prefs.categories}\n"

        return message

    def get_daily_briefing(self) -> str:
        """
        Generate daily morning news briefing

        Returns:
            Formatted news message
        """
        logger.info(f"Generating daily news briefing for user {self.user_id}")
        articles = self.get_personalized_news(num_articles=5)
        return self.format_news_message(articles)

    def get_global_news(self, limit: int = 5) -> str:
        """
        Get news from global sources (BBC, Reuters, AP, etc.)

        Args:
            limit: Number of articles

        Returns:
            Formatted news message in Arabic
        """
        logger.info(f"Fetching global news for user {self.user_id}")

        # Fetch from global sources
        global_sources = "bbc-news,reuters,associated-press,cnn"
        articles = self.fetch_from_sources(sources=global_sources, limit=limit)

        # Add summaries and translate to Arabic
        for article in articles:
            summary = self.summarize_article(article)
            article["ai_summary"] = self.translate_to_arabic(summary)
            article["arabic_title"] = self.translate_to_arabic(article.get("title", ""))

        message = f"🌍 *الأخبار العالمية*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        if not articles:
            return "🌍 لا توجد أخبار عالمية متاحة حالياً. حاول مرة أخرى لاحقاً!"

        for i, article in enumerate(articles, 1):
            # Use Arabic title if available
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

    def get_category_news(self, category: str, limit: int = 5) -> str:
        """
        Get news for a specific category

        Args:
            category: News category
            limit: Number of articles

        Returns:
            Formatted news message
        """
        logger.info(f"Fetching {category} news for user {self.user_id}")
        articles = self.fetch_top_headlines(category=category, limit=limit)

        # Add summaries and translate to Arabic
        for article in articles:
            summary = self.summarize_article(article)
            article["ai_summary"] = self.translate_to_arabic(summary)
            article["arabic_title"] = self.translate_to_arabic(article.get("title", ""))

        message = f"📰 *{category.capitalize()} News*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        for i, article in enumerate(articles, 1):
            # Use Arabic title if available
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

    def search_news(self, query: str, limit: int = 5) -> str:
        """
        Search news by custom query

        Args:
            query: Search query
            limit: Number of articles

        Returns:
            Formatted news message
        """
        logger.info(f"Searching news for: {query}")
        articles = self.fetch_by_keywords(keywords=query, limit=limit)

        # Add summaries
        for article in articles:
            article["ai_summary"] = self.summarize_article(article)

        message = f"🔍 *Search Results: {query}*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        if not articles:
            return f"🔍 No articles found for '{query}'. Try different keywords!"

        for i, article in enumerate(articles, 1):
            # Use Arabic title if available
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
