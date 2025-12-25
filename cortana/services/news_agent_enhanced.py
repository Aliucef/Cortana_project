"""
Enhanced News Agent - Lebanese sources, advanced filtering, scheduled delivery
"""
import requests
from config.settings import get_settings
from sqlalchemy.orm import Session
from models.news import NewsPreference
import google.generativeai as genai
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


class NewsAgentEnhanced:
    """Enhanced news agent with Lebanese sources and advanced filtering"""

    # Lebanese and Middle Eastern news sources
    LEBANESE_SOURCES = [
        "al-jazeera-english",  # Al Jazeera (covers Lebanon extensively)
        # Note: Many Lebanese sources (LBCI, MTV, Al-Jadeed, NNA, Annahar, L'Orient-Le Jour)
        # are not available in NewsAPI. We'll use keyword filtering for Lebanese news.
    ]

    CATEGORIES = [
        "general", "business", "entertainment", "health",
        "science", "sports", "technology"
    ]

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
            # Create default preferences with Lebanese focus
            prefs = NewsPreference(
                user_id=self.user_id,
                categories="",
                keywords="lebanon,beirut,lebanese",  # Default Lebanese keywords
                sources="al-jazeera-english",
                country="us",  # NewsAPI doesn't have 'lb' as top headlines country
                language="ar",
                morning_summary_enabled=True,
                preferred_time="08:00"
            )
            self.db.add(prefs)
            self.db.commit()
            self.db.refresh(prefs)

        return prefs

    def fetch_lebanese_news(self, category: str = None, limit: int = 10, days: int = 7) -> List[Dict]:
        """
        Fetch Lebanese-specific news using keyword search

        Args:
            category: Optional category filter
            limit: Number of articles
            days: How many days back to search

        Returns:
            List of articles
        """
        if not self.api_key:
            logger.error("NewsAPI key not configured")
            return []

        # Search for Lebanese news
        keywords = "lebanon OR beirut OR lebanese"

        if category and category != "general":
            keywords += f" AND {category}"

        from_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

        params = {
            "apiKey": self.api_key,
            "q": keywords,
            "language": "ar,en",  # Both Arabic and English
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
                logger.info(f"Fetched {len(articles)} Lebanese news articles")
                return articles
            else:
                logger.error(f"NewsAPI error: {data.get('message')}")
                return []

        except Exception as e:
            logger.error(f"Error fetching Lebanese news: {str(e)}")
            return []

    def fetch_by_location(self, location: str, limit: int = 10, days: int = 7) -> List[Dict]:
        """
        Fetch news by specific location

        Args:
            location: Location name (e.g., "beirut", "tripoli", "sidon")
            limit: Number of articles
            days: How many days back to search

        Returns:
            List of articles
        """
        if not self.api_key:
            logger.error("NewsAPI key not configured")
            return []

        from_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

        params = {
            "apiKey": self.api_key,
            "q": location,
            "language": "ar,en",
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
                logger.info(f"Fetched {len(articles)} articles for location: {location}")
                return articles
            else:
                logger.error(f"NewsAPI error: {data.get('message')}")
                return []

        except Exception as e:
            logger.error(f"Error fetching news by location: {str(e)}")
            return []

    def fetch_by_date_range(self, from_date: str, to_date: str, keywords: str = None, limit: int = 10) -> List[Dict]:
        """
        Fetch news within a specific date range

        Args:
            from_date: Start date (YYYY-MM-DD)
            to_date: End date (YYYY-MM-DD)
            keywords: Optional search keywords
            limit: Number of articles

        Returns:
            List of articles
        """
        if not self.api_key:
            logger.error("NewsAPI key not configured")
            return []

        # Default to Lebanese news if no keywords provided
        search_query = keywords if keywords else "lebanon OR beirut"

        params = {
            "apiKey": self.api_key,
            "q": search_query,
            "language": "ar,en",
            "sortBy": "publishedAt",
            "from": from_date,
            "to": to_date,
            "pageSize": limit
        }

        try:
            response = requests.get(f"{self.base_url}/everything", params=params)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "ok":
                articles = data.get("articles", [])
                logger.info(f"Fetched {len(articles)} articles from {from_date} to {to_date}")
                return articles
            else:
                logger.error(f"NewsAPI error: {data.get('message')}")
                return []

        except Exception as e:
            logger.error(f"Error fetching news by date range: {str(e)}")
            return []

    def fetch_category_news(self, category: str, limit: int = 10, days: int = 3) -> List[Dict]:
        """
        Fetch news by category with Lebanese focus

        Args:
            category: Category (business, technology, sports, etc.)
            limit: Number of articles
            days: How many days back

        Returns:
            List of articles
        """
        return self.fetch_lebanese_news(category=category, limit=limit, days=days)

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
You are a news summarization expert for Lebanese and Middle Eastern news. Process this article:

Article Title: {title}
Content: {description} {content}

Provide a JSON response with:
1. "arabic_title": Translate the title to natural, fluent Arabic
2. "arabic_summary": Write a 2-3 sentence summary in Arabic, focusing on key facts and Lebanese/regional context

Output ONLY valid JSON in this format:
{{
    "arabic_title": "العنوان بالعربية",
    "arabic_summary": "الملخص بالعربية مع التركيز على السياق اللبناني"
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

    def get_lebanese_briefing(self, num_articles: int = 8) -> str:
        """
        Get comprehensive Lebanese news briefing

        Args:
            num_articles: Number of articles (increased to 8 for more coverage)

        Returns:
            Formatted news message
        """
        logger.info(f"Generating Lebanese news briefing for user {self.user_id}")

        # Fetch Lebanese news
        articles = self.fetch_lebanese_news(limit=num_articles, days=2)

        if not articles:
            return "📰 لا توجد أخبار لبنانية متاحة حالياً. حاول مرة أخرى لاحقاً!"

        # Process articles in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            processed_articles = list(executor.map(self.process_article_sync, articles))

        message = f"🇱🇧 *أخبار لبنان*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        for i, article in enumerate(processed_articles, 1):
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

    def get_category_briefing(self, category: str, num_articles: int = 6) -> str:
        """
        Get news for specific category with Lebanese focus

        Args:
            category: News category
            num_articles: Number of articles

        Returns:
            Formatted news message
        """
        logger.info(f"Fetching {category} news for user {self.user_id}")

        articles = self.fetch_category_news(category=category, limit=num_articles)

        if not articles:
            return f"📰 لا توجد أخبار في فئة {category} حالياً."

        # Process in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            processed_articles = list(executor.map(self.process_article_sync, articles))

        # Category names in Arabic
        category_arabic = {
            "business": "الأعمال",
            "technology": "التكنولوجيا",
            "sports": "الرياضة",
            "health": "الصحة",
            "science": "العلوم",
            "entertainment": "الترفيه",
            "general": "عامة"
        }

        message = f"📰 *أخبار {category_arabic.get(category, category)}*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        for i, article in enumerate(processed_articles, 1):
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

    def get_location_news(self, location: str, num_articles: int = 6) -> str:
        """
        Get news for specific location

        Args:
            location: Location name
            num_articles: Number of articles

        Returns:
            Formatted news message
        """
        logger.info(f"Fetching news for location: {location}")

        articles = self.fetch_by_location(location=location, limit=num_articles)

        if not articles:
            return f"📍 لا توجد أخبار عن {location} حالياً."

        # Process in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            processed_articles = list(executor.map(self.process_article_sync, articles))

        message = f"📍 *أخبار {location}*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        for i, article in enumerate(processed_articles, 1):
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
        Generate daily morning news briefing (8 AM scheduled)

        Returns:
            Formatted Lebanese news briefing
        """
        return self.get_lebanese_briefing(num_articles=8)

    def get_global_news(self, limit: int = 5) -> str:
        """
        Get global news from international sources

        Args:
            limit: Number of articles

        Returns:
            Formatted news message in Arabic
        """
        logger.info(f"Fetching global news for user {self.user_id}")

        # Fetch from global sources
        if not self.api_key:
            return "⚠️ NewsAPI key not configured"

        params = {
            "apiKey": self.api_key,
            "sources": "bbc-news,reuters,associated-press",
            "sortBy": "publishedAt",
            "pageSize": limit
        }

        try:
            response = requests.get(f"{self.base_url}/top-headlines", params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("status") == "ok":
                articles = data.get("articles", [])
            else:
                return "⚠️ خطأ في جلب الأخبار العالمية"
        except:
            return "⚠️ خطأ في الاتصال بخدمة الأخبار"

        # Process in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:
            articles = list(executor.map(self.process_article_sync, articles))

        message = f"🌍 *الأخبار العالمية*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n\n"

        if not articles:
            return "🌍 لا توجد أخبار عالمية متاحة حالياً."

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
