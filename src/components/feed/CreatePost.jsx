"use client"

import { useState } from "react"
import { 
  HiPhotograph, HiVideoCamera, HiCalendar, 
  HiNewspaper, HiEmojiHappy, HiPaperAirplane,
  HiSparkles, HiLightningBolt
} from "react-icons/hi"

/**
 * CreatePost Component - Futuristic Edition
 * 
 * A next-generation post creation interface with cutting-edge design elements:
 * - Glassmorphism effects with advanced blur and transparency
 * - Neon glow effects and animated gradients
 * - Micro-interactions and smooth animations
 * - Futuristic color schemes and modern typography
 * - Advanced hover states and visual feedback
 */
export default function CreatePost() {
  const [postText, setPostText] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  // Enhanced post options with futuristic styling
  const postOptions = [
    { 
      icon: HiPhotograph, 
      text: "Photo", 
      gradient: "from-blue-400 to-cyan-400",
      glow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]"
    },
    { 
      icon: HiVideoCamera, 
      text: "Video", 
      gradient: "from-emerald-400 to-green-400",
      glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]"
    },
    { 
      icon: HiCalendar, 
      text: "Event", 
      gradient: "from-orange-400 to-amber-400",
      glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.6)]"
    },
    { 
      icon: HiNewspaper, 
      text: "Article", 
      gradient: "from-purple-400 to-pink-400",
      glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"
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
      relative overflow-hidden
      p-6 mb-6
      transition-all duration-500 ease-out
      ${isExpanded ? 'ring-2 ring-cyan-400/50 shadow-neon' : ''}
    `}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-ping"></div>
        <div className="absolute bottom-6 left-8 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-50 float"></div>
      </div>

      {/* Header with AI enhancement indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 pulse-glow"></div>
          </div>
          <div>
            <h3 className="text-futuristic text-lg font-bold">Share Your Vision</h3>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <HiSparkles className="w-3 h-3" />
              AI-Enhanced Posting
            </p>
          </div>
        </div>
        
        {/* Neural network indicator */}
        <div className="flex items-center gap-2 text-cyan-400">
          <HiLightningBolt className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-medium">Neural Active</span>
        </div>
      </div>

      {/* Main input area */}
      <div className="relative mb-6">
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="What's the future you're building today?"
          className={`
            input-futuristic
            w-full resize-none
            min-h-[80px] max-h-[300px]
            text-white placeholder-gray-400
            transition-all duration-300
            ${isExpanded ? 'min-h-[120px]' : ''}
          `}
          rows={isExpanded ? 4 : 2}
        />
        
        {/* Input enhancement overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
          <div className={`
            absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10
            transition-opacity duration-300
            ${isExpanded ? 'opacity-100' : 'opacity-0'}
          `}></div>
        </div>
      </div>

      {/* Enhanced action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Media options with futuristic styling */}
        <div className="flex flex-wrap gap-3">
          {postOptions.map((option, index) => (
            <button
              key={index}
              className={`
                relative group
                flex items-center gap-2
                bg-gradient-to-r ${option.gradient} bg-opacity-20
                hover:bg-opacity-30
                rounded-xl px-4 py-3
                border border-white/20 hover:border-white/40
                transition-all duration-300
                ${option.glow}
                transform hover:scale-105
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <option.icon className="w-5 h-5 text-white drop-shadow-lg" />
              <span className="text-sm font-medium text-white hidden sm:inline-block">
                {option.text}
              </span>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          ))}
          
          {/* Emoji button with special effects */}
          <button className="
            relative group
            flex items-center justify-center
            w-12 h-12 sm:w-auto sm:px-4 sm:py-3
            bg-gradient-to-r from-yellow-400 to-orange-400 bg-opacity-20
            hover:bg-opacity-30
            rounded-xl
            border border-white/20 hover:border-yellow-400/50
            transition-all duration-300
            hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]
            transform hover:scale-105
          ">
            <HiEmojiHappy className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>

        {/* Futuristic submit button */}
        <button
          disabled={!postText.trim()}
          className={`
            relative overflow-hidden
            flex items-center gap-3
            px-6 py-3 rounded-xl
            font-semibold text-white
            transition-all duration-300
            transform hover:scale-105
            ${postText.trim() 
              ? `
                bg-gradient-to-r from-cyan-500 to-purple-600
                hover:from-cyan-400 hover:to-purple-500
                shadow-[0_0_20px_rgba(34,211,238,0.4)]
                hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]
                border border-cyan-400/50 hover:border-cyan-300
              ` 
              : `
                bg-gray-700/50 text-gray-400
                border border-gray-600/30
                cursor-not-allowed
              `
            }
          `}
        >
          {/* Button shimmer effect */}
          {postText.trim() && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
          
          <span className="relative z-10">Launch Post</span>
          <HiPaperAirplane className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
            postText.trim() ? 'group-hover:translate-x-1' : ''
          }`} />
        </button>
      </div>

      {/* Progress indicator for character count (if expanded) */}
      {isExpanded && (
        <div className="mt-4 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Neural analysis: Active</span>
          </div>
          <div className="text-gray-500">
            {postText.length}/2000
          </div>
        </div>
      )}
    </div>
  )
}
