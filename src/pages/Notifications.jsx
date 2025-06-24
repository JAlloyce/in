import { useState } from "react";
import { HiUser, HiBriefcase, HiChat, HiThumbUp, HiUserGroup, HiX } from "react-icons/hi";
import { FaBellSlash } from "react-icons/fa";

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowSettings(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Settings
            </button>
            <button 
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b flex overflow-x-auto">
          {["all", "unread", "connection", "like", "message", "job", "network"].map(filter => (
            <button
              key={filter}
              onClick={() => filterNotifications(filter)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeFilter === filter
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 flex ${notification.unread ? "bg-blue-50" : ""}`}
              >
                <div className="mr-4">
                  <notification.icon className={`w-6 h-6 ${
                    notification.unread ? "text-blue-500" : "text-gray-500"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={notification.unread ? "font-medium" : ""}>{notification.message}</p>
                  <p className="text-sm text-gray-500">{notification.time}</p>
                </div>
                <div className="flex items-start">
                  {notification.unread && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Notification Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Messages</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Connection Requests</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Job Recommendations</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Push Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>New Messages</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Post Interactions</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
