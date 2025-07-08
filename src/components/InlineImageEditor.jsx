import React, { useState, useRef } from 'react';
import { Edit3, Upload, Save, X, RefreshCw, Check } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { uploadProductImage } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

const InlineImageEditor = ({
  children,
  productId,
  currentImageUrl,
  className = '',
  onImageUpdated
}) => {
  const { updateProductImage } = useProducts();
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file || !productId) return;

    setIsUploading(true);
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `product-${productId}-${timestamp}.${file.name.split('.').pop()}`;
      
      // Upload to Supabase Storage
      console.log('🔄 Uploading image to Supabase Storage...');
      const uploadResult = await uploadProductImage(file, productId);

      if (uploadResult && uploadResult.publicUrl) {
        console.log('✅ Image uploaded successfully:', uploadResult.publicUrl);

        // Update product image in context
        await updateProductImage(productId, uploadResult.publicUrl);
        
        // Show success feedback
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        
        // Call callback if provided
        if (onImageUpdated) {
          onImageUpdated(uploadResult.publicUrl);
        }
        
        // Force page refresh to show new image
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } else {
        throw new Error('Upload failed - no result returned');
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
      setIsEditing(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleUploadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  if (!isAdmin) {
    // Return children without edit functionality for non-admin users
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {children}
      
      {/* Edit Overlay */}
      {!isEditing && !isUploading && !showSuccess && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleEditClick}
            className="bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 transform scale-90 group-hover:scale-100"
          >
            <Edit3 size={16} />
            <span className="text-sm font-medium">Edit Image</span>
          </button>
        </div>
      )}

      {/* Editing Modal */}
      {isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Replace Product Image
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleUploadClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Upload size={20} />
                  <span>Choose New Image</span>
                </button>
                
                <button
                  onClick={handleCancel}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploading State */}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Uploading image...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {showSuccess && (
        <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <Check className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Image Updated!</p>
            <p className="text-sm opacity-90">Refreshing page...</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default InlineImageEditor;
