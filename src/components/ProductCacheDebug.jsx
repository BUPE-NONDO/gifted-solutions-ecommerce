import React from 'react';
import { RefreshCw, Trash2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const ProductCacheDebug = () => {
  const { 
    products, 
    refreshProducts, 
    clearProductCache, 
    lastUpdated 
  } = useProducts();

  const handleRefresh = async () => {
    console.log('🔄 Manually refreshing products...');
    await refreshProducts();
    window.location.reload(); // Force page reload to see changes
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the product cache? This will reset all image assignments.')) {
      clearProductCache();
      window.location.reload(); // Force page reload
    }
  };

  const handleForceReload = () => {
    if (window.confirm('Force reload the entire page to refresh all components?')) {
      window.location.reload(true); // Hard reload
    }
  };

  // Count products with updated images (non-default images)
  const productsWithUpdatedImages = products.filter(p => 
    p.image && p.image.includes('supabase.co')
  ).length;

  const productsWithDefaultImages = products.filter(p => 
    !p.image || !p.image.includes('supabase.co')
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Database className="mr-2" size={20} />
        Product Cache Debug Tools
      </h3>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{products.length}</div>
          <div className="text-sm text-blue-700">Total Products</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{productsWithUpdatedImages}</div>
          <div className="text-sm text-green-700">With Supabase Images</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{productsWithDefaultImages}</div>
          <div className="text-sm text-orange-700">With Default Images</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-sm text-purple-700">Last Updated</div>
          <div className="text-xs text-purple-600">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        {productsWithUpdatedImages > 0 ? (
          <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="mr-2" size={16} />
            <span className="text-sm">
              {productsWithUpdatedImages} products have been updated with Supabase images
            </span>
          </div>
        ) : (
          <div className="flex items-center text-orange-700 bg-orange-50 p-3 rounded-lg">
            <AlertCircle className="mr-2" size={16} />
            <span className="text-sm">
              No products have Supabase images assigned yet
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
        >
          <RefreshCw className="mr-2" size={16} />
          Refresh Products
        </button>

        <button
          onClick={handleForceReload}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
        >
          <RefreshCw className="mr-2" size={16} />
          Force Page Reload
        </button>

        <button
          onClick={handleClearCache}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
        >
          <Trash2 className="mr-2" size={16} />
          Clear Cache & Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Troubleshooting Steps:</h4>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>If images aren't showing on the main site, click "Force Page Reload"</li>
          <li>If that doesn't work, try "Refresh Products" then reload the page</li>
          <li>As a last resort, use "Clear Cache & Reset" to start fresh</li>
          <li>After clearing cache, you'll need to reassign images in the Image Manager</li>
        </ol>
      </div>

      {/* Recent Products Preview */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Recent Product Updates:</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {products.slice(0, 5).map(product => (
            <div key={product.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
              <img
                src={product.image}
                alt={product.name}
                className="w-8 h-8 object-cover rounded"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/32x32?text=?';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">
                  {product.image?.includes('supabase.co') ? '✅ Supabase' : '❌ Default'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCacheDebug;
