// Component to test and fix Supabase image access issues
import React, { useState, useEffect } from 'react';
import { fixImageAccess, testImageUrls, getCorrectImageUrls } from '../utils/fixSupabaseImageAccess';

const SupabaseImageTester = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runImageTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Running comprehensive image access test...');
      
      const results = await fixImageAccess();
      setTestResults(results);
      
      if (results.success) {
        console.log('✅ Image access test completed successfully');
      } else {
        console.error('❌ Image access test failed:', results.error);
        setError(results.error);
      }
      
    } catch (err) {
      console.error('❌ Error running test:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificUrls = async () => {
    setLoading(true);
    
    try {
      console.log('🔗 Testing specific image URLs...');
      
      const urlTests = await testImageUrls();
      console.log('URL test results:', urlTests);
      
      // Update test results with URL tests
      setTestResults(prev => ({
        ...prev,
        urlTests
      }));
      
    } catch (err) {
      console.error('❌ Error testing URLs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCorrectUrls = async () => {
    setLoading(true);
    
    try {
      console.log('🔗 Getting correct image URLs...');
      
      const urlResult = await getCorrectImageUrls();
      
      if (urlResult.success) {
        console.log('✅ Got correct URLs:', urlResult.imageUrls);
        
        // Update test results
        setTestResults(prev => ({
          ...prev,
          correctUrls: urlResult.imageUrls
        }));
      } else {
        console.error('❌ Failed to get URLs:', urlResult.error);
        setError(urlResult.error);
      }
      
    } catch (err) {
      console.error('❌ Error getting URLs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run test on component mount
  useEffect(() => {
    runImageTest();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🧪 Supabase Image Access Tester
      </h2>
      
      <div className="space-y-4">
        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runImageTest}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? '🔄 Testing...' : '🧪 Run Full Test'}
          </button>
          
          <button
            onClick={testSpecificUrls}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            🔗 Test URLs
          </button>
          
          <button
            onClick={getCorrectUrls}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            📋 Get Correct URLs
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Test Results */}
        {testResults && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">📊 Test Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Bucket Access:</span>
                  <span className={`ml-2 ${testResults.bucketAccessible ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.bucketAccessible ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Images:</span>
                  <span className="ml-2 text-blue-600">{testResults.totalImages || 0}</span>
                </div>
                <div>
                  <span className="font-medium">Accessible:</span>
                  <span className="ml-2 text-green-600">{testResults.accessibleImages || 0}</span>
                </div>
                <div>
                  <span className="font-medium">Inaccessible:</span>
                  <span className="ml-2 text-red-600">{testResults.inaccessibleImages || 0}</span>
                </div>
              </div>
            </div>

            {/* URL Test Results */}
            {testResults.testResults && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">🔗 URL Test Results</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {testResults.testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                      <span className="font-medium">{test.imageName}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded ${
                          test.accessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {test.accessible ? '✅ OK' : '❌ Failed'}
                        </span>
                        {test.status && (
                          <span className="text-gray-600">{test.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct URLs */}
            {testResults.correctUrls && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">📋 Correct Image URLs</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(testResults.correctUrls).map(([imageName, url]) => (
                    <div key={imageName} className="bg-white p-2 rounded text-sm">
                      <div className="font-medium text-gray-800">{imageName}</div>
                      <div className="text-blue-600 break-all">{url}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image URLs */}
            {testResults.imageUrls && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">🖼️ Generated Image URLs</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(testResults.imageUrls).map(([imageName, url]) => (
                    <div key={imageName} className="bg-white p-2 rounded text-sm">
                      <div className="font-medium text-gray-800">{imageName}</div>
                      <div className="text-blue-600 break-all">{url}</div>
                      <img 
                        src={url} 
                        alt={imageName}
                        className="mt-2 w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="text-red-500 text-xs mt-1" style={{display: 'none'}}>
                        ❌ Failed to load image
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h4 className="font-semibold">📝 Instructions:</h4>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Run the full test to check image accessibility</li>
            <li>If images are inaccessible, check Supabase dashboard</li>
            <li>Go to Storage → product-images → Settings</li>
            <li>Make sure the bucket is set to "Public"</li>
            <li>Check that RLS (Row Level Security) allows public access</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SupabaseImageTester;
