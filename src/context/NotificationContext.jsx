import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadJobCount, setUnreadJobCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load initial counts when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotificationCounts();
      setupRealtimeSubscriptions();
    } else {
      resetCounts();
    }

    return () => {
      // Cleanup subscriptions when component unmounts
      supabase.removeAllChannels();
    };
  }, [user, isAuthenticated]);

  const resetCounts = () => {
    setUnreadMessageCount(0);
    setUnreadJobCount(0);
  };

  const loadNotificationCounts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // TEMPORARILY DISABLED - Using mock data while fixing database schema
      console.log('📊 Using mock notification counts while fixing database schema');
      setUnreadMessageCount(0); // Mock unread messages
      setUnreadJobCount(0); // Mock unread jobs
    } catch (error) {
      console.error('Error loading notification counts:', error);
      setUnreadMessageCount(0);
      setUnreadJobCount(0);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // TEMPORARILY DISABLED - Real-time subscriptions disabled while fixing database schema
    console.log('📡 Real-time notification subscriptions temporarily disabled');
    
    return () => {
      // No cleanup needed since no subscriptions are active
    };
  };

  const markMessagesAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('type', 'message')
        .eq('read', false);

      if (!error) {
        setUnreadMessageCount(0);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markJobsAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .in('type', ['job_alert', 'job_application'])
        .eq('read', false);

      if (!error) {
        setUnreadJobCount(0);
      }
    } catch (error) {
      console.error('Error marking jobs as read:', error);
    }
  };

  const value = {
    unreadMessageCount,
    unreadJobCount,
    loading,
    loadNotificationCounts,
    markMessagesAsRead,
    markJobsAsRead,
    resetCounts
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 