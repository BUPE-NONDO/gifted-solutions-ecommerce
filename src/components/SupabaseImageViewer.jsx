import React, { useState, useEffect } from 'react';
import { Image, RefreshCw, AlertCircle, CheckCircle, Eye, Download } from 'lucide-react';
import supabaseService from '../services/supabase';

const SupabaseImageViewer = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Load images from Supabase bucket
  const loadImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading images from Supabase bucket...');
      
      // List all images in the products folder
      const imageList = await supabaseService.listImages('products');
      
      if (imageList && imageList.length > 0) {
        // Get public URLs for all images
        const imagesWithUrls = imageList.map(image => ({
          ...image,
          publicUrl: supabaseService.getPublicUrl(`products/${image.name}`),
          fullPath: `products/${image.name}`
        }));
        
        setImages(imagesWithUrls);
        console.log(`✅ Found ${imagesWithUrls.length} images in Supabase bucket`);
      } else {
        setImages([]);
        console.log('ℹ️ No images found in Supabase bucket');
      }
    } catch (err) {
      console.error('❌ Error loading images:', err);
      setError(err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Load images on component mount
  useEffect(() => {
    loadImages();
  }, []);

  // Test image accessibility
  const testImageAccess = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Image access test failed:', error);
      return false;
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard!');
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Image className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Supabase Images</h2>
        </div>
        
        <button
          onClick={loadImages}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Bucket: product-images</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>{images.length} images found</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Error loading images</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading images from Supabase...</p>
        </div>
      )}

      {/* Images Grid */}
      {!loading && images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <ImageCard
              key={index}
              image={image}
              onSelect={setSelectedImage}
              onCopyUrl={copyToClipboard}
              testAccess={testImageAccess}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && images.length === 0 && !error && (
        <div className="text-center py-8">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Images Found</h3>
          <p className="text-gray-600 mb-4">
            No images found in the Supabase bucket. Upload some images to get started.
          </p>
          <button
            onClick={loadImages}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onCopyUrl={copyToClipboard}
        />
      )}
    </div>
  );
};

// Individual Image Card Component
const ImageCard = ({ image, onSelect, onCopyUrl, testAccess }) => {
  const [isAccessible, setIsAccessible] = useState(null);
  const [testing, setTesting] = useState(false);

  // Test image accessibility on mount
  useEffect(() => {
    const checkAccess = async () => {
      setTesting(true);
      const accessible = await testAccess(image.publicUrl);
      setIsAccessible(accessible);
      setTesting(false);
    };
    
    checkAccess();
  }, [image.publicUrl, testAccess]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Preview */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={image.publicUrl}
          alt={image.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        
        {/* Access Status */}
        <div className="absolute top-2 right-2">
          {testing ? (
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          ) : isAccessible ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
      </div>

      {/* Image Info */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-2 truncate" title={image.name}>
          {image.name}
        </h4>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div>Size: {(image.metadata?.size / 1024).toFixed(1)} KB</div>
          <div>Modified: {new Date(image.updated_at).toLocaleDateString()}</div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => onSelect(image)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded transition-colors flex items-center justify-center"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </button>
          
          <button
            onClick={() => onCopyUrl(image.publicUrl)}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs py-2 px-3 rounded transition-colors flex items-center justify-center"
          >
            <Download className="w-3 h-3 mr-1" />
            Copy URL
          </button>
        </div>
      </div>
    </div>
  );
};

// Image Modal Component
const ImageModal = ({ image, onClose, onCopyUrl }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{image.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          <img
            src={image.publicUrl}
            alt={image.name}
            className="max-w-full max-h-96 mx-auto"
          />
          
          <div className="mt-4 space-y-2 text-sm">
            <div><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{image.publicUrl}</code></div>
            <div><strong>Path:</strong> {image.fullPath}</div>
            <div><strong>Size:</strong> {(image.metadata?.size / 1024).toFixed(1)} KB</div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => onCopyUrl(image.publicUrl)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Copy URL
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseImageViewer;
