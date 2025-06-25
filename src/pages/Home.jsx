import { useState } from "react";
import { HiUsers, HiGlobe, HiChat, HiShare, HiThumbUp, HiSparkles } from "react-icons/hi";
import { FaBuilding, FaRobot } from "react-icons/fa";
import CreatePost from "../components/feed/CreatePost"
import Comment from "../components/feed/Comment"

/**
 * Home Page Component - LinkedIn Feed
 * 
 * The central hub of the LinkedIn clone where users engage with diverse content.
 * Enhanced with different post types and visual indicators.
 * 
 * Current Implementation:
 * - Post creation interface
 * - Mixed feed with user, community, and page posts
 * - Visual indicators for different post sources
 * - Real-time activity indicators
 * 
 * Post Type Indicators:
 * - User posts: Standard profile picture
 * - Community posts: User + Community icon overlap
 * - Page posts: Page logo indicator
 * 
 * UX Philosophy:
 * - Clear visual hierarchy for different content sources
 * - Seamless browsing experience
 * - Professional LinkedIn-style design
 */
export default function Home() {
  const [showComments, setShowComments] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 1,
      type: "user",
      author: {
        name: "Sarah Johnson",
        title: "Product Manager at TechCorp",
        avatar: null
      },
      content: "Just completed an amazing project with my team! The new feature we launched has already increased user engagement by 35%. Proud of what we accomplished together. #ProductManagement #TeamWork",
      timestamp: "2 hours ago",
      likes: 45,
      comments: 12,
      shares: 8,
      commentsList: [
        {
          id: 1,
          author: "John Smith",
          content: "Congratulations! That's an impressive improvement. What specific features contributed most to the engagement boost?",
          timestamp: "1 hour ago",
          likes: 3
        },
        {
          id: 2,
          author: "Maria Garcia",
          content: "Amazing work! Your team's dedication really shows in these results.",
          timestamp: "45 minutes ago",
          likes: 2
        }
      ]
    },
    {
      id: 2,
      type: "community",
      author: {
        name: "Mike Chen",
        title: "Senior Developer",
        avatar: null
      },
      community: {
        name: "Tech Innovators",
        icon: "👥"
      },
      content: "Great discussion in our community about the future of AI in web development. Here are the key takeaways from today's session:\n\n1. AI-assisted coding will become mainstream\n2. Focus on problem-solving skills over syntax\n3. Collaboration between humans and AI is key\n\nWhat are your thoughts on AI in development?",
      timestamp: "4 hours ago",
      likes: 128,
      comments: 34,
      shares: 22,
      commentsList: [
        {
          id: 1,
          author: "David Chen",
          content: "Great insights! I especially agree with point 2. Problem-solving skills will always be more valuable than memorizing syntax.",
          timestamp: "3 hours ago",
          likes: 8
        },
        {
          id: 2,
          author: "Sarah Wilson",
          content: "This is exactly what we discussed in our team meeting yesterday. The future is definitely human-AI collaboration.",
          timestamp: "2 hours ago",
          likes: 5
        }
      ]
    },
    {
      id: 3,
      type: "page",
      author: {
        name: "TechCorp",
        title: "Software Company",
        avatar: null
      },
      page: {
        name: "TechCorp",
        logo: "🏢"
      },
      content: "We're excited to announce our new internship program for 2024! 🎉\n\nWe're looking for passionate students interested in:\n• Frontend Development (React, TypeScript)\n• Backend Development (Node.js, Python)\n• Data Science & Analytics\n• UX/UI Design\n\nApplications open next week. Stay tuned for more details!\n\n#Internship #TechCareers #Hiring",
      timestamp: "6 hours ago",
      likes: 89,
      comments: 56,
      shares: 41
    },
    {
      id: 4,
      type: "user",
      author: {
        name: "Alex Rodriguez",
        title: "UX Designer",
        avatar: null
      },
      content: "Just attended an incredible design conference! The sessions on accessibility and inclusive design were eye-opening. It's amazing how small changes can make such a big impact on user experience. Time to implement these learnings in our next project! ♿️✨",
      timestamp: "8 hours ago",
      likes: 67,
      comments: 23,
      shares: 15
    },
    {
      id: 5,
      type: "community",
      author: {
        name: "Lisa Park",
        title: "Data Scientist",
        avatar: null
      },
      community: {
        name: "AI & Machine Learning",
        icon: "🤖"
      },
      content: "Sharing my latest research on neural network optimization! Our team achieved a 40% improvement in training speed while maintaining accuracy. The key was implementing adaptive learning rates combined with dynamic batch sizing.\n\nFull paper will be published next month. Happy to discuss the methodology in the comments! 📊🧠",
      timestamp: "1 day ago",
      likes: 203,
      comments: 67,
      shares: 89
    }
  ]);

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAiAnalysis = (post) => {
    // Simulate AI analysis
    const analyses = [
      "This post shows strong leadership qualities and data-driven decision making. The 35% engagement increase demonstrates effective product management skills.",
      "The discussion about AI in development reflects current industry trends. This content would resonate well with tech professionals and could generate meaningful conversations.",
      "This internship announcement follows best practices for recruitment posts. The clear structure and specific role requirements will attract quality candidates.",
      "The focus on accessibility and inclusive design shows awareness of modern UX principles. This type of content builds professional credibility.",
      "This research post demonstrates thought leadership in AI/ML. The technical details and promise of future publication establish expertise in the field."
    ];
    
    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
    setAiAnalysis(prev => ({
      ...prev,
      [post.id]: randomAnalysis
    }));
  };

  const PostTypeIndicator = ({ post }) => {
    if (post.type === 'community') {
      return (
        <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          <div className="flex items-center -space-x-1">
            <div className="w-4 h-4 bg-gray-300 rounded-full border border-white z-10"></div>
            <HiUsers className="w-4 h-4 text-purple-600" />
          </div>
          <span>Posted in {post.community.name}</span>
        </div>
      );
    }
    
    if (post.type === 'page') {
      return (
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
            <FaBuilding className="w-2 h-2 text-blue-600" />
          </div>
          <span>{post.page.name} • Page</span>
        </div>
      );
    }
    
    return null;
  };

  const FeedPost = ({ post }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          {/* Community post overlay indicator */}
          {post.type === 'community' && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-100 rounded-full border-2 border-white flex items-center justify-center">
              <HiUsers className="w-3 h-3 text-purple-600" />
            </div>
          )}
          {/* Page post overlay indicator */}
          {post.type === 'page' && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center">
              <FaBuilding className="w-3 h-3 text-blue-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-sm text-gray-600">{post.author.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{post.timestamp}</span>
                <HiGlobe className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Post type indicator */}
          <div className="mt-2">
            <PostTypeIndicator post={post} />
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{post.likes} likes</span>
          <span>{post.comments} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600">
          <HiThumbUp className="w-4 h-4" />
          <span>Like</span>
        </button>
        <button 
          onClick={() => toggleComments(post.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <HiChat className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600">
          <HiShare className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button 
          onClick={() => handleAiAnalysis(post)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-50 text-purple-600"
        >
          <FaRobot className="w-4 h-4" />
          <span>AI Insights</span>
        </button>
      </div>

      {/* AI Analysis */}
      {aiAnalysis[post.id] && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FaRobot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-800 mb-2">AI Analysis</h4>
              <p className="text-purple-700 text-sm">{aiAnalysis[post.id]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments[post.id] && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="space-y-4">
            {post.commentsList && post.commentsList.map(comment => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
          
          {/* Add Comment */}
          <div className="mt-4 flex gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Post Creation Interface */}
      <CreatePost />
      
      {/* Feed Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
            All Posts
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full">
            Following
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <HiUsers className="w-4 h-4" />
            Communities
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <FaBuilding className="w-4 h-4" />
            Pages
          </button>
        </div>
      </div>
      
      {/* Activity Indicator */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live Feed Active</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>•</span>
            <span>Real-time updates</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>1.2K professionals online</span>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      </div>
      
      {/* Feed Posts */}
      <div>
        {feedPosts.map(post => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>
      
      {/* Load More */}
      <div className="flex justify-center py-8">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm">Loading more posts...</span>
        </div>
      </div>
    </div>
  )
} 