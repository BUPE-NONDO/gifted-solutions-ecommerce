import React, { useState, useEffect } from 'react';
import { Wand2, Upload, RefreshCw, Check, X, Eye, AlertCircle, Download } from 'lucide-react';
import { updateAllProductsWithGeneratedImages, generateUpdatedProductData } from '../utils/autoUpdateImages';
import { products } from '../data/newProducts';

const AutoUpdateImages = () => {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState([]);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [showPreview, setShowPreview] = useState(true);

  const handleAutoUpdateAll = async () => {
    setUpdating(true);
    setResults([]);
    setProgress({ overall: { current: 0, total: products.length } });

    try {
      console.log('Starting automatic image generation for all products...');
      
      const results = await updateAllProductsWithGeneratedImages(products, (progressData) => {
        setProgress(progressData);
      });

      setResults(results);
      
      // Generate updated product data
      const newProductData = generateUpdatedProductData(products, results);
      setUpdatedProducts(newProductData);
      
      console.log('Automatic image generation completed!');
    } catch (error) {
      console.error('Auto update failed:', error);
    } finally {
      setUpdating(false);
      setProgress(null);
    }
  };

  const downloadUpdatedProductsFile = () => {
    const successfulProducts = updatedProducts.filter(product => {
      const result = results.find(r => r.productId === product.id);
      return result && result.success;
    });

    const fileContent = `export const products = ${JSON.stringify(successfulProducts, null, 2)};`;
    
    const blob = new Blob([fileContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'updated-products.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getResultForProduct = (productId) => {
    return results.find(r => r.productId === productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
            🎨 Auto-Generate Unique Product Images
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">
              This tool automatically generates unique, colorful images for each product and uploads them to Supabase
            </p>
            <p className="text-sm text-blue-600">
              Each image is uniquely generated based on product ID, category, and name
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleAutoUpdateAll}
              disabled={updating}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg flex items-center gap-3 font-medium text-lg"
            >
              <Wand2 className="h-6 w-6" />
              {updating ? 'Generating Images...' : `Auto-Generate All Images (${products.length} products)`}
            </button>

            {results.length > 0 && (
              <button
                onClick={downloadUpdatedProductsFile}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg flex items-center gap-2 font-medium"
              >
                <Download className="h-5 w-5" />
                Download Updated Products File
              </button>
            )}

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg flex items-center gap-2 font-medium"
            >
              <Eye className="h-5 w-5" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {/* Progress */}
          {progress && (
            <div className="mb-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-800 mb-3">Auto-Generation Progress</h3>
              
              {progress.overall && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-purple-700 mb-2">
                    <span>Overall Progress</span>
                    <span>{progress.overall.current}/{progress.overall.total} ({progress.overall.percentage || 0}%)</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-3">
                    <div 
                      className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress.overall.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {progress.current && (
                <div className="text-sm text-purple-700">
                  <span className="font-medium">Current:</span> Product {progress.current} - {progress.status}
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {results.length > 0 && (
            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Generation Results</h3>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {results.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Successful</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {results.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-red-700 font-medium">Failed</div>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.length}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Total</div>
                </div>
              </div>
            </div>
          )}

          {/* Product List */}
          {showPreview && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Products with Auto-Generated Images</h2>
              
              <div className="grid gap-4">
                {products.map(product => {
                  const result = getResultForProduct(product.id);
                  const updatedProduct = updatedProducts.find(p => p.id === product.id);

                  return (
                    <div key={product.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start space-x-4">
                        {/* Current Image */}
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded border"
                            onError={(e) => {
                              e.target.style.border = '2px solid red';
                            }}
                          />
                          <div className="text-xs text-gray-500 mt-1 text-center">Current</div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center w-8 h-24">
                          <RefreshCw className="h-6 w-6 text-gray-400" />
                        </div>

                        {/* New Generated Image */}
                        <div className="w-24 h-24 flex-shrink-0">
                          {result && result.success ? (
                            <>
                              <img
                                src={result.imageUrl}
                                alt={`Generated ${product.name}`}
                                className="w-full h-full object-cover rounded border border-green-500"
                              />
                              <div className="text-xs text-green-600 mt-1 text-center font-medium">Generated</div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center">
                              <Wand2 className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-sm text-blue-600 font-medium">{product.price}</p>
                          <p className="text-xs text-gray-500 mt-1">Product ID: {product.id}</p>
                          
                          {result && (
                            <div className={`mt-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                              {result.success ? (
                                <span className="flex items-center gap-1">
                                  <Check className="h-4 w-4" />
                                  Image generated & uploaded successfully
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Click "Auto-Generate All Images" to start the process</li>
              <li>The system generates a unique image for each product using canvas</li>
              <li>Each image is automatically uploaded to Supabase storage</li>
              <li>Download the updated products file to replace your current data</li>
              <li>All images will be unique and properly sized (400x400px)</li>
            </ol>
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

export default AutoUpdateImages;
