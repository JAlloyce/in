"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  HiSearch, HiHome, HiUserGroup, HiBriefcase, 
  HiChat, HiBell, HiViewGrid, HiCog, HiMenu, HiX, HiDotsHorizontal,
  HiLogin, HiLogout, HiUser, HiBookmark, HiFlag, HiUsers
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
  
  // Navigation items with vibrant colors
  const navItems = [
    { icon: HiHome, label: "Home", path: "/", color: "text-blue-500" },
    { icon: HiUserGroup, label: "Network", path: "/network", color: "text-purple-500" },
    { icon: HiBriefcase, label: "Jobs", path: "/jobs", color: "text-pink-500" },
    { icon: HiChat, label: "Messaging", path: "/messaging", color: "text-blue-500" },
    { icon: HiBell, label: "Notifications", path: "/notifications", color: "text-purple-500" },
    { icon: HiViewGrid, label: "Work", path: "/workspace", color: "text-pink-500" },
    { icon: HiCog, label: "Settings", path: "#", action: () => setShowSettings(true), color: "text-blue-500" },
  ]

  // Additional items for mobile "More" dropdown
  const moreItems = [
    { icon: HiUsers, label: "Communities", path: "/communities", color: "text-purple-500" },
    { icon: HiFlag, label: "Pages", path: "/pages", color: "text-pink-500" },
    { icon: HiBookmark, label: "Saved", path: "/saved", color: "text-blue-500" },
  ]

  const isActive = (path) => location.pathname === path

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
              className="pl-8 pr-3 py-1 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-sm"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-6">
              {navItems.slice(0, 6).map((item) => (
                <Link
                  to={item.path}
                  key={item.label}
                  className={`flex flex-col items-center transition-colors ${
                    isActive(item.path) 
                      ? `${item.color}` 
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <item.icon className="text-xl" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showMobileMenu ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center space-x-4 ml-4">
            <button
              onClick={() => setShowSettings(true)}
              className={`flex flex-col items-center ${
                showSettings ? "text-blue-500" : "text-gray-500 hover:text-black"
              }`}
            >
              <HiCog className="text-2xl" />
              <span className="text-xs mt-1">Settings</span>
            </button>

            <Link to="/profile" className="flex flex-col items-center text-gray-500 hover:text-black">
              <div className="w-6 h-6 rounded-full bg-gray-300 mb-1"></div>
              <span className="text-xs">Me</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-x-0 bottom-0 bg-white border-t z-50 shadow-lg">
          <div className="flex justify-around py-2 px-2">
            {/* First 4 navigation items */}
            {navItems.slice(0, 4).map((item) => (
              <Link
                to={item.path}
                key={item.label}
                className={`flex flex-col items-center px-2 py-1 ${
                  isActive(item.path) ? item.color : "text-gray-500"
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
            
            {/* More dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className={`flex flex-col items-center px-2 py-1 ${
                  showMoreDropdown ? "text-purple-500" : "text-gray-500"
                }`}
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              >
                <HiDotsHorizontal className="w-6 h-6" />
                <span className="text-xs mt-1">More</span>
              </button>
              {/* Dropdown menu */}
              {showMoreDropdown && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                  {/* Original navbar items */}
                  {navItems.slice(4).map((item) => (
                    item.path !== "#" ? (
                      <Link
                        key={item.label}
                        to={item.path}
                        className={`flex items-center px-4 py-2 hover:bg-gray-100 ${item.color}`}
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowMoreDropdown(false);
                        }}
                      >
                        <item.icon className="w-5 h-5 mr-2" />
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <div
                        key={item.label}
                        className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${item.color}`}
                        onClick={() => {
                          item.action?.();
                          setShowMobileMenu(false);
                          setShowMoreDropdown(false);
                        }}
                      >
                        <item.icon className="w-5 h-5 mr-2" />
                        <span>{item.label}</span>
                      </div>
                    )
                  ))}
                  
                  {/* Separator */}
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  {/* Additional sidebar items for mobile */}
                  {moreItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`flex items-center px-4 py-2 hover:bg-gray-100 ${item.color}`}
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowMoreDropdown(false);
                      }}
                    >
                      <item.icon className="w-5 h-5 mr-2" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}