import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Download, 
  Image, 
  Folder, 
  Database, 
  RefreshCw,
  Camera,
  Save,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import HDImageDownloader from '../components/HDImageDownloader';
import supabaseService from '../services/supabase';
import { useProducts } from '../context/ProductContext';

const ComprehensiveImageManager = () => {
  const { products: contextProducts, updateProductImage, loading, error } = useProducts();
  const [activeTab, setActiveTab] = useState('download');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [supabaseImages, setSupabaseImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Use only Supabase products from context
  const products = contextProducts || [];

  // Load Supabase images
  const loadSupabaseImages = async () => {
    setLoadingImages(true);
    try {
      const images = await supabaseService.listImages();
      setSupabaseImages(images);
      setMessage({ type: 'success', text: `Loaded ${images.length} images from Supabase` });
    } catch (error) {
      console.error('Error loading images:', error);
      setMessage({ type: 'error', text: 'Failed to load images from Supabase' });
    } finally {
      setLoadingImages(false);
    }
  };

  // Handle file upload to Supabase
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const uploadResults = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(((i + 1) / files.length) * 100);

        const result = await supabaseService.uploadProductImage(file);
        uploadResults.push({
          file: file.name,
          success: true,
          url: result.publicUrl,
          path: result.path
        });
      }

      setMessage({
        type: 'success',
        text: `Successfully uploaded ${uploadResults.length} image(s) to Supabase`
      });

      // Refresh images
      await loadSupabaseImages();

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text: `Upload failed: ${error.message}`
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFiles([]);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      setSelectedFiles(imageFiles);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Delete image from Supabase
  const deleteImage = async (imagePath) => {
    try {
      await supabaseService.deleteImage(imagePath);
      setMessage({ type: 'success', text: 'Image deleted successfully' });
      await loadSupabaseImages();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete image' });
    }
  };

  const tabs = [
    { id: 'download', label: 'Download HD Images', icon: Download },
    { id: 'upload', label: 'Upload to Supabase', icon: Upload },
    { id: 'manage', label: 'Manage Storage', icon: Database },
    { id: 'products', label: 'Product Images', icon: Image }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📸 Comprehensive Image Manager
              </h1>
              <p className="text-gray-600">
                Download HD component images, upload to Supabase, and manage product images
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/super-admin"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Super Admin Panel
              </Link>
              <Link
                to="/"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Back to Website
              </Link>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            message.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="mr-2" size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Download HD Images Tab */}
            {activeTab === 'download' && (
              <div>
                <HDImageDownloader />
              </div>
            )}

            {/* Upload to Supabase Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Upload Images to Supabase Storage
                  </h2>
                  
                  {/* File Selection */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {uploading ? (
                      <div className="space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-600">Uploading to Supabase...</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% complete</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drop images here or click to upload
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports JPG, PNG, WebP files up to 10MB each
                          </p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-flex items-center"
                        >
                          <Upload className="mr-2" size={16} />
                          Choose Files
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && !uploading && (
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Selected Files ({selectedFiles.length})
                      </h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleFileUpload(selectedFiles)}
                        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center"
                      >
                        <Upload className="mr-2" size={16} />
                        Upload {selectedFiles.length} Files to Supabase
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manage Storage Tab */}
            {activeTab === 'manage' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Supabase Storage ({supabaseImages.length} images)
                  </h2>
                  <button
                    onClick={loadSupabaseImages}
                    disabled={loadingImages}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                  >
                    <RefreshCw className={`mr-2 ${loadingImages ? 'animate-spin' : ''}`} size={16} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loadingImages ? (
                    <div className="col-span-full text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading images...</p>
                    </div>
                  ) : supabaseImages.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Image className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No images found in Supabase storage</p>
                    </div>
                  ) : (
                    supabaseImages.map((image, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <img
                          src={image.publicUrl}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded mb-3"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x128?text=Error';
                          }}
                        />
                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate" title={image.name}>
                          {image.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {image.size ? `${(image.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(image.publicUrl, '_blank')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                          >
                            <Eye size={12} className="mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => deleteImage(image.path)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                          >
                            <Trash2 size={12} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Product Images Tab */}
            {activeTab === 'products' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Product Images ({products.length} products)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x128?text=No+Image';
                        }}
                      />
                      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2" title={product.name}>
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">{product.category}</p>
                      <p className="font-semibold text-blue-600 text-sm mb-3">{product.price}</p>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center">
                          <Plus size={12} className="mr-1" />
                          Update
                        </button>
                        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center">
                          <Eye size={12} className="mr-1" />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveImageManager;
