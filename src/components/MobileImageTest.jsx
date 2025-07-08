import React, { useState, useEffect } from 'react';
import MobileOptimizedImage from './MobileOptimizedImage';
import mobileImageProxyService from '../services/mobileImageProxyService';

const MobileImageTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const testUrls = [
    {
      name: 'Supabase Storage URL (No CORS!)',
      url: 'https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/test-image.jpg',
      expected: 'Should load without CORS issues'
    },
    {
      name: 'Firebase Storage URL (CORS Issues)',
      url: 'https://firebasestorage.googleapis.com/v0/b/gifted-solutions-shop.firebasestorage.app/o/products%2Fproduct_1732875123456_abc123.jpg?alt=media&token=12345',
      expected: 'May have CORS issues'
    },
    {
      name: 'Working Unsplash URL',
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center',
      expected: 'Should load successfully'
    },
    {
      name: 'Data URL',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwSDIyNVYyNTBIMTc1VjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+',
      expected: 'Should load data URL directly'
    },
    {
      name: 'Broken URL',
      url: 'https://example.com/nonexistent-image.jpg',
      expected: 'Should fallback to placeholder'
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const test of testUrls) {
      try {
        console.log(`Testing: ${test.name}`);
        const startTime = Date.now();

        const result = await mobileImageProxyService.createMobileFriendlyUrl(test.url, {
          forceRefresh: true,
          useProxy: true
        });

        const endTime = Date.now();
        const loadTime = endTime - startTime;

        setTestResults(prev => [...prev, {
          ...test,
          result: result,
          success: true,
          loadTime: loadTime,
          status: 'Success'
        }]);

      } catch (error) {
        setTestResults(prev => [...prev, {
          ...test,
          result: error.message,
          success: false,
          loadTime: 0,
          status: 'Failed'
        }]);
      }
    }

    setIsRunning(false);
  };

  const clearCache = () => {
    mobileImageProxyService.clearCache();
    setTestResults([]);
  };

  const getCacheStats = () => {
    return mobileImageProxyService.getCacheStats();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Mobile Image Loading Test</h2>

      {/* Controls */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Image Tests'}
        </button>

        <button
          onClick={clearCache}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Clear Cache
        </button>

        <div className="flex items-center text-sm text-gray-600">
          Cache Stats: {JSON.stringify(getCacheStats())}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
          {testResults.map((result, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{result.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  result.success
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.status} ({result.loadTime}ms)
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <strong>Expected:</strong> {result.expected}
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <strong>Original URL:</strong>
                <div className="break-all font-mono text-xs bg-gray-100 p-1 rounded">
                  {result.url}
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <strong>Result URL:</strong>
                <div className="break-all font-mono text-xs bg-gray-100 p-1 rounded">
                  {result.result}
                </div>
              </div>

              {/* Visual Test */}
              <div className="mt-3">
                <strong className="text-sm text-gray-600">Visual Test:</strong>
                <div className="mt-2 w-32 h-32 border border-gray-300 rounded overflow-hidden">
                  <MobileOptimizedImage
                    src={result.url}
                    alt={`Test ${result.name}`}
                    className="w-full h-full object-cover"
                    forceRefresh={true}
                    retryAttempts={1}
                    fallbackSrc="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Image Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Image Examples</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testUrls.map((test, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">{test.name}</h4>
              <div className="w-full h-32 border border-gray-300 rounded overflow-hidden mb-2">
                <MobileOptimizedImage
                  src={test.url}
                  alt={test.name}
                  className="w-full h-full object-cover"
                  forceRefresh={true}
                  retryAttempts={2}
                  fallbackSrc="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center"
                />
              </div>
              <p className="text-xs text-gray-600">{test.expected}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Testing Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Run Image Tests" to test the mobile image proxy service</li>
          <li>• Check the visual examples below to see real-time image loading</li>
          <li>• All images should display something (either original or fallback)</li>
          <li>• Test on different devices and network conditions</li>
          <li>• Check browser console for detailed loading information</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileImageTest;
