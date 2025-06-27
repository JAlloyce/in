import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BellIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { 
  MagnifyingGlassIcon, 
  HomeIcon, 
  UserGroupIcon, 
  BriefcaseIcon,
  PlusCircleIcon,
  CubeIcon
} from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { Avatar, Button } from '../ui'
import LoginForm from '../auth/LoginForm'
import IntruLogo from '../ui/IntruLogo'

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon, authRequired: false },
  { name: 'Network', href: '/network', icon: UserGroupIcon, authRequired: true },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon, authRequired: false },
  { name: 'Messaging', href: '/messaging', icon: ChatBubbleLeftIcon, authRequired: true },
  { name: 'Notifications', href: '/notifications', icon: BellIcon, authRequired: true },
  { name: 'Workspace', href: '/workspace', icon: CubeIcon, authRequired: false },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [error, setError] = useState(null)
  const { user, signOut } = useAuth()
  const { unreadMessageCount, unreadJobCount, markMessagesAsRead, markJobsAsRead } = useNotifications()
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Failed to sign out. Please try again.')
    }
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-fixed bg-white border-b border-gray-200 shadow-sm"
    >
      <nav className="container-system">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 touch-target focus-visible"
              aria-label="Intru Home"
            >
              <IntruLogo size="md" showText={true} />
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <motion.div 
              className={`relative transition-all duration-200 ${
                searchFocused ? 'scale-105' : 'scale-100'
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search..."
                aria-label="Search professionals, companies, and jobs"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                          bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent transition-all duration-200
                          text-sm placeholder-gray-500 min-h-[44px]"
              />
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchFocused && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-dropdown"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Search for "{searchQuery}"
                      </div>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button 
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded touch-target focus-visible"
                          aria-label={`Search for ${searchQuery}`}
                        >
                          <div className="flex items-center space-x-3">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            <span>Search for "{searchQuery}"</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.filter(item => !item.authRequired || user).map((item) => {
              const isActive = location.pathname === item.href
              
              // Get notification count for specific items
              let notificationCount = 0
              if (item.name === 'Messaging') {
                notificationCount = unreadMessageCount
              } else if (item.name === 'Jobs') {
                notificationCount = unreadJobCount
              }
              
              const handleNavClick = () => {
                // Mark notifications as read when clicking the nav item
                if (item.name === 'Messaging' && unreadMessageCount > 0) {
                  markMessagesAsRead()
                } else if (item.name === 'Jobs' && unreadJobCount > 0) {
                  markJobsAsRead()
                }
              }
              
              return (
                <motion.div key={item.name} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <Link
                    to={item.href}
                    onClick={handleNavClick}
                    aria-label={`${item.name}${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
                    className={`relative flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors touch-target focus-visible
                              ${isActive 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                    <div className="relative">
                      <item.icon className="h-6 w-6 mb-1" aria-hidden="true" />
                      {/* Notification Indicator */}
                      {notificationCount > 0 && (
                        <div 
                          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                          aria-label={`${notificationCount} unread notifications`}
                        >
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </div>
                      )}
                    </div>
                    <span>{item.name}</span>
                </Link>
                </motion.div>
              )
            })}
                  </div>
              
          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-3">
                  {user ? (
                    <>
                {/* Create Post Button - Hidden on small screens */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden md:block">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PlusCircleIcon className="h-4 w-4" />}
                    className="touch-target"
                    aria-label="Create new post"
                  >
                    Post
                  </Button>
                </motion.div>

                {/* User Avatar with Dropdown - Desktop */}
                <div className="relative group hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors touch-target focus-visible"
                    aria-label="User menu"
                  >
                    <Avatar 
                      src={user?.user_metadata?.avatar_url}
                      name={user?.user_metadata?.full_name || user?.email}
                      size="md"
                    />
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-500">View profile</div>
                    </div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-dropdown">
                      <Link
                        to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-target focus-visible"
                      >
                        View Profile
                      </Link>
                      <Link
                        to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-target focus-visible"
                      >
                        Settings
                      </Link>
                    <hr className="my-1" />
                      <button
                        onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-target focus-visible"
                      >
                        Sign Out
                      </button>
                  </div>
                </div>
                    </>
                  ) : (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                className="hidden md:flex touch-target"
                aria-label="Sign in to Intru"
                >
                Sign In
                </Button>
              )}

            {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors touch-target focus-visible"
              aria-label="Open main menu"
              aria-expanded={mobileMenuOpen}
              >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm"
            />
            <DialogPanel className="fixed inset-y-0 right-0 z-modal w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              >
                {/* Mobile menu header */}
          <div className="flex items-center justify-between">
                  <IntruLogo size="md" showText={true} />
              <button
              type="button"
                    className="rounded-lg p-2.5 text-gray-700 hover:bg-gray-50 touch-target focus-visible"
              onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
              >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
                {/* Mobile Search */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      aria-label="Search professionals, companies, and jobs"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Mobile Navigation */}
          <div className="mt-6 flow-root">
            <div className="space-y-2">
                    {navigation.filter(item => !item.authRequired || user).map((item) => {
                      const isActive = location.pathname === item.href
                      
                      let notificationCount = 0
                      if (item.name === 'Messaging') {
                        notificationCount = unreadMessageCount
                      } else if (item.name === 'Jobs') {
                        notificationCount = unreadJobCount
                      }

                      return (
                      <Link
                          key={item.name}
                    to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-label={`${item.name}${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors touch-target focus-visible
                                    ${isActive 
                                      ? 'text-blue-600 bg-blue-50' 
                                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                        >
                          <div className="relative">
                            <item.icon className="h-6 w-6" aria-hidden="true" />
                            {notificationCount > 0 && (
                              <div 
                                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                                aria-label={`${notificationCount} unread notifications`}
                              >
                                {notificationCount > 9 ? '9+' : notificationCount}
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile User Section */}
                {user ? (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar 
                        src={user?.user_metadata?.avatar_url}
                        name={user?.user_metadata?.full_name || user?.email}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-medium text-gray-900 truncate">
                          {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link 
                        to="/profile" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target focus-visible"
                      >
                        View Profile
                      </Link>
                  <Link
                        to="/settings" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target focus-visible"
                      >
                        Settings
                  </Link>
                  <button
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target focus-visible"
                  >
                    Sign Out
                  </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => {
                        setShowLoginModal(true)
                        setMobileMenuOpen(false)
                      }}
                      className="touch-target"
                      aria-label="Sign in to Intru"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </motion.div>
        </DialogPanel>
      </Dialog>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginForm onClose={() => setShowLoginModal(false)} />
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-toast"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
          <button 
            onClick={() => setError(null)}
              className="ml-3 text-red-500 hover:text-red-700 touch-target focus-visible"
              aria-label="Dismiss error"
          >
              <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        </motion.div>
      )}
    </motion.header>
  )
}