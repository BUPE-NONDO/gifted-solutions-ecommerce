import React, { useState, useEffect } from 'react';
import mobileImageProxyService from '../services/mobileImageProxyService';

const ImageDebugInfo = ({ src, className = "" }) => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (src) {
      const analyzeImage = async () => {
        const info = {
          originalUrl: src,
          isFirebaseStorage: mobileImageProxyService.isFirebaseStorageUrl(src),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          networkInfo: null,
          testResults: {}
        };

        // Get network info if available
        if ('connection' in navigator) {
          const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
          info.networkInfo = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
          };
        }

        // Test different URL strategies
        try {
          // Test 1: Original URL
          const img1 = new Image();
          const test1Promise = new Promise((resolve) => {
            img1.onload = () => resolve({ success: true, time: Date.now() });
            img1.onerror = () => resolve({ success: false, error: 'Load failed' });
            setTimeout(() => resolve({ success: false, error: 'Timeout' }), 5000);
          });
          img1.src = src;
          info.testResults.original = await test1Promise;

          // Test 2: With cache busting
          const cacheBustedUrl = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}&mobile=1`;
          const img2 = new Image();
          const test2Promise = new Promise((resolve) => {
            img2.onload = () => resolve({ success: true, time: Date.now() });
            img2.onerror = () => resolve({ success: false, error: 'Load failed' });
            setTimeout(() => resolve({ success: false, error: 'Timeout' }), 5000);
          });
          img2.src = cacheBustedUrl;
          info.testResults.cacheBusted = await test2Promise;

          // Test 3: Proxy service
          try {
            const proxyUrl = await mobileImageProxyService.createMobileFriendlyUrl(src, { forceRefresh: true });
            const img3 = new Image();
            const test3Promise = new Promise((resolve) => {
              img3.onload = () => resolve({ success: true, time: Date.now(), url: proxyUrl });
              img3.onerror = () => resolve({ success: false, error: 'Load failed', url: proxyUrl });
              setTimeout(() => resolve({ success: false, error: 'Timeout', url: proxyUrl }), 5000);
            });
            img3.src = proxyUrl;
            info.testResults.proxy = await test3Promise;
          } catch (error) {
            info.testResults.proxy = { success: false, error: error.message };
          }

        } catch (error) {
          info.testResults.error = error.message;
        }

        setDebugInfo(info);
      };

      analyzeImage();
    }
  }, [src]);

  if (!debugInfo) {
    return null;
  }

  return (
    <div className={`${className} relative`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10"
      >
        Debug
      </button>
      
      {isVisible && (
        <div className="absolute top-8 right-2 bg-white border border-gray-300 rounded shadow-lg p-4 z-20 max-w-sm text-xs">
          <h4 className="font-bold mb-2">Image Debug Info</h4>
          
          <div className="space-y-2">
            <div>
              <strong>URL:</strong>
              <div className="break-all text-gray-600">{debugInfo.originalUrl}</div>
            </div>
            
            <div>
              <strong>Firebase Storage:</strong> {debugInfo.isFirebaseStorage ? 'Yes' : 'No'}
            </div>
            
            <div>
              <strong>Mobile:</strong> {debugInfo.isMobile ? 'Yes' : 'No'}
            </div>
            
            {debugInfo.networkInfo && (
              <div>
                <strong>Network:</strong> {debugInfo.networkInfo.effectiveType} 
                ({debugInfo.networkInfo.downlink}Mbps)
              </div>
            )}
            
            <div>
              <strong>Test Results:</strong>
              <div className="ml-2 space-y-1">
                <div>
                  Original: {debugInfo.testResults.original?.success ? 
                    <span className="text-green-600">✓ Success</span> : 
                    <span className="text-red-600">✗ {debugInfo.testResults.original?.error}</span>
                  }
                </div>
                <div>
                  Cache Busted: {debugInfo.testResults.cacheBusted?.success ? 
                    <span className="text-green-600">✓ Success</span> : 
                    <span className="text-red-600">✗ {debugInfo.testResults.cacheBusted?.error}</span>
                  }
                </div>
                <div>
                  Proxy: {debugInfo.testResults.proxy?.success ? 
                    <span className="text-green-600">✓ Success</span> : 
                    <span className="text-red-600">✗ {debugInfo.testResults.proxy?.error}</span>
                  }
                </div>
              </div>
            </div>
            
            <div className="text-gray-500 text-xs">
              {debugInfo.timestamp}
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="mt-2 bg-gray-500 text-white px-2 py-1 rounded text-xs"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageDebugInfo;
