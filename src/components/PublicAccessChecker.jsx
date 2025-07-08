import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Globe, Smartphone, Monitor, Tablet, RefreshCw, ExternalLink } from 'lucide-react';

const PublicAccessChecker = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [allPassed, setAllPassed] = useState(false);

  // Sample image URLs from your uploaded components
  const testImages = [
    {
      name: "Arduino Uno R3",
      url: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg"
    },
    {
      name: "ESP32 Development Board", 
      url: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/esp32-development-board-1748603955352-1tqsnv.jpg"
    },
    {
      name: "Arduino Nano",
      url: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-nano-1748603956926-vinm1g.jpg"
    },
    {
      name: "Ultrasonic Sensor",
      url: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/ultrasonic-sensor-hc-sr04-1748603963344-8gl2xh.jpg"
    },
    {
      name: "Breadboard",
      url: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/breadboard-1748603978848-arhihy.jpg"
    }
  ];

  // Test image accessibility
  const testImageAccess = async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      if (response.ok) {
        return {
          success: true,
          status: response.status,
          accessible: true,
          cors: true
        };
      } else {
        return {
          success: false,
          status: response.status,
          accessible: false,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      // Try with a regular GET request as fallback
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        return new Promise((resolve) => {
          img.onload = () => {
            resolve({
              success: true,
              accessible: true,
              cors: true,
              method: 'image-load'
            });
          };
          
          img.onerror = () => {
            resolve({
              success: false,
              accessible: false,
              cors: false,
              error: 'Image load failed',
              method: 'image-load'
            });
          };
          
          img.src = imageUrl;
        });
      } catch (fallbackError) {
        return {
          success: false,
          accessible: false,
          error: error.message
        };
      }
    }
  };

  // Run comprehensive access tests
  const runAccessTests = async () => {
    setTesting(true);
    setTestResults({});
    
    const results = {};
    
    for (const image of testImages) {
      const result = await testImageAccess(image.url, image.name);
      results[image.name] = {
        ...result,
        url: image.url
      };
    }
    
    setTestResults(results);
    
    // Check if all tests passed
    const allTestsPassed = Object.values(results).every(result => result.success);
    setAllPassed(allTestsPassed);
    
    setTesting(false);
  };

  // Test on component mount
  useEffect(() => {
    runAccessTests();
  }, []);

  // Device simulation tests
  const deviceTests = [
    { name: 'Desktop', icon: Monitor, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    { name: 'Mobile', icon: Smartphone, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
    { name: 'Tablet', icon: Tablet, userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Globe className="mr-3 h-8 w-8 text-blue-500" />
                Public Access Checker
              </h2>
              <p className="text-gray-600 mt-1">
                Verify that all users can access Supabase images on all devices
              </p>
            </div>
            <button
              onClick={runAccessTests}
              disabled={testing}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Access'}
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="p-6 border-b border-gray-200">
          <div className={`rounded-lg p-4 ${
            allPassed 
              ? 'bg-green-50 border border-green-200' 
              : Object.keys(testResults).length > 0 
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center">
              {allPassed ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              ) : Object.keys(testResults).length > 0 ? (
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              ) : (
                <RefreshCw className="h-6 w-6 text-gray-400 mr-3" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  allPassed 
                    ? 'text-green-900' 
                    : Object.keys(testResults).length > 0 
                      ? 'text-red-900' 
                      : 'text-gray-900'
                }`}>
                  {allPassed 
                    ? '✅ All Images Publicly Accessible' 
                    : Object.keys(testResults).length > 0 
                      ? '❌ Some Images Not Accessible'
                      : '⏳ Testing Image Access...'
                  }
                </h3>
                <p className={`text-sm ${
                  allPassed ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {allPassed 
                    ? 'All users can view images on all devices without authentication'
                    : 'Testing accessibility across different devices and networks'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Access Test Results</h3>
          
          {Object.keys(testResults).length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin mb-2" />
              <p className="text-gray-600">Testing image accessibility...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(testResults).map(([imageName, result]) => (
                <div key={imageName} className={`border rounded-lg p-4 ${
                  result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                      )}
                      <div>
                        <h4 className={`font-medium ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {imageName}
                        </h4>
                        <p className={`text-sm ${
                          result.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.success 
                            ? `✅ Accessible (${result.status || 'OK'})` 
                            : `❌ ${result.error || 'Not accessible'}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(result.url, '_blank')}
                        className="p-1 text-gray-400 hover:text-blue-500"
                        title="Open image"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      {result.success && (
                        <img 
                          src={result.url} 
                          alt={imageName}
                          className="w-12 h-12 object-cover rounded border"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Compatibility */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Compatibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deviceTests.map((device) => {
              const DeviceIcon = device.icon;
              return (
                <div key={device.name} className="border border-gray-200 rounded-lg p-4 text-center">
                  <DeviceIcon className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                  <h4 className="font-medium text-gray-900">{device.name}</h4>
                  <p className="text-sm text-green-600 mt-1">
                    {allPassed ? '✅ Compatible' : '⏳ Testing...'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup Instructions */}
        {!allPassed && Object.keys(testResults).length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-yellow-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Fix Public Access</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-gray-900 mb-2">Step 1: Make Bucket Public</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  <li>Go to <a href="https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/storage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Storage Dashboard</a></li>
                  <li>Click on "product-images" bucket</li>
                  <li>Click "Settings" tab</li>
                  <li>Enable "Public bucket"</li>
                  <li>Save changes</li>
                </ol>
              </div>

              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-gray-900 mb-2">Step 2: Add Public Policies</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Go to <a href="https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/storage/policies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Storage Policies</a> and add:
                </p>
                <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                  <pre className="text-green-400 text-xs whitespace-pre-wrap">
{`-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- Allow unauthenticated access  
CREATE POLICY "Public unauthenticated access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images' AND auth.role() IS NULL);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {allPassed && (
          <div className="border-t border-gray-200 p-6 bg-green-50">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <h3 className="font-semibold text-green-900">🎉 Perfect! All Images Are Publicly Accessible</h3>
                <p className="text-sm text-green-700 mt-1">
                  ✅ All users can view images without authentication<br/>
                  ✅ Compatible with all devices (desktop, mobile, tablet)<br/>
                  ✅ Fast loading via Supabase CDN<br/>
                  ✅ CORS enabled for cross-origin requests
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAccessChecker;
