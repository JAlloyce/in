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
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header - Mobile optimized with icons */}
        <div className="p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <HiBell className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold truncate">Notifications</h1>
              {getUnreadCount() > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium flex-shrink-0">
                  {getUnreadCount()}
                </span>
              )}
            </div>
            
            {/* Action buttons - Icon-based for mobile */}
            <div className="flex items-center space-x-2 ml-4">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                title="Settings"
              >
                <HiCog className="w-5 h-5" />
              </button>
              
              <button 
                onClick={markAllAsRead}
                className="p-2 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"
                title="Mark all as read"
                disabled={getUnreadCount() === 0}
              >
                <HiCheckCircle className="w-5 h-5" />
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
                className={`flex-shrink-0 px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeFilter === filter
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === "unread" && getUnreadCount() > 0 && (
                  <span className="ml-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
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
                className={`p-4 flex items-start hover:bg-gray-50 transition-colors ${
                  notification.unread ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="mr-3 sm:mr-4 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.unread 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    <notification.icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm sm:text-base ${
                    notification.unread ? "font-medium text-gray-900" : "text-gray-700"
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
                
                <div className="flex items-center ml-2">
                  {notification.unread && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Mark as read"
                    >
                      <HiCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <FaBellSlash className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500">
                {activeFilter === "unread" 
                  ? "You have no unread notifications" 
                  : "You have no notifications in this category"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Notification Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div>
                <h3 className="font-medium mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base">Messages</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base">Connection Requests</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base">Job Recommendations</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Push Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base">New Messages</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base">Post Interactions</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Frequency</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="frequency" className="mr-2" defaultChecked />
                    <span className="text-sm sm:text-base">Real-time</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="frequency" className="mr-2" />
                    <span className="text-sm sm:text-base">Daily digest</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="frequency" className="mr-2" />
                    <span className="text-sm sm:text-base">Weekly digest</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert("Settings saved!")
                    setShowSettings(false)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
