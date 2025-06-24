"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  HiSearch, HiHome, HiUserGroup, HiBriefcase, 
  HiChat, HiBell, HiViewGrid, HiCog, HiMenu, HiX, HiDotsHorizontal 
} from "react-icons/hi"
import SettingsModal from "../settings/SettingsModal"

export default function Navbar() {
  const [showSettings, setShowSettings] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  
  // Navigation items
  const navItems = [
    { icon: HiHome, label: "Home", path: "/" },
    { icon: HiUserGroup, label: "Network", path: "/network" },
    { icon: HiBriefcase, label: "Jobs", path: "/jobs" },
    { icon: HiChat, label: "Messaging", path: "/messaging" },
    { icon: HiBell, label: "Notifications", path: "/notifications" },
    { icon: HiViewGrid, label: "Work", path: "#" },
    { icon: HiCog, label: "Settings", path: "#", action: () => setShowSettings(true) },
  ]

  const isActive = (path) => location.pathname === path

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreDropdown(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          {/* Logo */}
          <div className="flex items-center mr-4">
            <div className="text-blue-600 text-3xl font-bold">in</div>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:block relative flex-1 max-w-xs">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-1.5 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-8">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  to={item.path}
                  key={item.label}
                  className={`flex flex-col items-center transition-colors ${
                    isActive(item.path) 
                      ? "text-black" 
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <item.icon className="text-2xl" />
                  <span className="text-xs mt-1">{item.label}</span>
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
                showSettings ? "text-blue-600" : "text-gray-500 hover:text-black"
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
        <div className="md:hidden fixed inset-x-0 bottom-0 bg-white border-t z-20 shadow-lg">
          <div className="flex justify-around py-2">
            {/* First 4 navigation items */}
            {navItems.slice(0, 4).map((item) => (
              <Link
                to={item.path}
                key={item.label}
                className={`flex flex-col items-center px-2 py-1 ${
                  isActive(item.path) ? "text-blue-600" : "text-gray-500"
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
                  showMoreDropdown ? "text-blue-600" : "text-gray-500"
                }`}
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              >
                <HiDotsHorizontal className="w-6 h-6" />
                <span className="text-xs mt-1">More</span>
              </button>
              {/* Dropdown menu */}
              {showMoreDropdown && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                  {navItems.slice(4).map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        if (item.action) {
                          item.action()
                        } else {
                          setShowMobileMenu(false)
                        }
                        setShowMoreDropdown(false)
                      }}
                    >
                      <item.icon className="w-5 h-5 mr-2" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}