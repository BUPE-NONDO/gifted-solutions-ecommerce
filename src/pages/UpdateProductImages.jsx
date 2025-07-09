import React, { useState, useEffect } from 'react';
import { Download, Upload, RefreshCw, Check, X, Eye, AlertCircle } from 'lucide-react';
import { updateProductImage, updateAllProductImages, productImageMapping, accurateImageUrls } from '../utils/updateProductImages';
import { products } from '../data/newProducts';

const UpdateProductImages = () => {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize selected products with all products
  useEffect(() => {
    const allProductIds = Object.keys(productImageMapping).map(id => parseInt(id));
    setSelectedProducts(allProductIds);
  }, []);

  const handleUpdateSingle = async (productId) => {
    setUpdating(true);
    setProgress({ current: productId, status: 'updating' });

    try {
      const result = await updateProductImage(productId, (progressData) => {
        setProgress({ current: productId, ...progressData });
      });

      setResults(prev => [...prev, result]);
      setProgress(null);
    } catch (error) {
      console.error('Update failed:', error);
      setResults(prev => [...prev, { success: false, productId, error: error.message }]);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateAll = async () => {
    setUpdating(true);
    setResults([]);
    setProgress({ overall: { current: 0, total: selectedProducts.length } });

    try {
      const results = await updateAllProductImages((progressData) => {
        setProgress(progressData);
      });

      setResults(results);
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setUpdating(false);
      setProgress(null);
    }
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getProductInfo = (productId) => {
    return products.find(p => p.id === productId);
  };

  const getImageKey = (productId) => {
    return productImageMapping[productId];
  };

  const getNewImageUrl = (productId) => {
    const imageKey = productImageMapping[productId];
    return accurateImageUrls[imageKey];
  };

  const getResultForProduct = (productId) => {
    return results.find(r => r.productId === productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🖼️ Update Product Images
          </h1>

          {/* Controls */}
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleUpdateAll}
              disabled={updating || selectedProducts.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
            >
              <Upload className="h-5 w-5" />
              Update Selected ({selectedProducts.length})
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
            >
              <Eye className="h-5 w-5" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>

            <button
              onClick={() => setSelectedProducts(Object.keys(productImageMapping).map(id => parseInt(id)))}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
            >
              <Check className="h-5 w-5" />
              Select All
            </button>

            <button
              onClick={() => setSelectedProducts([])}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
            >
              <X className="h-5 w-5" />
              Select None
            </button>
          </div>

          {/* Progress */}
          {progress && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Update Progress</h3>
              
              {progress.overall && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-blue-700 mb-1">
                    <span>Overall Progress</span>
                    <span>{progress.overall.current}/{progress.overall.total} ({progress.overall.percentage || 0}%)</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.overall.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {progress.current && (
                <div className="text-sm text-blue-700">
                  <span className="font-medium">Current:</span> Product {progress.current} - {progress.status}
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {results.length > 0 && (
            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Update Results</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-100 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="bg-red-100 p-3 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="bg-blue-100 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.length}
                  </div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
              </div>
            </div>
          )}

          {/* Product List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Products to Update</h2>
            
            <div className="grid gap-4">
              {Object.keys(productImageMapping).map(productId => {
                const id = parseInt(productId);
                const product = getProductInfo(id);
                const imageKey = getImageKey(id);
                const newImageUrl = getNewImageUrl(id);
                const result = getResultForProduct(id);
                const isSelected = selectedProducts.includes(id);

                if (!product) return null;

                return (
                  <div key={id} className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleProductToggle(id)}
                        className="mt-2 h-4 w-4 text-blue-600"
                      />

                      {/* Current Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded border"
                          onError={(e) => {
                            e.target.style.border = '2px solid red';
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-1">Current</div>
                      </div>

                      {/* Arrow */}
                      {showPreview && (
                        <>
                          <div className="flex items-center justify-center w-8 h-20">
                            <RefreshCw className="h-6 w-6 text-gray-400" />
                          </div>

                          {/* New Image Preview */}
                          <div className="w-20 h-20 flex-shrink-0">
                            <img
                              src={newImageUrl}
                              alt={`New ${product.name}`}
                              className="w-full h-full object-cover rounded border"
                              onError={(e) => {
                                e.target.style.border = '2px solid red';
                              }}
                            />
                            <div className="text-xs text-gray-500 mt-1">New</div>
                          </div>
                        </>
                      )}

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-sm text-blue-600 font-medium">{product.price}</p>
                        <p className="text-xs text-gray-500 mt-1">Image Key: {imageKey}</p>
                        
                        {result && (
                          <div className={`mt-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                            {result.success ? (
                              <span className="flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                Updated successfully
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                Failed: {result.error}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Individual Update Button */}
                      <button
                        onClick={() => handleUpdateSingle(id)}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        Update
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center pt-8">
            <a 
              href="/" 
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Main Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProductImages;
