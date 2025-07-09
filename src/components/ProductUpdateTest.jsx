// Test component to verify product update functionality
import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';

const ProductUpdateTest = () => {
  const { products, updateProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [testData, setTestData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState(null);

  // Set test data when product is selected
  useEffect(() => {
    if (selectedProduct) {
      setTestData({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        price: selectedProduct.price || '',
        category: selectedProduct.category || ''
      });
    }
  }, [selectedProduct]);

  const handleTestUpdate = async () => {
    if (!selectedProduct) {
      setResult({ type: 'error', message: 'Please select a product first' });
      return;
    }

    try {
      setUpdating(true);
      setResult(null);

      console.log('🧪 Testing product update...', {
        productId: selectedProduct.id,
        updates: testData
      });

      const updatedProduct = await updateProduct(selectedProduct.id, testData);

      setResult({
        type: 'success',
        message: 'Product updated successfully!',
        data: updatedProduct
      });

      console.log('✅ Update test successful:', updatedProduct);

    } catch (error) {
      console.error('❌ Update test failed:', error);
      setResult({
        type: 'error',
        message: `Update failed: ${error.message}`,
        error: error
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDirectSupabaseTest = async () => {
    if (!selectedProduct) {
      setResult({ type: 'error', message: 'Please select a product first' });
      return;
    }

    try {
      setUpdating(true);
      setResult(null);

      console.log('🧪 Testing direct Supabase update...');

      // Import Supabase service directly
      const { default: supabaseService } = await import('../services/supabase');

      const directResult = await supabaseService.updateProduct(selectedProduct.id, testData);

      setResult({
        type: 'success',
        message: 'Direct Supabase update successful!',
        data: directResult
      });

      console.log('✅ Direct Supabase test successful:', directResult);

    } catch (error) {
      console.error('❌ Direct Supabase test failed:', error);
      setResult({
        type: 'error',
        message: `Direct Supabase update failed: ${error.message}`,
        error: error
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🧪 Product Update Test
      </h2>

      {/* Product Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Product to Test
        </label>
        <select
          value={selectedProduct?.id || ''}
          onChange={(e) => {
            const product = products.find(p => p.id === e.target.value);
            setSelectedProduct(product);
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Choose a product...</option>
          {products.slice(0, 10).map(product => (
            <option key={product.id} value={product.id}>
              {product.name} (ID: {product.id})
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <>
          {/* Current Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Current Product Data</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>ID:</strong> {selectedProduct.id}</div>
              <div><strong>Name:</strong> {selectedProduct.name}</div>
              <div><strong>Price:</strong> {selectedProduct.price}</div>
              <div><strong>Category:</strong> {selectedProduct.category}</div>
              <div className="col-span-2">
                <strong>Description:</strong> {selectedProduct.description}
              </div>
            </div>
          </div>

          {/* Test Data Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={testData.name}
                onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="text"
                value={testData.price}
                onChange={(e) => setTestData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={testData.category}
                onChange={(e) => setTestData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={testData.description}
                onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleTestUpdate}
              disabled={updating}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {updating ? '🔄 Testing...' : '🧪 Test Context Update'}
            </button>
            <button
              onClick={handleDirectSupabaseTest}
              disabled={updating}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {updating ? '🔄 Testing...' : '🔗 Test Direct Supabase'}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className={`rounded-lg p-4 ${
              result.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${
                result.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.type === 'success' ? '✅ Success' : '❌ Error'}
              </h3>
              <p className={`mb-2 ${
                result.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
              {result.data && (
                <div className="bg-white rounded p-3 mt-2">
                  <strong>Returned Data:</strong>
                  <pre className="text-xs mt-1 overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              {result.error && (
                <div className="bg-white rounded p-3 mt-2">
                  <strong>Error Details:</strong>
                  <pre className="text-xs mt-1 overflow-auto text-red-600">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-yellow-800">📝 How to Test:</h4>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-yellow-700">
          <li>Select a product from the dropdown</li>
          <li>Modify the test data fields</li>
          <li>Click "Test Context Update" to test through ProductContext</li>
          <li>Click "Test Direct Supabase" to test direct Supabase call</li>
          <li>Check the console for detailed logs</li>
          <li>Verify the results in the success/error message</li>
        </ol>
      </div>
    </div>
  );
};

export default ProductUpdateTest;
