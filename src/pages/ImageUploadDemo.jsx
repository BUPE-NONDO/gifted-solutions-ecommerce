import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import { uploadImage, getAllImages, deleteImage } from '../utils/imageUtils';
import { Trash2, Eye, Copy, CheckCircle } from 'lucide-react';

const ImageUploadDemo = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');

  const handleImageUpload = async (imageUrl) => {
    setSelectedImage(imageUrl);
    setUploadError('');
    // Refresh the gallery
    const allImages = getAllImages();
    setUploadedImages(allImages);
  };

  const handleImageError = (error) => {
    setUploadError(error);
  };

  const handleDeleteImage = (filename) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImage(filename);
      const allImages = getAllImages();
      setUploadedImages(allImages);
      if (selectedImage && selectedImage.includes(filename)) {
        setSelectedImage('');
      }
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    });
  };

  // Load images on component mount
  React.useEffect(() => {
    const allImages = getAllImages();
    setUploadedImages(allImages);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🖼️ Image Upload Demo
          </h1>
          <p className="text-gray-600">
            Test the local image upload functionality for product images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Image
            </h2>
            
            <ImageUpload
              value={selectedImage}
              onChange={handleImageUpload}
              onError={handleImageError}
              placeholder="Upload a product image"
              className="mb-4"
            />

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{uploadError}</p>
              </div>
            )}

            {selectedImage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium mb-2">✅ Upload Successful!</h3>
                <p className="text-green-700 text-sm mb-2">Image URL:</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-green-100 px-2 py-1 rounded text-xs text-green-800 flex-1 truncate">
                    {selectedImage}
                  </code>
                  <button
                    onClick={() => handleCopyUrl(selectedImage)}
                    className="text-green-600 hover:text-green-700"
                  >
                    {copiedUrl === selectedImage ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Image Preview
            </h2>
            
            {selectedImage ? (
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Selected preview"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Status:</strong> Ready to use in product form</p>
                  <p><strong>Usage:</strong> This URL can be used in the product image field</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="mx-auto h-12 w-12 mb-2" />
                  <p>Upload an image to see preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Uploaded Images ({uploadedImages.length})
          </h2>
          
          {uploadedImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No images uploaded yet. Upload your first image above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.filename} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.objectUrl}
                      alt={image.originalName}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => setSelectedImage(image.objectUrl)}
                    />
                  </div>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteImage(image.filename)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-900 truncate" title={image.originalName}>
                      {image.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(image.size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex space-x-1 mt-1">
                      <button
                        onClick={() => setSelectedImage(image.objectUrl)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleCopyUrl(image.objectUrl)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      >
                        {copiedUrl === image.objectUrl ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-800 font-medium mb-2">📋 How to Use:</h3>
          <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
            <li>Upload an image using the drag-and-drop area or click to browse</li>
            <li>The image will be processed and a preview URL will be generated</li>
            <li>Copy the image URL and use it in the product form</li>
            <li>The image will be stored locally and available in the admin gallery</li>
            <li>You can manage all uploaded images in the admin image gallery</li>
          </ol>
        </div>

        {/* Technical Info */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-800 font-medium mb-2">🔧 Technical Details:</h3>
          <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
            <li>Supported formats: JPEG, PNG, WebP</li>
            <li>Maximum file size: 5MB</li>
            <li>Images are stored locally using Object URLs</li>
            <li>Automatic image compression and optimization</li>
            <li>Drag and drop support for easy uploading</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadDemo;
