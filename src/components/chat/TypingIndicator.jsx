import React from 'react'

export function TypingIndicator({ users = [] }) {
  if (users.length === 0) return null

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-100 rounded-2xl px-4 py-2">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">
            {users.length === 1 ? `${users[0]} is` : `${users.length} people are`} typing
          </span>
          <div className="flex space-x-1 ml-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 