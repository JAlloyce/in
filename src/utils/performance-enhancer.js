import { memo, useCallback, useMemo, useState } from 'react'

/**
 * Performance Enhancement Utilities
 * 
 * Collection of utilities to optimize React application performance
 */

// Higher-order component for optimized memo with shallow comparison
export const optimizedMemo = (Component, propKeys = []) => {
  return memo(Component, (prevProps, nextProps) => {
    if (propKeys.length === 0) {
      return JSON.stringify(prevProps) === JSON.stringify(nextProps)
    }
    
    for (const key of propKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false
      }
    }
    return true
  })
}

// Optimized image component with lazy loading and error handling
export const LazyImage = memo(({ src, alt, className = '', onLoad, onError, ...props }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const handleLoad = useCallback(() => {
    setLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setError(true)
    onError?.()
  }, [onError])

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded"></div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
})

// Debounced search hook for performance
export const useDebounced = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  const debounce = useCallback(
    (fn, delay) => {
      let timeoutId
      return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(null, args), delay)
      }
    },
    []
  )

  const updateDebouncedValue = useMemo(
    () => debounce((newValue) => setDebouncedValue(newValue), delay),
    [debounce, delay]
  )

  // Update debounced value when input changes
  useState(() => {
    updateDebouncedValue(value)
  }, [value, updateDebouncedValue])

  return debouncedValue
}

// Virtual scrolling hook for large lists
export const useVirtualScroll = (items, itemHeight = 100, containerHeight = 600) => {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
    
    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    }
  }, [items, itemHeight, containerHeight, scrollTop])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  return {
    ...visibleItems,
    handleScroll
  }
}

// Memoized list component
export const MemoizedList = memo(({ items, renderItem, keyExtractor }) => {
  return (
    <div>
      {items.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item) : index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
})

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const startTime = useMemo(() => performance.now(), [])
  
  useState(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    if (renderTime > 16) { // More than 1 frame (60fps)
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
    }
    
    return () => {
      // Cleanup performance marks
      if (typeof performance !== 'undefined' && performance.clearMarks) {
        performance.clearMarks(`${componentName}-start`)
        performance.clearMarks(`${componentName}-end`)
      }
    }
  }, [componentName, startTime])
}

// Cache hook with TTL
export const useCache = (key, fetcher, ttl = 5 * 60 * 1000) => {
  const [cache, setCache] = useState(new Map())
  
  const getCachedData = useCallback(async () => {
    const cached = cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }
    
    const data = await fetcher()
    setCache(prev => new Map(prev).set(key, {
      data,
      timestamp: Date.now()
    }))
    
    return data
  }, [key, fetcher, ttl, cache])
  
  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])
  
  return { getCachedData, clearCache }
}

// Optimized event handlers
export const createOptimizedHandlers = (handlers) => {
  const memoizedHandlers = {}
  
  Object.keys(handlers).forEach(key => {
    memoizedHandlers[key] = useCallback(handlers[key], [])
  })
  
  return memoizedHandlers
}

export default {
  optimizedMemo,
  LazyImage,
  useDebounced,
  useVirtualScroll,
  MemoizedList,
  usePerformanceMonitor,
  useCache,
  createOptimizedHandlers
} 