import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';

const TestSupabaseOnly = () => {
  const { products, loading, error } = useProducts();
  const [testResults, setTestResults] = useState({
    productsLoaded: false,
    imagesFromSupabase: false,
    noFirebaseErrors: true,
    totalProducts: 0,
    supabaseImageCount: 0
  });

  useEffect(() => {
    if (!loading && products) {
      // Test if products are loaded
      const productsLoaded = products.length > 0;
      
      // Test if images are from Supabase
      const supabaseImages = products.filter(product => 
        product.image && product.image.includes('fotcjsmnerawpqzhldhq.supabase.co')
      );
      
      const imagesFromSupabase = supabaseImages.length > 0;
      
      setTestResults({
        productsLoaded,
        imagesFromSupabase,
        noFirebaseErrors: !error,
        totalProducts: products.length,
        supabaseImageCount: supabaseImages.length
      });
    }
  }, [products, loading, error]);

  const getStatusIcon = (status) => status ? '✅' : '❌';
  const getStatusText = (status) => status ? 'PASS' : 'FAIL';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🧪 Supabase-Only Test Results
          </h1>
          
          <div className="space-y-6">
            {/* Test Results */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Test Results</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="font-medium">Products Loaded</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(testResults.productsLoaded)}
                    <span className={`font-bold ${testResults.productsLoaded ? 'text-green-600' : 'text-red-600'}`}>
                      {getStatusText(testResults.productsLoaded)}
                    </span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="font-medium">Images from Supabase</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(testResults.imagesFromSupabase)}
                    <span className={`font-bold ${testResults.imagesFromSupabase ? 'text-green-600' : 'text-red-600'}`}>
                      {getStatusText(testResults.imagesFromSupabase)}
                    </span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="font-medium">No Firebase Errors</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(testResults.noFirebaseErrors)}
                    <span className={`font-bold ${testResults.noFirebaseErrors ? 'text-green-600' : 'text-red-600'}`}>
                      {getStatusText(testResults.noFirebaseErrors)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">Statistics</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border">
                  <div className="text-2xl font-bold text-blue-600">{testResults.totalProducts}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <div className="text-2xl font-bold text-green-600">{testResults.supabaseImageCount}</div>
                  <div className="text-sm text-gray-600">Supabase Images</div>
                </div>
              </div>
            </div>

            {/* Sample Products */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-800">Sample Products</h2>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 6).map(product => (
                    <div key={product.id} className="bg-white p-4 rounded border">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-2"
                        onError={(e) => {
                          e.target.style.border = '2px solid red';
                          e.target.alt = 'Image failed to load';
                        }}
                      />
                      <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                      <p className="text-green-600 font-bold">{product.price}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.image.includes('supabase.co') ? '✅ Supabase' : '❌ Not Supabase'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-red-800">Errors</h2>
                <div className="bg-white p-4 rounded border border-red-200">
                  <pre className="text-red-600 text-sm">{error}</pre>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="text-center pt-6">
              <a 
                href="/" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Main Site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSupabaseOnly;
