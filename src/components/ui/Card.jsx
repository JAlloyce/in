import { forwardRef } from 'react'

/**
 * Card Component
 * 
 * Flexible card component for content containers with consistent
 * spacing, shadows, and borders following the design system.
 */

const Card = forwardRef(({
  children,
  padding = 'md',
  shadow = 'sm',
  border = true,
  className = '',
  onClick,
  hoverable = false,
  ...props
}, ref) => {
  
  const baseClasses = [
    'bg-white rounded-lg',
    'transition-all duration-200'
  ]

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  const borderClasses = border ? 'border border-gray-200' : ''
  
  const hoverClasses = hoverable ? 'hover:shadow-md hover:border-gray-300 cursor-pointer' : ''
  
  const clickableClasses = onClick ? 'cursor-pointer' : ''

  const allClasses = [
    ...baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    borderClasses,
    hoverClasses,
    clickableClasses,
    className
  ].filter(Boolean).join(' ')

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      ref={ref}
      className={allClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  )
})

Card.displayName = 'Card'

// Card sub-components for structured content
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
)

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
    {children}
  </div>
)

export default Card 