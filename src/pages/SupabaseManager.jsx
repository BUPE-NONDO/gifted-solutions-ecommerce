import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Upload,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Trash2,
  Image
} from 'lucide-react';
import {
  seedAllProductsToSupabase,
  seedTestProducts,
  clearSupabaseProducts
} from '../utils/seedSupabase';
import supabaseService from '../services/supabase';
import SupabaseImageViewer from '../components/SupabaseImageViewer';

const SupabaseManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('database'); // database, images
  const [seedingStatus, setSeedingStatus] = useState('idle'); // idle, running, completed, error
  const [seedingResults, setSeedingResults] = useState(null);
  const [existingProducts, setExistingProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check existing products in Supabase
  const checkExistingProducts = async () => {
    setLoading(true);
    try {
      const products = await supabaseService.getProducts();
      setExistingProducts(products);
      console.log(`Found ${products.length} existing products in Supabase`);
    } catch (error) {
      console.error('Error checking existing products:', error);
      setExistingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Run test seeding (first 5 products)
  const runTestSeeding = async () => {
    setSeedingStatus('running');
    setSeedingResults(null);

    try {
      const results = await seedTestProducts();
      setSeedingResults(results);
      setSeedingStatus('completed');

      // Refresh existing products list
      await checkExistingProducts();
    } catch (error) {
      console.error('Test seeding failed:', error);
      setSeedingStatus('error');
      setSeedingResults({ error: error.message });
    }
  };

  // Run full seeding
  const runFullSeeding = async () => {
    const confirmed = window.confirm(
      'This will seed all 50 products to Supabase database. ' +
      'This process may take several minutes. Continue?'
    );

    if (!confirmed) return;

    setSeedingStatus('running');
    setSeedingResults(null);

    try {
      const results = await seedAllProductsToSupabase();
      setSeedingResults(results);
      setSeedingStatus('completed');

      // Refresh existing products list
      await checkExistingProducts();
    } catch (error) {
      console.error('Full seeding failed:', error);
      setSeedingStatus('error');
      setSeedingResults({ error: error.message });
    }
  };

  // Clear all products from Supabase
  const clearSupabaseProductsHandler = async () => {
    const confirmed = window.confirm(
      'This will DELETE ALL products from Supabase. This action cannot be undone. Continue?'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      await clearSupabaseProducts();

      console.log('All products deleted from Supabase');
      setExistingProducts([]);
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Error deleting products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkExistingProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Manager</h1>
            <p className="text-gray-600">
              Manage products in Supabase database and storage
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            <button
              onClick={() => setActiveTab('database')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                activeTab === 'database'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database className="w-4 h-4 mr-2" />
              Database
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                activeTab === 'images'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Image className="w-4 h-4 mr-2" />
              Images
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'database' && (
            <>
              {/* Current Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Current Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Supabase Products</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : existingProducts.length}
                  </span>
                  <span className="text-gray-600 ml-2">products</span>
                  <button
                    onClick={checkExistingProducts}
                    disabled={loading}
                    className="ml-auto p-1 text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Hardcoded Products</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-600">50</span>
                  <span className="text-gray-600 ml-2">products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seeding Actions */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Seeding Options</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={runTestSeeding}
                  disabled={seedingStatus === 'running'}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Test Seeding (5 products)
                </button>

                <button
                  onClick={runFullSeeding}
                  disabled={seedingStatus === 'running'}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Full Seeding (50 products)
                </button>
              </div>

              {existingProducts.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={clearSupabaseProductsHandler}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Supabase Products
                  </button>
                </div>
              )}
            </div>

            {/* Seeding Status */}
            {seedingStatus === 'running' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin mr-3" />
                  <span className="text-yellow-800 font-medium">Seeding in progress...</span>
                </div>
                <p className="text-yellow-700 mt-2">
                  Please wait while products are being seeded to Supabase. This may take several minutes.
                </p>
              </div>
            )}

            {/* Seeding Results */}
            {seedingResults && seedingStatus === 'completed' && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Seeding Results
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {seedingResults.successful?.length || 0}
                    </div>
                    <div className="text-green-800">Successful</div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {seedingResults.failed?.length || 0}
                    </div>
                    <div className="text-red-800">Failed</div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {seedingResults.total || 0}
                    </div>
                    <div className="text-blue-800">Total</div>
                  </div>
                </div>

                {seedingResults.failed?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Failed Products:</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      {seedingResults.failed.map((failure, index) => (
                        <li key={index}>• {failure.name}: {failure.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {seedingStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-3" />
                  <span className="text-red-800 font-medium">Seeding Failed</span>
                </div>
                <p className="text-red-700 mt-2">
                  {seedingResults?.error || 'An unknown error occurred during seeding.'}
                </p>
              </div>
            )}
          </div>
            </>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <SupabaseImageViewer />
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => navigate('/admin-mode')}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back to Admin
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
            >
              View Website
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseManager;
