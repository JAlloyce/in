"use client"

import { HiThumbUp, HiChat, HiShare, HiPaperAirplane, HiSparkles } from "react-icons/hi"

export default function PostActions({ liked, onLike, onComment, onAiInsight }) {
  const actions = [
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
    },
    {
      icon: HiPaperAirplane,
      label: "Send",
      onClick: () => {},
      active: false,
      activeColor: "text-orange-600",
    },
    {
      icon: HiSparkles,
      label: "AI Insight",
      onClick: onAiInsight,
      active: false,
      activeColor: "text-yellow-600",
    }
  ]

  return (
    <div className="border-t border-gray-200">
      <div className="flex items-center justify-around py-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-gray-100 ${
              action.active ? action.activeColor : "text-gray-600"
            }`}
          >
            <action.icon className="w-5 h-5" />
            <span className="font-medium text-sm hidden sm:inline-block">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
