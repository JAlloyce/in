import { useState } from "react"
import { 
  HiX, HiUser, HiLockClosed, HiBell, HiClock, 
  HiQuestionMarkCircle, HiInformationCircle, HiShieldCheck, HiGlobe, HiCog, HiEye, HiMail 
} from "react-icons/hi"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import { Button, Input, Card } from "../ui"

/**
 * Responsive Settings Modal Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Proper z-index management
 * - Touch-optimized controls
 * - Accessibility compliant
 * - Smooth animations
 */
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
    { id: "privacy", label: "Privacy", icon: HiLockClosed },
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

  const handleInputChange = (field, value) => {
    setAccountInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    // TODO: Implement settings save functionality
    console.log('Saving settings:', accountInfo)
    onClose()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                </label>
                  <Input
                  type="text"
                    value={accountInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                </label>
                  <Input
                  type="email"
                    value={accountInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="w-full"
                  disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed from settings
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Headline
                  </label>
                  <Input
                    type="text"
                    value={accountInfo.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    placeholder="e.g., Senior Software Engineer at Company"
                    className="w-full"
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                </label>
                  <Input
                  type="text"
                    value={accountInfo.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full"
                />
                </div>
              </div>
            </div>
          </motion.div>
        )
      
      case "notifications":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              
          <div className="space-y-4">
                <Card className="p-4">
              <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HiMail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                        <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive updates via email</p>
                      </div>
                </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
              </div>
                </Card>

                <Card className="p-4">
              <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HiBell className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                        <h4 className="text-base font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications on your device</p>
                </div>
              </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )
      
      case "privacy":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
              
          <div className="space-y-4">
                <Card className="p-4">
              <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HiEye className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                        <h4 className="text-base font-medium text-gray-900">Profile Visibility</h4>
                        <p className="text-sm text-gray-500">Who can see your profile</p>
                      </div>
                </div>
                    <select className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target">
                      <option>Public</option>
                  <option>Connections only</option>
                  <option>Private</option>
                </select>
              </div>
                </Card>

                <Card className="p-4">
              <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HiGlobe className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                        <h4 className="text-base font-medium text-gray-900">Search Engine Indexing</h4>
                        <p className="text-sm text-gray-500">Let search engines find your profile</p>
              </div>
            </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )
      
      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col mobile-safe shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target focus-visible"
              aria-label="Close settings"
            >
              <HiX className="w-5 h-5" />
          </button>
        </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs - Mobile Responsive */}
            <div className="w-full sm:w-48 md:w-56 border-r bg-gray-50 sm:bg-white">
              <nav className="p-4 space-y-1 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors touch-target focus-visible ${
                    activeTab === tab.id 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                    <tab.icon className="w-5 h-5 mr-3" />
                    <span className="text-base font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6">
            {renderTabContent()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                variant="secondary"
                onClick={handleSignOut}
                className="w-full sm:w-auto touch-target"
              >
                Sign Out
              </Button>
              <div className="flex space-x-3 sm:ml-auto">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1 sm:flex-none touch-target"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="flex-1 sm:flex-none touch-target"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
