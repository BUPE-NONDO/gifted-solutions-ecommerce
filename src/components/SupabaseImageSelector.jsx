import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Search, RefreshCw, CheckCircle } from 'lucide-react';
import { useImages } from '../context/ImageContext';
import RobustImage from './RobustImage';

const SupabaseImageSelector = ({ 
  isOpen, 
  onClose, 
  onSelectImage, 
  currentImage = null,
  title = "Select from Supabase Gallery"
}) => {
  const { images, loading, refreshImages } = useImages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Filter images based on search term
  const filteredImages = images.filter(image => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (image.name || '').toLowerCase().includes(searchLower) ||
      (image.title || '').toLowerCase().includes(searchLower) ||
      (image.category || '').toLowerCase().includes(searchLower)
    );
  });

  // Handle image selection
  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  // Confirm selection
  const handleConfirmSelection = () => {
    if (selectedImage) {
      onSelectImage(selectedImage.publicUrl, selectedImage);
      onClose();
    }
  };

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search images by name, title, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshImages}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredImages.length} of {images.length} images
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>

        {/* Images Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading images from Supabase...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching images found' : 'No images found'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Upload some images to get started'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((image, index) => (
                <ImageCard
                  key={index}
                  image={image}
                  isSelected={selectedImage?.publicUrl === image.publicUrl}
                  onSelect={() => handleImageSelect(image)}
                  currentImage={currentImage}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedImage ? (
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Selected: {selectedImage.title || selectedImage.name}
              </span>
            ) : (
              'Select an image to continue'
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedImage}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Image Card Component
const ImageCard = ({ image, isSelected, onSelect, currentImage }) => {
  const isCurrent = currentImage === image.publicUrl;

  return (
    <div 
      className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-purple-500 ring-2 ring-purple-200' 
          : isCurrent
          ? 'border-green-500 ring-2 ring-green-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative">
        <RobustImage
          src={image.publicUrl}
          alt={image.title || image.name}
          className="w-full h-full object-cover"
          fallbackType="electronics"
        />
        
        {/* Selection Indicator */}
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-purple-600 border-purple-600' 
            : isCurrent
            ? 'bg-green-600 border-green-600'
            : 'bg-white border-gray-300 group-hover:border-purple-400'
        }`}>
          {(isSelected || isCurrent) && (
            <CheckCircle className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Current Image Badge */}
        {isCurrent && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              Current
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
      </div>

      {/* Image Info */}
      <div className="p-2">
        <p className="text-xs font-medium text-gray-900 truncate">
          {image.title || image.name}
        </p>
        {image.category && (
          <p className="text-xs text-gray-500 truncate">
            {image.category}
          </p>
        )}
      </div>
    </div>
  );
};

export default SupabaseImageSelector;
