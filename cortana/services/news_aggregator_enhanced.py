"""
Enhanced Multi-Source News Aggregator - Lebanese and Middle Eastern news
Features:
- Full category filtering (business, tech, sports, health, science, entertainment)
- Full location filtering (Beirut, Tripoli, Sidon, Tyre, etc.)
- More Lebanese RSS sources (MTV Lebanon, LBCI, etc.)
- Improved formatting (no links, cleaner presentation, source specified)
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
import re
import time

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


class NewsAggregatorEnhanced:
    """
    Enhanced multi-source news aggregator for Lebanese news

    Sources:
    1. Lebanese RSS Feeds (MTV, LBCI, Naharnet, L'Orient, Daily Star, Lebanon Files)
    2. GNews API (better international coverage)
    3. NewsAPI (supplementary)
    """

    # Enhanced Lebanese RSS Feeds (Tested and Working)
    RSS_FEEDS = {
        "The961": "https://www.the961.com/feed",
        "An-Nahar": "https://www.annahar.com/rss",
        "Lebanon Files": "https://www.lebanonfiles.com/rss",
        "L'Orient Today": "https://today.lorientlejour.com/feed",
    }

    # Category keywords for filtering
    CATEGORY_KEYWORDS = {
        "business": ["economy", "business", "trade", "market", "financial", "bank", "اقتصاد", "تجارة", "مالي"],
        "technology": ["tech", "technology", "digital", "internet", "cyber", "AI", "تكنولوجيا", "رقمي"],
        "sports": ["sport", "football", "basketball", "olympics", "رياضة", "كرة"],
        "health": ["health", "medical", "hospital", "covid", "vaccine", "صحة", "طبي"],
        "science": ["science", "research", "study", "scientist", "علم", "بحث"],
        "entertainment": ["entertainment", "movie", "music", "celebrity", "فن", "موسيقى", "فنان"],
        "politics": ["politic", "government", "minister", "parliament", "election", "سياسة", "حكومة", "وزير"],
        "general": []  # No filtering for general news
    }

    # Location keywords for filtering
    LOCATION_KEYWORDS = {
        "beirut": ["beirut", "بيروت"],
        "tripoli": ["tripoli", "طرابلس"],
        "sidon": ["sidon", "saida", "صيدا"],
        "tyre": ["tyre", "sour", "صور"],
        "zahle": ["zahle", "zahlé", "زحلة"],
        "baalbek": ["baalbek", "baalbeck", "بعلبك"],
        "jounieh": ["jounieh", "جونيه"],
        "byblos": ["byblos", "jbeil", "جبيل"],
        "lebanon": ["lebanon", "lebanese", "لبنان", "لبناني"]
    }

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.newsapi_key = settings.news_api_key
        self.gnews_key = getattr(settings, 'gnews_api_key', None)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.executor = ThreadPoolExecutor(max_workers=2)  # Reduced from 5 to 2 to prevent rate limiting

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
                sources="",
                country="lb",
                language="ar",
                morning_summary_enabled=True,
                preferred_time="08:00"
            )
            self.db.add(prefs)
            self.db.commit()
            self.db.refresh(prefs)

        return prefs

    def matches_category(self, article: Dict, category: str) -> bool:
        """Check if article matches category"""
        if category == "general" or not category:
            return True

        keywords = self.CATEGORY_KEYWORDS.get(category.lower(), [])
        if not keywords:
            return True

        # Check title, description, and content
        text = (
            article.get("title", "") + " " +
            article.get("description", "") + " " +
            article.get("content", "")
        ).lower()

        return any(keyword.lower() in text for keyword in keywords)

    def matches_location(self, article: Dict, location: str) -> bool:
        """Check if article matches location"""
        if location == "lebanon" or not location:
            return True

        keywords = self.LOCATION_KEYWORDS.get(location.lower(), [])
        if not keywords:
            return True

        # Check title, description, and content
        text = (
            article.get("title", "") + " " +
            article.get("description", "") + " " +
            article.get("content", "")
        ).lower()

        return any(keyword.lower() in text for keyword in keywords)

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

    def fetch_all_lebanese_rss(self, limit_per_source: int = 3, category: str = None, location: str = None) -> List[Dict]:
        """
        Fetch from all Lebanese RSS feeds with filtering

        Args:
            limit_per_source: Articles per source
            category: Filter by category
            location: Filter by location

        Returns:
            Combined list of articles
        """
        all_articles = []

        # Fetch from each RSS feed
        for source_name, feed_url in self.RSS_FEEDS.items():
            # Fetch MORE articles when filtering to ensure we get enough matches
            fetch_limit = limit_per_source * 5 if (category and category != "general") else limit_per_source * 2
            articles = self.fetch_from_rss(feed_url, source_name, fetch_limit)

            # Apply filters
            if category and category != "general":
                articles = [a for a in articles if self.matches_category(a, category)]
                logger.info(f"Filtered {source_name} for category '{category}': {len(articles)} matches")

            if location and location != "lebanon":
                articles = [a for a in articles if self.matches_location(a, location)]
                logger.info(f"Filtered {source_name} for location '{location}': {len(articles)} matches")

            # Limit after filtering
            articles = articles[:limit_per_source]
            all_articles.extend(articles)

        logger.info(f"Total RSS articles after filtering: {len(all_articles)}")
        return all_articles

    def fetch_from_newsapi(self, keywords: str = "lebanon", limit: int = 5, category: str = None) -> List[Dict]:
        """
        Fetch from NewsAPI with category support

        Args:
            keywords: Search keywords
            limit: Number of articles
            category: Filter by category

        Returns:
            List of articles
        """
        if not self.newsapi_key:
            return []

        from_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")

        # Add category keywords to query
        if category and category != "general":
            cat_keywords = self.CATEGORY_KEYWORDS.get(category.lower(), [])
            if cat_keywords:
                keywords += " AND (" + " OR ".join(cat_keywords[:5]) + ")"

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

    def fetch_from_gnews(self, keywords: str = "lebanon", limit: int = 10, category: str = None) -> List[Dict]:
        """
        Fetch from GNews API with category support

        Args:
            keywords: Search keywords
            limit: Number of articles
            category: Filter by category

        Returns:
            List of articles
        """
        try:
            # Add category keywords to query
            if category and category != "general":
                cat_keywords = self.CATEGORY_KEYWORDS.get(category.lower(), [])
                if cat_keywords:
                    keywords += " " + " ".join(cat_keywords[:3])

            url = "https://gnews.io/api/v4/search"
            params = {
                "q": keywords,
                "lang": "ar,en",
                "country": "lb",
                "max": limit,
                "apikey": self.gnews_key if self.gnews_key else "demo"
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

    def aggregate_news(self, num_articles: int = 10, category: str = None, location: str = None) -> List[Dict]:
        """
        Aggregate Lebanese news from ALL sources with filtering

        Args:
            num_articles: Target number of articles
            category: Filter by category (business, tech, sports, health, science, entertainment)
            location: Filter by location (beirut, tripoli, sidon, tyre, etc.)

        Returns:
            Combined and deduplicated list of articles
        """
        logger.info(f"Aggregating Lebanese news (category: {category}, location: {location})...")

        all_articles = []

        # Build search keywords
        keywords = "lebanon OR beirut"
        if location and location != "lebanon":
            loc_keywords = self.LOCATION_KEYWORDS.get(location.lower(), [])
            if loc_keywords:
                keywords = " OR ".join(loc_keywords[:3])

        # 1. Fetch from Lebanese RSS feeds (primary source)
        logger.info("Fetching from Lebanese RSS feeds...")
        rss_articles = self.fetch_all_lebanese_rss(
            limit_per_source=3,
            category=category,
            location=location
        )
        all_articles.extend(rss_articles)

        # 2. Fetch from GNews (good Lebanese coverage)
        logger.info("Fetching from GNews...")
        gnews_articles = self.fetch_from_gnews(keywords=keywords, limit=5, category=category)
        if location and location != "lebanon":
            gnews_articles = [a for a in gnews_articles if self.matches_location(a, location)]
        all_articles.extend(gnews_articles)

        # 3. Fetch from NewsAPI (supplementary)
        logger.info("Fetching from NewsAPI...")
        newsapi_articles = self.fetch_from_newsapi(keywords=keywords, limit=5, category=category)
        if location and location != "lebanon":
            newsapi_articles = [a for a in newsapi_articles if self.matches_location(a, location)]
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

        logger.info(f"Aggregated {len(result)} unique articles from {len(all_articles)} total")
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
        """Wrapper for synchronous article processing with rate limiting"""
        time.sleep(0.6)  # 600ms delay to stay under 10 requests/minute (1 req per 6 seconds = 10/min)
        result = self.summarize_and_translate_article(article)
        article["arabic_title"] = result["arabic_title"]
        article["ai_summary"] = result["ai_summary"]
        return article

    def remove_urls(self, text: str) -> str:
        """Remove all URLs from text"""
        # Remove http/https URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        # Remove www URLs
        text = re.sub(r'www\.(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),])+', '', text)
        # Remove markdown links [text](url)
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        # Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def split_message(self, message: str, max_length: int = 4000) -> List[str]:
        """
        Split a long message into chunks that fit Telegram's 4096 character limit

        Args:
            message: The message to split
            max_length: Maximum characters per chunk (default 4000 to be safe)

        Returns:
            List of message chunks
        """
        if len(message) <= max_length:
            return [message]

        chunks = []
        current_chunk = ""

        # Split by article separator
        parts = message.split("─────────────────────\n\n")

        header = parts[0] if parts else ""
        footer = ""

        # Extract footer if present
        if "📌 _تم جمع الأخبار" in message:
            footer_start = message.find("📌 _تم جمع الأخبار")
            footer = message[footer_start:]
            message = message[:footer_start]

        # Start with header
        current_chunk = header + "─────────────────────\n\n"

        # Process article parts (skip header which is parts[0])
        for i, part in enumerate(parts[1:], 1):
            article_text = part + "─────────────────────\n\n"

            # If adding this article exceeds limit, save current chunk and start new one
            if len(current_chunk) + len(article_text) > max_length - len(footer) - 100:  # 100 char buffer
                # Add continuation indicator
                current_chunk += f"\n_...يتبع في الرسالة التالية_\n"
                chunks.append(current_chunk)

                # Start new chunk with minimal header
                current_chunk = f"🇱🇧 _(تابع)_\n\n─────────────────────\n\n"

            current_chunk += article_text

        # Add footer to last chunk
        if footer:
            current_chunk += footer

        chunks.append(current_chunk)

        logger.info(f"Split message into {len(chunks)} chunks")
        return chunks

    def format_news_message(self, articles: List[Dict], title: str = "أخبار لبنان") -> str:
        """
        Format news articles into a clean message WITHOUT links

        Args:
            articles: List of processed articles
            title: Message title

        Returns:
            Formatted news message in Arabic
        """
        if not articles:
            return "📰 لا توجد أخبار متاحة حالياً. حاول مرة أخرى لاحقاً!"

        # Build message header
        message = f"🇱🇧 *{title}*\n"
        message += f"_{datetime.now().strftime('%d %B %Y')}_\n"

        # Get unique sources
        sources = list(set([a.get('source', {}).get('name', 'Unknown') for a in articles]))
        message += f"_من {len(sources)} مصادر: {', '.join(sources[:3])}"
        if len(sources) > 3:
            message += f" و{len(sources)-3} آخرين"
        message += "_\n\n"

        message += "─────────────────────\n\n"

        # Format each article
        for i, article in enumerate(articles, 1):
            article_title = article.get("arabic_title", article.get("title", "بدون عنوان"))
            summary = article.get("ai_summary", article.get("description", ""))
            source = article.get("source", {}).get("name", "Unknown")

            # Remove any URLs from title and summary
            article_title = self.remove_urls(article_title)
            summary = self.remove_urls(summary)

            message += f"*{i}. {article_title}*\n"
            message += f"📰 المصدر: {source}\n\n"
            message += f"{summary}\n\n"
            message += "─────────────────────\n\n"

        # Footer
        message += "📌 _تم جمع الأخبار من مصادر لبنانية موثوقة_\n"
        message += f"🕐 _آخر تحديث: {datetime.now().strftime('%I:%M %p')}_"

        return message

    def get_daily_briefing(self, num_articles: int = 6) -> str:
        """
        Get comprehensive Lebanese news briefing from multiple sources

        Args:
            num_articles: Number of articles (default 6, reduced from 10 to prevent rate limiting)

        Returns:
            Formatted news message in Arabic without links
        """
        logger.info(f"Generating comprehensive Lebanese news briefing...")

        # Aggregate from all sources
        articles = self.aggregate_news(num_articles=num_articles)

        if not articles:
            return "📰 لا توجد أخبار لبنانية متاحة حالياً. حاول مرة أخرى لاحقاً!"

        # Process articles in parallel (2 at a time to prevent rate limiting)
        with ThreadPoolExecutor(max_workers=2) as executor:
            processed_articles = list(executor.map(self.process_article_sync, articles))

        return self.format_news_message(processed_articles, title="أخبار لبنان - التقرير اليومي")

    def get_category_news(self, category: str, num_articles: int = 8) -> str:
        """
        Get news for specific category

        Args:
            category: Category (business, tech, sports, health, science, entertainment)
            num_articles: Number of articles

        Returns:
            Formatted news message in Arabic without links
        """
        logger.info(f"Generating {category} news briefing...")

        # Map category to Arabic title
        category_titles = {
            "business": "الأخبار الاقتصادية",
            "technology": "أخبار التكنولوجيا",
            "sports": "الأخبار الرياضية",
            "health": "الأخبار الصحية",
            "science": "الأخبار العلمية",
            "entertainment": "أخبار الفن والترفيه",
            "politics": "الأخبار السياسية"
        }

        title = category_titles.get(category.lower(), "الأخبار")

        # Aggregate with category filter - fetch MORE to ensure we get category matches
        articles = self.aggregate_news(num_articles=num_articles * 2, category=category)

        # Filter again to ensure category match
        if category and category != "general":
            articles = [a for a in articles if self.matches_category(a, category)]

        # Limit to requested number after strict filtering
        articles = articles[:num_articles]

        if not articles:
            return f"📰 لا توجد أخبار {title.lower()} متاحة حالياً. حاول البحث عن فئة أخرى أو اطلب الأخبار العامة."

        # Process articles in parallel (2 at a time to prevent rate limiting)
        with ThreadPoolExecutor(max_workers=2) as executor:
            processed_articles = list(executor.map(self.process_article_sync, articles))

        return self.format_news_message(processed_articles, title=title)

    def get_location_news(self, location: str, num_articles: int = 8) -> str:
        """
        Get news for specific location

        Args:
            location: Location (beirut, tripoli, sidon, tyre, etc.)
            num_articles: Number of articles

        Returns:
            Formatted news message in Arabic without links
        """
        logger.info(f"Generating {location} news briefing...")

        # Map location to Arabic title
        location_titles = {
            "beirut": "أخبار بيروت",
            "tripoli": "أخبار طرابلس",
            "sidon": "أخبار صيدا",
            "tyre": "أخبار صور",
            "zahle": "أخبار زحلة",
            "baalbek": "أخبار بعلبك",
            "jounieh": "أخبار جونيه",
            "byblos": "أخبار جبيل",
            "lebanon": "أخبار لبنان"
        }

        title = location_titles.get(location.lower(), f"أخبار {location}")

        # Aggregate with location filter
        articles = self.aggregate_news(num_articles=num_articles, location=location)

        if not articles:
            return f"📰 لا توجد أخبار من {location} متاحة حالياً. حاول مرة أخرى لاحقاً!"

        # Process articles in parallel (2 at a time to prevent rate limiting)
        with ThreadPoolExecutor(max_workers=2) as executor:
            processed_articles = list(executor.map(self.process_article_sync, articles))

        return self.format_news_message(processed_articles, title=title)

    def get_global_news(self, num_articles: int = 6) -> str:
        """
        Get global/international news WITHOUT Lebanese filtering

        Args:
            num_articles: Number of articles (default 6)

        Returns:
            Formatted news message in Arabic without links
        """
        logger.info("Generating global news briefing...")

        all_articles = []

        # 1. Fetch from NewsAPI (international sources)
        try:
            from_date = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
            params = {
                "apiKey": self.newsapi_key,
                "q": "world OR international OR global",
                "domains": "bbc.com,reuters.com,cnn.com,aljazeera.com,theguardian.com",
                "language": "en",
                "sortBy": "publishedAt",
                "from": from_date,
                "pageSize": num_articles
            }

            response = requests.get("https://newsapi.org/v2/everything", params=params)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    all_articles.extend(data.get("articles", []))
                    logger.info(f"Fetched {len(data.get('articles', []))} articles from NewsAPI global")

        except Exception as e:
            logger.error(f"Error fetching global news from NewsAPI: {str(e)}")

        # 2. Fetch from GNews (global)
        try:
            url = "https://gnews.io/api/v4/top-headlines"
            params = {
                "lang": "en",
                "country": "us",  # US for global coverage
                "max": num_articles,
                "apikey": self.gnews_key if self.gnews_key else "demo"
            }

            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                articles = data.get("articles", [])

                # Convert GNews format
                for article in articles:
                    all_articles.append({
                        "title": article.get("title", ""),
                        "description": article.get("description", ""),
                        "url": article.get("url", ""),
                        "publishedAt": article.get("publishedAt", ""),
                        "source": {"name": article.get("source", {}).get("name", "GNews")},
                        "content": article.get("content", "")
                    })

                logger.info(f"Fetched {len(articles)} articles from GNews global")

        except Exception as e:
            logger.error(f"Error fetching from GNews: {str(e)}")

        # Remove duplicates
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

        # Limit to requested number
        unique_articles = unique_articles[:num_articles]

        if not unique_articles:
            return "📰 لا توجد أخبار عالمية متاحة حالياً. حاول مرة أخرى لاحقاً!"

        # Process articles in parallel (2 at a time to prevent rate limiting)
        with ThreadPoolExecutor(max_workers=2) as executor:
            processed_articles = list(executor.map(self.process_article_sync, unique_articles))

        return self.format_news_message(processed_articles, title="أخبار عالمية")
