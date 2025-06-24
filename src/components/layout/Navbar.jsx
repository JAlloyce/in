"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  HiSearch, HiHome, HiUserGroup, HiBriefcase, 
  HiChat, HiBell, HiViewGrid, HiCog, HiMenu, HiX, HiDotsHorizontal,
  HiLogin, HiLogout, HiUserCircle, HiUser, HiSparkles, HiLightningBolt
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
  
  // Enhanced navigation items with futuristic styling
  const navItems = isLoggedIn
    ? [
        { icon: HiHome, label: "Home", path: "/", glow: "hover:text-cyan-400" },
        { icon: HiUserGroup, label: "Network", path: "/network", glow: "hover:text-purple-400" },
        { icon: HiBriefcase, label: "Jobs", path: "/jobs", glow: "hover:text-green-400" },
        { icon: HiChat, label: "Messaging", path: "/messaging", glow: "hover:text-blue-400" },
        { 
          icon: HiBell, 
          label: "Notifications", 
          path: "/notifications",
          badge: unreadNotifications,
          glow: "hover:text-amber-400"
        },
        { icon: HiViewGrid, label: "Work", path: "/workspace", glow: "hover:text-pink-400" },
      ]
    : [
        { icon: HiHome, label: "Home", path: "/", glow: "hover:text-cyan-400" },
        { icon: HiUserGroup, label: "Network", path: "/network", glow: "hover:text-purple-400" },
        { icon: HiBriefcase, label: "Jobs", path: "/jobs", glow: "hover:text-green-400" },
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

  // Enhanced notification badge component
  const NotificationBadge = ({ count }) => {
    if (count === 0) return null;
    
    return (
      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
        {count > 9 ? "9+" : count}
      </span>
    );
  };

  return (
    <>
      {/* Futuristic Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Enhanced Logo with Neon Effect */}
            <div className="flex items-center mr-6">
              <div className="relative group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  in
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Futuristic Search Bar */}
            <div className="hidden md:block relative flex-1 max-w-md">
              <div className="relative group">
                <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the neural network..."
                  className="
                    w-full pl-12 pr-4 py-3 
                    bg-white/10 backdrop-blur-sm
                    border border-white/20 
                    rounded-xl
                    text-white placeholder-gray-400
                    focus:outline-none focus:border-cyan-400/50 focus:bg-white/15
                    focus:shadow-[0_0_20px_rgba(34,211,238,0.3)]
                    transition-all duration-300
                  "
                />
                {/* Search enhancement indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-60">
                  <HiSparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Desktop Navigation with Enhanced Styling */}
            <nav className="hidden md:flex items-center space-x-2 ml-6">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`
                    group relative flex flex-col items-center p-3 rounded-xl
                    transition-all duration-300 transform hover:scale-105
                    ${isActive(item.path) 
                      ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                      : `text-gray-300 hover:bg-white/5 ${item.glow}`
                    }
                  `}
                  onClick={() => handleProtectedClick(item.path, item.action)}
                >
                  <div className="relative">
                    <item.icon className="text-xl mb-1" />
                    {item.badge !== undefined && <NotificationBadge count={item.badge} />}
                    
                    {/* Active indicator */}
                    {isActive(item.path) && (
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button with Futuristic Styling */}
            <div className="md:hidden">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="
                  p-3 rounded-xl
                  bg-white/10 backdrop-blur-sm
                  border border-white/20
                  text-white hover:text-cyan-400
                  hover:bg-white/15 hover:border-cyan-400/50
                  transition-all duration-300
                "
              >
                {showMobileMenu ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
              </button>
            </div>

            {/* Enhanced Right Side Actions */}
            <div className="hidden md:flex items-center space-x-3 ml-6">
              {isLoggedIn ? (
                <>
                  {/* Settings Button */}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="
                      group relative p-3 rounded-xl
                      text-gray-300 hover:text-purple-400
                      hover:bg-white/5 
                      transition-all duration-300 transform hover:scale-105
                    "
                  >
                    <HiCog className="text-xl" />
                    <div className="absolute inset-0 bg-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
                  </button>

                  {/* Enhanced Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="
                        group relative flex items-center gap-3 p-2 rounded-xl
                        hover:bg-white/5 transition-all duration-300
                      "
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-0.5">
                          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                            <HiUser className="text-cyan-400 w-5 h-5" />
                          </div>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                      </div>
                      <span className="text-white font-medium">Neural User</span>
                    </button>
                    
                    {/* Enhanced Profile Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-64 card-modern rounded-xl shadow-2xl py-2 border border-white/20">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white font-semibold">Neural User</p>
                          <p className="text-gray-400 text-sm">Future Architect</p>
                        </div>
                        <Link 
                          to="/my-profile" 
                          className="flex items-center px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <HiUser className="w-4 h-4 mr-3" />
                          View Profile
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <HiLogout className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Enhanced Login Button */
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="
                    btn-futuristic
                    flex items-center gap-2
                    hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]
                  "
                >
                  <HiLogin className="w-4 h-4" />
                  <span>Neural Access</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 card-modern m-4 rounded-xl border border-white/20">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl
                    transition-all duration-300
                    ${isActive(item.path) 
                      ? "text-cyan-400 bg-cyan-400/10" 
                      : `text-gray-300 hover:bg-white/5 ${item.glow}`
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
              
              {/* Mobile Login/Logout */}
              {!isLoggedIn ? (
                <button
                  onClick={() => {
                    setShowLoginModal(true)
                    setShowMobileMenu(false)
                  }}
                  className="w-full btn-futuristic mt-4"
                >
                  Neural Access
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <HiLogout className="text-xl" />
                  <span className="font-medium">Sign Out</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Enhanced Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern max-w-md w-full p-8 rounded-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-futuristic">Neural Access</h2>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Neural ID (Email)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-futuristic w-full"
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Security Code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-futuristic w-full"
                />
              </div>
              
              {loginError && (
                <p className="text-red-400 text-sm">{loginError}</p>
              )}
              
              <button
                type="submit"
                className="w-full btn-futuristic flex items-center justify-center gap-2"
              >
                <HiLightningBolt className="w-4 h-4" />
                Initialize Connection
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