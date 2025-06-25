import { forwardRef } from 'react'
import { designTokens } from '../../styles/design-tokens'

/**
 * Button Component
 * 
 * Consistent, accessible button component following the design system.
 * Supports multiple variants, sizes, and states.
 */

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'relative overflow-hidden'
  ]

  const variantClasses = {
    primary: [
      'bg-blue-600 text-white',
      'hover:bg-blue-700 focus:ring-blue-500',
      'active:bg-blue-800'
    ],
    secondary: [
      'bg-gray-100 text-gray-900 border border-gray-300',
      'hover:bg-gray-200 focus:ring-gray-500',
      'active:bg-gray-300'
    ],
    outline: [
      'bg-transparent text-blue-600 border border-blue-600',
      'hover:bg-blue-50 focus:ring-blue-500',
      'active:bg-blue-100'
    ],
    ghost: [
      'bg-transparent text-gray-700',
      'hover:bg-gray-100 focus:ring-gray-500',
      'active:bg-gray-200'
    ],
    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700 focus:ring-red-500',
      'active:bg-red-800'
    ]
  }

  const sizeClasses = {
    sm: [
      'h-8 px-3 text-sm',
      'rounded-md gap-1.5'
    ],
    md: [
      'h-10 px-4 text-sm',
      'rounded-lg gap-2'
    ],
    lg: [
      'h-12 px-6 text-base',
      'rounded-lg gap-2'
    ]
  }

  const widthClasses = fullWidth ? 'w-full' : ''

  const allClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    widthClasses,
    className
  ].filter(Boolean).join(' ')

  const handleClick = (e) => {
    if (disabled || loading) return
    onClick?.(e)
  }

  return (
    <button
      ref={ref}
      type={type}
      className={allClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {children}
        
        {rightIcon && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </div>
    </button>
  )
})

Button.displayName = 'Button'

export default Button 