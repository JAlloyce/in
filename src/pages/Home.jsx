import { useState, useEffect } from "react";
import { HiUsers, HiGlobe, HiChat, HiShare, HiThumbUp, HiSparkles } from "react-icons/hi";
import { FaBuilding, FaRobot } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/feed/CreatePost"
import Comment from "../components/feed/Comment"
import { posts, realtime } from '../lib/supabase'

/**
 * Home Page Component - LinkedIn Feed (Connected to Supabase)
 * 
 * Now connected to real Supabase backend with:
 * - Real user authentication
 * - Dynamic post loading from database
 * - Real-time post updates
 * - User interactions (likes, comments)
 * - Professional feed with actual data
 */
export default function Home() {
  const { user, loading } = useAuth()
  const [feedPosts, setFeedPosts] = useState([])
  const [showComments, setShowComments] = useState({})
  const [aiAnalysis, setAiAnalysis] = useState({})
  const [feedLoading, setFeedLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load feed data when component mounts or user changes
  useEffect(() => {
    if (!loading) {
      loadFeedPosts()
    }
  }, [loading, user])

  // Set up real-time subscription for new posts
  useEffect(() => {
    const subscription = realtime.subscribeToFeed((payload) => {
      console.log('New post received:', payload)
      if (payload.eventType === 'INSERT') {
        loadFeedPosts() // Reload feed when new posts are added
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Removed initializeHome - now handled by AuthContext and useEffect

  const loadFeedPosts = async () => {
    try {
      setFeedLoading(true)
      setError(null)
      
      const { data: postsData, error: postsError } = await posts.getFeed(20)
      
      if (postsError) {
        console.error('Error loading posts:', postsError)
        setError('Failed to load posts: ' + postsError.message)
        return
      }

      if (!postsData) {
        setFeedPosts([])
        return
      }

      // Transform the data for display
      const transformedPosts = postsData.map((post) => {
        return {
          id: post.id,
          type: 'user',
          author: {
            name: post.author?.name || 'Unknown User',
            title: post.author?.headline || 'Professional',
            avatar: post.author?.avatar_url
          },
          content: post.content,
          timestamp: formatTimestamp(post.created_at),
          likes: Math.floor(Math.random() * 50), // Mock data for now
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          media_urls: [],
          user_liked: false,
          source_id: post.source_id,
          commentsList: []
        }
      })

      setFeedPosts(transformedPosts)
    } catch (err) {
      console.error('Error loading feed:', err)
      setError('Failed to load feed: ' + err.message)
    } finally {
      setFeedLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleLike = async (postId) => {
    if (!user) {
      alert('Please log in to like posts')
      return
    }

    try {
      const post = feedPosts.find(p => p.id === postId)
      if (post.user_liked) {
        // Unlike the post
        const { error } = await posts.unlike(postId, user.id)
        if (error) throw error
        
        setFeedPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes: Math.max(0, p.likes - 1), user_liked: false }
            : p
        ))
      } else {
        // Like the post
        const { error } = await posts.like(postId, user.id)
        if (error) throw error
        
        setFeedPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes: p.likes + 1, user_liked: true }
            : p
        ))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      alert('Failed to update like: ' + err.message)
    }
  }

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const handleAiAnalysis = (post) => {
    // Simulate AI analysis for now
    const analyses = [
      "This post demonstrates strong professional engagement and authentic storytelling. The personal experience shared could resonate well with your network.",
      "The content shows thought leadership in the tech space. Consider adding specific metrics or data points to increase credibility.",
      "This post effectively combines personal achievement with team recognition, which tends to perform well on LinkedIn.",
      "The narrative structure is compelling. The emotional hook at the beginning draws readers in effectively.",
      "This content aligns well with current industry trends. Consider cross-posting to relevant professional groups."
    ]
    
    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)]
    setAiAnalysis(prev => ({
      ...prev,
      [post.id]: randomAnalysis
    }))
  }

  const handlePostCreated = (newPost) => {
    // Add the new post to the top of the feed
    setFeedPosts(prev => [newPost, ...prev])
  }

  const PostTypeIndicator = ({ post }) => {
    if (post.type === 'community') {
      return (
        <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          <div className="flex items-center -space-x-1">
            <div className="w-4 h-4 bg-gray-300 rounded-full border border-white z-10"></div>
            <HiUsers className="w-4 h-4 text-purple-600" />
          </div>
          <span>Community Post</span>
        </div>
      )
    }
    
    if (post.type === 'page') {
      return (
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
            <FaBuilding className="w-2 h-2 text-blue-600" />
          </div>
          <span>Company Page</span>
        </div>
      )
    }
    
    return null
  }

  const FeedPost = ({ post }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          {post.author.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Post type overlay indicators */}
          {post.type === 'community' && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-100 rounded-full border-2 border-white flex items-center justify-center">
              <HiUsers className="w-3 h-3 text-purple-600" />
            </div>
          )}
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
        
        {/* Media URLs (if any) */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            {post.media_urls.map((url, index) => (
              <img 
                key={index}
                src={url} 
                alt="Post media"
                className="rounded-lg max-h-96 object-cover"
              />
            ))}
          </div>
        )}
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
        <button 
          onClick={() => handleLike(post.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
            post.user_liked ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
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
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {user && (
                  <span className="text-xs text-gray-600 font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
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
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null)
            loadFeedPosts()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Post Creation Interface */}
      <CreatePost user={user} onPostCreated={handlePostCreated} />
      
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
          <span>{feedPosts.length} posts loaded</span>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      </div>
      
      {/* Feed Posts */}
      <div>
        {feedLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : feedPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <HiSparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share something with your network!</p>
          </div>
        ) : (
          feedPosts.map(post => (
            <FeedPost key={post.id} post={post} />
          ))
        )}
      </div>
      
      {/* Load More */}
      {feedPosts.length > 0 && (
        <div className="flex justify-center py-8">
          <button 
            onClick={loadFeedPosts}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            Load More Posts
          </button>
        </div>
      )}
    </div>
  )
} 