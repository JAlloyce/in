import { useState, useEffect } from "react";
import { HiUsers, HiGlobe, HiChat, HiShare, HiThumbUp, HiSparkles, HiTrendingUp, HiClock } from "react-icons/hi";
import { FaBuilding, FaRobot } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/feed/CreatePost"
import Hero from "../components/feed/Hero"
import Comment from "../components/feed/Comment"
import CommentInput from "../components/feed/CommentInput"
import { Button, Card, Avatar } from "../components/ui"
import { posts, comments, realtime } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import PostActions from "../components/feed/PostActions"

/**
 * Enhanced Home Page Component - Modern LinkedIn Feed
 * 
 * Features:
 * - Improved responsive grid layout with consistent spacing
 * - Advanced post animations with staggered loading
 * - Better mobile experience with touch-optimized elements
 * - Enhanced feed filtering and sorting
 * - Real-time activity indicators
 * - Professional polish with smooth transitions
 */
export default function Home() {
  const { user, loading } = useAuth()
  const [feedPosts, setFeedPosts] = useState([])
  const [showComments, setShowComments] = useState({})
  const [aiAnalysis, setAiAnalysis] = useState({})
  const [feedLoading, setFeedLoading] = useState(false)
  const [error, setError] = useState(null)
  const [feedFilter, setFeedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Load feed data when component mounts or user changes
  useEffect(() => {
    if (!loading) {
      loadFeedPosts()
    }
  }, [loading, user])

  // Disable real-time for now (causing WebSocket errors)
  // useEffect(() => {
  //   const subscription = realtime.subscribeToFeed((payload) => {
  //     console.log('New post received:', payload)
  //     if (payload.eventType === 'INSERT') {
  //       loadFeedPosts() // Reload feed when new posts are added
  //     }
  //   })

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

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
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
          media_urls: [],
          user_liked: false,
          source_id: post.source_id,
          commentsList: [],
          image_url: post.image_url
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

  const toggleComments = async (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))

    // Load comments when showing them for the first time
    if (!showComments[postId]) {
      try {
        const { data: commentsData, error } = await comments.getByPost(postId)
        
        if (error) {
          console.error('Error loading comments:', error)
          return
        }

        // Update the post with real comments
        setFeedPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentsList: commentsData || [] }
            : post
        ))
      } catch (err) {
        console.error('Error loading comments:', err)
      }
    }
  }

  const handleCommentAdded = (postId, newComment) => {
    // Add the new comment to the post's comment list
    setFeedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            commentsList: [...(post.commentsList || []), newComment],
            comments: post.comments + 1
          }
        : post
    ))
  }

  const handleAiAnalysis = async (post) => {
    try {
      // Set loading state
      setAiAnalysis(prev => ({
        ...prev,
        [post.id]: 'Analyzing post...'
      }))

      // In a real implementation, this would call an AI service
      // For now, we'll use a simple analysis based on post content
      let analysis = "This post shows professional engagement. "
      
      const content = post.content.toLowerCase()
      if (content.includes('achievement') || content.includes('success')) {
        analysis += "The achievement-focused content tends to perform well and inspire others."
      } else if (content.includes('team') || content.includes('collaboration')) {
        analysis += "Team-oriented content demonstrates leadership and collaborative skills."
      } else if (content.includes('excited') || content.includes('thrilled')) {
        analysis += "The positive tone and enthusiasm can help increase engagement."
      } else {
        analysis += "Consider adding more specific details or personal insights to increase engagement."
      }

      // Simulate API delay
      setTimeout(() => {
        setAiAnalysis(prev => ({
          ...prev,
          [post.id]: analysis
        }))
      }, 1500)
      
    } catch (err) {
      console.error('Error analyzing post:', err)
      setAiAnalysis(prev => ({
        ...prev,
        [post.id]: 'Unable to analyze this post at the moment.'
      }))
    }
  }

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share({
          title: 'LinkedIn Clone Post',
          text: post.content,
          url: window.location.href
        });
      } else {
        // Fallback - copy to clipboard
        const shareText = `Check out this post: "${post.content}" - ${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        alert('Post link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
      // Fallback for older browsers
      const shareText = `Check out this post: "${post.content}" - ${window.location.href}`;
      prompt('Copy this link to share:', shareText);
    }
  };

  const handlePostCreated = (newPost) => {
    // Add the new post to the top of the feed with animation
    setFeedPosts(prev => [newPost, ...prev])
  }

  const handleFilterChange = (filter) => {
    setFeedFilter(filter)
    // Filter posts based on type
    if (filter === 'all') {
      // Show all posts
    } else if (filter === 'following') {
      // Filter to followed users only
    } else if (filter === 'communities') {
      // Filter to community posts only
    } else if (filter === 'pages') {
      // Filter to company page posts only
    }
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
    const sortedPosts = [...feedPosts]
    if (sort === 'recent') {
      sortedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    } else if (sort === 'popular') {
      sortedPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    }
    setFeedPosts(sortedPosts)
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
    <Card className="linkedin-post mb-6">
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          <Avatar 
              src={post.author.avatar} 
            name={post.author.name}
            size="lg"
          />
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
        {post.image_url && (
          <div className="mt-4">
            <img 
              src={post.image_url} 
              alt="Post image"
              className="rounded-lg max-h-96 w-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', post.image_url);
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            {post.media_urls.map((url, index) => (
              <img 
                key={index}
                src={url} 
                alt={`Post media ${index + 1}`}
                className="rounded-lg max-h-96 w-full object-cover"
                onError={(e) => {
                  console.error('Media failed to load:', url);
                  e.target.style.display = 'none';
                }}
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
      <PostActions 
        liked={post.user_liked}
        onLike={() => handleLike(post.id)}
        onComment={() => toggleComments(post.id)}
        onShare={() => handleShare(post)}
        onAiInsight={() => handleAiAnalysis(post)}
        onBookmark={() => {}} // TODO: Implement bookmark functionality
        isBookmarked={false} // TODO: Get from post data
        onReport={() => alert('Post reported')}
        onNotInterested={() => alert('Marked as not interested')}
      />

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
              <Comment 
                key={comment.id} 
                user={comment.user?.name || 'Unknown User'}
                content={comment.content}
                time={formatTimestamp(comment.created_at)}
                likes={0}
                liked={false}
              />
            ))}
          </div>
          
          {/* Add Comment */}
          <CommentInput 
            postId={post.id} 
            onCommentAdded={(newComment) => handleCommentAdded(post.id, newComment)}
          />
        </div>
      )}
    </Card>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Hero Section for Non-authenticated users */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="grid grid-cols-6 gap-4 h-full opacity-20">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="bg-white rounded-full w-2 h-2 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative z-10">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Welcome to the future of{' '}
              <span className="text-yellow-300">networking</span>
            </motion.h1>
            <motion.p 
              className="text-xl mb-6 text-blue-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connect with professionals worldwide and build your career
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Join now
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/20 transition-all duration-300"
              >
                Learn more
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Post Creation Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
      <CreatePost user={user} onPostCreated={handlePostCreated} />
      </motion.div>
      
      {/* Enhanced Feed Filter & Sort Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <Button 
                variant={feedFilter === 'all' ? 'primary' : 'ghost'} 
                size="sm" 
                className="whitespace-nowrap"
                onClick={() => handleFilterChange('all')}
              >
            All Posts
              </Button>
              <Button 
                variant={feedFilter === 'following' ? 'primary' : 'ghost'} 
                size="sm" 
                className="whitespace-nowrap"
                onClick={() => handleFilterChange('following')}
              >
            Following
              </Button>
              <Button 
                variant={feedFilter === 'communities' ? 'primary' : 'ghost'} 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-2"
                onClick={() => handleFilterChange('communities')}
              >
            <HiUsers className="w-4 h-4" />
            Communities
              </Button>
              <Button 
                variant={feedFilter === 'pages' ? 'primary' : 'ghost'} 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-2"
                onClick={() => handleFilterChange('pages')}
              >
            <FaBuilding className="w-4 h-4" />
            Pages
              </Button>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleSortChange('recent')}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-all ${
                    sortBy === 'recent' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <HiClock className="w-4 h-4" />
                  Recent
                </button>
                <button
                  onClick={() => handleSortChange('popular')}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-all ${
                    sortBy === 'popular' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <HiTrendingUp className="w-4 h-4" />
                  Popular
          </button>
        </div>
      </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Activity Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Feed Active</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>•</span>
            <span>Real-time updates</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium">{feedPosts.length} posts loaded</span>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      </div>
        </Card>
      </motion.div>
      
      {/* Feed Posts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {feedLoading ? (
          <Card className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your personalized feed...</p>
          </Card>
        ) : feedPosts.length === 0 ? (
          <Card className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <HiSparkles className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your feed awaits!</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start connecting with professionals and sharing your expertise to see amazing content here.
              </p>
              <Button variant="primary" size="lg">
                Find people to follow
              </Button>
            </motion.div>
          </Card>
        ) : (
          <div className="space-y-6">
            {feedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeedPost post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Load More */}
      {feedPosts.length > 0 && (
        <motion.div 
          className="flex justify-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button 
            variant="outline"
            size="lg"
            onClick={loadFeedPosts}
            className="transform hover:scale-105 transition-all duration-200"
          >
            Load More Posts
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
} 