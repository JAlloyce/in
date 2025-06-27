import React from 'react';

/**
 * Intru Logo Component
 * 
 * A clean, professional "i" logo representing the Intru brand.
 * Features:
 * - Scalable SVG design
 * - Multiple size variants
 * - Professional blue color scheme
 * - Consistent branding across the app
 */
export default function IntruLogo({ 
  size = 'md', 
  className = '',
  showText = false,
  color = 'blue'
}) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    dark: 'text-gray-900'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} flex-shrink-0`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="currentColor" 
          className="w-full h-full"
        >
          <rect width="32" height="32" rx="6" fill="currentColor"/>
          <circle cx="16" cy="10" r="2.5" fill="white"/>
          <rect x="13.5" y="14" width="5" height="12" rx="1" fill="white"/>
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold ${colorClasses[color]} ${
          size === 'xs' ? 'text-sm' :
          size === 'sm' ? 'text-base' :
          size === 'md' ? 'text-lg' :
          size === 'lg' ? 'text-xl' :
          size === 'xl' ? 'text-2xl' :
          'text-3xl'
        }`}>
          intru
        </span>
      )}
    </div>
  );
}

// Additional icon-only variant for smaller spaces
export function IntruIcon({ size = 'md', className = '', color = 'blue' }) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    dark: 'text-gray-900'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg 
        viewBox="0 0 32 32" 
        fill="currentColor" 
        className="w-full h-full"
      >
        <rect width="32" height="32" rx="6" fill="currentColor"/>
        <circle cx="16" cy="10" r="2.5" fill="white"/>
        <rect x="13.5" y="14" width="5" height="12" rx="1" fill="white"/>
      </svg>
    </div>
  );
} 