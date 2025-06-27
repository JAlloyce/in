import { useState } from "react"
import { 
  HiX, HiUser, HiLockClosed, HiBell, HiClock, 
  HiQuestionMarkCircle, HiInformationCircle, HiShieldCheck, HiGlobe, HiCog 
} from "react-icons/hi"
import { useAuth } from "../../context/AuthContext"

export default function SettingsModal({ isOpen, onClose }) {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  
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

  const tabs = [
    { id: "profile", label: "Profile", icon: HiUser },
    { id: "notifications", label: "Notifications", icon: HiBell },
    { id: "privacy", label: "Privacy", icon: HiShieldCheck },
    { id: "preferences", label: "Preferences", icon: HiGlobe },
  ]

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer at Google"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )
      
      case "notifications":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Receive browser notifications</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Connection Requests</h4>
                  <p className="text-sm text-gray-600">Notify when someone wants to connect</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        )
      
      case "privacy":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Profile Visibility</h4>
                  <p className="text-sm text-gray-600">Who can see your profile</p>
                </div>
                <select className="border border-gray-300 rounded px-3 py-1">
                  <option>Everyone</option>
                  <option>Connections only</option>
                  <option>Private</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Activity Status</h4>
                  <p className="text-sm text-gray-600">Show when you're active</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        )
      
      case "preferences":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>UTC</option>
                  <option>EST</option>
                  <option>PST</option>
                </select>
              </div>
            </div>
          </div>
        )
      
      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-[10000]">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors z-[10001] relative">
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <nav className="space-y-1 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
            
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={signOut}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
