import { useState, useEffect } from 'react';
import {
  Upload, RefreshCw, ImageIcon, Save, X, Edit, Star,
  Package, Shield, Home, Database, AlertTriangle, Settings, Bot, Percent, Zap
} from 'lucide-react';
import QuickDbSetup from '../components/QuickDbSetup';
import AdminSettings from '../components/AdminSettings';
import BulkDiscountManager from '../components/admin/BulkDiscountManager';
import VercelImageUpload from '../components/admin/VercelImageUpload';
import FreshAdminUpload from '../components/FreshAdminUpload';
import firebaseMetadataService from '../services/firebaseMetadataService';

const SuperAdmin = () => {
  // State management
  const [activeTab, setActiveTab] = useState('products');
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testingFirebase, setTestingFirebase] = useState(false);

  // Load images from Supabase on component mount
  useEffect(() => {
    loadImages();

    // Set up global refresh function for other components to call
    window.refreshAllImages = loadImages;

    // Cleanup on unmount
    return () => {
      delete window.refreshAllImages;
    };
  }, []);

  const loadImages = async () => {
    try {
      setLoadingImages(true);
      console.log('🔄 Loading ALL products from Firebase...');

      const { default: productService } = await import('../services/productService');

      // Load products from Firebase
      const products = await productService.getAllProducts();

      if (products && products.length > 0) {
        // Convert products to image format for compatibility
        const imagesWithUrls = products.map((product) => {
          const publicUrl = product.image;

          return {
            id: product.id,
            name: product.title || 'Untitled',
            publicUrl,
            fullPath: publicUrl,
            title: product.title || '',
            description: product.description || '',
            category: product.category || '',
            price: product.price || null,
            inStock: product.in_stock !== false,
            featured: product.featured || false,
            hasMetadata: true
          };
        });

        setImages(imagesWithUrls);
        console.log(`✅ Loaded ${imagesWithUrls.length} products from Firebase`);

        // Count images with and without metadata
        const withMetadata = imagesWithUrls.filter(img => img.hasMetadata).length;
        const withoutMetadata = imagesWithUrls.length - withMetadata;
        console.log(`📊 Images with admin metadata: ${withMetadata}, without metadata: ${withoutMetadata}`);
      } else {
        setImages([]);
        console.log('ℹ️ No images found in Supabase products folder');
      }
    } catch (error) {
      console.error('❌ Error loading WEBSITE images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // NO automatic data generation - all metadata must be added by admin

  const testFirebaseConnection = async () => {
    try {
      setTestingFirebase(true);
      console.log('🔄 Testing Firebase connection...');

      await firebaseMetadataService.testConnection();
      alert('✅ Firebase connection test successful! You can save metadata.');
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      alert(`❌ Firebase connection failed: ${error.message}`);
    } finally {
      setTestingFirebase(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      console.log('📤 Uploading image to Vercel Blob storage...');

      const { default: productService } = await import('../services/productService');

      // Upload to products folder specifically
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `products/${fileName}`;

      const result = await productService.uploadImage(file, filePath);

      console.log('✅ Image uploaded successfully to Vercel Blob:', result.url);

      // Trigger refresh across all pages
      await loadImages(); // Refresh SuperAdmin first

      // Trigger refresh on other pages
      if (window.refreshHomeImages) {
        window.refreshHomeImages();
      }
      if (window.refreshGalleryImages) {
        window.refreshGalleryImages();
      }

      // Dispatch global refresh event
      window.dispatchEvent(new CustomEvent('refreshAllImages'));
    } catch (error) {
      console.error('❌ Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (image) => {
    if (!confirm(`Are you sure you want to delete "${image.title || image.name}"? This will remove it from ALL sections of the website (Home, Gallery, Featured products).`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting product from Firebase...');

      const { default: productService } = await import('../services/productService');

      // Delete from Firebase
      await productService.deleteProduct(image.id);

      // Delete image from Vercel Blob if it exists
      if (image.fullPath) {
        await productService.deleteImage(image.fullPath);
      }

      console.log('✅ Product deleted successfully from Firebase and Vercel Blob');

      // Trigger refresh across all pages
      await loadImages(); // Refresh SuperAdmin first

      // Trigger refresh on other pages
      if (window.refreshHomeImages) {
        window.refreshHomeImages();
      }
      if (window.refreshGalleryImages) {
        window.refreshGalleryImages();
      }

      // Dispatch global refresh event
      window.dispatchEvent(new CustomEvent('refreshAllImages'));
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
                <p className="text-sm text-gray-600">Central Image Management - Controls ALL Website Images</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open('/', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                View Website
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              All Website Images
            </button>
            <button
              onClick={() => setActiveTab('fresh-upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fresh-upload'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Fresh Start Upload
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Legacy Upload
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'database'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Database Setup
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Site Settings
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discounts'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Percent className="w-4 h-4 inline mr-2" />
              Bulk Discounts
            </button>
            <button
              onClick={() => setActiveTab('migration')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'migration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Vercel Blob
            </button>
            <a
              href="/admin/chatbot"
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              <Bot className="w-4 h-4 inline mr-2" />
              AI Chatbot
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Images</p>
                    <p className="text-lg font-bold text-gray-900">{images.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">In Home</p>
                    <p className="text-lg font-bold text-gray-900">{images.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">In Gallery</p>
                    <p className="text-lg font-bold text-gray-900">{images.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Featured</p>
                    <p className="text-lg font-bold text-gray-900">{images.filter(img => img.featured).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">All Website Images</h3>
                  <p className="text-sm text-gray-600">Central control for ALL images - Home, Gallery, Featured products. Edit details and delete as needed.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={testFirebaseConnection}
                    disabled={testingFirebase}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                  >
                    <Database className={`w-4 h-4 mr-2 ${testingFirebase ? 'animate-spin' : ''}`} />
                    Test Firebase
                  </button>
                  <button
                    onClick={loadImages}
                    disabled={loadingImages}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingImages ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            
            {loadingImages ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">Loading website images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No website images found</h3>
                <p className="mt-1 text-sm text-gray-500">Upload images to display across the website (Home, Gallery, Featured).</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((image) => (
                  <SuperAdminProductCard
                    key={image.id}
                    image={image}
                    onDelete={() => handleDeleteImage(image)}
                    onRefresh={loadImages}
                  />
                ))}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Fresh Upload Tab */}
        {activeTab === 'fresh-upload' && (
          <div>
            <FreshAdminUpload />
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upload New Images</h3>
              <p className="text-sm text-gray-600">Add new images to display across ALL sections of the website</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Website Images</h4>
              <p className="text-gray-600 mb-4">Images will appear in Home, Gallery, and Featured sections</p>

              <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer inline-flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Choose Files'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    files.forEach(file => handleImageUpload(file));
                  }}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {uploading && (
                <div className="mt-4">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Database Setup Tab */}
        {activeTab === 'database' && (
          <QuickDbSetup />
        )}

        {/* Site Settings Tab */}
        {activeTab === 'settings' && (
          <AdminSettings />
        )}

        {/* Bulk Discounts Tab */}
        {activeTab === 'discounts' && (
          <BulkDiscountManager />
        )}

        {/* Vercel Blob Storage - Upload Interface */}
        {activeTab === 'migration' && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <Zap className="w-12 h-12 mx-auto text-blue-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Vercel Blob Storage Active
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  All new image uploads automatically use Vercel Blob storage for optimal performance.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    ✅ Enhanced image service configured<br/>
                    ✅ Responsive loading with srcSet<br/>
                    ✅ Global CDN delivery<br/>
                    ✅ 2-3x faster image loading
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Interface */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Product Images
              </h4>
              <VercelImageUpload
                category="products"
                onUploadComplete={(result) => {
                  console.log('Image uploaded:', result);
                  // Optionally refresh product list or show success message
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// SuperAdmin Product Card Component
const SuperAdminProductCard = ({ image, onDelete, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: image.title || '',
    description: image.description || '',
    price: image.price || '',
    category: image.category || 'Components',
    inStock: image.inStock !== undefined ? image.inStock : true,
    featured: image.featured || false,
    videoUrl: image.video_url || image.videoUrl || '',
    youtubeTutorialUrl: image.youtube_tutorial_url || image.youtubeTutorialUrl || '',
    videoTitle: image.video_title || image.videoTitle || '',
    videoDescription: image.video_description || image.videoDescription || ''
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving product card data to Firebase...');
      console.log('📝 Image name:', image.name);
      console.log('📝 Edit data:', editData);

      // Validate required fields
      if (!editData.title.trim()) {
        alert('❌ Title is required');
        return;
      }

      // Save to Firebase with all metadata
      const metadataToSave = {
        title: editData.title.trim(),
        description: editData.description.trim(),
        category: editData.category.trim(),
        price: editData.price ? parseFloat(editData.price) : null,
        currency: 'K',
        inStock: editData.inStock,
        featured: editData.featured,
        public_url: image.publicUrl,
        file_path: image.fullPath,
        publicUrl: image.publicUrl, // Add both formats for compatibility
        fullPath: image.fullPath,
        // Video fields
        videoUrl: editData.videoUrl,
        youtubeTutorialUrl: editData.youtubeTutorialUrl,
        videoTitle: editData.videoTitle,
        videoDescription: editData.videoDescription
      };

      console.log('📤 Sending to Firebase:', metadataToSave);

      const result = await firebaseMetadataService.saveImageMetadata(image.name, metadataToSave);

      console.log('✅ Firebase save result:', result);
      console.log('✅ Product card data saved successfully to Firebase');

      // Show success message
      alert('✅ Product data saved successfully!');

      // Trigger refresh across all pages
      if (onRefresh) {
        await onRefresh();
      }

      // Trigger refresh on other pages
      if (window.refreshHomeImages) {
        window.refreshHomeImages();
      }
      if (window.refreshGalleryImages) {
        window.refreshGalleryImages();
      }

      // Dispatch global refresh event
      window.dispatchEvent(new CustomEvent('refreshAllImages'));

      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error saving product card data:', error);
      console.error('❌ Full error:', error);
      alert(`❌ Failed to save changes: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: image.title || '',
      description: image.description || '',
      price: image.price || '',
      category: image.category || 'Components',
      inStock: image.inStock !== undefined ? image.inStock : true,
      featured: image.featured || false
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200">
      {/* Metadata Status Badge */}
      <div className={`text-xs font-medium px-3 py-1 text-center ${
        image.hasMetadata
          ? (editData.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        {image.hasMetadata
          ? (editData.inStock ? 'In Stock' : 'Out of Stock')
          : 'No Metadata - Admin Must Add'
        }
      </div>

      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={image.publicUrl}
          alt={image.title || image.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        {/* No Metadata Warning Overlay */}
        {!image.hasMetadata && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white p-2">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs font-medium">No Data</p>
              <p className="text-xs">Click Edit</p>
            </div>
          </div>
        )}

        {editData.featured && image.hasMetadata && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </span>
          </div>
        )}
        {editData.price && image.hasMetadata && (
          <div className="absolute top-2 right-2">
            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              K{editData.price}
            </span>
          </div>
        )}
      </div>

      {/* Category and Usage Badges */}
      <div className="px-3 pt-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-block bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
            {editData.category}
          </span>
          {editData.featured && (
            <span className="inline-block bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Usage indicators */}
        <div className="flex flex-wrap gap-1">
          <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded">
            Home
          </span>
          <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded">
            Gallery
          </span>
          {editData.featured && (
            <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Product title"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <input
              type="number"
              placeholder="Price (K)"
              value={editData.price}
              onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <select
              value={editData.category}
              onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Microcontrollers">Microcontrollers</option>
              <option value="WiFi Modules">WiFi Modules</option>
              <option value="Sensors">Sensors</option>
              <option value="Components">Components</option>
              <option value="Displays">Displays</option>
              <option value="Motors">Motors</option>
              <option value="Power Supply">Power Supply</option>
              <option value="Cables">Cables</option>
            </select>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.featured}
                  onChange={(e) => setEditData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.inStock}
                  onChange={(e) => setEditData(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock</span>
              </label>
            </div>

            {/* Video Section */}
            <div className="border-t pt-3 space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Video Content
              </h4>
              <input
                type="url"
                placeholder="Product video URL (YouTube, MP4, etc.)"
                value={editData.videoUrl}
                onChange={(e) => setEditData(prev => ({ ...prev, videoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="url"
                placeholder="YouTube tutorial URL"
                value={editData.youtubeTutorialUrl}
                onChange={(e) => setEditData(prev => ({ ...prev, youtubeTutorialUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Video title (optional)"
                value={editData.videoTitle}
                onChange={(e) => setEditData(prev => ({ ...prev, videoTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Video description (optional)"
                value={editData.videoDescription}
                onChange={(e) => setEditData(prev => ({ ...prev, videoDescription: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />Save</>}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-1" />Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
              {editData.title || image.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {editData.description || 'No description'}
            </p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {editData.category}
              </span>
              {editData.price && (
                <span className="text-sm font-medium text-green-600">K{editData.price}</span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
              >
                <Edit className="w-4 h-4 mr-1" />Edit
              </button>
              <button
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                title="Delete image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
