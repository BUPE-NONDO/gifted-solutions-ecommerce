import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Link,
  Unlink,
  Eye,
  Trash2,
  Download,
  Search,
  Filter,
  Grid,
  List,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Save,
  Sync,
  Database,
  ExternalLink
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import supabaseService from '../services/supabase';
import { supabase } from '../lib/supabase';

const SupabaseImageSyncTool = () => {
  // State management
  const [supabaseImages, setSupabaseImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all'); // 'all', 'assigned', 'unassigned'
  const [message, setMessage] = useState(null);
  const [syncResults, setSyncResults] = useState(null);

  // Get products from context
  const { products, updateProduct, refreshProducts } = useProducts();

  // Load Supabase images
  const loadSupabaseImages = async () => {
    setLoading(true);
    try {
      const result = await supabaseService.listImages('products');
      if (result && result.length > 0) {
        const imagesWithDetails = result.map(img => ({
          ...img,
          publicUrl: supabaseService.getPublicUrl(img.name),
          isAssigned: isImageAssigned(img.name),
          assignedTo: getImageAssignment(img.name)
        }));
        setSupabaseImages(imagesWithDetails);
        setFilteredImages(imagesWithDetails);
        setMessage({ type: 'success', text: `Loaded ${imagesWithDetails.length} images from Supabase` });
      } else {
        setSupabaseImages([]);
        setFilteredImages([]);
        setMessage({ type: 'warning', text: 'No images found in Supabase storage' });
      }
    } catch (error) {
      console.error('Error loading Supabase images:', error);
      setMessage({ type: 'error', text: 'Failed to load images from Supabase' });
    } finally {
      setLoading(false);
    }
  };

  // Check if image is assigned to any product
  const isImageAssigned = (imageName) => {
    const imageUrl = supabaseService.getPublicUrl(imageName);
    return products.some(product => 
      product.image === imageUrl || 
      (product.images && product.images.includes(imageUrl))
    );
  };

  // Get which product(s) an image is assigned to
  const getImageAssignment = (imageName) => {
    const imageUrl = supabaseService.getPublicUrl(imageName);
    return products.filter(product => 
      product.image === imageUrl || 
      (product.images && product.images.includes(imageUrl))
    );
  };

  // Filter images based on search and filter type
  const filterImages = () => {
    let filtered = supabaseImages;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.assignedTo.some(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'assigned':
        filtered = filtered.filter(img => img.isAssigned);
        break;
      case 'unassigned':
        filtered = filtered.filter(img => !img.isAssigned);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredImages(filtered);
  };

  // Handle image selection
  const toggleImageSelection = (image) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.name === image.name);
      if (isSelected) {
        return prev.filter(img => img.name !== image.name);
      } else {
        return [...prev, image];
      }
    });
  };

  // Assign selected images to a product
  const assignImagesToProduct = async (productId, imageUrls) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Update product with new images
      const updatedProduct = {
        ...product,
        image: imageUrls[0] || product.image, // Set first image as main image
        images: [...(product.images || []), ...imageUrls].filter((url, index, arr) => 
          arr.indexOf(url) === index // Remove duplicates
        )
      };

      await updateProduct(productId, updatedProduct);
      return { success: true, product: updatedProduct };
    } catch (error) {
      console.error('Error assigning images to product:', error);
      return { success: false, error: error.message };
    }
  };

  // Sync selected images with selected product
  const syncSelectedImages = async () => {
    if (!selectedProduct || selectedImages.length === 0) {
      setMessage({ type: 'warning', text: 'Please select a product and at least one image' });
      return;
    }

    setSyncing(true);
    try {
      const imageUrls = selectedImages.map(img => img.publicUrl);
      const result = await assignImagesToProduct(selectedProduct.id, imageUrls);

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully assigned ${selectedImages.length} image(s) to ${selectedProduct.name}` 
        });
        
        // Clear selections
        setSelectedImages([]);
        setSelectedProduct(null);
        
        // Refresh data
        await Promise.all([
          loadSupabaseImages(),
          refreshProducts()
        ]);

        setSyncResults({
          success: true,
          productName: selectedProduct.name,
          imageCount: selectedImages.length,
          timestamp: new Date().toLocaleString()
        });
      } else {
        setMessage({ type: 'error', text: `Failed to assign images: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Sync failed: ${error.message}` });
    } finally {
      setSyncing(false);
    }
  };

  // Upload new images
  const handleImageUpload = async (files) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        supabaseService.uploadProductImage(file)
      );
      
      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.publicUrl).length;
      
      setMessage({ 
        type: 'success', 
        text: `Successfully uploaded ${successful} of ${files.length} images` 
      });
      
      // Refresh image list
      await loadSupabaseImages();
    } catch (error) {
      setMessage({ type: 'error', text: `Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadSupabaseImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [searchTerm, filterType, supabaseImages]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Database className="mr-3 h-6 w-6 text-blue-500" />
                Supabase Image Sync Tool
              </h2>
              <p className="text-gray-600 mt-1">
                Check, assign, and sync images from Supabase storage to products
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadSupabaseImages}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <label className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
