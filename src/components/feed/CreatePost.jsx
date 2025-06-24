"use client"

import { useState } from "react"
import { 
  HiPhotograph, HiVideoCamera, HiCalendar, 
  HiNewspaper, HiEmojiHappy, HiPaperAirplane
} from "react-icons/hi"

/**
 * CreatePost Component - Professional Edition
 * 
 * LinkedIn-style post creation interface with modern enhancements:
 * - Clean, professional design
 * - Subtle glassmorphism effects
 * - Responsive layout with smooth animations
 * - Professional color scheme
 * - Intuitive user experience
 */
export default function CreatePost() {
  const [postText, setPostText] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  // Professional post options
  const postOptions = [
    { 
      icon: HiPhotograph, 
      text: "Photo", 
      color: "text-blue-600",
      hoverBg: "hover:bg-blue-50"
    },
    { 
      icon: HiVideoCamera, 
      text: "Video", 
      color: "text-green-600",
      hoverBg: "hover:bg-green-50"
    },
    { 
      icon: HiCalendar, 
      text: "Event", 
      color: "text-amber-600",
      hoverBg: "hover:bg-amber-50"
    },
    { 
      icon: HiNewspaper, 
      text: "Article", 
      color: "text-purple-600",
      hoverBg: "hover:bg-purple-50"
    },
  ]

  const handleFocus = () => {
    setIsExpanded(true)
  }

  const handleBlur = () => {
    if (!postText.trim()) {
      setIsExpanded(false)
    }
  }

  return (
    <div className={`
      card-modern hover-lift
      p-5 mb-4
      transition-all duration-300
      ${isExpanded ? 'ring-2 ring-blue-200' : ''}
    `}>
      
      {/* Post input section */}
      <div className="flex items-start gap-4 mb-4">
        {/* User avatar */}
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          JD
        </div>
        
        {/* Text input */}
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Start a post..."
          className={`
            flex-1 resize-none border-none outline-none 
            text-base placeholder-gray-500
            bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3
            focus:bg-white focus:ring-2 focus:ring-blue-200
            transition-all duration-200
            ${isExpanded ? 'min-h-[100px]' : 'min-h-[50px]'}
          `}
          rows={isExpanded ? 4 : 2}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Media options */}
        <div className="flex flex-wrap gap-2">
          {postOptions.map((option, index) => (
            <button
              key={index}
              className={`
                flex items-center gap-2
                px-4 py-2 rounded-lg
                border border-gray-200 ${option.hoverBg}
                transition-all duration-200
                text-gray-700 hover:text-gray-900
                font-medium text-sm
              `}
            >
              <option.icon className={`w-5 h-5 ${option.color}`} />
              <span className="hidden sm:inline">{option.text}</span>
            </button>
          ))}
          
          {/* Emoji button */}
          <button className="
            flex items-center justify-center
            w-10 h-10 sm:w-auto sm:px-4 sm:py-2
            rounded-lg
            border border-gray-200 hover:bg-gray-50
            transition-all duration-200
            text-gray-700 hover:text-gray-900
          ">
            <HiEmojiHappy className="w-5 h-5 text-yellow-500" />
          </button>
        </div>

        {/* Post button */}
        <button
          disabled={!postText.trim()}
          className={`
            flex items-center gap-2
            px-6 py-2 rounded-lg
            font-semibold text-sm
            transition-all duration-200
            ${postText.trim() 
              ? `
                bg-blue-600 hover:bg-blue-700 text-white
                shadow-sm hover:shadow-md
              ` 
              : `
                bg-gray-100 text-gray-400
                cursor-not-allowed
              `
            }
          `}
        >
          <span>Post</span>
          <HiPaperAirplane className="w-4 h-4" />
        </button>
      </div>

      {/* Character count and tips (when expanded) */}
      {isExpanded && (
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>💡 Tip: Add visuals to increase engagement</span>
          </div>
          <div>
            {postText.length}/3000
          </div>
        </div>
      )}
    </div>
  )
}
