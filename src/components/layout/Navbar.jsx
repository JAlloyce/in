import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BellIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { 
  MagnifyingGlassIcon, 
  HomeIcon, 
  UserGroupIcon, 
  BriefcaseIcon,
  PlusCircleIcon
} from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar, Button } from '../ui'
import LoginForm from '../auth/LoginForm'

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Network', href: '/network', icon: UserGroupIcon },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Messaging', href: '/messaging', icon: ChatBubbleLeftIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
      <nav className="container-system">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">i</span>
          </div>
              <span className="hidden md:block text-xl font-bold text-gray-900">Intru</span>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <motion.div 
              className={`relative transition-all duration-200 ${
                searchFocused ? 'scale-105' : 'scale-100'
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                          bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent transition-all duration-200
                          text-sm placeholder-gray-500"
              />
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchFocused && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Search for "{searchQuery}"
                      </div>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
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
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <motion.div key={item.name} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <Link
                    to={item.href}
                    className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors
                              ${isActive 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                    <item.icon className="h-6 w-6 mb-1" />
                    <span>{item.name}</span>
                </Link>
                </motion.div>
              )
            })}
                  </div>
              
          {/* User Menu */}
          <div className="flex items-center space-x-3">
                  {user ? (
                    <>
                {/* Create Post Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PlusCircleIcon className="h-4 w-4" />}
                    className="hidden md:flex"
                  >
                    Post
                  </Button>
                </motion.div>

                {/* User Avatar with Dropdown */}
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar 
                      src={user?.user_metadata?.avatar_url}
                      name={user?.user_metadata?.full_name || user?.email}
                      size="md"
                    />
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-500">View profile</div>
                    </div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-50"
                      >
                        View Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
                    </>
                  ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                >
                  Sign In
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                >
                  Join now
                </Button>
                </div>
              )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <Bars3Icon className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <DialogTitle className="sr-only">Mobile Navigation Menu</DialogTitle>
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Li</span>
              </div>
              <span className="text-lg font-bold text-gray-900">LinkedIn</span>
              </Link>
              <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-600"
              >
              <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
          <div className="mt-6 flow-root">
            <div className="space-y-2">
              {navigation.map((item) => (
                <motion.div key={item.name} whileTap={{ scale: 0.95 }}>
                      <Link
                    to={item.href}
                    className="flex items-center px-3 py-3 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-50"
                  >
                    <item.icon className="h-6 w-6 mr-3 text-gray-400" />
                    {item.name}
                      </Link>
                </motion.div>
              ))}
              
              {user && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-3 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-50"
                      >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-3 text-base font-medium text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
                )}
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginForm onClose={() => setShowLoginModal(false)} />
      )}
    </motion.header>
  )
}