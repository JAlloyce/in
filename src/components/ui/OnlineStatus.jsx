import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function OnlineStatus({ userId, size = 'sm' }) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState(null)

  useEffect(() => {
    // Subscribe to user's online status
    const channel = supabase
      .channel(`user_${userId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setIsOnline(Object.keys(state).length > 0)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className="relative">
      <div 
        className={`${sizes[size]} rounded-full border-2 border-white ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {isOnline && (
        <div 
          className={`absolute inset-0 ${sizes[size]} rounded-full bg-green-500 animate-ping opacity-75`}
        />
      )}
    </div>
  )
} 