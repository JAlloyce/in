"use client"

import { useState } from "react"
import { HiPhotograph, HiVideoCamera, HiCalendar, HiNewspaper, HiEmojiHappy } from "react-icons/hi"

export default function CreatePost() {
  const [postText, setPostText] = useState("")

  const postOptions = [
    { icon: HiPhotograph, text: "Photo", color: "text-blue-500" },
    { icon: HiVideoCamera, text: "Video", color: "text-green-500" },
    { icon: HiCalendar, text: "Event", color: "text-orange-500" },
    { icon: HiNewspaper, text: "Article", color: "text-red-500" },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="What do you want to talk about?"
          className="flex-1 resize-none border-none outline-none text-lg placeholder-gray-500 bg-gray-100 rounded-full px-4 py-2"
          rows={1}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-6">
          {postOptions.map((option, index) => (
            <button
              key={index}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <option.icon className={`w-5 h-5 mr-1 ${option.color}`} />
              <span>{option.text}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <HiEmojiHappy className="w-5 h-5" />
          </button>
          <button
            disabled={!postText.trim()}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              postText.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
