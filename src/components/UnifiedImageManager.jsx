import React, { useState, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Link2,
  Unlink,
  Eye,
  Trash2,
  Download,
  Search,
  Filter,
  Grid,
  List,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Save,

  Database,
  ExternalLink,
  Settings,
  Plus,
  Edit3,
  X
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import supabaseService from '../services/supabase';
import {
  listSupabaseImages,
  getSupabaseImageUrl,
  suggestProductByImageName
} from '../utils/supabaseImageChecker';
import DebugInfo from './DebugInfo';

const UnifiedImageManager = () => {
  // State management
  const [supabaseImages, setSupabaseImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all'); // 'all', 'assigned', 'unassigned'
  const [message, setMessage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [initError, setInitError] = useState(null);

  // Get products from context with error handling
  const {
    products,
    updateProduct,
    refreshProducts,
    loading: productsLoading,
    error: productsError
  } = useProducts();

  // Load Supabase images
  const loadSupabaseImages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSupabaseImages();
      if (result.success) {
        const imagesWithDetails = result.images.map(img => ({
          ...img,
          publicUrl: getSupabaseImageUrl(img.name),
          isAssigned: isImageAssigned(img.name),
          assignedProducts: getAssignedProducts(img.name),
          suggestions: suggestProductByImageName(img.name)
        }));
        setSupabaseImages(imagesWithDetails);
        setFilteredImages(imagesWithDetails);
        setMessage({ type: 'success', text: `Loaded ${imagesWithDetails.length} images from Supabase` });
      } else {
        setSupabaseImages([]);
        setFilteredImages([]);
        setMessage({ type: 'warning', text: 'No images found in Supabase storage' });
      }
    } catch (error) {
      console.error('Error loading Supabase images:', error);
      setMessage({ type: 'error', text: 'Failed to load images from Supabase' });
    } finally {
      setLoading(false);
    }
  }, [isImageAssigned, getAssignedProducts]);

  // Check if image is assigned to any product
  const isImageAssigned = useCallback((imageName) => {
    const imageUrl = getSupabaseImageUrl(imageName);
    return products.some(product =>
      product.image === imageUrl ||
      (product.images && product.images.includes(imageUrl))
    );
  }, [products]);

  // Get which product(s) an image is assigned to
  const getAssignedProducts = useCallback((imageName) => {
    const imageUrl = getSupabaseImageUrl(imageName);
    return products.filter(product =>
      product.image === imageUrl ||
      (product.images && product.images.includes(imageUrl))
    );
  }, [products]);

  // Filter images based on search and filter type
  const filterImages = useCallback(() => {
    let filtered = supabaseImages;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.assignedProducts.some(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'assigned':
        filtered = filtered.filter(img => img.isAssigned);
        break;
      case 'unassigned':
        filtered = filtered.filter(img => !img.isAssigned);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredImages(filtered);
  }, [supabaseImages, searchTerm, filterType]);

  // Handle image selection
  const toggleImageSelection = (image) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.name === image.name);
      if (isSelected) {
        return prev.filter(img => img.name !== image.name);
      } else {
        return [...prev, image];
      }
    });
  };

  // Assign image to product (real-time database update)
  const assignImageToProduct = async (imageName, productId, replace = false) => {
    console.log('🔄 Assigning image:', { imageName, productId, replace });

    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        console.error('❌ Product not found:', productId);
        throw new Error(`Product with ID ${productId} not found`);
      }

      console.log('✅ Found product:', product.name);

      const imageUrl = getSupabaseImageUrl(imageName);
      console.log('🖼️ Image URL:', imageUrl);

      let updatedProduct;
      if (replace) {
        // Replace main image
        updatedProduct = {
          ...product,
          image: imageUrl,
          updatedAt: new Date(),
          imageVersion: Date.now() // For cache busting
        };
        console.log('🔄 Replacing main image');
      } else {
        // Add to images array
        const currentImages = product.images || [];
        const newImages = [...currentImages, imageUrl].filter((url, index, arr) =>
          arr.indexOf(url) === index // Remove duplicates
        );

        updatedProduct = {
          ...product,
          image: product.image || imageUrl, // Set as main image if none exists
          images: newImages,
          updatedAt: new Date(),
          imageVersion: Date.now() // For cache busting
        };
        console.log('➕ Adding to images array. Current:', currentImages.length, 'New:', newImages.length);
      }

      console.log('💾 Updating product in database...');

      // Update in database via context (real-time)
      if (updateProduct) {
        await updateProduct(productId, updatedProduct);
        console.log('✅ Product updated successfully');
      } else if (updateProductImage && replace) {
        // Fallback to updateProductImage for replace operations
        await updateProductImage(productId, imageUrl);
        console.log('✅ Product image updated via updateProductImage');
      } else {
        console.error('❌ No update function available');
        throw new Error('Product update function not available');
      }

      // Force a complete refresh of the website
      console.log('🔄 Forcing website refresh...');

      // Emit custom event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('productImageUpdated', {
          detail: {
            productId,
            imageUrl,
            product: updatedProduct,
            timestamp: Date.now()
          }
        }));

        // Also emit a general product update event
        window.dispatchEvent(new CustomEvent('productUpdated', {
          detail: {
            productId,
            product: updatedProduct,
            timestamp: Date.now()
          }
        }));
      }

      // Refresh both products and images to update assignment status
      console.log('🔄 Refreshing products and images...');
      await Promise.all([
        refreshProducts(),
        loadSupabaseImages()
      ]);

      // Force localStorage update
      try {
        const savedProducts = localStorage.getItem('gifted-solutions-products');
        if (savedProducts) {
          const parsedProducts = JSON.parse(savedProducts);
          const updatedProducts = parsedProducts.map(p =>
            p.id === productId ? updatedProduct : p
          );
          localStorage.setItem('gifted-solutions-products', JSON.stringify(updatedProducts));
          console.log('💾 Updated localStorage with new product data');
        }
      } catch (error) {
        console.warn('Failed to update localStorage:', error);
      }

      return { success: true, product: updatedProduct };
    } catch (error) {
      console.error('❌ Error assigning image to product:', error);
      return { success: false, error: error.message };
    }
  };

  // Remove image from product
  const removeImageFromProduct = async (imageName, productId) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const imageUrl = getSupabaseImageUrl(imageName);
      
      let updatedProduct = { ...product };
      
      // Remove from main image if it matches
      if (product.image === imageUrl) {
        updatedProduct.image = product.images && product.images.length > 0 
          ? product.images[0] 
          : '';
      }
      
      // Remove from images array
      if (product.images) {
        updatedProduct.images = product.images.filter(url => url !== imageUrl);
      }

      // Update in database via context (real-time)
      await updateProduct(productId, updatedProduct);
      
      // Refresh images to update assignment status
      await loadSupabaseImages();
      
      return { success: true, product: updatedProduct };
    } catch (error) {
      console.error('Error removing image from product:', error);
      return { success: false, error: error.message };
    }
  };

  // Upload new images
  const handleImageUpload = async (files) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        supabaseService.uploadProductImage(file)
      );
      
      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.publicUrl).length;
      
      setMessage({ 
        type: 'success', 
        text: `Successfully uploaded ${successful} of ${files.length} images` 
      });
      
      // Refresh image list
      await loadSupabaseImages();
      setShowUploadModal(false);
    } catch (error) {
      setMessage({ type: 'error', text: `Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  // Effects
  useEffect(() => {
    const initializeManager = async () => {
      try {
        console.log('🚀 Initializing Unified Image Manager...');
        console.log('📊 Products available:', products?.length || 0);
        console.log('⚠️ Products error:', productsError);
        console.log('⏳ Products loading:', productsLoading);

        if (productsError) {
          setInitError(`Products loading error: ${productsError}`);
          setMessage({ type: 'error', text: `Failed to load products: ${productsError}` });
          return;
        }

        if (!productsLoading) {
          await loadSupabaseImages();
        }
      } catch (error) {
        console.error('❌ Error initializing manager:', error);
        setInitError(error.message);
        setMessage({ type: 'error', text: `Initialization failed: ${error.message}` });
      }
    };

    initializeManager();
  }, [productsLoading, productsError]);

  useEffect(() => {
    filterImages();
  }, [filterImages]);

  // Auto-refresh disabled to prevent infinite loops
  // Users can manually refresh using the "Refresh Data" button
  // useEffect(() => {
  //   if (supabaseImages.length > 0 && products?.length > 0) {
  //     // Only refresh if we haven't refreshed recently
  //     const lastRefresh = localStorage.getItem('lastImageRefresh');
  //     const now = Date.now();
  //     if (!lastRefresh || now - parseInt(lastRefresh) > 5000) { // 5 second cooldown
  //       localStorage.setItem('lastImageRefresh', now.toString());
  //       loadSupabaseImages();
  //     }
  //   }
  // }, [products?.length, loadSupabaseImages, supabaseImages.length]);

  // Show error state if there are critical issues
  if (initError || productsError) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unified Image Manager - Error
              </h2>
              <p className="text-red-600 mb-4">
                {initError || productsError}
              </p>

              {/* Debug Information */}
              <div className="bg-gray-50 p-4 rounded-lg text-left text-sm">
                <h3 className="font-semibold mb-2">Debug Information:</h3>
                <ul className="space-y-1">
                  <li><strong>Products Loading:</strong> {productsLoading ? 'Yes' : 'No'}</li>
                  <li><strong>Products Count:</strong> {products?.length || 0}</li>
                  <li><strong>Products Error:</strong> {productsError || 'None'}</li>
                  <li><strong>Init Error:</strong> {initError || 'None'}</li>
                  <li><strong>Current URL:</strong> {window.location.href}</li>
                </ul>
              </div>

              <div className="mt-4 space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Debug Info Component - Temporarily disabled */}
      {/* <DebugInfo /> */}

      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Database className="mr-3 h-6 w-6 text-blue-500" />
                Unified Image Manager
              </h2>
              <p className="text-gray-600 mt-1">
                Manage Supabase images with real-time product updates
              </p>
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1">
                  Products: {products?.length || 0} | Loading: {productsLoading ? 'Yes' : 'No'} | Images: {filteredImages.length}
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadSupabaseImages}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  setMessage({ type: 'info', text: 'Refreshing all data...' });

                  try {
                    // Refresh products from database
                    await refreshProducts();

                    // Refresh images from Supabase
                    await loadSupabaseImages();

                    setMessage({ type: 'success', text: 'Successfully refreshed all data! Changes should now be visible.' });

                    // Clear message after 3 seconds
                    setTimeout(() => setMessage(null), 3000);
                  } catch (error) {
                    console.error('Error refreshing data:', error);
                    setMessage({ type: 'error', text: 'Failed to refresh data. Please try again.' });
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                <Database className="mr-2 h-4 w-4" />
                Refresh Data
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Images
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            message.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
            'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> :
               message.type === 'warning' ? <AlertCircle className="h-5 w-5 mr-2" /> :
               <AlertCircle className="h-5 w-5 mr-2" />}
              {message.text}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 items-center">
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Images</option>
                <option value="assigned">Assigned Images</option>
                <option value="unassigned">Unassigned Images</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{filteredImages.length}</div>
              <div className="text-sm text-blue-700">Total Images</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">
                {filteredImages.filter(img => img.isAssigned).length}
              </div>
              <div className="text-sm text-green-700">Assigned</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600">
                {filteredImages.filter(img => !img.isAssigned).length}
              </div>
              <div className="text-sm text-orange-700">Unassigned</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-600">{products.length}</div>
              <div className="text-sm text-purple-700">Products</div>
            </div>
          </div>
        </div>

        {/* Image Grid/List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">Loading images...</p>
            </div>
          ) : filteredImages.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map(image => (
                  <ImageCard
                    key={image.name}
                    image={image}
                    products={products}
                    onAssign={assignImageToProduct}
                    onRemove={removeImageFromProduct}
                    onSelect={() => toggleImageSelection(image)}
                    isSelected={selectedImages.some(img => img.name === image.name)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredImages.map(image => (
                  <ImageListItem
                    key={image.name}
                    image={image}
                    products={products}
                    onAssign={assignImageToProduct}
                    onRemove={removeImageFromProduct}
                    onSelect={() => toggleImageSelection(image)}
                    isSelected={selectedImages.some(img => img.name === image.name)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No images found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleImageUpload}
            uploading={uploading}
          />
        )}
      </div>
    </div>
  );
};

// Image Card Component for Grid View
const ImageCard = ({ image, products, onAssign, onRemove, onSelect, isSelected }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async (replace = false) => {
    if (!selectedProductId) {
      alert('Please select a product first');
      return;
    }

    setAssigning(true);
    try {
      const result = await onAssign(image.name, parseInt(selectedProductId), replace);
      if (result.success) {
        const product = products.find(p => p.id === parseInt(selectedProductId));
        const actionType = replace ? 'replaced' : 'added';

        // Show success message
        const message = `✅ Successfully ${actionType} image for "${product?.name}"!\n\n` +
          `✨ Data has been automatically refreshed and changes should be visible now.\n` +
          `If you don't see the changes, click the "Refresh Data" button above.`;

        alert(message);
        setSelectedProductId('');
        setShowActions(false);
      } else {
        alert(`Failed to assign image: ${result.error}`);
      }
    } catch (error) {
      console.error('Assignment error:', error);
      alert(`Error assigning image: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (productId) => {
    const result = await onRemove(image.name, productId);
    if (result.success) {
      // Success handled by parent component
    }
  };

  return (
    <div className={`border rounded-lg p-4 bg-white ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Image */}
      <div className="aspect-square mb-3 relative">
        <img
          src={image.publicUrl}
          alt={image.name}
          className="w-full h-full object-cover rounded border"
        />
        <button
          onClick={onSelect}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 ${
            isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
          }`}
        >
          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Image Info */}
      <div className="space-y-2">
        <div className="font-medium text-sm truncate" title={image.name}>
          {image.name}
        </div>

        <div className="text-xs text-gray-500">
          Size: {image.metadata?.size ? Math.round(image.metadata.size / 1024) + 'KB' : 'Unknown'}
        </div>

        {/* Assignment Status */}
        {image.isAssigned ? (
          <div className="space-y-1">
            <div className="text-xs text-green-600 font-medium">
              ✓ Assigned to:
            </div>
            {image.assignedProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between bg-green-50 p-1 rounded text-xs">
                <span className="truncate">{product.name}</span>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-orange-600 font-medium">
            ⚠ Unassigned
          </div>
        )}

        {/* Smart Suggestions */}
        {image.suggestions && image.suggestions.length > 0 && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
            <div className="font-medium mb-1">💡 Suggestions:</div>
            {image.suggestions.slice(0, 2).map(product => (
              <button
                key={product.id}
                onClick={() => onAssign(image.name, product.id)}
                className="block w-full text-left hover:bg-blue-100 px-1 py-0.5 rounded text-xs truncate"
                title={product.name}
              >
                {product.name}
              </button>
            ))}
          </div>
        )}

        {/* Manual Assignment */}
        <div className="pt-2 space-y-2">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select product...</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          {selectedProductId && (
            <div className="flex gap-1">
              <button
                onClick={() => handleAssign(false)}
                disabled={assigning}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? (
                  <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />
                ) : (
                  <Link2 className="w-3 h-3 inline mr-1" />
                )}
                Add
              </button>
              <button
                onClick={() => handleAssign(true)}
                disabled={assigning}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? (
                  <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />
                ) : (
                  <Save className="w-3 h-3 inline mr-1" />
                )}
                Replace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Image List Item Component for List View
const ImageListItem = ({ image, products, onAssign, onRemove, onSelect, isSelected }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async (replace = false) => {
    if (!selectedProductId) {
      alert('Please select a product first');
      return;
    }

    setAssigning(true);
    try {
      const result = await onAssign(image.name, parseInt(selectedProductId), replace);
      if (result.success) {
        const product = products.find(p => p.id === parseInt(selectedProductId));
        const actionType = replace ? 'replaced' : 'added';

        // Show success message
        const message = `✅ Successfully ${actionType} image for "${product?.name}"!\n\n` +
          `✨ Data has been automatically refreshed and changes should be visible now.\n` +
          `If you don't see the changes, click the "Refresh Data" button above.`;

        alert(message);
        setSelectedProductId('');
      } else {
        alert(`Failed to assign image: ${result.error}`);
      }
    } catch (error) {
      console.error('Assignment error:', error);
      alert(`Error assigning image: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 bg-white ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <button
          onClick={onSelect}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
          }`}
        >
          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
        </button>

        {/* Image Thumbnail */}
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={image.publicUrl}
            alt={image.name}
            className="w-full h-full object-cover rounded border"
          />
        </div>

        {/* Image Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{image.name}</div>
          <div className="text-xs text-gray-500">
            Size: {image.metadata?.size ? Math.round(image.metadata.size / 1024) + 'KB' : 'Unknown'}
          </div>

          {/* Assignment Status */}
          {image.isAssigned ? (
            <div className="text-xs text-green-600 font-medium mt-1">
              ✓ Assigned to: {image.assignedProducts.map(p => p.name).join(', ')}
            </div>
          ) : (
            <div className="text-xs text-orange-600 font-medium mt-1">
              ⚠ Unassigned
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select product...</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          {selectedProductId && (
            <>
              <button
                onClick={() => handleAssign(false)}
                disabled={assigning}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {assigning ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Link2 className="w-3 h-3 mr-1" />
                )}
                Add
              </button>
              <button
                onClick={() => handleAssign(true)}
                disabled={assigning}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {assigning ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Save className="w-3 h-3 mr-1" />
                )}
                Replace
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Upload Modal Component
const UploadModal = ({ onClose, onUpload, uploading }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload Images</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Selected {selectedFiles.length} file(s):
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="text-xs text-gray-500 truncate">
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedImageManager;
