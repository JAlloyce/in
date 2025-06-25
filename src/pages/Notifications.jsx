import { useState, useEffect } from "react";
import { 
  HiUser, HiBriefcase, HiChat, HiThumbUp, HiUserGroup, HiX, 
  HiCog, HiCheckCircle, HiBell, HiCheck
} from "react-icons/hi";
import { FaBellSlash } from "react-icons/fa";
import { notifications, auth, realtime } from '../lib/supabase';

/**
 * Notifications Page - Real Database Notifications
 * 
 * Features:
 * - Real notifications from Supabase database
 * - Live notification updates with real-time subscriptions
 * - Mark as read functionality
 * - Mobile-responsive design with real data
 */
export default function Notifications() {
  const [notificationsList, setNotificationsList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  // Icon mapping for notification types
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return HiUser;
      case 'job_alert':
      case 'job_application':
        return HiBriefcase;
      case 'message':
        return HiChat;
      case 'like':
      case 'comment':
        return HiThumbUp;
      case 'follow':
      case 'network':
        return HiUserGroup;
      default:
        return HiBell;
    }
  };

  // Initialize notifications
  useEffect(() => {
    initializeNotifications();
    return () => {
      // Cleanup subscription
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { session } = await auth.getSession();
      if (!session?.user) {
        setError('Please log in to view notifications');
        return;
      }

      setUser(session.user);
      
      // Load notifications
      await loadNotifications(session.user.id);

      // Set up real-time subscription for new notifications
      const newSubscription = realtime.subscribeToUserNotifications(
        session.user.id,
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = transformNotification(payload.new);
            setNotificationsList(prev => [newNotification, ...prev]);
          }
        }
      );
      
      setSubscription(newSubscription);

    } catch (err) {
      console.error('Error initializing notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async (userId) => {
    const { data: notificationsData, error: notificationsError } = await notifications.get(userId, 50);
    
    if (notificationsError) {
      console.error('Error loading notifications:', notificationsError);
      return;
    }

    // Transform notifications data
    const transformedNotifications = notificationsData.map(transformNotification);
    setNotificationsList(transformedNotifications);
  };

  const transformNotification = (notification) => {
    return {
      id: notification.id,
      type: notification.type,
      icon: getNotificationIcon(notification.type),
      message: notification.message,
      time: formatTimestamp(notification.created_at),
      unread: !notification.is_read,
      sender: notification.sender
    };
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Filter notifications when list or filter changes
  useEffect(() => {
    filterNotifications(activeFilter);
  }, [notificationsList, activeFilter]);

  const filterNotifications = (filter) => {
    setActiveFilter(filter);
    let filtered = notificationsList;
    
    if (filter === "unread") {
      filtered = notificationsList.filter(n => n.unread);
    } else if (filter !== "all") {
      // Map filter names to notification types
      const typeMapping = {
        'connection': ['connection_request', 'connection_accepted'],
        'like': ['like', 'comment'],
        'message': ['message'],
        'job': ['job_alert', 'job_application'],
        'network': ['follow', 'network']
      };
      
      const types = typeMapping[filter] || [filter];
      filtered = notificationsList.filter(n => types.includes(n.type));
    }
    
    setFilteredNotifications(filtered);
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await notifications.markAsRead(id);
      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotificationsList(prev => prev.map(n => 
        n.id === id ? { ...n, unread: false } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = filteredNotifications.filter(n => n.unread);
      
      // Mark all as read in parallel
      await Promise.all(
        unreadNotifications.map(n => notifications.markAsRead(n.id))
      );

      // Update local state
      setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getUnreadCount = () => {
    return filteredNotifications.filter(n => n.unread).length;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={initializeNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header - Mobile optimized with icons */}
      <div className="p-3 sm:p-4 lg:p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <HiBell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">Notifications</h1>
            {getUnreadCount() > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium flex-shrink-0">
                {getUnreadCount()}
              </span>
            )}
          </div>
          
          {/* Action buttons - Icon-based for mobile */}
          <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              title="Settings"
            >
              <HiCog className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button 
              onClick={markAllAsRead}
              className="p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"
              title="Mark all as read"
              disabled={getUnreadCount() === 0}
            >
              <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button 
              onClick={() => loadNotifications(user?.id)}
              className="p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
              title="Refresh"
            >
              <HiBell className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile text labels - shown below icons */}
        <div className="flex justify-end space-x-4 mt-2 sm:hidden">
          <span className="text-xs text-gray-500">Settings</span>
          <span className="text-xs text-gray-500">Mark read</span>
          <span className="text-xs text-gray-500">Refresh</span>
        </div>
      </div>

      {/* Filter Tabs - Horizontal scroll on mobile */}
      <div className="border-b">
        <div className="flex overflow-x-auto scrollbar-hide">
          {["all", "unread", "connection", "like", "message", "job", "network"].map(filter => (
            <button
              key={filter}
              onClick={() => filterNotifications(filter)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeFilter === filter
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === "unread" && getUnreadCount() > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 flex items-center justify-center">
                  {getUnreadCount()}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-3 sm:p-4 flex items-start hover:bg-gray-50 transition-colors ${
                notification.unread ? "bg-blue-50 border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="mr-3 flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  notification.unread 
                    ? "bg-blue-100 text-blue-600" 
                    : "bg-gray-100 text-gray-500"
                }`}>
                  <notification.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm lg:text-base ${
                  notification.unread ? "font-medium text-gray-900" : "text-gray-700"
                }`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                {notification.sender && (
                  <p className="text-xs text-gray-400 mt-1">
                    From: {notification.sender.name}
                  </p>
                )}
              </div>
              
              {notification.unread && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="ml-2 p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                  title="Mark as read"
                >
                  <HiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 sm:p-8 text-center">
            <FaBellSlash className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No notifications</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {activeFilter === "all" 
                ? "You're all caught up! Check back later for new notifications." 
                : `No ${activeFilter} notifications found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Notification Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email notifications</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Push notifications</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection requests</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Job recommendations</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Comments and likes</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Messages</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In real app, save settings to database
                  alert('Settings saved!');
                  setShowSettings(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
