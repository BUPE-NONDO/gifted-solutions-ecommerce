import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import supabaseService from '../services/supabase'; // Import Supabase service

const ImageUpload = ({
  value,
  onChange,
  onError,
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  placeholder = 'Upload product image',
  productId = null // Optional productId for better naming in storage
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || ''); // Initialize preview with existing value
  const fileInputRef = useRef(null);

  // Effect to update preview if the external value changes
  useEffect(() => {
    if (value && value !== preview) {
      setPreview(value);
    }
    // If value is cleared externally, clear preview
    if (!value && preview) {
      setPreview('');
    }
  }, [value]);

  const validateFile = (file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Please upload: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB`;
    }

    return null;
  };

  const handleFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError && onError(validationError);
      return;
    }

    setUploading(true);
    // Show uploading state without local preview
    setPreview(''); // Clear preview during upload

    try {
      // Upload the file using Supabase service
      const uploadResult = await supabaseService.uploadProductImage(file, productId);

      // Call onChange with the permanent URL from Supabase Storage
      onChange(uploadResult.publicUrl);
      // Set preview to the permanent URL from Supabase
      setPreview(uploadResult.publicUrl);

    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      onError && onError(uploadError.message || 'Failed to upload image. Please try again.');
      // Revert preview to original value
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {preview ? (
        // Image Preview
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="mr-1 text-green-500" size={16} />
              Image uploaded successfully
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleClick}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={uploading}
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-red-600 hover:text-red-700"
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          className={`relative w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"></div>
                <p className="text-sm text-gray-600">Uploading image...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                  (Max: {formatFileSize(maxSize)})
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
