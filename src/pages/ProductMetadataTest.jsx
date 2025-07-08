import { useState, useEffect } from 'react';
import {
  Database,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Tag,
  Star,
  BarChart3
} from 'lucide-react';
import { setupProductMetadata } from '../scripts/setupProductMetadata';
import productMetadataService from '../services/productMetadataService';

const ProductMetadataTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [setupResult, setSetupResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsData, productsData, categoriesData] = await Promise.all([
        productMetadataService.getProductStats(),
        productMetadataService.getProducts({ limit: 5 }),
        productMetadataService.getCategories()
      ]);
      
      setStats(statsData);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSetup = async () => {
    setIsRunning(true);
    setSetupResult(null);
    
    try {
      console.log('🚀 Running Product Metadata Setup...');
      const result = await setupProductMetadata();
      setSetupResult(result);
      
      if (result.success) {
        // Reload stats after successful setup
        await loadStats();
      }
    } catch (error) {
      console.error('Setup error:', error);
      setSetupResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testOperations = [
    {
      name: 'Create Tables',
      description: 'Creates product_metadata, product_categories, and product_reviews tables',
      status: 'pending'
    },
    {
      name: 'Sample Categories',
      description: 'Creates 6 sample product categories',
      status: 'pending'
    },
    {
      name: 'Sample Products',
      description: 'Creates 5 sample products with full metadata',
      status: 'pending'
    },
    {
      name: 'Verify Setup',
      description: 'Verifies all data was created successfully',
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Metadata System Test</h1>
                <p className="text-gray-600">Test and setup the comprehensive product metadata system</p>
              </div>
            </div>
            
            <button
              onClick={handleRunSetup}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Running Setup...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Run Setup</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Setup Process */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Setup Process</h2>
            
            <div className="space-y-4">
              {testOperations.map((operation, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {isRunning ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    ) : setupResult?.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : setupResult?.success === false ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{operation.name}</h3>
                    <p className="text-sm text-gray-600">{operation.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Setup Result */}
            {setupResult && (
              <div className={`mt-6 p-4 rounded-lg ${
                setupResult.success
                  ? 'bg-green-50 border border-green-200'
                  : setupResult.manualSetup
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {setupResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : setupResult.manualSetup ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <h3 className={`font-medium ${
                    setupResult.success
                      ? 'text-green-900'
                      : setupResult.manualSetup
                      ? 'text-yellow-900'
                      : 'text-red-900'
                  }`}>
                    {setupResult.success
                      ? 'Setup Completed Successfully!'
                      : setupResult.manualSetup
                      ? 'Manual Database Setup Required'
                      : 'Setup Failed'
                    }
                  </h3>
                </div>

                {setupResult.success && setupResult.stats && (
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Products Created:</span>
                      <span className="font-medium ml-2">{setupResult.stats.products}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Categories Created:</span>
                      <span className="font-medium ml-2">{setupResult.stats.categories}</span>
                    </div>
                    <div>
                      <span className="text-green-700">In Stock:</span>
                      <span className="font-medium ml-2">{setupResult.stats.inStock}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Featured:</span>
                      <span className="font-medium ml-2">{setupResult.stats.featured}</span>
                    </div>
                  </div>
                )}

                {setupResult.manualSetup && (
                  <div className="mt-3">
                    <p className="text-sm text-yellow-700 mb-3">
                      The database tables need to be created manually through Supabase SQL Editor.
                    </p>
                    <a
                      href="/manual-database-setup"
                      className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Go to Manual Setup Guide
                    </a>
                  </div>
                )}

                {!setupResult.success && !setupResult.manualSetup && (
                  <p className="mt-2 text-sm text-red-700">{setupResult.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Current Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Statistics</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading statistics...</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center">
                      <Package className="h-6 w-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Total Products</p>
                        <p className="text-xl font-bold text-blue-900">{stats.total}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">In Stock</p>
                        <p className="text-xl font-bold text-green-900">{stats.in_stock}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center">
                      <Star className="h-6 w-6 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-600">Featured</p>
                        <p className="text-xl font-bold text-yellow-900">{stats.featured}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center">
                      <Tag className="h-6 w-6 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Categories</p>
                        <p className="text-xl font-bold text-purple-900">{categories.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Products */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Products</h3>
                  <div className="space-y-2">
                    {products.length > 0 ? (
                      products.map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{product.currency}{product.price}</p>
                            <p className={`text-sm ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                              {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No products found. Run setup to create sample products.
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {category.name}
                        </span>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 w-full">
                        No categories found. Run setup to create sample categories.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Unable to load statistics</p>
                <button
                  onClick={loadStats}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/product-metadata-manager"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Metadata Manager</h3>
                  <p className="text-sm text-blue-700">Full CRUD interface</p>
                </div>
              </div>
            </a>
            
            <a
              href="/super-admin"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">Super Admin</h3>
                  <p className="text-sm text-green-700">Product management</p>
                </div>
              </div>
            </a>
            
            <a
              href="/shop"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-medium text-purple-900">Shop Page</h3>
                  <p className="text-sm text-purple-700">View products</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMetadataTest;
