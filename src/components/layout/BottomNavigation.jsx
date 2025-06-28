import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiHome, HiUsers, HiBriefcase, HiChat, HiUser } from 'react-icons/hi'

export function BottomNavigation() {
  const location = useLocation()
  
  const navItems = [
    { icon: HiHome, label: 'Home', path: '/' },
    { icon: HiUsers, label: 'Network', path: '/network' },
    { icon: HiBriefcase, label: 'Jobs', path: '/jobs' },
    { icon: HiChat, label: 'Messages', path: '/messaging' },
    { icon: HiUser, label: 'Profile', path: '/profile' }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2 px-4 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-[44px] min-h-[44px] justify-center ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 