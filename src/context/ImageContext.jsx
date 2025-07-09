import React, { createContext, useContext, useState, useEffect } from 'react';
import supabaseService from '../services/supabase';
import firebaseMetadataService from '../services/firebaseMetadataService';

const ImageContext = createContext();

export const useImages = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
};

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load images with admin metadata from Firebase ONLY
  const loadImages = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🖼️ Loading images with admin metadata from Firebase...');

      // Load images from the products folder
      const imageList = await supabaseService.listImages('products');

      if (imageList && imageList.length > 0) {
        // Only load images that have admin-added metadata in Firebase
        const imagesWithMetadata = [];

        for (const image of imageList) {
          const publicUrl = supabaseService.getPublicUrl(`products/${image.name}`);

          // Try to load metadata from Firebase
          let metadata = null;
          try {
            metadata = await firebaseMetadataService.getImageMetadata(image.name);
          } catch (error) {
            console.log(`No Firebase metadata for ${image.name}`);
          }

          // ONLY include images with admin-added metadata
          if (metadata && metadata.title && metadata.title.trim()) {
            const imageWithMetadata = {
              ...image,
              id: image.name.replace(/\.[^/.]+$/, ""), // Remove file extension for ID
              publicUrl,
              fullPath: `products/${image.name}`,
              title: metadata.title,
              description: metadata.description || '',
              category: metadata.category || '',
              price: metadata.price || null,
              inStock: metadata.in_stock !== false,
              featured: metadata.featured || false,
              tags: metadata.tags || [],
              specifications: metadata.specifications || {},
              hasMetadata: true,
              isUsed: false // Will be updated when products are loaded
            };

            imagesWithMetadata.push(imageWithMetadata);
          }
        }

        setImages(imagesWithMetadata);
        setLastUpdated(new Date());
        console.log(`✅ Loaded ${imagesWithMetadata.length} images with admin metadata from Firebase`);
        console.log(`ℹ️ Filtered out ${imageList.length - imagesWithMetadata.length} images without admin metadata`);
      } else {
        setImages([]);
        console.log('ℹ️ No images found in Supabase storage');
      }
    } catch (error) {
      console.error('❌ Error loading images:', error);
      setError(error.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // NO automatic data generation - all metadata comes from Firebase admin entries

  // Get images by category
  const getImagesByCategory = (category) => {
    if (category === 'All') return images;
    return images.filter(image => image.category === category);
  };

  // Get random image from category
  const getRandomImageFromCategory = (category) => {
    const categoryImages = getImagesByCategory(category);
    if (categoryImages.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * categoryImages.length);
    return categoryImages[randomIndex];
  };

  // Get featured images (first few from each category)
  const getFeaturedImages = () => {
    const categories = ['Microcontrollers', 'WiFi Modules', 'Sensors', 'Components'];
    const featuredImages = [];
    
    categories.forEach(category => {
      const categoryImages = getImagesByCategory(category);
      if (categoryImages.length > 0) {
        featuredImages.push(categoryImages[0]); // Take first image from each category
      }
    });
    
    return featuredImages;
  };

  // Get unique categories
  const getCategories = () => {
    const categories = [...new Set(images.map(image => image.category))];
    return ['All', ...categories];
  };

  // Upload new image
  const uploadImage = async (file, folder = 'products') => {
    try {
      console.log('📤 Uploading image to Supabase storage...');
      
      const uploadedImage = await supabaseService.uploadImage(file, folder);
      
      // Reload images to include the new one
      await loadImages(true);
      
      console.log('✅ Image uploaded successfully:', uploadedImage);
      return uploadedImage;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  };

  // Delete image
  const deleteImage = async (imagePath) => {
    try {
      console.log('🗑️ Deleting image from Supabase storage...');
      
      await supabaseService.deleteImage(imagePath);
      
      // Remove from local state
      setImages(prev => prev.filter(image => image.fullPath !== imagePath));
      
      console.log('✅ Image deleted successfully:', imagePath);
      return true;
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
  };

  // Update image metadata in Firebase
  const updateImageMetadata = async (imageName, metadata) => {
    try {
      console.log('📝 Updating image metadata in Firebase...');

      // Save to Firebase
      await firebaseMetadataService.saveImageMetadata(imageName, metadata);
      console.log('✅ Metadata saved to Firebase');

      // Update local state for immediate UI feedback
      setImages(prev => prev.map(image =>
        image.name === imageName
          ? { ...image, ...metadata, hasMetadata: true }
          : image
      ));

      console.log('✅ Image metadata updated successfully:', imageName);
      return true;
    } catch (error) {
      console.error('❌ Error updating image metadata:', error);
      throw error;
    }
  };

  // Refresh images
  const refreshImages = () => {
    return loadImages(true);
  };

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, []);

  // Listen for image updates
  useEffect(() => {
    const handleImageUpdate = () => {
      console.log('🔄 Image update event received, refreshing images...');
      setTimeout(() => {
        loadImages(true);
      }, 500);
    };

    window.addEventListener('imageDataUpdated', handleImageUpdate);

    return () => {
      window.removeEventListener('imageDataUpdated', handleImageUpdate);
    };
  }, []);

  const value = {
    // State
    images,
    loading,
    error,
    lastUpdated,

    // Actions
    loadImages,
    uploadImage,
    deleteImage,
    updateImageMetadata,
    refreshImages,

    // Getters
    getImagesByCategory,
    getRandomImageFromCategory,
    getFeaturedImages,
    getCategories,

    // Computed values
    totalImages: images.length,
    categories: getCategories(),
    featuredImages: getFeaturedImages()
  };

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
};

export default ImageContext;
