import React from 'react'
import { Link } from 'react-router-dom'
import { NotificationBadge } from '../ui/NotificationBadge'

export function NavItem({ icon: Icon, label, href, notificationCount = 0 }) {
  return (
    <Link 
      to={href} 
      className="relative p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
    >
      <Icon className="w-6 h-6" />
      {notificationCount > 0 && <NotificationBadge count={notificationCount} />}
      <span className="sr-only">{label}</span>
    </Link>
  )
} 