import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader, Image as ImageIcon } from 'lucide-react';
import { vercelBlobService } from '../../services/vercelBlobService';

const VercelImageUpload = ({ onUploadComplete, category = 'general', productId = null }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const url = await vercelBlobService.uploadProductImage(file, productId, category);
      
      const result = {
        url,
        filename: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        storage: 'vercel',
        optimized: true
      };

      setUploadResult(result);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Uploading to Vercel Blob...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Drag and drop an image here, or{' '}
              <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                browse
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">Max file size: 10MB</p>
          </>
        )}
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Upload Successful
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                {uploadResult.filename} ({(uploadResult.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          </div>
          <div className="mt-2">
            <img
              src={uploadResult.url}
              alt="Uploaded"
              className="w-full h-32 object-cover rounded border"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Vercel Blob Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center">
          <ImageIcon className="w-4 h-4 text-blue-500 mr-2" />
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <p className="font-medium">Vercel Blob Storage</p>
            <p>Global CDN • WebP optimization • Responsive loading</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VercelImageUpload;
