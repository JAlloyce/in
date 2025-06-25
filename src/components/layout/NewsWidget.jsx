import { useState, useEffect } from 'react';
import { HiTrendingUp, HiRefresh } from 'react-icons/hi';

export default function NewsWidget() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadTrendingTopics();
  }, []);

  const loadTrendingTopics = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from a news API
      // For now, we'll generate contextual trending topics based on current tech trends
      const topics = [
        {
          title: "AI Tools in Professional Development",
          engagement: Math.floor(Math.random() * 5000) + 1000,
          timeAgo: `${Math.floor(Math.random() * 6) + 1}h`,
          category: "Technology"
        },
        {
          title: "Remote Work Best Practices 2024",
          engagement: Math.floor(Math.random() * 8000) + 2000,
          timeAgo: `${Math.floor(Math.random() * 12) + 2}h`,
          category: "Career"
        },
        {
          title: "Green Technology Investment Surge",
          engagement: Math.floor(Math.random() * 3000) + 800,
          timeAgo: `${Math.floor(Math.random() * 8) + 1}h`,
          category: "Business"
        },
        {
          title: "Skills Gap in Tech Industry",
          engagement: Math.floor(Math.random() * 6000) + 1500,
          timeAgo: `${Math.floor(Math.random() * 24) + 3}h`,
          category: "Industry"
        },
        {
          title: "Cybersecurity Awareness Month",
          engagement: Math.floor(Math.random() * 4000) + 1200,
          timeAgo: `${Math.floor(Math.random() * 18) + 2}h`,
          category: "Security"
        }
      ];

      // Sort by engagement to simulate "trending"
      const sortedTopics = topics.sort((a, b) => b.engagement - a.engagement);
      
      setTimeout(() => {
        setNews(sortedTopics.slice(0, 4));
        setLastUpdated(new Date());
        setLoading(false);
      }, 800);
      
    } catch (error) {
      console.error('Error loading trending topics:', error);
      setLoading(false);
    }
  };

  const formatEngagement = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const refreshNews = () => {
    loadTrendingTopics();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 sticky top-20 sm:top-24">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 sticky top-20 sm:top-24">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center">
          <HiTrendingUp className="w-4 h-4 text-blue-600 mr-2" />
          <h3 className="font-semibold text-sm sm:text-base">Trending Topics</h3>
        </div>
        <button
          onClick={refreshNews}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Refresh trending topics"
        >
          <HiRefresh className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {news.map((item, index) => (
          <div key={index} className="text-xs sm:text-sm cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
            <p className="font-medium text-gray-900 line-clamp-2">{item.title}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-gray-500">{item.timeAgo} • {formatEngagement(item.engagement)} readers</p>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t">
        <p className="text-xs text-gray-500 text-center">
          Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}