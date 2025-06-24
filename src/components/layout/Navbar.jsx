"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  HiSearch, HiHome, HiUserGroup, HiBriefcase, 
  HiChat, HiBell, HiViewGrid, HiCog, HiMenu, HiX, HiDotsHorizontal,
  HiLogin, HiLogout, HiUserCircle, HiUser
} from "react-icons/hi"
import SettingsModal from "../settings/SettingsModal"

export default function Navbar() {
  const [showSettings, setShowSettings] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [unreadNotifications, setUnreadNotifications] = useState(15)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Professional navigation items
  const navItems = isLoggedIn
    ? [
        { icon: HiHome, label: "Home", path: "/" },
        { icon: HiUserGroup, label: "My Network", path: "/network" },
        { icon: HiBriefcase, label: "Jobs", path: "/jobs" },
        { icon: HiChat, label: "Messaging", path: "/messaging" },
        { 
          icon: HiBell, 
          label: "Notifications", 
          path: "/notifications",
          badge: unreadNotifications
        },
        { icon: HiViewGrid, label: "Work", path: "/workspace" },
      ]
    : [
        { icon: HiHome, label: "Home", path: "/" },
        { icon: HiUserGroup, label: "Network", path: "/network" },
        { icon: HiBriefcase, label: "Jobs", path: "/jobs" },
      ]

  const isActive = (path) => location.pathname === path

  // Handle click outside to close dropdowns
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

  // Check login status on initial load
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setLoginError("Please enter both email and password")
      return
    }
    
    localStorage.setItem("token", "demo_token")
    setIsLoggedIn(true)
    setShowLoginModal(false)
    setLoginError("")
    setEmail("")
    setPassword("")
    navigate("/")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setShowProfileDropdown(false)
    navigate("/")
  }

  const handleProtectedClick = (path, action) => {
    if (!isLoggedIn) {
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
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            
            {/* LinkedIn Logo */}
            <div className="flex items-center mr-6">
              <Link to="/" className="flex items-center group">
                <div className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                  in
                </div>
              </Link>
            </div>

            {/* Professional Search Bar */}
            <div className="hidden md:block relative flex-1 max-w-md">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="
                    w-full pl-10 pr-4 py-2 
                    bg-gray-100 hover:bg-gray-50
                    border border-transparent hover:border-gray-300
                    rounded-md
                    text-gray-900 placeholder-gray-500
                    focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2 ml-6">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`
                    group relative flex flex-col items-center p-3 rounded-lg
                    transition-all duration-200
                    ${isActive(item.path) 
                      ? "text-gray-900" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                  onClick={() => handleProtectedClick(item.path, item.action)}
                >
                  <div className="relative">
                    <item.icon className="text-xl mb-1" />
                    {item.badge !== undefined && <NotificationBadge count={item.badge} />}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {showMobileMenu ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
              </button>
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-2 ml-6">
              {isLoggedIn ? (
                <>
                  {/* Settings Button */}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <HiCog className="text-xl" />
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                        JD
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden lg:block">John Doe</span>
                    </button>
                    
                    {/* Profile Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">John Doe</p>
                          <p className="text-sm text-gray-600">Software Engineer</p>
                        </div>
                        <Link 
                          to="/my-profile" 
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <HiUser className="w-4 h-4 mr-3" />
                          View Profile
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiLogout className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="btn-professional flex items-center gap-2"
                >
                  <HiLogin className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`
                    w-full flex items-center gap-4 p-3 rounded-lg text-left
                    transition-colors
                    ${isActive(item.path) 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                  onClick={() => {
                    handleProtectedClick(item.path, item.action)
                    setShowMobileMenu(false)
                  }}
                >
                  <div className="relative">
                    <item.icon className="text-xl" />
                    {item.badge !== undefined && <NotificationBadge count={item.badge} />}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              {/* Mobile Auth Actions */}
              {!isLoggedIn ? (
                <button
                  onClick={() => {
                    setShowLoginModal(true)
                    setShowMobileMenu(false)
                  }}
                  className="w-full btn-professional mt-4"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <HiLogout className="text-xl" />
                  <span className="font-medium">Sign Out</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Professional Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
              
              {loginError && (
                <p className="text-red-600 text-sm">{loginError}</p>
              )}
              
              <button
                type="submit"
                className="w-full btn-professional flex items-center justify-center gap-2"
              >
                Sign In
              </button>
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