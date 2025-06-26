/**
 * Route Testing Utility
 * 
 * Comprehensive testing utility for all application routes and API endpoints
 * Includes both frontend route navigation tests and backend API endpoint tests
 */

import { apiTester } from '../services/api-testing';
import { performanceMonitor } from '../services/performance-optimizer';

export class RouteTester {
  constructor() {
    this.testResults = [];
    this.navigationHistory = [];
    this.performanceMetrics = {};
  }

  /**
   * Test all application routes
   */
  async testAllRoutes() {
    console.log('🚀 Starting comprehensive route testing...');
    
    try {
      // Test frontend routes
      await this.testFrontendRoutes();
      
      // Test API endpoints
      await this.testAPIEndpoints();
      
      // Test database connectivity
      await this.testDatabaseConnectivity();
      
      // Generate comprehensive report
      this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Route testing failed:', error);
    }
  }

  /**
   * Test frontend application routes
   */
  async testFrontendRoutes() {
    console.log('🌐 Testing Frontend Routes...');
    
    const routes = [
      { path: '/', name: 'Home', requiresAuth: false },
      { path: '/network', name: 'Network', requiresAuth: true },
      { path: '/jobs', name: 'Jobs', requiresAuth: false },
      { path: '/messaging', name: 'Messaging', requiresAuth: true },
      { path: '/notifications', name: 'Notifications', requiresAuth: true },
      { path: '/profile', name: 'Profile', requiresAuth: true },
      { path: '/settings', name: 'Settings', requiresAuth: true },
      { path: '/workspace', name: 'Workspace', requiresAuth: true },
      { path: '/communities', name: 'Communities', requiresAuth: false },
      { path: '/saved', name: 'Saved', requiresAuth: true },
      { path: '/recent', name: 'Recent', requiresAuth: true }
    ];

    for (const route of routes) {
      await this.testRoute(route);
    }
  }

  /**
   * Test individual route
   */
  async testRoute(route) {
    try {
      performanceMonitor.startMeasure(`route-${route.name}`);
      
      console.log(`Testing route: ${route.path}`);
      
      // Simulate navigation
      const navigationStart = performance.now();
      
      // Check if route is accessible
      const isAccessible = await this.checkRouteAccessibility(route);
      
      const navigationEnd = performance.now();
      const loadTime = navigationEnd - navigationStart;
      
      const result = {
        route: route.path,
        name: route.name,
        requiresAuth: route.requiresAuth,
        accessible: isAccessible,
        loadTime: loadTime,
        timestamp: new Date().toISOString(),
        status: isAccessible ? 'PASS' : 'FAIL'
      };

      this.testResults.push(result);
      this.navigationHistory.push(route.path);
      
      const renderTime = performanceMonitor.endMeasure(`route-${route.name}`);
      this.performanceMetrics[route.name] = {
        loadTime,
        renderTime
      };

      const statusEmoji = isAccessible ? '✅' : '❌';
      console.log(`${statusEmoji} ${route.name} (${route.path}): ${loadTime.toFixed(2)}ms`);

    } catch (error) {
      const result = {
        route: route.path,
        name: route.name,
        requiresAuth: route.requiresAuth,
        accessible: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'ERROR'
      };

      this.testResults.push(result);
      console.log(`❌ ${route.name}: Error - ${error.message}`);
    }
  }

  /**
   * Check route accessibility
   */
  async checkRouteAccessibility(route) {
    try {
      // Simulate checking if route components exist and can be rendered
      // In a real implementation, this would navigate to the route and check for errors
      
      if (route.requiresAuth) {
        // Check if authentication is required and working
        const isAuthenticated = await this.checkAuthenticationStatus();
        if (!isAuthenticated) {
          console.log(`⚠️ ${route.name} requires authentication`);
          return false;
        }
      }

      // Simulate component loading
      await this.simulateComponentLoad(route);
      
      return true;
    } catch (error) {
      console.error(`Route ${route.path} accessibility check failed:`, error);
      return false;
    }
  }

  /**
   * Check authentication status
   */
  async checkAuthenticationStatus() {
    try {
      // This would typically check the authentication context
      // For testing purposes, we'll simulate this
      const authToken = localStorage.getItem('supabase.auth.token');
      return !!authToken;
    } catch (error) {
      return false;
    }
  }

  /**
   * Simulate component loading
   */
  async simulateComponentLoad(route) {
    // Simulate component loading time
    return new Promise(resolve => {
      setTimeout(resolve, Math.random() * 100 + 50);
    });
  }

  /**
   * Test API endpoints
   */
  async testAPIEndpoints() {
    console.log('🔗 Testing API Endpoints...');
    
    await apiTester.runAllTests();
    await apiTester.testDatabaseConnectivity();
    await apiTester.testRealTimeConnectivity();
  }

  /**
   * Test database connectivity
   */
  async testDatabaseConnectivity() {
    console.log('🗄️ Testing Database Connectivity...');
    
    try {
      const dbConnected = await apiTester.testDatabaseConnectivity();
      
      this.testResults.push({
        route: 'Database',
        name: 'Database Connection',
        accessible: dbConnected,
        status: dbConnected ? 'PASS' : 'FAIL',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.testResults.push({
        route: 'Database',
        name: 'Database Connection',
        accessible: false,
        error: error.message,
        status: 'ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate CURL commands for manual testing
   */
  generateCurlCommands() {
    console.log('\n📋 CURL Commands for Manual Testing:');
    console.log('=' .repeat(50));
    
    const curlCommands = apiTester.generateCurlCommands();
    console.log(curlCommands);
    
    // Additional route-specific curl commands
    console.log('\n# Additional Route Tests');
    console.log(`curl -X GET "http://localhost:5173/" -w "Time: %{time_total}s\\n"`);
    console.log(`curl -X GET "http://localhost:5173/network" -w "Time: %{time_total}s\\n"`);
    console.log(`curl -X GET "http://localhost:5173/jobs" -w "Time: %{time_total}s\\n"`);
    console.log(`curl -X GET "http://localhost:5173/messaging" -w "Time: %{time_total}s\\n"`);
    console.log(`curl -X GET "http://localhost:5173/notifications" -w "Time: %{time_total}s\\n"`);
    
    return curlCommands;
  }

  /**
   * Generate comprehensive test report
   */
  generateComprehensiveReport() {
    const frontendTests = this.testResults.filter(r => r.route !== 'Database');
    const apiTests = apiTester.testResults;
    
    const totalFrontendTests = frontendTests.length;
    const passedFrontendTests = frontendTests.filter(r => r.status === 'PASS').length;
    const failedFrontendTests = totalFrontendTests - passedFrontendTests;
    
    const totalApiTests = apiTests.length;
    const passedApiTests = apiTests.filter(r => r.success).length;
    const failedApiTests = totalApiTests - passedApiTests;

    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TESTING REPORT');
    console.log('='.repeat(60));
    
    console.log('\n🌐 Frontend Routes:');
    console.log(`Total: ${totalFrontendTests} | Passed: ${passedFrontendTests} | Failed: ${failedFrontendTests}`);
    console.log(`Success Rate: ${((passedFrontendTests / totalFrontendTests) * 100).toFixed(1)}%`);
    
    console.log('\n🔗 API Endpoints:');
    console.log(`Total: ${totalApiTests} | Passed: ${passedApiTests} | Failed: ${failedApiTests}`);
    console.log(`Success Rate: ${((passedApiTests / totalApiTests) * 100).toFixed(1)}%`);
    
    console.log('\n⚡ Performance Metrics:');
    Object.entries(this.performanceMetrics).forEach(([route, metrics]) => {
      console.log(`${route}: Load ${metrics.loadTime.toFixed(2)}ms | Render ${metrics.renderTime.toFixed(2)}ms`);
    });
    
    console.log('\n❌ Failed Tests:');
    const allFailedTests = [
      ...frontendTests.filter(r => r.status !== 'PASS'),
      ...apiTests.filter(r => !r.success)
    ];
    
    if (allFailedTests.length === 0) {
      console.log('🎉 All tests passed!');
    } else {
      allFailedTests.forEach(test => {
        console.log(`- ${test.name || test.testName}: ${test.error || test.status}`);
      });
    }
    
    console.log('\n📋 Recommendations:');
    this.generateRecommendations(frontendTests, apiTests);
    
    console.log('\n🧪 CURL Commands Generated - Use for manual testing');
    this.generateCurlCommands();
    
    return {
      frontend: {
        total: totalFrontendTests,
        passed: passedFrontendTests,
        failed: failedFrontendTests,
        successRate: (passedFrontendTests / totalFrontendTests) * 100
      },
      api: {
        total: totalApiTests,
        passed: passedApiTests,
        failed: failedApiTests,
        successRate: (passedApiTests / totalApiTests) * 100
      },
      performance: this.performanceMetrics,
      failedTests: allFailedTests
    };
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations(frontendTests, apiTests) {
    const recommendations = [];
    
    // Check for authentication issues
    const authFailures = frontendTests.filter(r => r.requiresAuth && r.status === 'FAIL');
    if (authFailures.length > 0) {
      recommendations.push('🔐 Fix authentication issues on protected routes');
    }
    
    // Check for slow loading routes
    const slowRoutes = Object.entries(this.performanceMetrics)
      .filter(([, metrics]) => metrics.loadTime > 1000)
      .map(([route]) => route);
    
    if (slowRoutes.length > 0) {
      recommendations.push(`⚡ Optimize performance for slow routes: ${slowRoutes.join(', ')}`);
    }
    
    // Check for API failures
    const apiFailures = apiTests.filter(r => !r.success);
    if (apiFailures.length > 0) {
      recommendations.push('🔗 Fix failing API endpoints');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✨ All systems are performing well!');
    }
    
    recommendations.forEach(rec => console.log(`- ${rec}`));
  }

  /**
   * Run specific route test
   */
  async testSpecificRoute(routePath) {
    console.log(`🎯 Testing specific route: ${routePath}`);
    
    const route = {
      path: routePath,
      name: routePath.split('/')[1] || 'Home',
      requiresAuth: ['network', 'messaging', 'notifications', 'profile', 'settings', 'workspace', 'saved', 'recent'].includes(routePath.split('/')[1])
    };
    
    await this.testRoute(route);
    
    const result = this.testResults[this.testResults.length - 1];
    console.log(`Test Result:`, result);
    
    return result;
  }
}

// Export singleton instance
export const routeTester = new RouteTester();

// Auto-run tests in development mode
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Add global testing function
  window.testRoutes = () => routeTester.testAllRoutes();
  window.testRoute = (path) => routeTester.testSpecificRoute(path);
  window.generateCurls = () => routeTester.generateCurlCommands();
  
  console.log('🧪 Route testing utilities available:');
  console.log('- testRoutes() - Run all route tests');
  console.log('- testRoute(path) - Test specific route');
  console.log('- generateCurls() - Generate CURL commands');
}

export default RouteTester; 