import React, { useState } from 'react';
import { HiOutlineSparkles, HiOutlineDocument } from 'react-icons/hi';

export default function Test() {
  const [testResults, setTestResults] = useState(null);

  const testPerplexityAPI = async () => {
    try {
      // Test Perplexity service dynamically
      const perplexityService = await import('../services/perplexity');
      const result = await perplexityService.default.testAPI();
      setTestResults({ type: 'perplexity', ...result });
      console.log('Perplexity test result:', result);
    } catch (error) {
      console.error('Perplexity test failed:', error);
      setTestResults({ type: 'perplexity', success: false, error: error.message });
    }
  };

  const testOCR = async () => {
    try {
      // Test OCR service dynamically
      const ocrService = await import('../services/ocr');
      console.log('OCR service loaded:', ocrService.default);
      setTestResults({ type: 'ocr', success: true, message: 'OCR service loaded successfully' });
    } catch (error) {
      console.error('OCR test failed:', error);
      setTestResults({ type: 'ocr', success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Simple API Test Dashboard
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Perplexity API Test */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <HiOutlineSparkles className="mr-2 text-purple-500" />
                Perplexity API Test
              </h2>
              
              <button
                onClick={testPerplexityAPI}
                className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Test Perplexity API
              </button>
            </div>

            {/* OCR Test */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <HiOutlineDocument className="mr-2 text-blue-500" />
                OCR Test
              </h2>
              
              <button
                onClick={testOCR}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Test OCR Service
              </button>
            </div>
          </div>

          {/* Results Display */}
          {testResults && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Test Results:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Console Commands</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Test Perplexity: <code className="bg-blue-100 px-1 rounded">window.testPerplexityAPI()</code></p>
              <p>• Test OCR: <code className="bg-blue-100 px-1 rounded">window.testOCR(imageFile)</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 