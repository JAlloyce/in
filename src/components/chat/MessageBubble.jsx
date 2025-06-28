import React from 'react'
import { HiCheck, HiCheckCircle } from 'react-icons/hi'

export function MessageBubble({ message, isOwn, status = 'sent' }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
      case 'sent':
        return <HiCheck className="w-4 h-4 text-white/70" />
      case 'delivered':
        return <HiCheckCircle className="w-4 h-4 text-white/70" />
      case 'read':
        return <HiCheckCircle className="w-4 h-4 text-white" />
      default:
        return null
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
        <div 
          className={`px-4 py-2 rounded-2xl relative ${
            isOwn 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="break-words">{message.content}</p>
          
          {/* Message status for own messages */}
          {isOwn && (
            <div className="flex items-center justify-end mt-1">
              {getStatusIcon()}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
} 