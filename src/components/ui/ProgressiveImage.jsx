import React, { useState } from 'react'

export function ProgressiveImage({ 
  src, 
  placeholder, 
  alt, 
  className = '',
  ...props 
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/blur image */}
      {placeholder && !imageLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
        />
      )}
      
      {/* Loading skeleton */}
      {!imageLoaded && !placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Main image */}
      {!imageError && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
      
      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  )
} 