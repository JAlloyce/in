import { forwardRef } from 'react'

/**
 * Input Component
 * 
 * Flexible input component with consistent styling, sizing,
 * and states following the design system.
 */

const Input = forwardRef(({
  type = 'text',
  size = 'md',
  variant = 'default',
  error = false,
  disabled = false,
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  placeholder = '',
  className = '',
  ...props
}, ref) => {
  
  const baseClasses = [
    'w-full transition-all duration-200',
    'border-gray-300 rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'placeholder:text-gray-400'
  ]

  const sizeClasses = {
    sm: 'h-10 px-3 text-base min-h-[44px]',
    md: 'h-11 px-4 text-base min-h-[44px]',
    lg: 'h-12 px-5 text-lg min-h-[44px]'
  }

  const variantClasses = {
    default: [
      'bg-white border',
      'focus:ring-blue-500 focus:border-blue-500',
      'hover:border-gray-400'
    ],
    filled: [
      'bg-gray-50 border',
      'focus:ring-blue-500 focus:border-blue-500 focus:bg-white',
      'hover:bg-gray-100'
    ]
  }

  const errorClasses = error ? [
    'border-red-500 focus:ring-red-500 focus:border-red-500',
    'text-red-900 placeholder:text-red-400'
  ] : []

  const paddingWithIcons = (() => {
    const basePadding = sizeClasses[size]
    
    if (leftIcon && rightIcon) {
      return basePadding.replace('px-', 'pl-10 pr-10').replace('px-', 'pl-12 pr-12')
    } else if (leftIcon) {
      return basePadding.replace('px-', 'pl-10 pr-').replace('px-', 'pl-12 pr-')
    } else if (rightIcon) {
      return basePadding.replace('px-', 'pl- pr-10').replace('px-', 'pl- pr-12')
    }
    
    return basePadding
  })()

  const allClasses = [
    ...baseClasses,
    paddingWithIcons,
    ...variantClasses[variant],
    ...errorClasses,
    className
  ].filter(Boolean).join(' ')

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  const iconPosition = size === 'sm' ? 'left-2.5 right-2.5' : size === 'lg' ? 'left-4 right-4' : 'left-3 right-3'

  if (leftAddon || rightAddon) {
    return (
      <div className="flex">
        {leftAddon && (
          <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
            {leftAddon}
          </span>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`${allClasses} ${leftAddon ? 'rounded-l-none' : ''} ${rightAddon ? 'rounded-r-none' : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        
        {rightAddon && (
          <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg">
            {rightAddon}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {leftIcon && (
        <div className={`absolute ${iconPosition.split(' ')[0]} top-1/2 transform -translate-y-1/2 text-gray-400`}>
          <span className={iconSize}>
            {leftIcon}
          </span>
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        className={allClasses}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      
      {rightIcon && (
        <div className={`absolute ${iconPosition.split(' ')[1]} top-1/2 transform -translate-y-1/2 text-gray-400`}>
          <span className={iconSize}>
            {rightIcon}
          </span>
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input 