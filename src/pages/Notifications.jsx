import { useState } from "react";
import { 
  HiUser, HiBriefcase, HiChat, HiThumbUp, HiUserGroup, HiX, 
  HiCog, HiCheckCircle, HiBell, HiCheck
} from "react-icons/hi";
import { FaBellSlash } from "react-icons/fa";

/**
 * Notifications Page - Mobile-Optimized Interface
 * 
 * Features:
 * - Fixed mobile view with icon-based header actions
 * - Proper responsive layout that prevents text overlap
 * - Icon-based controls for settings and mark as read
 * - Professional LinkedIn-style notifications interface
 * - Smooth animations and hover effects
 * - Mobile-first padding and spacing
 */
export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "connection",
      icon: HiUser,
      message: "Sarah Johnson accepted your connection request",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      type: "like",
      icon: HiThumbUp,
      message: "Alex Chen and 12 others liked your post",
      time: "4 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "message",
      icon: HiChat,
      message: "New message from David Wilson",
      time: "6 hours ago",
      unread: false,
    },
    {
      id: 4,
      type: "job",
      icon: HiBriefcase,
      message: "New job recommendation: Senior Developer at TechCorp",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 5,
      type: "network",
      icon: HiUserGroup,
      message: "You have 5 new profile views",
      time: "2 days ago",
      unread: false,
    },
    {
      id: 6,
      type: "post",
      icon: HiThumbUp,
      message: "Your post was shared 3 times",
      time: "3 days ago",
      unread: false,
    },
    {
      id: 7,
      type: "announcement",
      icon: HiBriefcase,
      message: "New feature: Enhanced job search filters are now available",
      time: "1 week ago",
      unread: false,
    }
  ];

  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredNotifications, setFilteredNotifications] = useState(notifications);
  const [showSettings, setShowSettings] = useState(false);

  const filterNotifications = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredNotifications(notifications);
    } else if (filter === "unread") {
      setFilteredNotifications(notifications.filter(n => n.unread));
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === filter));
    }
  };

  const markAsRead = (id) => {
    const updated = filteredNotifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    );
    setFilteredNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = filteredNotifications.map(n => ({ ...n, unread: false }));
    setFilteredNotifications(updated);
  };

  const getUnreadCount = () => {
    return filteredNotifications.filter(n => n.unread).length;
  };

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
          </div>
        </div>
        
        {/* Mobile text labels - shown below icons */}
        <div className="flex justify-end space-x-4 mt-2 sm:hidden">
          <span className="text-xs text-gray-500">Settings</span>
          <span className="text-xs text-gray-500">Mark all read</span>
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
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
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
