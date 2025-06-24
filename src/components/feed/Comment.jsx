import { HiThumbUp, HiDotsHorizontal } from "react-icons/hi"

export default function Comment({ user, role, content, time, likes, liked }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div>
            <h4 className="font-medium text-gray-900">{user}</h4>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <HiDotsHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-gray-700 mb-3">{content}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{time}</span>
        <div className="flex items-center space-x-2">
          <button className={`flex items-center ${liked ? "text-blue-600" : "text-gray-500"}`}>
            <HiThumbUp className="w-4 h-4 mr-1" />
            <span>{likes} {likes === 1 ? "like" : "likes"}</span>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            Reply
          </button>
        </div>
      </div>
    </div>
  )
} 