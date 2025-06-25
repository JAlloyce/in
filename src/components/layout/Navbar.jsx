import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  HiSearch, HiHome, HiUserGroup, HiBriefcase, 
  HiChat, HiBell, HiViewGrid, HiCog, HiMenu, HiX, HiDotsHorizontal,
  HiLogin, HiLogout, HiUser, HiBookmark, HiFlag, HiUsers
} from "react-icons/hi"
import SettingsModal from "../settings/SettingsModal"
import { auth, notifications } from '../../lib/supabase'

/**
 * Navbar Component - Real Supabase Authentication
 * 
 * Features:
 * - Real Supabase authentication
 * - Dynamic user state management
 * - Real notification counts from database
 * - Professional LinkedIn-style appearance
 * - Mobile-optimized navigation
 */
export default function Navbar() {
  const [showSettings, setShowSettings] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Initialize user state and notifications
  useEffect(() => {
    initializeAuth()
  }, [])

  // Load notifications count when user changes
  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  // Main navigation items - core features
  const navItems = [
    { icon: HiHome, label: "Home", path: "/", color: "text-blue-500" },
    { icon: HiUserGroup, label: "Network", path: "/network", color: "text-purple-500" },
    { icon: HiBriefcase, label: "Jobs", path: "/jobs", color: "text-pink-500" },
    { icon: HiChat, label: "Messaging", path: "/messaging", color: "text-blue-500" },
    { icon: HiBell, label: "Notifications", path: "/notifications", color: "text-purple-500" },
  ]

  // Secondary navigation items for mobile more menu
  const secondaryNavItems = [
    { icon: HiViewGrid, label: "Work", path: "/workspace", color: "text-pink-500" },
    { icon: HiUsers, label: "Communities", path: "/communities", color: "text-purple-500" },
    { icon: HiFlag, label: "Pages", path: "/pages", color: "text-pink-500" },
    { icon: HiBookmark, label: "Saved", path: "/saved", color: "text-blue-500" },
    { icon: HiCog, label: "Settings", path: "#", action: () => setShowSettings(true), color: "text-blue-500" },
  ]

  const isActive = (path) => location.pathname === path

  const initializeAuth = async () => {
    try {
      const { user: currentUser } = await auth.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error getting current user:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      const { data: notificationData, error } = await notifications.get(user.id, 50)
      if (!error && notificationData) {
        const unreadCount = notificationData.filter(n => !n.is_read).length
        setUnreadNotifications(unreadCount)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setLoginError("Please enter both email and password")
      return
    }
    
    try {
      setLoading(true)
      setLoginError("")

      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        setLoginError(error.message)
        return
      }

      if (data.user) {
        setUser(data.user)
        setShowLoginModal(false)
        setEmail("")
        setPassword("")
        navigate("/")
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoginError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) {
        console.error('Logout error:', error)
        return
      }
      
      setUser(null)
      setUnreadNotifications(0)
      setShowProfileDropdown(false)
      navigate("/")
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleProtectedClick = (path, action) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    
    if (action) {
      action()
    } else {
      navigate(path)
    }
  }

  // Professional notification badge
  const NotificationBadge = ({ count }) => {
    if (count === 0) return null;
    
    return (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
        {count > 9 ? "9+" : count}
      </span>
    );
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center">
          {/* Logo */}
          <div className="flex items-center mr-3">
            <div className="text-blue-600 text-2xl font-bold">in</div>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:block relative flex-1 max-w-xs">
            <HiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-sm"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  to={item.path}
                  key={item.label}
                  className={`flex flex-col items-center transition-colors ${
                    isActive(item.path) 
                      ? `${item.color}` 
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <div className="relative">
                  <item.icon className="text-xl" />
                    {item.label === "Notifications" && (
                      <NotificationBadge count={unreadNotifications} />
                    )}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              ))}
              
              {/* Work dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                  className={`flex flex-col items-center transition-colors ${
                    showMoreDropdown ? "text-pink-500" : "text-gray-500 hover:text-black"
                  }`}
                >
                  <HiViewGrid className="text-xl" />
                  <span className="text-xs mt-1">Work</span>
                </button>
                
                {showMoreDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border z-50">
                    {secondaryNavItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => {
                          if (item.action) item.action()
                          setShowMoreDropdown(false)
                        }}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center space-x-4 ml-4">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex flex-col items-center text-gray-500 hover:text-black"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover mb-1"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 mb-1 flex items-center justify-center">
                    {user ? (
                      <span className="text-xs text-gray-600 font-semibold">
                        {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
                      </span>
                    ) : null}
                  </div>
                )}
                <span className="text-xs">Me</span>
              </button>
              
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <HiUser className="w-5 h-5 mr-3" />
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <HiLogout className="w-5 h-5 mr-3" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLoginModal(true)
                        setShowProfileDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <HiLogin className="w-5 h-5 mr-3" />
                      Login
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              {showMobileMenu ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Fixed */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="flex justify-around items-center py-2 px-1 safe-area-bottom">
            {navItems.slice(0, 4).map((item) => (
              <Link
                to={item.path}
                key={item.label}
              className={`flex flex-col items-center px-1 py-2 min-w-0 ${
                isActive(item.path) 
                  ? `${item.color}` 
                  : "text-gray-500"
                }`}
            >
              <div className="relative">
                <item.icon className="text-xl mb-1" />
                {item.label === "Notifications" && (
                  <NotificationBadge count={unreadNotifications} />
                )}
              </div>
              <span className="text-xs truncate max-w-full">{item.label}</span>
              </Link>
            ))}
            
          {/* More button for mobile */}
              <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`flex flex-col items-center px-1 py-2 min-w-0 ${
              showMobileMenu ? "text-blue-500" : "text-gray-500"
                }`}
          >
            <HiDotsHorizontal className="text-xl mb-1" />
            <span className="text-xs">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Menu</h3>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {/* Primary nav items */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">MAIN</h4>
                  {navItems.slice(4).map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                      isActive(item.path) 
                        ? `bg-blue-50 ${item.color}` 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="relative">
                      <item.icon className="w-6 h-6 mr-3" />
                      {item.label === "Notifications" && (
                        <NotificationBadge count={unreadNotifications} />
                      )}
                    </div>
                    <span className="font-medium">{item.label}</span>
                      </Link>
                ))}
              </div>
              
              {/* Secondary nav items */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">MORE</h4>
                {secondaryNavItems.map((item) => (
                  <Link
                        key={item.label}
                    to={item.path}
                        onClick={() => {
                      if (item.action) item.action()
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                    <item.icon className={`w-6 h-6 mr-3 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                      </div>
                  
              {/* Profile section */}
              <div className="pt-4 border-t">
                {user ? (
                  <>
                    <div className="px-3 py-2 mb-2">
                      <p className="font-semibold text-gray-900">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <HiUser className="w-6 h-6 mr-3" />
                      <span className="font-medium">View Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowMobileMenu(false)
                      }}
                      className="flex items-center w-full px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <HiLogout className="w-6 h-6 mr-3" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowLoginModal(true)
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center w-full px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <HiLogin className="w-6 h-6 mr-3" />
                    <span className="font-medium">Login</span>
                  </button>
                )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Sign in to LinkedIn</h2>
              <button 
                onClick={() => {
                  setShowLoginModal(false)
                  setLoginError("")
                  setEmail("")
                  setPassword("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="p-6">
              {loginError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {loginError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
              
              <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account? 
                <span className="text-blue-600 hover:underline cursor-pointer ml-1">
                  Join now
                </span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  )
}