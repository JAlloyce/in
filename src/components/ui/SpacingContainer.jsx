import React from 'react'

export function SpacingContainer({ children, spacing = 'default', className = '' }) {
  const spacings = {
    tight: 'space-y-2 sm:space-y-3',
    default: 'space-y-4 sm:space-y-6',
    loose: 'space-y-6 sm:space-y-8',
    relaxed: 'space-y-8 sm:space-y-12'
  }

  return (
    <div className={`${spacings[spacing]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
} 