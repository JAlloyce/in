import { forwardRef, useState } from 'react'
import { HiUser } from 'react-icons/hi2'

/**
 * Avatar Component
 * 
 * Flexible avatar component supporting images, initials, and fallbacks
 * with consistent sizing following the design system.
 */

const Avatar = forwardRef(({
  src,
  alt = '',
  name = '',
  size = 'md',
  variant = 'circular',
  className = '',
  onClick,
  status,
  ...props
}, ref) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs min-w-[24px] min-h-[24px]',
    sm: 'w-8 h-8 text-sm min-w-[32px] min-h-[32px]',
    md: 'w-10 h-10 text-base min-w-[40px] min-h-[40px]',
    lg: 'w-12 h-12 text-lg min-w-[48px] min-h-[48px]',
    xl: 'w-16 h-16 text-xl min-w-[64px] min-h-[64px]',
    '2xl': 'w-20 h-20 text-2xl min-w-[80px] min-h-[80px]'
  }

  const variantClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  }

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  }

  const statusPositions = {
    xs: 'bottom-0 right-0',
    sm: 'bottom-0 right-0',
    md: 'bottom-0 right-0',
    lg: 'bottom-0.5 right-0.5',
    xl: 'bottom-0.5 right-0.5',
    '2xl': 'bottom-1 right-1'
  }

  const statusColors = {
    online: 'bg-green-500 border-white',
    offline: 'bg-gray-400 border-white',
    away: 'bg-yellow-500 border-white',
    busy: 'bg-red-500 border-white'
  }

  const baseClasses = [
    'relative inline-flex items-center justify-center',
    'bg-gray-100 text-gray-600 font-medium overflow-hidden',
    'border-2 border-transparent',
    'transition-all duration-200'
  ]

  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80 touch-target focus-visible mobile-safe' : ''

  const allClasses = [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    clickableClasses,
    className
  ].filter(Boolean).join(' ')

  const getInitials = (name) => {
    if (!name) return ''
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      )
    }

    const initials = getInitials(name)
    if (initials) {
      return <span>{initials}</span>
    }

    const iconSize = size === 'xs' ? 'w-3 h-3' : 
                    size === 'sm' ? 'w-4 h-4' : 
                    size === 'md' ? 'w-5 h-5' : 
                    size === 'lg' ? 'w-6 h-6' : 
                    size === 'xl' ? 'w-8 h-8' : 'w-10 h-10'

    return <HiUser className={iconSize} />
  }

  return (
    <div
      ref={ref}
      className={allClasses}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
      
      {status && (
        <div
          className={`absolute ${statusPositions[size]} ${statusSizes[size]} ${statusColors[status]} rounded-full border-2`}
        />
      )}
    </div>
  )
})

Avatar.displayName = 'Avatar'

// Avatar Group component for displaying multiple avatars
export const AvatarGroup = ({ 
  children, 
  max = 3, 
  size = 'md', 
  className = '',
  showRemaining = true 
}) => {
  const avatars = Array.isArray(children) ? children : [children]
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  const spacing = {
    xs: '-space-x-1',
    sm: '-space-x-1.5', 
    md: '-space-x-2',
    lg: '-space-x-2.5',
    xl: '-space-x-3',
    '2xl': '-space-x-4'
  }

  return (
    <div className={`flex items-center ${spacing[size]} ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className="relative border-2 border-white rounded-full">
          {avatar}
        </div>
      ))}
      
      {showRemaining && remainingCount > 0 && (
        <Avatar 
          size={size}
          className="bg-gray-300 text-gray-700"
          name={`+${remainingCount}`}
        />
      )}
    </div>
  )
}

export default Avatar 