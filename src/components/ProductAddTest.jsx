import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const ProductAddTest = () => {
  const [testProduct, setTestProduct] = useState({
    name: 'Test Product',
    description: 'This is a test product',
    price: '100',
    category: 'Electronics',
    image: '',
    inStock: true,
    featured: false
  });
  const [isAdding, setIsAdding] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testAddProduct = async () => {
    setIsAdding(true);
    setResult(null);
    setError(null);

    try {
      console.log('🧪 Testing product addition...');
      
      // Import Supabase service
      const { default: supabaseService } = await import('../services/supabase');
      
      // Prepare test product data
      const productData = {
        name: `${testProduct.name} ${Date.now()}`,
        description: testProduct.description,
        price: testProduct.price.startsWith('K') ? testProduct.price : `K${testProduct.price}`,
        category: testProduct.category,
        image: testProduct.image,
        inStock: testProduct.inStock,
        featured: testProduct.featured
      };

      console.log('📝 Test product data:', productData);

      // Add product to Supabase
      const addedProduct = await supabaseService.addProduct(productData);
      
      console.log('✅ Test product added successfully:', addedProduct);
      setResult(addedProduct);

    } catch (error) {
      console.error('❌ Test failed:', error);
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Addition Test</h3>
        <button
          onClick={clearResults}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear Results
        </button>
      </div>

      {/* Test Product Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={testProduct.name}
            onChange={(e) => setTestProduct(prev => ({ ...prev, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="text"
            value={testProduct.price}
            onChange={(e) => setTestProduct(prev => ({ ...prev, price: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={testProduct.category}
            onChange={(e) => setTestProduct(prev => ({ ...prev, category: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            value={testProduct.image}
            onChange={(e) => setTestProduct(prev => ({ ...prev, image: e.target.value }))}
            placeholder="Optional image URL"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={testProduct.description}
            onChange={(e) => setTestProduct(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={testProduct.inStock}
              onChange={(e) => setTestProduct(prev => ({ ...prev, inStock: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">In Stock</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={testProduct.featured}
              onChange={(e) => setTestProduct(prev => ({ ...prev, featured: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>
      </div>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={testAddProduct}
          disabled={isAdding || !testProduct.name || !testProduct.price}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
        >
          {isAdding ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {isAdding ? 'Testing...' : 'Test Add Product'}
        </button>
      </div>

      {/* Results */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h4 className="font-medium text-red-800">Test Failed</h4>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-green-800">Test Successful!</h4>
          </div>
          <div className="text-sm text-green-700">
            <p><strong>Product ID:</strong> {result.id}</p>
            <p><strong>Name:</strong> {result.name}</p>
            <p><strong>Price:</strong> {result.price}</p>
            <p><strong>Category:</strong> {result.category}</p>
            <p><strong>Created:</strong> {new Date(result.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 mb-2">Test Instructions:</h5>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Fill in the test product details above</li>
          <li>2. Click "Test Add Product" to test the Supabase integration</li>
          <li>3. Check the browser console for detailed logs</li>
          <li>4. If successful, the product will be added to your Supabase database</li>
          <li>5. Check the main website to see if it appears immediately</li>
        </ol>
      </div>
    </div>
  );
};

export default ProductAddTest;
