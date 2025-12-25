"""
Multi-Source News Aggregator - Lebanese and Middle Eastern news from multiple sources
"""
import requests
import feedparser
from config.settings import get_settings
from sqlalchemy.orm import Session
from models.news import NewsPreference
import google.generativeai as genai
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


class NewsAggregator:
    """
    Multi-source news aggregator for Lebanese news

    Sources:
    1. NewsAPI (limited Lebanese coverage)
    2. GNews API (better international coverage)
    3. RSS Feeds (Lebanese sources: L'Orient, Naharnet, etc.)
    """

    # Lebanese RSS Feeds
    RSS_FEEDS = {
        "Naharnet": "https://www.naharnet.com/rss",
        "L'Orient Today": "https://today.lorientlejour.com/feed",
        "The Daily Star": "http://www.dailystar.com.lb/rss.xml",
        "Lebanon Files": "https://www.lebanonfiles.com/rss",
        # Add more Lebanese RSS feeds
    }

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.newsapi_key = settings.news_api_key
        # GNews is free with 100 requests/day
        self.gnews_key = getattr(settings, 'gnews_api_key', None)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.executor = ThreadPoolExecutor(max_workers=5)

    def get_user_preferences(self) -> Optional[NewsPreference]:
        """Get user's news preferences"""
        prefs = self.db.query(NewsPreference).filter(
            NewsPreference.user_id == self.user_id
        ).first()

        if not prefs:
            prefs = NewsPreference(
                user_id=self.user_id,
                categories="",
                keywords="lebanon,beirut,lebanese",
                sources="al-jazeera-english",
                country="us",
                language="ar",
                morning_summary_enabled=True,
                preferred_time="08:00"
            )
            self.db.add(prefs)
            self.db.commit()
            self.db.refresh(prefs)

        return prefs

    def fetch_from_rss(self, feed_url: str, source_name: str, limit: int = 5) -> List[Dict]:
        """
        Fetch news from RSS feed

        Args:
            feed_url: RSS feed URL
            source_name: Name of the source
            limit: Number of articles

        Returns:
            List of articles
        """
        try:
            logger.info(f"Fetching from RSS: {source_name}")
            feed = feedparser.parse(feed_url)

            articles = []
            for entry in feed.entries[:limit]:
                # Extract article details
                article = {
                    "title": entry.get("title", ""),
                    "description": entry.get("summary", entry.get("description", "")),
                    "url": entry.get("link", ""),
                    "publishedAt": entry.get("published", ""),
                    "source": {"name": source_name},
                    "content": entry.get("summary", "")
                }
                articles.append(article)

            logger.info(f"Fetched {len(articles)} articles from {source_name}")
            return articles

        except Exception as e:
            logger.error(f"Error fetching RSS from {source_name}: {str(e)}")
            return []

    def fetch_all_lebanese_rss(self, limit_per_source: int = 3) -> List[Dict]:
        """
        Fetch from all Lebanese RSS feeds

        Args:
            limit_per_source: Articles per source

        Returns:
            Combined list of articles
        """
        all_articles = []

        # Fetch from each RSS feed
        for source_name, feed_url in self.RSS_FEEDS.items():
            articles = self.fetch_from_rss(feed_url, source_name, limit_per_source)
            all_articles.extend(articles)

        return all_articles

    def fetch_from_newsapi(self, keywords: str = "lebanon", limit: int = 5) -> List[Dict]:
        """
        Fetch from NewsAPI (existing functionality)

        Args:
            keywords: Search keywords
            limit: Number of articles

        Returns:
            List of articles
        """
        if not self.newsapi_key:
            return []

        from_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")

        params = {
            "apiKey": self.newsapi_key,
            "q": keywords,
            "language": "ar,en",
            "sortBy": "publishedAt",
            "from": from_date,
            "pageSize": limit
        }

        try:
            response = requests.get("https://newsapi.org/v2/everything", params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("status") == "ok":
                return data.get("articles", [])
            return []

        except Exception as e:
            logger.error(f"Error fetching from NewsAPI: {str(e)}")
            return []

    def fetch_from_gnews(self, keywords: str = "lebanon", limit: int = 10) -> List[Dict]:
        """
        Fetch from GNews API (alternative to NewsAPI)
        GNews Free: 100 requests/day

        Args:
            keywords: Search keywords
            limit: Number of articles

        Returns:
            List of articles
        """
        # GNews doesn't require API key for basic usage
        # Using their free endpoint
        try:
            url = "https://gnews.io/api/v4/search"
            params = {
                "q": keywords,
                "lang": "ar,en",
                "country": "lb",  # Lebanon country code
                "max": limit,
                "apikey": self.gnews_key if self.gnews_key else "demo"  # Use demo if no key
            }

            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()
                articles = data.get("articles", [])

                # Convert GNews format to our standard format
                formatted_articles = []
                for article in articles:
                    formatted_articles.append({
                        "title": article.get("title", ""),
                        "description": article.get("description", ""),
                        "url": article.get("url", ""),
                        "publishedAt": article.get("publishedAt", ""),
                        "source": {"name": article.get("source", {}).get("name", "GNews")},
                        "content": article.get("content", "")
                    })

                logger.info(f"Fetched {len(formatted_articles)} articles from GNews")
                return formatted_articles
            else:
                logger.warning(f"GNews returned status {response.status_code}")
                return []

        except Exception as e:
            logger.error(f"Error fetching from GNews: {str(e)}")
            return []

    def aggregate_lebanese_news(self, num_articles: int = 10) -> List[Dict]:
        """
        Aggregate Lebanese news from ALL sources

        Args:
            num_articles: Target number of articles

        Returns:
            Combined and deduplicated list of articles
        """
        logger.info("Aggregating Lebanese news from multiple sources...")

        all_articles = []

        # 1. Fetch from Lebanese RSS feeds (primary source)
        logger.info("Fetching from Lebanese RSS feeds...")
        rss_articles = self.fetch_all_lebanese_rss(limit_per_source=3)
        all_articles.extend(rss_articles)

        # 2. Fetch from GNews (good Lebanese coverage)
        logger.info("Fetching from GNews...")
        gnews_articles = self.fetch_from_gnews(keywords="lebanon OR beirut", limit=5)
        all_articles.extend(gnews_articles)

        # 3. Fetch from NewsAPI (supplementary)
        logger.info("Fetching from NewsAPI...")
        newsapi_articles = self.fetch_from_newsapi(keywords="lebanon OR beirut", limit=5)
        all_articles.extend(newsapi_articles)

        # Remove duplicates by URL and title
        seen_urls = set()
        seen_titles = set()
        unique_articles = []

        for article in all_articles:
            url = article.get("url", "")
            title = article.get("title", "").lower()

            if url and url not in seen_urls and title not in seen_titles:
                seen_urls.add(url)
                seen_titles.add(title)
                unique_articles.append(article)

        # Sort by date (most recent first)
        unique_articles.sort(
            key=lambda x: x.get("publishedAt", ""),
            reverse=True
        )

        # Limit to requested number
        result = unique_articles[:num_articles]

        logger.info(f"Aggregated {len(result)} unique Lebanese news articles from {len(all_articles)} total")
        return result

    def summarize_and_translate_article(self, article: Dict) -> Dict:
        """
        OPTIMIZED: Combine summarization AND translation in ONE Gemini call

        Args:
            article: Article dictionary

        Returns:
            Dict with arabic_title and ai_summary
        """
        title = article.get("title", "")
        description = article.get("description", "")
        content = article.get("content", "")

        full_text = f"{title}\n\n{description}\n\n{content}"

        prompt = f"""
You are a news summarization expert for Lebanese and Middle Eastern news. Process this article:

Article Title: {title}
Content: {description} {content}

Provide a JSON response with:
1. "arabic_title": Translate the title to natural, fluent Arabic
2. "arabic_summary": Write a 2-3 sentence summary in Arabic, focusing on key facts and Lebanese context

Output ONLY valid JSON in this format:
{{
    "arabic_title": "العنوان بالعربية",
    "arabic_summary": "الملخص بالعربية مع التركيز على السياق اللبناني"
}}
"""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean JSON
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

    def get_daily_briefing(self, num_articles: int = 10) -> str:
        """
        Get comprehensive Lebanese news briefing from multiple sources

        Args:
            num_articles: Number of articles (default 10 for comprehensive coverage)

        Returns:
            Formatted news message in Arabic
        """
        logger.info(f"Generating comprehensive Lebanese news briefing...")

        # Aggregate from all sources
        articles = self.aggregate_lebanese_news(num_articles=num_articles)

        if not articles:
            return "📰 لا توجد أخبار لبنانية متاحة حالياً. حاول مرة أخرى لاحقاً!"

        # Process articles in parallel (5 at a time)
        with ThreadPoolExecutor(max_workers=5) as executor:
            processed_articles = list(executor.map(self.process_article_sync, articles))

        message = f"🇱🇧 *أخبار لبنان - تقرير شامل*\n"
        message += f"_{datetime.now().strftime('%B %d, %Y')}_\n"
        message += f"_من {len(set([a.get('source', {}).get('name', 'Unknown') for a in processed_articles]))} مصادر مختلفة_\n\n"

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
