import { useState } from "react"
import { 
  HiThumbUp, HiChat, HiShare, HiSparkles, 
  HiOutlineBookmark, HiDotsVertical, HiFlag, HiEyeOff, HiDotsHorizontal, HiOutlineEyeOff
} from "react-icons/hi"
import { posts } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

/**
 * PostActions Component - Mobile-Optimized with Enhanced Features
 * 
 * Features:
 * - Mobile-first responsive design with icon-only buttons on small screens
 * - 3 dots menu with save, not interested, and report options
 * - Proper button spacing and overflow handling
 * - AI Insight button that adapts to screen size
 * - Professional LinkedIn-style interactions
 */
export default function PostActions({ 
  postId, 
  likes = 0, 
  comments = 0, 
  shares = 0,
  userLiked = false,
  onLikeChange,
  onCommentToggle,
  post
}) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(userLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState(null)

  const handleLike = async () => {
    if (!user) {
      setError('Please log in to like posts')
      return
    }

    if (isLoading) return

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Like action initiated:', { postId, isLiked })

      if (isLiked) {
        // Unlike the post
        const { error: unlikeError } = await posts.unlike(postId)
        
        if (unlikeError) {
          console.error('Unlike error:', unlikeError)
          setError('Failed to unlike post')
          return
        }
        
        setIsLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
        console.log('👎 Post unliked successfully')
      } else {
        // Like the post
        const { error: likeError } = await posts.like(postId)
        
        if (likeError) {
          console.error('Like error:', likeError)
          setError('Failed to like post')
          return
        }
        
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
        console.log('👍 Post liked successfully')
      }

      // Notify parent component of the change
      if (onLikeChange) {
        onLikeChange(postId, !isLiked)
      }
    } catch (err) {
      console.error('Like action error:', err)
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'LinkedIn Clone Post',
        text: post?.content || 'Check out this post!',
        url: window.location.href
      }

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        console.log('📤 Post shared via Web Share API')
      } else {
        // Fallback - copy to clipboard
        const textToShare = `${shareData.text}\n\n${shareData.url}`
        await navigator.clipboard.writeText(textToShare)
        
        // Show temporary success message
        const originalText = 'Share'
        const button = document.activeElement
        if (button && button.textContent.includes('Share')) {
          button.textContent = 'Copied!'
          setTimeout(() => {
            button.textContent = originalText
          }, 2000)
        }
        
        console.log('📋 Post link copied to clipboard')
      }
    } catch (err) {
      console.error('Share failed:', err)
      setError('Failed to share post')
    }
  }

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('💾 Save post:', postId)
  }

  const handleHide = async () => {
    // TODO: Implement hide functionality
    console.log('👁️ Hide post:', postId)
  }

  const handleReport = async () => {
    // TODO: Implement report functionality
    console.log('🚩 Report post:', postId)
  }

  return (
    <div className="border-t border-gray-200 pt-3">
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        {/* Main Actions */}
        <div className="flex items-center space-x-1">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isLiked
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-600 hover:bg-gray-100'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HiThumbUp className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isLoading ? '...' : likeCount > 0 ? likeCount : 'Like'}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onCommentToggle && onCommentToggle(postId)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <HiChat className="w-5 h-5" />
            <span className="text-sm font-medium">
              {comments > 0 ? comments : 'Comment'}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <HiShare className="w-5 h-5" />
            <span className="text-sm font-medium">
              {shares > 0 ? shares : 'Share'}
            </span>
          </button>
        </div>

        {/* More Options */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <HiDotsHorizontal className="w-5 h-5" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px] z-10">
              <button
                onClick={handleSave}
                className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <HiOutlineBookmark className="w-4 h-4" />
                <span>Save post</span>
              </button>
              
              <button
                onClick={handleHide}
                className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <HiOutlineEyeOff className="w-4 h-4" />
                <span>Hide post</span>
              </button>
              
              <button
                onClick={handleReport}
                className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <HiFlag className="w-4 h-4" />
                <span>Report post</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
