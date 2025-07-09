import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import BulkDiscountDisplay from '../components/BulkDiscountDisplay';
import { enhancedImageService } from '../services/enhancedImageService';
import RobustImage from '../components/RobustImage';

import {
  Search,
  Package,
  Play,
  Youtube,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  X,
  Eye,
  ExternalLink
} from 'lucide-react';

const Gallery = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();

  // State for Supabase images (same as SuperAdmin approach)
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'All');

  // State for product detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Load images with admin metadata from Firebase ONLY
  const loadSupabaseImages = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🖼️ Loading images with admin metadata from Firebase for Gallery...');

      const { default: supabaseService } = await import('../services/supabase');
      const { default: firebaseMetadataService } = await import('../services/firebaseMetadataService');

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
              hasMetadata: true
            };

            imagesWithMetadata.push(imageWithMetadata);
          }
        }

        setImages(imagesWithMetadata);
        console.log(`✅ Loaded ${imagesWithMetadata.length} images with admin metadata from Firebase for Gallery`);
        console.log(`ℹ️ Filtered out ${imageList.length - imagesWithMetadata.length} images without admin metadata`);
      } else {
        setImages([]);
        console.log('ℹ️ No images found in Supabase storage');
      }
    } catch (err) {
      console.error('❌ Error loading images for Gallery:', err);
      setError(err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // NO automatic data generation - all metadata comes from Firebase admin entries

  // Get unique categories from images
  const getCategories = () => {
    const categories = [...new Set(images.map(image => image.category))];
    return ['All', ...categories];
  };

  // Load images on component mount and set up refresh listener
  useEffect(() => {
    loadSupabaseImages();

    // Listen for global refresh events from SuperAdmin
    const handleGlobalRefresh = () => {
      console.log('🔄 Gallery page refreshing due to SuperAdmin changes...');
      loadSupabaseImages();
    };

    // Set up global refresh listener
    window.addEventListener('refreshAllImages', handleGlobalRefresh);

    // Also set up a global function that SuperAdmin can call
    if (!window.refreshGalleryImages) {
      window.refreshGalleryImages = loadSupabaseImages;
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener('refreshAllImages', handleGlobalRefresh);
      delete window.refreshGalleryImages;
    };
  }, []);

  // Filter images
  const filteredAndSortedImages = useMemo(() => {
    let filtered = images;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(image => image.category === selectedCategory);
    }

    // Sort by name alphabetically
    filtered.sort((a, b) => {
      const aValue = (a.title || a.name).toLowerCase();
      const bValue = (b.title || b.name).toLowerCase();
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    return filtered;
  }, [images, searchTerm, selectedCategory]);

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    if (newCategory === 'All') {
      navigate('/gallery');
    } else {
      navigate(`/gallery/${newCategory}`);
    }
  };

  const handleAddToCart = (image) => {
    if (image.price) {
      const cartItem = {
        id: image.id,
        name: image.title || image.name,
        price: image.price,
        image: image.publicUrl,
        category: image.category,
        description: image.description
      };
      addToCart(cartItem);
    }
  };

  // Handle opening product detail modal
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Handle closing product detail modal
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <Package className="w-12 h-12 animate-pulse mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <p className="text-red-600">Error loading gallery: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Simple Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h1>
          <p className="text-gray-600 mt-1">Browse our electronic components</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Simple Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {getCategories().map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredAndSortedImages.length} products found
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </div>

        {/* Clean Product Grid */}
        {filteredAndSortedImages.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredAndSortedImages.map((image) => (
              <ProductCard key={image.id} image={image} onAddToCart={handleAddToCart} onViewProduct={handleViewProduct} />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProduct.title || selectedProduct.name}
              </h2>
              <button
                onClick={closeProductModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <RobustImage
                      src={enhancedImageService.getOptimizedUrl(selectedProduct.publicUrl || selectedProduct.image, { width: 600, height: 600 })}
                      alt={selectedProduct.title || selectedProduct.name}
                      productName={selectedProduct.title || selectedProduct.name}
                      category={selectedProduct.category}
                      className="w-full h-full object-cover"
                      loading={enhancedImageService.isVercelBlobUrl(selectedProduct.publicUrl || selectedProduct.image) ? "eager" : "lazy"}
                      {...(enhancedImageService.isVercelBlobUrl(selectedProduct.publicUrl || selectedProduct.image) && {
                        srcSet: enhancedImageService.generateSrcSet(selectedProduct.publicUrl || selectedProduct.image),
                        sizes: "(max-width: 768px) 400px, 600px"
                      })}
                    />
                  </div>

                  {/* Video Indicators */}
                  {(selectedProduct.video_url || selectedProduct.videoUrl || selectedProduct.youtube_tutorial_url || selectedProduct.youtubeTutorialUrl) && (
                    <div className="flex space-x-2">
                      {(selectedProduct.video_url || selectedProduct.videoUrl) && (
                        <div className="flex items-center bg-black text-white rounded-lg px-3 py-2 text-sm">
                          <Play className="w-4 h-4 mr-2" />
                          Product Video
                        </div>
                      )}
                      {(selectedProduct.youtube_tutorial_url || selectedProduct.youtubeTutorialUrl) && (
                        <div className="flex items-center bg-red-600 text-white rounded-lg px-3 py-2 text-sm">
                          <Youtube className="w-4 h-4 mr-2" />
                          Tutorial
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedProduct.description || 'Professional electronic component with advanced features'}
                    </p>
                  </div>

                  {/* Price */}
                  {selectedProduct.price && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Price</h3>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        K{selectedProduct.price}
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Features</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        High-quality construction
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Professional grade components
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Compatible with standard projects
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Detailed documentation included
                      </li>
                    </ul>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Category:</span>
                        <span className="text-gray-600 dark:text-gray-300 ml-2">
                          {selectedProduct.category || 'Components'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Availability:</span>
                        <span className={`ml-2 ${selectedProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Discounts */}
                  <BulkDiscountDisplay
                    product={selectedProduct}
                    currentQuantity={getItemQuantity(selectedProduct.id)}
                    compact={false}
                  />

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        closeProductModal();
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={closeProductModal}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Product Card Component - Updated design with full image and quantity controls
const ProductCard = ({ image, onAddToCart, onViewProduct }) => {
  const [quantity, setQuantity] = useState(0);
  const [isInCart, setIsInCart] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(image);
    setQuantity(1);
    setIsInCart(true);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      setQuantity(0);
      setIsInCart(false);
    } else {
      setQuantity(newQuantity);
      // Update cart with new quantity
      onAddToCart({ ...image, quantity: newQuantity });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Stock Status Badge */}
      <div className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 text-center">
        {image.inStock ? 'In Stock' : 'Out of Stock'}
      </div>

      {/* Image Container - Full image fill */}
      <div className="aspect-square relative overflow-hidden">
        <RobustImage
          src={enhancedImageService.getOptimizedUrl(image.publicUrl, { width: 300, height: 300 })}
          alt={image.title || image.name}
          productName={image.title || image.name}
          category={image.category}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading={enhancedImageService.isVercelBlobUrl(image.publicUrl) ? "eager" : "lazy"}
          {...(enhancedImageService.isVercelBlobUrl(image.publicUrl) && {
            srcSet: enhancedImageService.generateSrcSet(image.publicUrl),
            sizes: "(max-width: 768px) 250px, 300px"
          })}
        />

        {/* Video Indicators */}
        {(image.video_url || image.videoUrl || image.youtube_tutorial_url || image.youtubeTutorialUrl) && (
          <div className="absolute top-2 right-2 flex space-x-1">
            {(image.video_url || image.videoUrl) && (
              <div className="bg-black bg-opacity-70 text-white rounded-full p-1.5 text-xs">
                <Play className="w-3 h-3" />
              </div>
            )}
            {(image.youtube_tutorial_url || image.youtubeTutorialUrl) && (
              <div className="bg-red-600 text-white rounded-full p-1.5 text-xs">
                <Youtube className="w-3 h-3" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Badge */}
      <div className="px-3 pt-2">
        <span className="inline-block bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
          {image.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {image.title || image.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">
          {image.description}
        </p>

        {/* Price */}
        {image.price && (
          <div className="text-lg font-bold text-gray-900">
            K{image.price}
          </div>
        )}

        {/* Compact Bulk Discount Display */}
        <BulkDiscountDisplay
          product={image}
          currentQuantity={quantity}
          compact={true}
        />

        {/* View Details Button */}
        <button
          onClick={() => onViewProduct && onViewProduct(image)}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded text-sm transition-colors duration-200 flex items-center justify-center mb-2"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </button>

        {/* Add to Cart Button or Quantity Controls */}
        {image.price && image.inStock && (
          <>
            {!isInCart ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded text-sm transition-colors duration-200 flex items-center justify-center"
              >
                🛒 Add to Cart
              </button>
            ) : (
              <div className="flex items-center justify-between bg-gray-100 rounded p-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold"
                >
                  −
                </button>
                <span className="text-lg font-semibold text-gray-900">
                  Qty: {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold"
                >
                  +
                </button>
              </div>
            )}
          </>
        )}

        {/* Out of Stock Button */}
        {image.price && !image.inStock && (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-3 rounded text-sm cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default Gallery;
