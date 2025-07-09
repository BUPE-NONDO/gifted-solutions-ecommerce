import React, { useState, useEffect } from 'react';
import { RefreshCw, Image as ImageIcon, Check, AlertCircle, Download, Upload, Eye, Settings, Link2, Search, Filter } from 'lucide-react';
import {
  performFullImageSync,
  checkForNewImages,
  suggestProductUpdates,
  applyImageUpdates,
  getCurrentSupabaseImages,
  listSupabaseImages,
  getSupabaseImageUrl,
  suggestProductByImageName
} from '../utils/supabaseImageChecker';
import { products } from '../data/newProducts';
import { useProducts } from '../context/ProductContext';

const CheckSupabaseImages = () => {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [selectedUpdates, setSelectedUpdates] = useState([]);
  const [showPreview, setShowPreview] = useState(true);

  // Manual mode state
  const [manualMode, setManualMode] = useState(false);
  const [allSupabaseImages, setAllSupabaseImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [manualAssignments, setManualAssignments] = useState([]);
  const [imageFilter, setImageFilter] = useState('all'); // 'all', 'assigned', 'unassigned'

  // Get products from context for real-time updates
  const {
    products: contextProducts,
    updateProduct,
    refreshProducts,
    loading: productsLoading
  } = useProducts();

  // Use context products if available, fallback to static products
  const currentProducts = contextProducts.length > 0 ? contextProducts : products;

  const handleFullSync = async () => {
    setLoading(true);
    setSyncResult(null);
    
    try {
      console.log('🔄 Starting full Supabase image sync...');
      const result = await performFullImageSync();
      setSyncResult(result);
      
      if (result.success) {
        console.log('✅ Full sync completed successfully');
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
      setSyncResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyUpdates = async () => {
    if (selectedUpdates.length === 0) {
      alert('Please select at least one update to apply');
      return;
    }

    setLoading(true);
    try {
      const result = await applyImageUpdates(selectedUpdates);
      if (result.success) {
        // Download updated products file
        const blob = new Blob([result.updatedProductsFileContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'updated-products.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`Successfully updated ${result.summary.successfulUpdates} products! Downloaded updated products.js file.`);
      }
    } catch (error) {
      console.error('❌ Apply updates failed:', error);
      alert('Failed to apply updates: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUpdate = (productId, imageUrl) => {
    const updateKey = `${productId}-${imageUrl}`;
    const existingIndex = selectedUpdates.findIndex(u => `${u.productId}-${u.newImageUrl}` === updateKey);
    
    if (existingIndex >= 0) {
      setSelectedUpdates(selectedUpdates.filter((_, index) => index !== existingIndex));
    } else {
      setSelectedUpdates([...selectedUpdates, { productId, newImageUrl: imageUrl }]);
    }
  };

  const isUpdateSelected = (productId, imageUrl) => {
    return selectedUpdates.some(u => u.productId === productId && u.newImageUrl === imageUrl);
  };

  // Manual mode functions
  const loadAllSupabaseImages = async () => {
    setLoading(true);
    try {
      const result = await listSupabaseImages();
      if (result.success) {
        const imagesWithDetails = result.images.map(img => ({
          ...img,
          url: getSupabaseImageUrl(img.name),
          isAssigned: isImageAssignedToProduct(img.name),
          assignedProducts: getAssignedProducts(img.name)
        }));
        setAllSupabaseImages(imagesWithDetails);
        setFilteredImages(imagesWithDetails);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const isImageAssignedToProduct = (imageName) => {
    const imageUrl = getSupabaseImageUrl(imageName);
    return currentProducts.some(product => product.image === imageUrl);
  };

  const getAssignedProducts = (imageName) => {
    const imageUrl = getSupabaseImageUrl(imageName);
    return currentProducts.filter(product => product.image === imageUrl);
  };

  const filterImages = () => {
    let filtered = allSupabaseImages;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.assignedProducts.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply assignment filter
    switch (imageFilter) {
      case 'assigned':
        filtered = filtered.filter(img => img.isAssigned);
        break;
      case 'unassigned':
        filtered = filtered.filter(img => !img.isAssigned);
        break;
      default:
        break;
    }

    setFilteredImages(filtered);
  };

  const addManualAssignment = async (imageName, productId) => {
    const product = currentProducts.find(p => p.id === productId);
    const imageUrl = getSupabaseImageUrl(imageName);

    if (product && updateProduct) {
      try {
        // Update product in real-time database
        const updatedProduct = {
          ...product,
          image: imageUrl // Set as main image
        };

        await updateProduct(productId, updatedProduct);

        // Refresh images to show updated assignment status
        await loadAllSupabaseImages();

        alert(`Successfully assigned ${imageName} to ${product.name}!`);
      } catch (error) {
        console.error('Error assigning image:', error);
        alert('Failed to assign image. Please try again.');
      }
    } else {
      // Fallback to manual assignment queue if no real-time update available
      const assignment = {
        imageName,
        imageUrl,
        productId,
        productName: product.name,
        id: `${imageName}-${productId}-${Date.now()}`
      };

      setManualAssignments(prev => [...prev, assignment]);
    }
  };

  const removeManualAssignment = (assignmentId) => {
    setManualAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  const applyManualAssignments = async () => {
    if (manualAssignments.length === 0) {
      alert('No manual assignments to apply');
      return;
    }

    setLoading(true);
    try {
      const updates = manualAssignments.map(assignment => ({
        productId: assignment.productId,
        newImageUrl: assignment.imageUrl
      }));

      const result = await applyImageUpdates(updates);
      if (result.success) {
        // Download updated products file
        const blob = new Blob([result.updatedProductsFileContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'updated-products-manual.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert(`Successfully applied ${manualAssignments.length} manual assignments! Downloaded updated products.js file.`);
        setManualAssignments([]);
        await loadAllSupabaseImages(); // Refresh
      }
    } catch (error) {
      console.error('Error applying manual assignments:', error);
      alert('Failed to apply assignments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Effects for manual mode
  useEffect(() => {
    if (manualMode) {
      loadAllSupabaseImages();
    }
  }, [manualMode]);

  useEffect(() => {
    if (manualMode) {
      filterImages();
    }
  }, [searchTerm, imageFilter, allSupabaseImages]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
            📸 Check Supabase for New Images
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">
              Scan Supabase storage for new product images and update the website
            </p>
            <p className="text-sm text-blue-600">
              Automatically matches new images to products and suggests updates
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6 flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setManualMode(false)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  !manualMode
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Auto Mode
              </button>
              <button
                onClick={() => setManualMode(true)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  manualMode
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Manual Mode
              </button>
            </div>
          </div>

          {/* Controls */}
          {!manualMode ? (
            <div className="mb-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleFullSync}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg flex items-center gap-3 font-medium text-lg"
              >
                <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Checking Supabase...' : 'Check for New Images'}
              </button>

              {syncResult && syncResult.success && syncResult.suggestions.suggestions.length > 0 && (
                <button
                  onClick={handleApplyUpdates}
                  disabled={loading || selectedUpdates.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg flex items-center gap-2 font-medium"
                >
                  <Upload className="h-5 w-5" />
                  Apply Selected Updates ({selectedUpdates.length})
                </button>
              )}

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg flex items-center gap-2 font-medium"
              >
                <Eye className="h-5 w-5" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>
          ) : (
            <div className="mb-8 space-y-4">
              {/* Manual Mode Controls */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={loadAllSupabaseImages}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Load All Images
                </button>

                {manualAssignments.length > 0 && (
                  <button
                    onClick={applyManualAssignments}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <Link2 className="h-5 w-5" />
                    Apply Assignments ({manualAssignments.length})
                  </button>
                )}
              </div>

              {/* Search and Filter */}
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search images or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={imageFilter}
                  onChange={(e) => setImageFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Images</option>
                  <option value="assigned">Assigned Images</option>
                  <option value="unassigned">Unassigned Images</option>
                </select>
              </div>
            </div>
          )}

          {/* Manual Mode Interface */}
          {manualMode && (
            <div className="space-y-6">
              {/* Manual Assignments Queue */}
              {manualAssignments.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 mb-4">📋 Pending Manual Assignments ({manualAssignments.length})</h3>
                  <div className="space-y-2">
                    {manualAssignments.map(assignment => (
                      <div key={assignment.id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div className="flex items-center gap-3">
                          <img src={assignment.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />
                          <div>
                            <div className="font-medium text-sm">{assignment.imageName}</div>
                            <div className="text-xs text-gray-500">→ {assignment.productName}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeManualAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Grid */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  🖼️ Supabase Images ({filteredImages.length})
                </h3>

                {filteredImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredImages.map(image => (
                      <div key={image.name} className="border rounded-lg p-4 bg-gray-50">
                        <div className="aspect-square mb-3">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover rounded border"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="font-medium text-sm truncate" title={image.name}>
                            {image.name}
                          </div>

                          <div className="text-xs text-gray-500">
                            Size: {image.metadata?.size ? Math.round(image.metadata.size / 1024) + 'KB' : 'Unknown'}
                          </div>

                          {image.isAssigned ? (
                            <div className="text-xs text-green-600 font-medium">
                              ✓ Assigned to: {image.assignedProducts.map(p => p.name).join(', ')}
                            </div>
                          ) : (
                            <div className="text-xs text-orange-600 font-medium">
                              ⚠ Unassigned
                            </div>
                          )}

                          {/* Smart Suggestions */}
                          {(() => {
                            const suggestions = suggestProductByImageName(image.name);
                            return suggestions.length > 0 && (
                              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 mt-1">
                                <div className="font-medium mb-1">💡 Suggested matches:</div>
                                {suggestions.slice(0, 3).map(product => (
                                  <button
                                    key={product.id}
                                    onClick={() => {
                                      addManualAssignment(image.name, product.id);
                                    }}
                                    className="block w-full text-left hover:bg-blue-100 px-1 py-0.5 rounded text-xs"
                                  >
                                    {product.name}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}

                          <div className="pt-2">
                            <select
                              value={selectedProduct}
                              onChange={(e) => setSelectedProduct(e.target.value)}
                              className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select product to assign...</option>
                              {currentProducts.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({product.category})
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                if (selectedProduct) {
                                  addManualAssignment(image.name, selectedProduct);
                                  setSelectedProduct('');
                                }
                              }}
                              disabled={!selectedProduct}
                              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium"
                            >
                              <Link2 className="h-3 w-3 inline mr-1" />
                              Assign to Product
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {loading ? 'Loading images...' : 'No images found matching your criteria'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto Mode Results */}
          {!manualMode && syncResult && (
            <div className="space-y-6">
              {syncResult.success ? (
                <>
                  {/* Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 mb-4">📊 Sync Results Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {syncResult.summary.totalSupabaseImages}
                        </div>
                        <div className="text-sm text-blue-700">Total Images in Supabase</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {syncResult.summary.newUnusedImages}
                        </div>
                        <div className="text-sm text-green-700">New Unused Images</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {syncResult.summary.updateSuggestions}
                        </div>
                        <div className="text-sm text-purple-700">Update Suggestions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {syncResult.summary.highConfidenceMatches}
                        </div>
                        <div className="text-sm text-orange-700">High Confidence Matches</div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {syncResult.suggestions.suggestions.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">🤖 Suggested Image Updates</h3>
                      
                      <div className="space-y-4">
                        {syncResult.suggestions.suggestions.map((suggestion, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start gap-4">
                              {/* New Image */}
                              <div className="w-24 h-24 flex-shrink-0">
                                <img
                                  src={suggestion.imageInfo.url}
                                  alt="New image"
                                  className="w-full h-full object-cover rounded border-2 border-green-500"
                                />
                                <div className="text-xs text-green-600 mt-1 text-center font-medium">
                                  New Image
                                </div>
                              </div>

                              {/* Image Info */}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {suggestion.imageInfo.fileName}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  Size: {suggestion.imageInfo.size} | 
                                  Uploaded: {new Date(suggestion.imageInfo.uploadedAt).toLocaleDateString()}
                                </p>
                                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  suggestion.confidence === 'high' ? 'bg-green-100 text-green-800' :
                                  suggestion.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {suggestion.confidence.toUpperCase()} CONFIDENCE
                                </div>
                              </div>

                              {/* Suggested Products */}
                              <div className="flex-1">
                                {suggestion.suggestedProducts.length > 0 ? (
                                  <div>
                                    <h5 className="font-medium text-gray-800 mb-2">Suggested for:</h5>
                                    {suggestion.suggestedProducts.map(product => (
                                      <div key={product.id} className="mb-3 p-3 bg-white rounded border">
                                        <div className="flex items-center gap-3">
                                          <img
                                            src={product.currentImage}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded"
                                          />
                                          <div className="flex-1">
                                            <div className="font-medium text-sm">{product.name}</div>
                                            <div className="text-xs text-gray-500">{product.category}</div>
                                          </div>
                                          <label className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={isUpdateSelected(product.id, suggestion.imageInfo.url)}
                                              onChange={() => toggleUpdate(product.id, suggestion.imageInfo.url)}
                                              className="rounded"
                                            />
                                            <span className="text-sm">Update</span>
                                          </label>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    {suggestion.note || 'No automatic matches found'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-yellow-800 mb-2">No New Images Found</h3>
                      <p className="text-yellow-700">
                        All images in Supabase are already being used by products, or no new images were uploaded.
                      </p>
                    </div>
                  )}

                  {/* Current Usage */}
                  {showPreview && syncResult.currentImages && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">📋 Current Supabase Image Usage</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                        <div className="bg-white p-4 rounded">
                          <div className="text-xl font-bold text-blue-600">
                            {syncResult.currentImages.totalProducts}
                          </div>
                          <div className="text-sm text-gray-600">Total Products</div>
                        </div>
                        <div className="bg-white p-4 rounded">
                          <div className="text-xl font-bold text-green-600">
                            {syncResult.currentImages.supabaseImageCount}
                          </div>
                          <div className="text-sm text-gray-600">Using Supabase Images</div>
                        </div>
                        <div className="bg-white p-4 rounded">
                          <div className="text-xl font-bold text-orange-600">
                            {syncResult.currentImages.otherImageCount}
                          </div>
                          <div className="text-sm text-gray-600">Using Other Images</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-red-800 mb-2">Sync Failed</h3>
                  <p className="text-red-700">{syncResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">📖 How it works:</h3>

            {!manualMode ? (
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Auto Mode:</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>Click "Check for New Images" to scan Supabase storage</li>
                  <li>Review suggested matches between new images and products</li>
                  <li>Select which updates you want to apply</li>
                  <li>Click "Apply Selected Updates" to download updated products.js</li>
                  <li>Replace your current products.js file with the downloaded version</li>
                  <li>Rebuild and deploy your website</li>
                </ol>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Manual Mode:</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>Click "Load All Images" to see all Supabase images</li>
                  <li>Use search and filters to find specific images</li>
                  <li>For each image, select a product from the dropdown</li>
                  <li>Click "Assign to Product" to queue the assignment</li>
                  <li>Review your assignments in the pending queue</li>
                  <li>Click "Apply Assignments" to download updated products.js</li>
                  <li>Replace your current products.js file and redeploy</li>
                </ol>

                <div className="mt-4 p-3 bg-green-100 rounded border border-green-200">
                  <h5 className="font-medium text-green-800 mb-1">💡 Image Name Mapping Tips:</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Use descriptive filenames like "arduino-uno-r3.jpg" for easy identification</li>
                    <li>• Search by product name or image filename to quickly find matches</li>
                    <li>• Filter by "Unassigned" to see images that need manual assignment</li>
                    <li>• You can assign the same image to multiple products if needed</li>
                  </ul>
                </div>
              </div>
            )}
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

export default CheckSupabaseImages;
