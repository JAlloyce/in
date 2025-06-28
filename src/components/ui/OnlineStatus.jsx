import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function OnlineStatus({ userId, size = 'sm', showText = false }) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState(null)

  useEffect(() => {
    // Skip if no userId provided
    if (!userId) return;

    // Set up subscription to presence changes
    const channel = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // Check if this user is in the presence state
        const state = channel.presenceState();
        const userPresent = Object.keys(state).some(presenceId => 
          state[presenceId].some(presence => presence.user_id === userId)
        );
        setIsOnline(userPresent);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // When successfully subscribed, track the current user's presence
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: userId
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className="relative flex items-center gap-1">
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
      {showText && (
        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  )
} 