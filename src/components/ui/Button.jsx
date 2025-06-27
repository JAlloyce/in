import { motion } from 'framer-motion'
import { forwardRef } from 'react'

/**
 * Responsive Button Component
 *
 * Features:
 * - Touch-optimized sizes (min 44px)
 * - iOS compatibility
 * - Accessibility compliant
 * - Loading states
 * - Proper focus management
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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible disabled:opacity-50 disabled:cursor-not-allowed mobile-safe'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 border border-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-md'
  }
  
  const sizes = {
    xs: 'px-2 py-1 text-xs min-h-[32px]', // Smaller for desktop contexts
    sm: 'px-3 py-2 text-sm min-h-[40px]', // Close to touch target
    md: 'px-4 py-2.5 text-base min-h-[44px]', // Touch target compliant
    lg: 'px-6 py-3 text-lg min-h-[48px]', // Large touch target
    xl: 'px-8 py-4 text-xl min-h-[56px]' // Extra large
  }
  
  const widthClasses = fullWidth ? 'w-full' : ''
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClasses} ${className}`
  
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {loading && (
        <div className="mr-2 animate-spin">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" cy="12" r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
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
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button 