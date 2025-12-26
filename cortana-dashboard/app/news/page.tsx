"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUp,
  Globe,
  Sparkles,
  Zap,
  Heart,
  Briefcase,
} from "lucide-react";
import { getNewsFeed, type NewsArticle } from "@/lib/api";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    setLoading(true);
    try {
      const feed = await getNewsFeed(1);
      setArticles(feed);
    } catch (error) {
      console.error("Failed to load news:", error);
      // Mock data for demo
      setArticles([
        {
          title: "Lebanon's Tech Sector Shows Strong Growth",
          description:
            "Lebanese startups continue to thrive despite economic challenges, with tech companies leading innovation in the region.",
          url: "#",
          source: "Beirut News",
          published_at: new Date().toISOString(),
          category: "tech",
        },
        {
          title: "Global AI Trends 2025: What to Expect",
          description:
            "Industry experts predict major breakthroughs in AI technology with new models surpassing human-level performance in several domains.",
          url: "#",
          source: "Tech Today",
          published_at: new Date().toISOString(),
          category: "tech",
        },
        {
          title: "Market Analysis: Economic Outlook for Q1",
          description:
            "Financial analysts share insights on market trends and investment opportunities for the upcoming quarter.",
          url: "#",
          source: "Business Weekly",
          published_at: new Date().toISOString(),
          category: "business",
        },
        {
          title: "Health & Wellness: New Research on Exercise",
          description:
            "Recent studies reveal surprising benefits of regular physical activity on mental health and cognitive function.",
          url: "#",
          source: "Health Journal",
          published_at: new Date().toISOString(),
          category: "health",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { id: "all", name: "All News", icon: Globe, color: "gray" },
    { id: "tech", name: "Technology", icon: Zap, color: "blue" },
    { id: "business", name: "Business", icon: Briefcase, color: "green" },
    { id: "sports", name: "Sports", icon: TrendingUp, color: "orange" },
    { id: "health", name: "Health", icon: Heart, color: "red" },
  ];

  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const categoryMap: Record<string, string> = {
      tech: "from-blue-50 to-cyan-50 border-blue-200/50 shadow-blue-100/50",
      business:
        "from-green-50 to-emerald-50 border-green-200/50 shadow-green-100/50",
      sports:
        "from-orange-50 to-amber-50 border-orange-200/50 shadow-orange-100/50",
      health: "from-red-50 to-pink-50 border-red-200/50 shadow-red-100/50",
    };
    return (
      categoryMap[category] ||
      "from-gray-50 to-slate-50 border-gray-200/50 shadow-gray-100/50"
    );
  };

  const getCategoryBadgeColor = (category: string) => {
    const colorMap: Record<string, string> = {
      tech: "bg-blue-100 text-blue-700",
      business: "bg-green-100 text-green-700",
      sports: "bg-orange-100 text-orange-700",
      health: "bg-red-100 text-red-700",
    };
    return colorMap[category] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-gray-900 text-xl font-medium"
        >
          Loading latest news...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          News Feed
        </h1>
        <p className="text-gray-600 font-medium">
          Stay updated with personalized news and insights
        </p>

        {/* Category Filters */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-200/50 shadow-sm w-fit">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Daily Briefing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        className="mb-8 relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl border border-purple-200/50 rounded-3xl p-8 shadow-lg shadow-purple-100/50 hover:shadow-xl hover:shadow-purple-100/70 transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="p-4 bg-purple-500/10 rounded-3xl w-fit">
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">
              AI-Powered Daily Briefing
            </h3>
            <p className="text-gray-600 font-medium">
              Get a personalized summary of today's most important news delivered
              every morning at 8 AM
            </p>
          </div>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-semibold shadow-lg shadow-purple-200 hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap">
            Configure
          </button>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* News Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.3 + index * 0.1,
                type: "spring",
                stiffness: 300,
              }}
              className={`relative overflow-hidden bg-gradient-to-br ${getCategoryColor(
                article.category
              )} backdrop-blur-xl border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 group`}
            >
              {/* Article Category Badge */}
              {article.category && (
                <div
                  className={`inline-block px-3 py-1 ${getCategoryBadgeColor(
                    article.category
                  )} text-xs font-semibold rounded-full mb-4`}
                >
                  {article.category.toUpperCase()}
                </div>
              )}

              {/* Article Title */}
              <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
                {article.title}
              </h3>

              {/* Article Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                {article.description}
              </p>

              {/* Article Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4 font-medium">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-gray-200/50 rounded-lg">
                    <Newspaper className="w-3 h-3" />
                  </div>
                  <span>{article.source}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Read More Button */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors text-sm font-bold group"
              >
                Read Full Article
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Decorative gradient blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl" />
            </motion.article>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-12 text-center shadow-lg shadow-gray-100/50"
        >
          <div className="p-4 bg-gray-100 rounded-3xl w-fit mx-auto mb-6">
            <Newspaper className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">
            No Articles Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Try selecting a different category or check back later for fresh
            content
          </p>
        </motion.div>
      )}
    </div>
  );
}
