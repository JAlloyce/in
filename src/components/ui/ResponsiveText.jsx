import React from 'react'

export function ResponsiveText({ children, variant = 'body', className = '' }) {
  const variants = {
    heading: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    subheading: 'text-xl sm:text-2xl md:text-3xl font-semibold',
    body: 'text-base sm:text-lg leading-relaxed',
    caption: 'text-sm sm:text-base text-gray-600'
  }

  return (
    <div className={`${variants[variant]} ${className}`} style={{ fontSize: '16px' }}>
      {children}
    </div>
  )
} 