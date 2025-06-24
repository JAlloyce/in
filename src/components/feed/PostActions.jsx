"use client"

import { 
  HiThumbUp, HiChat, HiShare, HiSparkles, 
  HiOutlineBookmark 
} from "react-icons/hi"

export default function PostActions({ liked, onLike, onComment, onAiInsight, onBookmark, isBookmarked }) {
  const mainActions = [
    {
      icon: HiThumbUp,
      label: "Like",
      onClick: onLike,
      active: liked,
      activeColor: "text-blue-600",
    },
    {
      icon: HiChat,
      label: "Comment",
      onClick: onComment,
      active: false,
      activeColor: "text-green-600",
    },
    {
      icon: HiShare,
      label: "Share",
      onClick: () => {},
      active: false,
      activeColor: "text-purple-600",
    }
  ]

  const secondaryActions = [
    {
      icon: HiSparkles,
      label: "AI Insight",
      onClick: onAiInsight,
      active: false,
      activeColor: "text-yellow-600",
    },
    {
      icon: HiOutlineBookmark,
      label: "Save",
      onClick: onBookmark,
      active: isBookmarked,
      activeColor: "text-blue-600",
    }
  ]

  return (
    <div className="border-t border-gray-200">
      <div className="flex items-center justify-between py-2 px-4">
        <div className="flex space-x-6">
          {mainActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center space-x-2 ${
                action.active ? action.activeColor : "text-gray-600 hover:text-gray-800"
              }`}
              title={action.label}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex space-x-4">
          {secondaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center space-x-2 ${
                action.active ? action.activeColor : "text-gray-600 hover:text-gray-800"
              }`}
              title={action.label}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
