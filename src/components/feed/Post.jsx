import { useState } from "react"
import { 
  HiDotsHorizontal, HiThumbUp, HiChat, HiShare, 
  HiFlag, HiSparkles, HiX, HiChevronLeft, HiChevronRight,
  HiOutlineBookmark, HiOutlineEyeOff, HiEmojiHappy, HiUserGroup
} from "react-icons/hi"
import PostActions from "./PostActions"
import Comment from "./Comment"

export default function Post({
  userId,
  userName,
  userRole,
  userCompany,
  content,
  time,
  likes,
  comments,
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
  const [postComments, setPostComments] = useState([
    {
      id: 1,
      user: "Michael Chen",
      role: "Software Engineer",
      content: "This looks amazing! Can't wait to try it out.",
      time: "1h ago",
      likes: 5,
      liked: false
    },
    {
      id: 2,
      user: "Emma Wilson",
      role: "Product Designer",
      content: "The design looks so intuitive. Great job!",
      time: "45m ago",
      likes: 3,
      liked: true
    }
  ])

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
    <div className="bg-white rounded-lg shadow mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div>
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-900">{userName || 'Sarah Johnson'}</h3>
                {communityName && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <HiUserGroup className="inline mr-1" /> {communityName}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{userRole || 'Senior Product Manager'} at {userCompany || 'InnovateX'}</p>
              <p className="text-xs text-gray-400">{time || '2h'} • 🌍</p>
            </div>
          </div>
          
          {/* Post Header Menu */}
          <div className="flex items-center space-x-2">
            <button 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              onClick={handleBookmark}
              title="Bookmark post"
            >
              <HiOutlineBookmark className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <HiDotsHorizontal className="w-5 h-5" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Save post
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Not interested
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <HiFlag className="w-4 h-4 mr-2" />
                    Report post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed mb-4">
            {content || `Excited to share that our team just launched a new feature that will help thousands of users streamline
            their workflow! 🚀
            <br />
            <br />
            The journey wasn't easy, but seeing the positive impact on our community makes every late night worth it.
            <br />
            <br />
            #ProductLaunch #TeamWork #Innovation`}
          </p>

          {/* Image Carousel */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-lg font-medium">
                {images[currentImageIndex].placeholder}
              </span>
            </div>
            
            {images.length > 1 && (
              <>
                <button 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                  onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50 hover:bg-opacity-75"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>{likes || 67} reactions • {comments || 12} comments</span>
          <span>5 shares</span>
        </div>
      </div>

      {/* AI Insight Section */}
      {showAi && (
        <div className="border-t border-gray-200">
          <div className="p-4 bg-blue-50 relative">
            <button 
              onClick={() => setShowAi(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <HiX className="w-5 h-5" />
            </button>
            
            <div className="flex items-center mb-2">
              <HiSparkles className="w-5 h-5 text-yellow-500 mr-2" />
              <h4 className="font-medium">AI Insight</h4>
            </div>
            
            {aiLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            ) : aiInsight && (
              <div className="space-y-3">
                <p><strong>Summary:</strong> {aiInsight.summary}</p>
                <p><strong>Sentiment:</strong> {aiInsight.sentiment}</p>
                <div>
                  <strong>Key Points:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    {aiInsight.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <PostActions 
        liked={liked} 
        onLike={() => setLiked(!liked)}
        onComment={() => setShowComments(!showComments)}
        onAiInsight={handleGetAiInsight}
      />

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200">
          <div className="p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="flex-1 relative">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border-b border-gray-300 py-2 pr-20 focus:outline-none focus:border-blue-500 text-sm"
                />
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button className="text-gray-500 hover:text-gray-700">
                    <HiEmojiHappy className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className={`font-medium px-2 ${
                      commentText.trim() 
                        ? "text-blue-600 hover:text-blue-700" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              {postComments.map(comment => (
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
        </div>
      )}
    </div>
  )
}

