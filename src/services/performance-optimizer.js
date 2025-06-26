import React, { Suspense, lazy, memo, useMemo, useCallback } from 'react';

/**
 * Performance Optimization Service
 * 
 * Provides utilities for optimizing React application performance including:
 * - Lazy loading components
 * - Memoization helpers
 * - Image optimization
 * - Data caching
 * - Performance monitoring
 */

/**
 * Lazy load components with error boundaries
 */
export const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props) => (
    <Suspense fallback={fallback || <ComponentSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

/**
 * Component skeleton for loading states
 */
const ComponentSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
    <div className="mt-4 space-y-2">
      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
    </div>
  </div>
);

/**
 * Enhanced memo with deep comparison for complex props
 */
export const createMemoComponent = (Component, customCompare) => {
  return memo(Component, customCompare || ((prevProps, nextProps) => {
    // Deep comparison for objects and arrays
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  }));
};

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
  }

  /**
   * Start performance measurement
   */
  startMeasure(name) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * End performance measurement
   */
  endMeasure(name) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      this.metrics.set(name, measure.duration);
      
      // Clean up marks
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      
      return measure.duration;
    }
    return 0;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorWebVitals() {
    if (typeof window !== 'undefined') {
      // Simple Core Web Vitals monitoring
      if ('performance' in window) {
        // Monitor Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
      }
    }
  }

  /**
   * Observe element intersection for lazy loading
   */
  observeIntersection(element, callback, options = {}) {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });

    observer.observe(element);
    this.observers.set(element, observer);

    return () => {
      observer.unobserve(element);
      this.observers.delete(element);
    };
  }
}

/**
 * Data caching service
 */
export class DataCache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  /**
   * Set cache entry
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get cache entry
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Image optimization utilities
 */
export const ImageOptimizer = {
  /**
   * Create optimized image component
   */
  createOptimizedImage: (src, alt, options = {}) => {
    const {
      width,
      height,
      loading = 'lazy',
      className = ''
    } = options;

    return React.createElement('img', {
      src,
      alt,
      width,
      height,
      loading,
      className: `transition-opacity duration-300 ${className}`,
      onLoad: (e) => {
        e.target.style.opacity = '1';
      },
      style: { opacity: '0' }
    });
  },

  /**
   * Preload critical images
   */
  preloadImages: (urls) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
};

/**
 * Virtual scrolling for large lists
 */
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
};

/**
 * Debounced search hook
 */
export const useDebouncedSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const searchResults = await searchFn(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, searchFn, delay]);

  return { query, setQuery, results, loading };
};

/**
 * Optimized component wrapper
 */
export const withPerformanceOptimization = (Component) => {
  return memo((props) => {
    const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);
    
    React.useEffect(() => {
      performanceMonitor.startMeasure('component-render');
      return () => {
        performanceMonitor.endMeasure('component-render');
      };
    });

    return <Component {...props} performanceMonitor={performanceMonitor} />;
  });
};

// Create singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const dataCache = new DataCache();

// Export utilities
export default {
  createLazyComponent,
  createMemoComponent,
  PerformanceMonitor,
  DataCache,
  ImageOptimizer,
  useVirtualScroll,
  useDebouncedSearch,
  withPerformanceOptimization,
  performanceMonitor,
  dataCache
}; 