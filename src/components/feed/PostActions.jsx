"use client"

import { useState } from "react"
import { 
  HiThumbUp, HiChat, HiShare, HiSparkles, 
  HiOutlineBookmark, HiDotsVertical, HiFlag, HiEyeOff
} from "react-icons/hi"

/**
 * PostActions Component - Mobile-Optimized with Enhanced Features
 * 
 * Features:
 * - Mobile-first responsive design
 * - 3 dots menu with save, not interested, and report options
 * - Proper button spacing and overflow handling
 * - AI Insight button that adapts to screen size
 * - Professional LinkedIn-style interactions
 */
export default function PostActions({ 
  liked, 
  onLike, 
  onComment, 
  onAiInsight, 
  onBookmark, 
  isBookmarked,
  onReport,
  onNotInterested
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  
  // Main action buttons - always visible
  const mainActions = [
    {
      icon: HiThumbUp,
      label: "Like",
      onClick: onLike,
      active: liked,
      activeColor: "text-blue-600",
      hoverColor: "hover:bg-blue-50"
    },
    {
      icon: HiChat,
      label: "Comment",
      onClick: onComment,
      active: false,
      activeColor: "text-green-600",
      hoverColor: "hover:bg-green-50"
    },
    {
      icon: HiShare,
      label: "Share",
      onClick: () => {},
      active: false,
      activeColor: "text-purple-600",
      hoverColor: "hover:bg-purple-50"
    }
  ]

  // More menu options
  const moreActions = [
    {
      icon: HiOutlineBookmark,
      label: isBookmarked ? "Remove from Saved" : "Save post",
      onClick: onBookmark,
      active: isBookmarked,
      activeColor: "text-blue-600"
    },
    {
      icon: HiEyeOff,
      label: "Not interested",
      onClick: onNotInterested || (() => alert("Marked as not interested")),
      active: false,
      activeColor: "text-gray-600"
    },
    {
      icon: HiFlag,
      label: "Report post",
      onClick: onReport || (() => alert("Post reported")),
      active: false,
      activeColor: "text-red-600"
    }
  ]

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="flex items-center px-3 sm:px-4 py-2">
        {/* Main actions - responsive layout */}
        <div className="flex items-center space-x-1 sm:space-x-4 flex-1">
          {mainActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                flex items-center justify-center gap-1 sm:gap-2
                px-2 sm:px-4 py-2 rounded-lg
                transition-all duration-200
                text-sm font-medium
                ${action.hoverColor}
                ${action.active ? action.activeColor : "text-gray-600 hover:text-gray-800"}
              `}
              title={action.label}
            >
              <action.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
        
        {/* AI Insight - shown on larger screens, hidden on mobile to save space */}
        <div className="hidden md:flex items-center">
          <button
            onClick={onAiInsight}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200"
            title="AI Insight"
          >
            <HiSparkles className="w-5 h-5" />
            <span className="hidden lg:inline">AI Insight</span>
          </button>
        </div>
        
        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200"
            title="More options"
          >
            <HiDotsVertical className="w-5 h-5" />
          </button>
          
          {/* Dropdown menu */}
          {showMoreMenu && (
            <>
              {/* Backdrop to close menu */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMoreMenu(false)}
              />
              
              {/* Menu content */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                {/* AI Insight for mobile - only show in more menu on small screens */}
                <div className="md:hidden">
                  <button
                    onClick={() => {
                      onAiInsight()
                      setShowMoreMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <HiSparkles className="w-5 h-5 mr-3 text-amber-500" />
                    <span className="font-medium">AI Insight</span>
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                </div>
                
                {/* More actions */}
                {moreActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick()
                      setShowMoreMenu(false)
                    }}
                    className={`
                      flex items-center w-full px-4 py-2 text-left
                      transition-colors font-medium
                      ${action.active ? action.activeColor : "text-gray-700"}
                      hover:bg-gray-100
                    `}
                  >
                    <action.icon className={`w-5 h-5 mr-3 ${
                      action.active ? action.activeColor : "text-gray-500"
                    }`} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
