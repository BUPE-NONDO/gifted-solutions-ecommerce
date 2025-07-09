import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Image as ImageIcon,
  ExternalLink,
  Database,
  HardDrive,
  Globe
} from 'lucide-react';
import { products } from '../data/newProducts';

const ImageVerificationTool = () => {
  const [verificationResults, setVerificationResults] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [summary, setSummary] = useState({});

  // Test image accessibility
  const testImageUrl = async (url, productName) => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      if (response.ok) {
        return {
          success: true,
          status: response.status,
          type: getImageType(url),
          accessible: true
        };
      } else {
        return {
          success: false,
          status: response.status,
          type: getImageType(url),
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      // Fallback test with image loading
      try {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          const timeout = setTimeout(() => {
            resolve({
              success: false,
              type: getImageType(url),
              error: 'Timeout',
              accessible: false
            });
          }, 5000);
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve({
              success: true,
              type: getImageType(url),
              accessible: true,
              method: 'image-load'
            });
          };
          
          img.onerror = () => {
            clearTimeout(timeout);
            resolve({
              success: false,
              type: getImageType(url),
              error: 'Image load failed',
              accessible: false
            });
          };
          
          img.src = url;
        });
      } catch (fallbackError) {
        return {
          success: false,
          type: getImageType(url),
          error: fallbackError.message,
          accessible: false
        };
      }
    }
  };

  // Determine image type
  const getImageType = (url) => {
    if (!url) return 'missing';
    if (url.startsWith('data:')) return 'base64';
    if (url.includes('supabase.co')) return 'supabase';
    if (url.includes('unsplash.com')) return 'unsplash';
    if (url.includes('placeholder.com') || url.includes('via.placeholder.com')) return 'placeholder';
    if (url.startsWith('/')) return 'local';
    return 'external';
  };

  // Run verification on all products
  const runVerification = async () => {
    setIsVerifying(true);
    setVerificationResults({});
    
    const results = {};
    const typeCount = {
      supabase: 0,
      base64: 0,
      placeholder: 0,
      unsplash: 0,
      local: 0,
      external: 0,
      missing: 0
    };
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const product of products) {
      const imageType = getImageType(product.image);
      typeCount[imageType]++;
      
      const result = await testImageUrl(product.image, product.name);
      results[product.id] = {
        ...result,
        productName: product.name,
        imageUrl: product.image,
        category: product.category
      };
      
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }
    
    setVerificationResults(results);
    setSummary({
      total: products.length,
      successful: successCount,
      failed: failureCount,
      typeCount
    });
    setIsVerifying(false);
  };

  // Run verification on component mount
  useEffect(() => {
    runVerification();
  }, []);

  // Get status color
  const getStatusColor = (type, success) => {
    if (type === 'placeholder') return 'text-red-600 bg-red-50';
    if (type === 'supabase' && success) return 'text-green-600 bg-green-50';
    if (type === 'base64') return 'text-blue-600 bg-blue-50';
    if (success) return 'text-green-600 bg-green-50';
    return 'text-red-600 bg-red-50';
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'supabase': return <Database className="h-4 w-4" />;
      case 'base64': return <HardDrive className="h-4 w-4" />;
      case 'placeholder': return <AlertCircle className="h-4 w-4" />;
      case 'external': return <Globe className="h-4 w-4" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Image Verification Tool</h2>
              <p className="text-gray-600 mt-1">
                Verify all product images are loading correctly from Supabase
              </p>
            </div>
            <button
              onClick={runVerification}
              disabled={isVerifying}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Verifying...' : 'Re-verify'}
            </button>
          </div>
        </div>

        {/* Summary */}
        {summary.total && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Summary</h3>
            
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Images</p>
                    <p className="text-2xl font-bold text-blue-900">{summary.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Working</p>
                    <p className="text-2xl font-bold text-green-900">{summary.successful}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-600">Failed</p>
                    <p className="text-2xl font-bold text-red-900">{summary.failed}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Type Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Image Sources</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Supabase</span>
                  </div>
                  <span className="font-bold text-green-600">{summary.typeCount.supabase}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HardDrive className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Base64</span>
                  </div>
                  <span className="font-bold text-blue-600">{summary.typeCount.base64}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm">Placeholder</span>
                  </div>
                  <span className="font-bold text-red-600">{summary.typeCount.placeholder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm">External</span>
                  </div>
                  <span className="font-bold text-yellow-600">{summary.typeCount.external + summary.typeCount.unsplash}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Results */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
          
          {isVerifying ? (
            <div className="text-center py-8">
              <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin mb-2" />
              <p className="text-gray-600">Verifying images...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(verificationResults).map(([productId, result]) => (
                <div key={productId} className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.type === 'placeholder' 
                    ? 'border-red-200 bg-red-50' 
                    : result.success 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{result.productName}</p>
                      <p className="text-sm text-gray-600">{result.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.type, result.success)}`}>
                      {getTypeIcon(result.type)}
                      <span className="ml-1 capitalize">{result.type}</span>
                    </div>
                    
                    {result.imageUrl && (
                      <button
                        onClick={() => window.open(result.imageUrl, '_blank')}
                        className="p-1 text-gray-400 hover:text-blue-500"
                        title="Open image"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {summary.typeCount && summary.typeCount.placeholder > 0 && (
          <div className="border-t border-gray-200 p-6 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Action Required</h3>
            <p className="text-red-700 mb-3">
              {summary.typeCount.placeholder} products are still using placeholder images. 
              These should be replaced with Supabase images.
            </p>
            <button
              onClick={() => window.open('/auto-upload-images', '_blank')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Upload Real Images
            </button>
          </div>
        )}

        {/* Success Message */}
        {summary.typeCount && summary.typeCount.placeholder === 0 && summary.failed === 0 && (
          <div className="border-t border-gray-200 p-6 bg-green-50">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <h3 className="font-semibold text-green-900">✅ All Images Working Perfectly!</h3>
                <p className="text-sm text-green-700 mt-1">
                  All product images are loading correctly from Supabase or hardcoded fallbacks. 
                  No placeholder images detected.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageVerificationTool;
