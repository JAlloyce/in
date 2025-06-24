"use client"

import { useState } from "react"
import { 
  HiDotsHorizontal, HiThumbUp, HiChat, HiShare, 
  HiFlag, HiSparkles, HiX 
} from "react-icons/hi"
import PostActions from "./PostActions"
import Comment from "./Comment"

export default function Post() {
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState(null)
  const [showAi, setShowAi] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState([
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
      id: comments.length + 1,
      user: "John Doe",
      role: "Software Engineer at TechCorp",
      content: commentText,
      time: "Just now",
      likes: 0,
      liked: false
    }
    
    setComments([...comments, newComment])
    setCommentText("")
  }

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div>
              <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
              <p className="text-sm text-gray-500">Senior Product Manager at InnovateX</p>
              <p className="text-xs text-gray-400">2h • 🌍</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              title="Report post"
            >
              <HiFlag className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
              <HiDotsHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed mb-4">
            Excited to share that our team just launched a new feature that will help thousands of users streamline
            their workflow! 🚀
            <br />
            <br />
            The journey wasn't easy, but seeing the positive impact on our community makes every late night worth it.
            <br />
            <br />
            #ProductLaunch #TeamWork #Innovation
          </p>

          <div className="rounded-lg overflow-hidden bg-gray-100">
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-lg font-medium">Product Launch Image</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>67 reactions • 12 comments</span>
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
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => setCommentText("")}
                  className="mr-2 px-4 py-1.5 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className={`px-4 py-1.5 rounded font-medium ${
                    commentText.trim() 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map(comment => (
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
      )}
    </div>
  )
}
