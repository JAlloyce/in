"use client"

import { useState } from "react"
import { 
  HiPhotograph, HiVideoCamera, HiCalendar, 
  HiNewspaper, HiEmojiHappy, HiPaperAirplane, HiX
} from "react-icons/hi"

/**
 * CreatePost Component - Futuristic Mobile-First Edition
 * 
 * Mobile-optimized post creation with:
 * - Modal interface for mobile devices to prevent frame overflow
 * - Futuristic glassmorphism design
 * - Responsive layout that adapts to screen size
 * - Professional color scheme with modern aesthetics
 * - Smooth animations and transitions
 */
export default function CreatePost() {
  const [postText, setPostText] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Listen for window resize to detect mobile
  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Professional post options with futuristic styling
  const postOptions = [
    { 
      icon: HiPhotograph, 
      text: "Photo", 
      color: "text-cyan-500",
      hoverBg: "hover:bg-cyan-50",
      gradient: "from-cyan-400 to-blue-500"
    },
    { 
      icon: HiVideoCamera, 
      text: "Video", 
      color: "text-emerald-500",
      hoverBg: "hover:bg-emerald-50",
      gradient: "from-emerald-400 to-teal-500"
    },
    { 
      icon: HiCalendar, 
      text: "Event", 
      color: "text-amber-500",
      hoverBg: "hover:bg-amber-50",
      gradient: "from-amber-400 to-orange-500"
    },
    { 
      icon: HiNewspaper, 
      text: "Article", 
      color: "text-purple-500",
      hoverBg: "hover:bg-purple-50",
      gradient: "from-purple-400 to-pink-500"
    },
  ]

  const handleFocus = () => {
    if (isMobile) {
      setShowModal(true)
    } else {
      setIsExpanded(true)
    }
  }

  const handleBlur = () => {
    if (!postText.trim() && !isMobile) {
      setIsExpanded(false)
    }
  }

  const handlePost = () => {
    if (postText.trim()) {
      // Handle post submission
      console.log("Posting:", postText)
      setPostText("")
      setIsExpanded(false)
      setShowModal(false)
    }
  }

  // Mobile Modal Component
  const MobileModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Post
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <HiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* User avatar and input */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-lg">
              JD
            </div>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 resize-none border-none outline-none text-base placeholder-gray-500 bg-transparent min-h-[120px] p-2"
              autoFocus
            />
          </div>

          {/* Media options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {postOptions.map((option, index) => (
              <button
                key={index}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-2xl
                  bg-gradient-to-br ${option.gradient} bg-opacity-10
                  border border-white/20 backdrop-blur-sm
                  hover:shadow-lg hover:scale-105
                  transition-all duration-300
                  text-gray-700 hover:text-white
                  hover:bg-gradient-to-br hover:${option.gradient}
                `}
              >
                <option.icon className={`w-6 h-6 ${option.color}`} />
                <span className="text-sm font-medium">{option.text}</span>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
            <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
              <HiEmojiHappy className="w-6 h-6 text-yellow-500" />
            </button>
            
            <button
              onClick={handlePost}
              disabled={!postText.trim()}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-full
                font-semibold text-sm transition-all duration-300
                ${postText.trim() 
                  ? `bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                     shadow-lg hover:shadow-xl hover:scale-105` 
                  : `bg-gray-100 text-gray-400 cursor-not-allowed`
                }
              `}
            >
              <span>Post</span>
              <HiPaperAirplane className="w-4 h-4" />
            </button>
          </div>

          {/* Character count */}
          <div className="text-right text-xs text-gray-500">
            {postText.length}/3000
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop/Tablet View */}
      <div className={`
        relative overflow-hidden
        bg-white/80 backdrop-blur-xl
        border border-white/20 shadow-lg
        rounded-2xl p-6 mb-4
        transition-all duration-300
        ${isExpanded ? 'ring-2 ring-blue-400 shadow-xl' : 'hover:shadow-xl'}
      `}>
        
        {/* Futuristic background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-2xl"></div>
        
        <div className="relative z-10">
          {/* Post input section */}
          <div className="flex items-start gap-4 mb-4">
            {/* User avatar with gradient */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-lg">
              JD
            </div>
            
            {/* Text input */}
            <button
              onClick={handleFocus}
              className={`
                flex-1 text-left
                bg-gray-50/80 hover:bg-white/80 backdrop-blur-sm
                rounded-xl px-4 py-3
                border border-gray-200/50
                focus:ring-2 focus:ring-blue-400 focus:border-transparent
                transition-all duration-200
                text-gray-600 hover:text-gray-800
                ${isExpanded ? 'hidden' : 'block'}
              `}
            >
              Start a post...
            </button>

            {/* Expanded textarea for desktop */}
            {isExpanded && !isMobile && (
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                onBlur={handleBlur}
                placeholder="What's on your mind?"
                className="flex-1 resize-none border-none outline-none text-base placeholder-gray-500 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 transition-all duration-200 min-h-[100px]"
                autoFocus
              />
            )}
          </div>

          {/* Action buttons - only show when expanded on desktop */}
          {(isExpanded && !isMobile) && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              
              {/* Media options */}
              <div className="flex flex-wrap gap-2">
                {postOptions.map((option, index) => (
                  <button
                    key={index}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl
                      bg-white/60 backdrop-blur-sm border border-white/40
                      hover:bg-gradient-to-r hover:${option.gradient} hover:text-white
                      transition-all duration-300 hover:shadow-lg hover:scale-105
                      text-gray-700 font-medium text-sm
                    `}
                  >
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                    <span className="hidden sm:inline">{option.text}</span>
                  </button>
                ))}
                
                {/* Emoji button */}
                <button className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-yellow-50 transition-all duration-300 text-gray-700 hover:text-yellow-600">
                  <HiEmojiHappy className="w-5 h-5 text-yellow-500" />
                </button>
              </div>

              {/* Post button */}
              <button
                onClick={handlePost}
                disabled={!postText.trim()}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl
                  font-semibold text-sm transition-all duration-300
                  ${postText.trim() 
                    ? `bg-gradient-to-r from-blue-600 to-purple-600 text-white
                       shadow-lg hover:shadow-xl hover:scale-105` 
                    : `bg-gray-100 text-gray-400 cursor-not-allowed`
                  }
                `}
              >
                <span>Post</span>
                <HiPaperAirplane className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Character count and tips (when expanded on desktop) */}
          {(isExpanded && !isMobile) && (
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  💡 Tip: Add visuals to increase engagement
                </span>
              </div>
              <div>{postText.length}/3000</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Modal */}
      {showModal && <MobileModal />}
    </>
  )
}
