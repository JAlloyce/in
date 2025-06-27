import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { HiCheckCircle, HiExclamationTriangle, HiInformationCircle, HiXCircle } from 'react-icons/hi2';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Export singular version for consistency
export const useNotification = useNotifications;

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadJobCount, setUnreadJobCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

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

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = 3000) => {
    return addNotification(message, 'success', duration);
  }, [addNotification]);

  const showError = useCallback((message, duration = 5000) => {
    return addNotification(message, 'error', duration);
  }, [addNotification]);

  const showWarning = useCallback((message, duration = 4000) => {
    return addNotification(message, 'warning', duration);
  }, [addNotification]);

  const showInfo = useCallback((message, duration = 3000) => {
    return addNotification(message, 'info', duration);
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    unreadMessageCount,
    unreadJobCount,
    loading,
    loadNotificationCounts,
    markMessagesAsRead,
    markJobsAsRead,
    resetCounts,
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Notification Container Component
const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

// Individual Notification Item
const NotificationItem = ({ notification, onRemove }) => {
  const { message, type } = notification;
  
  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: HiCheckCircle,
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: HiXCircle,
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: HiExclamationTriangle,
          iconColor: 'text-yellow-600'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: HiInformationCircle,
          iconColor: 'text-blue-600'
        };
    }
  };

  const styles = getNotificationStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`${styles.bg} ${styles.text} border rounded-lg p-4 shadow-lg flex items-start space-x-3 animate-fade-in`}>
      <IconComponent className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{message}</p>
      </div>
      <button
        onClick={onRemove}
        className={`${styles.iconColor} hover:opacity-75 flex-shrink-0`}
      >
        <HiXCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

// CSS for animations (you can add this to your main CSS file)
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;

export default NotificationProvider; 