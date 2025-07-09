import React, { useState, useRef } from 'react';
import { Upload, X, Image, Check, AlertCircle } from 'lucide-react';
import { vercelBlobService } from '../services/vercelBlobService';

const VercelImageUpload = ({ 
  onImageUploaded, 
  category = 'general',
  maxFiles = 1,
  acceptedTypes = 'image/*',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    // Validate file types
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      uploadImages(validFiles);
    }
  };

  const uploadImages = async (files) => {
    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        const url = await vercelBlobService.uploadProductImage(file, `product-${Date.now()}`, category);
        return {
          url,
          name: file.name,
          size: file.size,
          type: file.type
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...results]);
      
      // Notify parent component
      if (onImageUploaded) {
        results.forEach(result => onImageUploaded(result.url));
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index, url) => {
    try {
      await vercelBlobService.deleteImage(url);
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${dragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Uploading to Vercel...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports JPG, PNG, WebP up to 10MB
            </p>
            {maxFiles > 1 && (
              <p className="text-xs text-gray-400 mt-1">
                Upload up to {maxFiles} images
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
            Uploaded Images ({uploadedImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={vercelBlobService.getThumbnailUrl(image.url)}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Image Info Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(image.url, '_blank');
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="View full size"
                    >
                      <Image className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index, image.url);
                      }}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Success Indicator */}
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>

                {/* Image Details */}
                <div className="mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Stats */}
      {uploadedImages.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700 dark:text-green-400">
              {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} uploaded successfully to Vercel CDN
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            Images are now optimized and served globally for fast loading
          </p>
        </div>
      )}
    </div>
  );
};

export default VercelImageUpload;
