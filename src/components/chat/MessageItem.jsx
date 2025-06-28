import React from 'react'
import { useSwipeGesture } from '../../hooks/useSwipeGesture'
import { motion } from 'framer-motion'
import { OnlineStatus } from '../ui/OnlineStatus'

export function MessageItem({ message, isOwnMessage, userAvatar, onDelete }) {
  const swipeHandlers = useSwipeGesture(
    () => onDelete?.(message.id), // Swipe left to delete
    null
  )

  return (
    <motion.div 
      {...swipeHandlers}
      className={`flex items-start gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar - only show for messages from other users */}
      {!isOwnMessage && (
        <div className="relative flex-shrink-0">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="User" 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">
                {message.sender_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          <OnlineStatus userId={message.sender_id} size="sm" />
        </div>
      )}
      
      {/* Message bubble */}
      <div 
        className={`relative max-w-[75%] p-3 rounded-lg ${
          isOwnMessage 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        {/* Message content */}
        <p className={`text-sm ${message.isDeleted ? 'italic text-opacity-70' : ''}`}>
          {message.content}
        </p>
        
        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  )
} 