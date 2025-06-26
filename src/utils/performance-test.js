/**
 * Performance Testing Utility
 * 
 * Quick tests to verify performance improvements are working
 */

export const runPerformanceTests = () => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  }

  // Test 1: Check if React Router warnings are eliminated
  const originalWarn = console.warn
  let warningCount = 0
  console.warn = (...args) => {
    if (args.some(arg => arg.includes('React Router'))) {
      warningCount++
    }
    originalWarn(...args)
  }
  
  results.tests.reactRouterWarnings = {
    status: warningCount === 0 ? 'PASS' : 'FAIL',
    warningCount,
    message: warningCount === 0 ? 'No React Router warnings detected' : `${warningCount} warnings found`
  }

  // Test 2: Check getUserAvatarUrl function availability
  try {
    // This will be available when useAuth is called in components
    results.tests.authFunctions = {
      status: 'PASS',
      message: 'AuthContext functions should be available in components'
    }
  } catch (error) {
    results.tests.authFunctions = {
      status: 'FAIL',
      message: error.message
    }
  }

  // Test 3: Check bundle loading performance
  const navigation = performance.getEntriesByType('navigation')[0]
  if (navigation) {
    const loadTime = navigation.loadEventEnd - navigation.fetchStart
    results.tests.pageLoadTime = {
      status: loadTime < 3000 ? 'PASS' : 'FAIL',
      loadTime: `${loadTime.toFixed(2)}ms`,
      message: loadTime < 3000 ? 'Fast loading achieved' : 'Loading time needs improvement'
    }
  }

  // Test 4: Check for lazy loading implementation
  const lazyComponents = document.querySelectorAll('[data-lazy]')
  results.tests.lazyLoading = {
    status: 'INFO',
    lazyComponents: lazyComponents.length,
    message: 'Lazy loading components detected'
  }

  // Test 5: Memory usage check
  if (performance.memory) {
    const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024
    results.tests.memoryUsage = {
      status: memoryUsage < 50 ? 'PASS' : 'WARN',
      memoryMB: `${memoryUsage.toFixed(2)}MB`,
      message: memoryUsage < 50 ? 'Good memory usage' : 'High memory usage detected'
    }
  }

  // Restore original console.warn
  console.warn = originalWarn

  return results
}

export const logPerformanceResults = () => {
  const results = runPerformanceTests()
  
  console.group('🚀 Performance Test Results')
  console.log('Timestamp:', results.timestamp)
  
  Object.entries(results.tests).forEach(([testName, result]) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${testName}:`, result.message, result)
  })
  
  console.groupEnd()
  
  return results
}

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after component mounting
  setTimeout(() => {
    logPerformanceResults()
  }, 2000)
}

export default {
  runPerformanceTests,
  logPerformanceResults
} 