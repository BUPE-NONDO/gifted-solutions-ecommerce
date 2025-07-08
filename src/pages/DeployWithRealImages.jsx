import React, { useState, useEffect } from 'react';
import { Rocket, Download, Check, AlertCircle, Globe, Image as ImageIcon } from 'lucide-react';
import { updateAllProductsWithRealImages, generateUpdatedProductDataWithRealImages } from '../utils/realProductImages';
import { products } from '../data/newProducts';

const DeployWithRealImages = () => {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState([]);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [deploymentReady, setDeploymentReady] = useState(false);

  const handleDeploymentUpdate = async () => {
    setUpdating(true);
    setResults([]);
    setProgress({ overall: { current: 0, total: products.length } });

    try {
      console.log('🚀 Starting deployment preparation with real images...');
      
      const results = await updateAllProductsWithRealImages(products, (progressData) => {
        setProgress(progressData);
      });

      setResults(results);
      
      // Generate updated product data
      const newProductData = generateUpdatedProductDataWithRealImages(products, results);
      setUpdatedProducts(newProductData);
      
      // Check if deployment is ready
      const successfulUpdates = results.filter(r => r.success).length;
      const deploymentThreshold = Math.floor(products.length * 0.8); // 80% success rate
      
      if (successfulUpdates >= deploymentThreshold) {
        setDeploymentReady(true);
        console.log('✅ Deployment ready! Successfully updated', successfulUpdates, 'products');
      }
      
    } catch (error) {
      console.error('❌ Deployment preparation failed:', error);
    } finally {
      setUpdating(false);
      setProgress(null);
    }
  };

  const downloadDeploymentFiles = () => {
    const successfulProducts = updatedProducts.filter(product => {
      const result = results.find(r => r.productId === product.id);
      return result && result.success;
    });

    // Generate updated products.js file
    const productsFileContent = `export const products = ${JSON.stringify(successfulProducts, null, 2)};`;
    
    // Create deployment package
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      successfulUpdates: successfulProducts.length,
      failedUpdates: products.length - successfulProducts.length,
      deploymentReady: deploymentReady,
      contactInfo: {
        phone: "0961288156 | 0779421717",
        email: "giftedsolutions20@gmail.com",
        address: "Lusaka, Chalala near ICU"
      },
      instructions: [
        "1. Replace src/data/products.js with the downloaded products.js file",
        "2. Run 'npm run build' to create production build",
        "3. Deploy the 'dist' folder to your hosting platform",
        "4. All images are now stored in Supabase and will load automatically"
      ]
    };

    const deploymentFileContent = JSON.stringify(deploymentInfo, null, 2);
    
    // Download products.js
    const productsBlob = new Blob([productsFileContent], { type: 'text/javascript' });
    const productsUrl = URL.createObjectURL(productsBlob);
    const productsLink = document.createElement('a');
    productsLink.href = productsUrl;
    productsLink.download = 'products.js';
    document.body.appendChild(productsLink);
    productsLink.click();
    document.body.removeChild(productsLink);
    URL.revokeObjectURL(productsUrl);
    
    // Download deployment info
    const deploymentBlob = new Blob([deploymentFileContent], { type: 'application/json' });
    const deploymentUrl = URL.createObjectURL(deploymentBlob);
    const deploymentLink = document.createElement('a');
    deploymentLink.href = deploymentUrl;
    deploymentLink.download = 'deployment-info.json';
    document.body.appendChild(deploymentLink);
    deploymentLink.click();
    document.body.removeChild(deploymentLink);
    URL.revokeObjectURL(deploymentUrl);
  };

  const getResultForProduct = (productId) => {
    return results.find(r => r.productId === productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🚀 Deploy with Real Product Images
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Automatically download real product images and prepare for deployment
            </p>
            <p className="text-sm text-blue-600">
              Sources: Arduino Official, Espressif, Components101, and reliable electronics retailers
            </p>
          </div>

          {/* Main Action */}
          <div className="text-center mb-8">
            <button
              onClick={handleDeploymentUpdate}
              disabled={updating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {updating ? (
                <span className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Downloading Real Images...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Download className="h-6 w-6" />
                  Download Real Images & Prepare Deployment
                </span>
              )}
            </button>
          </div>

          {/* Progress */}
          {progress && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Downloading Real Product Images
              </h3>
              
              {progress.overall && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-blue-700 mb-2">
                    <span>Overall Progress</span>
                    <span>{progress.overall.current}/{progress.overall.total} ({progress.overall.percentage || 0}%)</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
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

          {/* Results */}
          {results.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {results.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Successfully Downloaded</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {results.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-red-700 font-medium">Failed Downloads</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round((results.filter(r => r.success).length / results.length) * 100)}%
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Success Rate</div>
                </div>
              </div>

              {/* Deployment Status */}
              {deploymentReady ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-green-800">🎉 Ready for Deployment!</h3>
                      <p className="text-green-700">All images have been successfully downloaded and uploaded to Supabase</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={downloadDeploymentFiles}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download Deployment Files
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Deployment Status</h3>
                      <p className="text-yellow-700">Some images failed to download. You can still deploy with the successful ones.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Preview */}
          {results.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Image Updates</h3>
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {products.slice(0, 10).map(product => {
                  const result = getResultForProduct(product.id);
                  const updatedProduct = updatedProducts.find(p => p.id === product.id);

                  return (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 flex-shrink-0">
                        {result && result.success ? (
                          <img
                            src={result.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover rounded border-2 border-green-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category} - {product.price}</p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {result && result.success ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : result && !result.success ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <div className="h-5 w-5 bg-gray-300 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {products.length > 10 && (
                  <div className="text-center text-gray-500 text-sm py-2">
                    ... and {products.length - 10} more products
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deployment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Deployment Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Click "Download Real Images & Prepare Deployment" to start the process</li>
              <li>Wait for all images to be downloaded and uploaded to Supabase</li>
              <li>Download the deployment files (products.js and deployment-info.json)</li>
              <li>Replace your current src/data/products.js with the downloaded file</li>
              <li>Run <code className="bg-blue-100 px-2 py-1 rounded">npm run build</code> to create production build</li>
              <li>Deploy the 'dist' folder to your hosting platform (Netlify, Vercel, etc.)</li>
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

export default DeployWithRealImages;
