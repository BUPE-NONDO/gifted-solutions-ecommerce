import React, { useState, useEffect } from 'react';
import hybridDb from '../services/hybridDatabase';
import supabaseService from '../services/supabase';

/**
 * Database Test Component
 * Tests both Firebase and Supabase databases
 */
const DatabaseTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState('firebase');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    runDatabaseTests();
  }, []);

  const runDatabaseTests = async () => {
    setIsLoading(true);
    try {
      console.log('Running database tests...');
      const results = await hybridDb.testDatabases();
      setTestResults(results);
      console.log('Database test results:', results);
    } catch (error) {
      console.error('Database tests failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchProvider = async (provider) => {
    setIsLoading(true);
    try {
      hybridDb.setDatabaseProvider(provider);
      setCurrentProvider(provider);
      
      // Fetch products from the selected provider
      const fetchedProducts = await hybridDb.getProducts();
      setProducts(fetchedProducts);
      
      console.log(`Switched to ${provider}, found ${fetchedProducts.length} products`);
    } catch (error) {
      console.error(`Error switching to ${provider}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    try {
      console.log('Testing Supabase connection...');
      
      // Test storage
      const testUrl = supabaseService.getPublicUrl('test/sample.jpg');
      console.log('Supabase storage URL:', testUrl);
      
      // Test database
      const supabaseProducts = await supabaseService.getProducts();
      console.log('Supabase products:', supabaseProducts);
      
      alert(`Supabase test successful! Found ${supabaseProducts.length} products`);
    } catch (error) {
      console.error('Supabase test failed:', error);
      alert(`Supabase test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const migrateData = async () => {
    if (!confirm('This will migrate all data from Firebase to Supabase. Continue?')) {
      return;
    }

    setIsLoading(true);
    try {
      await hybridDb.migrateToSupabase();
      alert('Migration completed successfully!');
      await runDatabaseTests();
    } catch (error) {
      console.error('Migration failed:', error);
      alert(`Migration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔄 Hybrid Database Test
      </h2>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">Testing databases...</span>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Firebase Results */}
          <div className={`p-4 rounded border-2 ${
            testResults.firebase.status === 'working' 
              ? 'border-green-300 bg-green-50' 
              : 'border-red-300 bg-red-50'
          }`}>
            <h3 className="font-bold text-lg mb-2 flex items-center">
              🔥 Firebase Firestore
              {testResults.firebase.status === 'working' ? (
                <span className="ml-2 text-green-600">✅</span>
              ) : (
                <span className="ml-2 text-red-600">❌</span>
              )}
            </h3>
            <p className="text-sm">
              <strong>Status:</strong> {testResults.firebase.status}
            </p>
            <p className="text-sm">
              <strong>Products:</strong> {testResults.firebase.products}
            </p>
            {testResults.firebase.error && (
              <p className="text-sm text-red-600">
                <strong>Error:</strong> {testResults.firebase.error}
              </p>
            )}
          </div>

          {/* Supabase Results */}
          <div className={`p-4 rounded border-2 ${
            testResults.supabase.status === 'working' 
              ? 'border-green-300 bg-green-50' 
              : 'border-red-300 bg-red-50'
          }`}>
            <h3 className="font-bold text-lg mb-2 flex items-center">
              🚀 Supabase PostgreSQL
              {testResults.supabase.status === 'working' ? (
                <span className="ml-2 text-green-600">✅</span>
              ) : (
                <span className="ml-2 text-red-600">❌</span>
              )}
            </h3>
            <p className="text-sm">
              <strong>Status:</strong> {testResults.supabase.status}
            </p>
            <p className="text-sm">
              <strong>Products:</strong> {testResults.supabase.products}
            </p>
            {testResults.supabase.error && (
              <p className="text-sm text-red-600">
                <strong>Error:</strong> {testResults.supabase.error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Provider Switcher */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-3">Current Database Provider: {currentProvider}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => switchProvider('firebase')}
            disabled={isLoading}
            className={`px-4 py-2 rounded font-medium ${
              currentProvider === 'firebase'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔥 Use Firebase
          </button>
          <button
            onClick={() => switchProvider('supabase')}
            disabled={isLoading}
            className={`px-4 py-2 rounded font-medium ${
              currentProvider === 'supabase'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🚀 Use Supabase
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={runDatabaseTests}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          🧪 Run Tests
        </button>
        <button
          onClick={testSupabaseConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          🔗 Test Supabase
        </button>
        <button
          onClick={migrateData}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          🔄 Migrate to Supabase
        </button>
      </div>

      {/* Products Display */}
      {products.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3">
            Products from {currentProvider} ({products.length} items)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
            {products.slice(0, 6).map((product, index) => (
              <div key={product.id || index} className="p-3 border rounded bg-gray-50">
                <h4 className="font-medium text-sm">{product.name || 'Unnamed Product'}</h4>
                <p className="text-xs text-gray-600">
                  Price: {product.price || 'N/A'}
                </p>
                <p className="text-xs text-gray-600">
                  Category: {product.category || 'N/A'}
                </p>
              </div>
            ))}
          </div>
          {products.length > 6 && (
            <p className="text-sm text-gray-600 mt-2">
              ... and {products.length - 6} more products
            </p>
          )}
        </div>
      )}

      {/* Setup Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
        <h3 className="font-bold mb-2">📋 Setup Instructions</h3>
        <ol className="text-sm space-y-1">
          <li>1. <strong>Supabase Schema:</strong> Run the SQL in <code>supabase-schema.sql</code></li>
          <li>2. <strong>Storage Bucket:</strong> Create "product-images" bucket in Supabase</li>
          <li>3. <strong>Test Connection:</strong> Click "Test Supabase" button</li>
          <li>4. <strong>Migration:</strong> Use "Migrate to Supabase" when ready</li>
        </ol>
      </div>
    </div>
  );
};

export default DatabaseTest;
