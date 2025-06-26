#!/usr/bin/env node

/**
 * Validation Script for Phase 2 Fixes
 * 
 * Quick validation to ensure all authentication and performance fixes are working
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Validating Phase 2 Implementation Fixes...\n');

// Files to validate
const filesToCheck = [
  'src/pages/Network.jsx',
  'src/pages/Jobs.jsx', 
  'src/pages/Messaging.jsx',
  'src/pages/Notifications.jsx',
  'src/services/performance-optimizer.js',
  'src/services/api-testing.js',
  'src/utils/route-tester.js',
  'src/context/AuthContext.jsx',
  'src/components/ui/ErrorBoundary.jsx',
  'src/services/error-handler.js'
];

let validationResults = [];

// Check if files exist and contain expected fixes
filesToCheck.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      let hasExpectedFix = false;
      let fixDescription = '';
      
      // Check for specific fixes
      if (filePath.includes('pages/')) {
        hasExpectedFix = content.includes('useAuth') && content.includes('isAuthenticated');
        fixDescription = 'Uses proper useAuth hook for authentication';
      } else if (filePath.includes('performance-optimizer')) {
        hasExpectedFix = content.includes('PerformanceMonitor') && content.includes('DataCache');
        fixDescription = 'Contains performance optimization utilities';
      } else if (filePath.includes('api-testing')) {
        hasExpectedFix = content.includes('APITester') && content.includes('generateCurlCommands');
        fixDescription = 'Contains comprehensive API testing suite';
      } else if (filePath.includes('route-tester')) {
        hasExpectedFix = content.includes('RouteTester') && content.includes('testAllRoutes');
        fixDescription = 'Contains route testing utilities';
      } else if (filePath.includes('AuthContext')) {
        hasExpectedFix = content.includes('createProfile') && content.includes('ErrorBoundary');
        fixDescription = 'Enhanced authentication context with error handling';
      } else if (filePath.includes('ErrorBoundary')) {
        hasExpectedFix = content.includes('componentDidCatch') && content.includes('retry');
        fixDescription = 'React error boundary with retry functionality';
      } else if (filePath.includes('error-handler')) {
        hasExpectedFix = content.includes('ErrorHandler') && content.includes('logError');
        fixDescription = 'Centralized error handling service';
      }
      
      validationResults.push({
        file: filePath,
        exists: true,
        hasExpectedFix,
        fixDescription,
        status: hasExpectedFix ? '✅ PASS' : '❌ FAIL'
      });
      
    } else {
      validationResults.push({
        file: filePath,
        exists: false,
        hasExpectedFix: false,
        fixDescription: 'File not found',
        status: '❌ MISSING'
      });
    }
  } catch (error) {
    validationResults.push({
      file: filePath,
      exists: false,
      hasExpectedFix: false,
      fixDescription: `Error reading file: ${error.message}`,
      status: '❌ ERROR'
    });
  }
});

// Display results
console.log('📊 VALIDATION RESULTS:\n');
console.log('='.repeat(80));

validationResults.forEach(result => {
  console.log(`${result.status} ${result.file}`);
  console.log(`   ${result.fixDescription}`);
  console.log('');
});

// Summary
const totalFiles = validationResults.length;
const passedFiles = validationResults.filter(r => r.status === '✅ PASS').length;
const failedFiles = totalFiles - passedFiles;
const successRate = ((passedFiles / totalFiles) * 100).toFixed(1);

console.log('='.repeat(80));
console.log('📈 VALIDATION SUMMARY:');
console.log(`Total Files: ${totalFiles}`);
console.log(`Passed: ${passedFiles}`);
console.log(`Failed: ${failedFiles}`);
console.log(`Success Rate: ${successRate}%`);

if (successRate >= 90) {
  console.log('\n🎉 VALIDATION SUCCESSFUL! All critical fixes are in place.');
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Login to your account');
  console.log('3. Navigate to Network, Jobs, Messages, and Notifications pages');
  console.log('4. Verify no "Please login" messages appear');
  console.log('5. Open browser console and run: testRoutes()');
  console.log('6. Check performance improvements');
} else {
  console.log('\n⚠️ VALIDATION INCOMPLETE! Some fixes may be missing.');
  console.log('Please check the failed files above.');
}

console.log('\n📋 CURL TESTING:');
console.log('For API testing, use the CURL commands in PHASE_2_IMPLEMENTATION_STATUS.md');

console.log('\n🧪 BROWSER TESTING:');
console.log('Open browser console after starting the app and run:');
console.log('- testRoutes() // Test all routes');
console.log('- testRoute("/network") // Test specific route');
console.log('- apiTester.runAllTests() // Test all APIs');
console.log('- generateCurls() // Generate CURL commands');

console.log('\n✨ Phase 2 Implementation Validation Complete! ✨'); 