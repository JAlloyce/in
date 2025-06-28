import { useState } from "react"
import { 
  HiDotsHorizontal, HiThumbUp, HiChat, HiShare, 
  HiFlag, HiSparkles, HiX, HiChevronLeft, HiChevronRight,
  HiOutlineBookmark, HiOutlineEyeOff, HiEmojiHappy, HiUserGroup
} from "react-icons/hi"
import { motion, AnimatePresence } from "framer-motion"
import PostActions from "./PostActions"
import Comment from "./Comment"

/**
 * Responsive Post Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Touch-optimized controls
 * - Proper overflow handling
 * - Accessibility compliant
 * - Smooth animations
 */
export default function Post({
  userId,
  userName,
  userRole,
  userCompany,
  content,
  time,
  likes,
  comments = [],
  communityName,
  onComment
}) {
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState(null)
  const [showAi, setShowAi] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [postComments, setPostComments] = useState(comments)

  // Sample images array - in real app, this would come from props
  const images = [
    {
      url: "product-launch-1.jpg",
      alt: "Product Launch Main Image",
      placeholder: "Product Launch Image 1"
    },
    {
      url: "product-launch-2.jpg",
      alt: "Product Features",
      placeholder: "Product Launch Image 2"
    },
    {
      url: "product-launch-3.jpg",
      alt: "Team Celebration",
      placeholder: "Product Launch Image 3"
    }
  ]

  const handleGetAiInsight = () => {
    setShowAi(true)
    setAiLoading(true)
    
    // Simulate AI processing time
    setTimeout(() => {
      setAiInsight({
        summary: "This post announces a new workflow feature launch. The author expresses excitement about the team's achievement after overcoming challenges. The tone is positive and celebratory.",
        sentiment: "Positive",
        keyPoints: [
          "Team collaboration was key to success",
          "The feature addresses workflow efficiency",
          "Impact on user community is emphasized"
        ]
      })
      setAiLoading(false)
    }, 3000)
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    
    const newComment = {
      id: postComments.length + 1,
      user: "John Doe",
      role: "Software Engineer at TechCorp",
      content: commentText,
      time: "Just now",
      likes: 0,
      liked: false
    }
    
    setPostComments([...postComments, newComment])
    setCommentText("")
  }

  const handleBookmark = () => {
    alert("Post bookmarked!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow border border-gray-200 mb-4 mobile-safe overflow-hidden"
    >
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap">
                <h3 className="font-semibold text-gray-900 text-base truncate">
                  {userName || 'Sarah Johnson'}
                </h3>
                {communityName && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                    <HiUserGroup className="w-3 h-3 mr-1" /> 
                    <span className="truncate max-w-20">{communityName}</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {userRole || 'Senior Product Manager'} at {userCompany || 'InnovateX'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {time || '2h'} • 🌍
              </p>
            </div>
          </div>
          
          {/* Post Header Actions */}
          <div className="flex items-center space-x-1 ml-2">
            <button 
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target focus-visible"
              onClick={handleBookmark}
              aria-label="Bookmark post"
            >
              <HiOutlineBookmark className="w-5 h-5" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target focus-visible"
                aria-label="More options"
              >
                <HiDotsHorizontal className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
              {showDropdown && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-dropdown-backdrop md:hidden"
                      onClick={() => setShowDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-dropdown border border-gray-200"
                    >
                      <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target">
                        <HiOutlineBookmark className="w-4 h-4 mr-3" />
                    Save post
                  </button>
                      <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target">
                        <HiOutlineEyeOff className="w-4 h-4 mr-3" />
                    Not interested
                  </button>
                      <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target">
                        <HiFlag className="w-4 h-4 mr-3" />
                    Report post
                  </button>
                    </motion.div>
                  </>
              )}
              </AnimatePresence>
            </div>
            </div>
          </div>
        </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed text-base">
            {content || `Excited to share that our team just launched a new feature that will help thousands of users streamline their workflow! 🚀

            The journey wasn't easy, but seeing the positive impact on our community makes every late night worth it.

            #ProductLaunch #TeamWork #Innovation`}
          </p>
        </div>

        {/* Image Carousel - Mobile Optimized */}
        <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-4">
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-base md:text-lg font-medium px-4 text-center">
                {images[currentImageIndex].placeholder}
              </span>
            </div>
            
            {images.length > 1 && (
              <>
                <button 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-all touch-target focus-visible"
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                aria-label="Previous image"
                >
                <HiChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-all touch-target focus-visible"
                  onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                aria-label="Next image"
                >
                <HiChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                    className={`w-2 h-2 rounded-full transition-all touch-target ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                      onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
        </div>

        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3 px-1">
          <span>{likes || 24} likes</span>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="hover:text-gray-700 transition-colors touch-target"
          >
            {comments || postComments.length} comments
          </button>
        </div>
      </div>

      {/* Post Actions */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 md:space-x-2">
            <button 
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all touch-target focus-visible ${
                liked 
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <HiThumbUp className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm font-medium hidden sm:inline">Like</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all touch-target focus-visible"
            >
              <HiChat className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm font-medium hidden sm:inline">Comment</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all touch-target focus-visible">
              <HiShare className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm font-medium hidden sm:inline">Share</span>
            </button>
          </div>
          
          <button
            onClick={handleGetAiInsight}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-all touch-target focus-visible"
          >
            <HiSparkles className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm font-medium hidden md:inline">AI Insight</span>
          </button>
        </div>
      </div>

      {/* AI Insight Panel */}
      <AnimatePresence>
        {showAi && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 bg-purple-50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-purple-900 flex items-center">
                  <HiSparkles className="w-4 h-4 mr-2" />
                  AI Insight
                </h4>
                <button
                  onClick={() => setShowAi(false)}
                  className="text-purple-600 hover:text-purple-800 p-1 rounded-lg hover:bg-purple-100 transition-colors touch-target focus-visible"
                  aria-label="Close AI insight"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
              
              {aiLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-purple-700">Analyzing post...</span>
                </div>
              ) : aiInsight ? (
              <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-purple-900 mb-1">Summary</h5>
                    <p className="text-sm text-purple-800">{aiInsight.summary}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-purple-900 mb-1">Sentiment</h5>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {aiInsight.sentiment}
                    </span>
                  </div>
                <div>
                    <h5 className="text-sm font-medium text-purple-900 mb-2">Key Points</h5>
                    <ul className="text-sm text-purple-800 space-y-1">
                      {aiInsight.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-1 h-1 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {point}
                        </li>
                    ))}
                  </ul>
                </div>
              </div>
              ) : null}
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Section */}
      <AnimatePresence>
      {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              {/* Comment Input */}
              <div className="flex space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                <input
                      type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base mobile-safe"
                      style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                  <button 
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target focus-visible"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>

              {/* Comments List */}
              <div className="space-y-4">
                {postComments.map((comment) => (
                <Comment 
                  key={comment.id}
                  user={comment.user}
                  role={comment.role}
                  content={comment.content}
                  time={comment.time}
                  likes={comment.likes}
                  liked={comment.liked}
                />
              ))}
            </div>
          </div>
          </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  )
}

