"use client"

import { useState } from "react"
import { 
  HiX, HiUser, HiLockClosed, HiBell, HiClock, 
  HiQuestionMarkCircle, HiInformationCircle, HiShieldCheck 
} from "react-icons/hi"

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("account")
  
  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    connectionRequests: true,
    postInteractions: true,
    jobAlerts: true,
    recommendations: false,
  })
  
  const [privacySettings, setPrivacySettings] = useState({
    friendsList: "friends",
    communities: "friends",
    photos: "friends",
    feed: "all",
    bio: "all",
    activityStatus: "friends",
  })
  
  const [accountInfo, setAccountInfo] = useState({
    bio: "Passionate software engineer with 5+ years of experience",
    phone: "+1 (555) 123-4567",
    shortName: "@johndoe",
    email: "john.doe@example.com",
  })

  if (!isOpen) return null

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handlePrivacyChange = (key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleAccountChange = (e) => {
    const { name, value } = e.target
    setAccountInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const renderContent = () => {
    switch(activeTab) {
      case "notifications":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Notification preferences</h3>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {key === 'messages' && 'When someone sends you a message'}
                      {key === 'connectionRequests' && 'When someone wants to connect'}
                      {key === 'postInteractions' && 'Likes, comments on your posts'}
                      {key === 'jobAlerts' && 'New job recommendations'}
                      {key === 'recommendations' && 'Profile suggestions and news'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={value}
                      onChange={() => handleNotificationChange(key)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )
      
      case "account":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Account information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={accountInfo.bio}
                  onChange={handleAccountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={accountInfo.phone}
                  onChange={handleAccountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Name (@handle)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    @
                  </div>
                  <input
                    type="text"
                    name="shortName"
                    value={accountInfo.shortName.replace('@', '')}
                    onChange={handleAccountChange}
                    className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={accountInfo.email}
                  onChange={handleAccountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Change Password</h4>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Change password
                </button>
              </div>
            </div>
          </div>
        )
      
      case "privacy":
        const visibilityOptions = [
          { value: "all", label: "All users" },
          { value: "friends_of_friends", label: "Friends of friends" },
          { value: "friends", label: "Friends" },
          { value: "only_me", label: "Only me" },
          { value: "selected", label: "Certain friends" }
        ]
        
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Privacy settings</h3>
            <div className="space-y-6">
              {Object.entries(privacySettings).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium">
                      {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Who can see your {key === 'friendsList' ? 'connections' : key}
                    </p>
                  </div>
                  <select
                    value={value}
                    onChange={(e) => handlePrivacyChange(key, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
                  >
                    {visibilityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )
      
      case "activity":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Activity history</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 mb-4">
                Your activity history shows all your actions on the platform. You can review and manage your activity here.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
                  Download activity data
                </button>
                <button className="border border-red-600 text-red-600 px-4 py-2 rounded-md font-medium hover:bg-red-50">
                  Clear all activity
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex justify-between">
                  <div>
                    <p className="font-medium">Connected with Sarah Johnson</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      
      case "help":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Help & Support</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">How to change my profile information?</p>
                <p className="text-sm text-gray-500 mt-1">Step-by-step guide to updating your profile</p>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Privacy settings explained</p>
                <p className="text-sm text-gray-500 mt-1">Understand how to control your information visibility</p>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Managing notifications</p>
                <p className="text-sm text-gray-500 mt-1">Customize which notifications you receive</p>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Report a problem</p>
                <p className="text-sm text-gray-500 mt-1">Having issues? Let us know</p>
              </div>
            </div>
          </div>
        )
      
      case "about":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">About LinkedIn Clone</h3>
            <div className="space-y-4">
              <p className="text-gray-700">
                This LinkedIn clone is a demonstration project built with React, Vite, and Tailwind CSS. 
                It showcases key features of professional networking platforms.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Version Information</h4>
                <p className="text-sm">App Version: 1.2.0</p>
                <p className="text-sm">Build Date: October 15, 2023</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Terms & Policies</h4>
                <div className="flex flex-wrap gap-4">
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                  <a href="#" className="text-blue-600 hover:underline">Cookie Policy</a>
                  <a href="#" className="text-blue-600 hover:underline">Copyright Policy</a>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return <div>Select a setting category</div>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <nav className="space-y-1 p-4">
              {[
                { id: "account", icon: HiUser, label: "Account" },
                { id: "privacy", icon: HiLockClosed, label: "Privacy" },
                { id: "notifications", icon: HiBell, label: "Notifications" },
                { id: "activity", icon: HiClock, label: "Activity History" },
                { id: "help", icon: HiQuestionMarkCircle, label: "Help & Support" },
                { id: "about", icon: HiInformationCircle, label: "About" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === item.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
