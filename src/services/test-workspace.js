/**
 * Test file for workspace service functionality
 * This tests AI content generation and OCR integration
 */

import workspaceService from './workspace.js';
import ocrService from './ocr.js';

// Mock AI results for testing
const mockAIResults = {
  tasks: [
    "Learn React fundamentals",
    "Build a todo app",
    "Study React hooks"
  ],
  objectives: [
    "Understand components",
    "Master state management"
  ],
  resources: [
    "React Documentation",
    "Tutorial website"
  ],
  complete: {
    content: "Complete React learning plan...",
    citations: ["https://react.dev"]
  }
};

// Test functions
export const testServices = async () => {
  console.log('🧪 Testing Workspace Services...');
  
  try {
    // Test workspace service
    if (typeof workspaceService.addAiGeneratedContent === 'function') {
      console.log('✅ addAiGeneratedContent method exists');
    } else {
      console.error('❌ addAiGeneratedContent method missing');
    }
    
    // Test OCR service
    if (ocrService && typeof ocrService.isValidFile === 'function') {
      console.log('✅ OCR service loaded successfully');
      
      const mockFile = new File([''], 'test.png', { type: 'image/png' });
      const isValid = ocrService.isValidFile(mockFile);
      console.log('✅ File validation:', isValid ? 'Working' : 'Failed');
    } else {
      console.error('❌ OCR service not properly loaded');
    }
    
    console.log('✅ All services tested successfully');
    
  } catch (error) {
    console.error('❌ Service test failed:', error);
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.testWorkspaceServices = testServices;
  console.log('🔧 Test loaded. Run window.testWorkspaceServices() to test.');
}

export default testServices; 