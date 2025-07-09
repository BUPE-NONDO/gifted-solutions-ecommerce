import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useImages } from '../context/ImageContext';
import { useCart } from '../context/CartContext';
import firebaseMetadataService from '../services/firebaseMetadataService';
import RobustImage from '../components/RobustImage';
import { formatPrice, parsePrice } from '../utils/priceUtils';
import { SearchEmptyState, CategoryEmptyState } from '../components/EmptyState';
import ProductMetadataList from '../components/ProductMetadataList';
import BulkDiscountDisplay from '../components/BulkDiscountDisplay';
import { enhancedImageService } from '../services/enhancedImageService';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  FileText,
  X,
  Eye,
  ExternalLink
} from 'lucide-react';

const Shop = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const { products: contextProducts, loading: productsLoading, error: productsError } = useProducts();
  const { images, getImagesByCategory, loading: imagesLoading, error: imagesError, categories: imageCategories } = useImages();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [metadataProducts, setMetadataProducts] = useState([]);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState(null);

  // State for product detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Load images with Firebase metadata (using Vercel Blob URLs)
  useEffect(() => {
    const loadImagesWithMetadata = async () => {
      setMetadataLoading(true);
      try {
        console.log('🔄 Loading images with admin metadata from Firebase for Shop...');

        // Load product metadata directly from Firebase (no Supabase storage calls)
        const { default: firebaseMetadataService } = await import('../services/firebaseMetadataService');

        // Get all products with metadata from Firebase
        const productsWithMetadata = await firebaseMetadataService.getAllProducts();

        if (productsWithMetadata && productsWithMetadata.length > 0) {
          // Filter products that have valid Vercel Blob URLs
          const imagesWithMetadata = [];

          for (const product of productsWithMetadata) {
            // Only include products with valid data and Vercel Blob URLs
            if (product.title && product.title.trim() && product.image) {
              const imageWithMetadata = {
                id: product.id,
                publicUrl: product.image, // This should be a Vercel Blob URL
                image: product.image,
                title: product.title,
                name: product.title, // For compatibility
                description: product.description || '',
                category: product.category || '',
                price: product.price || null,
                inStock: product.in_stock !== false,
                featured: product.featured || false,
                hasMetadata: true
              };

              imagesWithMetadata.push(imageWithMetadata);
            }
          }

          setMetadataProducts(imagesWithMetadata);
          console.log(`✅ Loaded ${imagesWithMetadata.length} products with Vercel Blob URLs from Firebase for Shop`);
        } else {
          setMetadataProducts([]);
          console.log('ℹ️ No products found in Firebase');
        }

        setMetadataError(null);
      } catch (error) {
        console.error('Error loading Firebase metadata products:', error);
        setMetadataError(error.message);
        setMetadataProducts([]);
      } finally {
        setMetadataLoading(false);
      }
    };

    loadImagesWithMetadata();
  }, []);

  // Combine loading and error states
  const loading = imagesLoading || productsLoading || metadataLoading;
  const error = imagesError || productsError || metadataError;
  const categories = ['All', ...imageCategories];

  // Handle adding image to cart
  const handleAddToCart = (item) => {
    if (item.price) {
      const cartItem = {
        id: item.id || item.name,
        name: item.title || item.name,
        price: item.price,
        image: item.publicUrl || item.image,
        category: item.category,
        description: item.description
      };
      addToCart(cartItem);
    }
  };

  // Filter and sort products (Firebase metadata products only - same as Home page)
  const filteredProducts = useMemo(() => {
    try {
      let items = [];

      // ONLY use Firebase metadata products (admin-configured images)
      if (metadataProducts && Array.isArray(metadataProducts) && metadataProducts.length > 0) {
        items = metadataProducts.filter(product =>
          product && product.id && product.title && product.hasMetadata
        ).map(product => ({
          ...product,
          source: 'firebase_metadata'
        }));
      }

      // Filter by category first
      if (selectedCategory !== 'All') {
        items = items.filter(item => item && item.category === selectedCategory);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        items = items.filter(item => {
          if (!item) return false;
          const name = item.title || item.name || '';
          const description = item.description || '';
          const category = item.category || '';

          return name.toLowerCase().includes(searchLower) ||
                 description.toLowerCase().includes(searchLower) ||
                 category.toLowerCase().includes(searchLower);
        });
      }

      // Sort items
      items.sort((a, b) => {
        if (!a || !b) return 0;
        switch (sortBy) {
          case 'price-low':
            const priceA = parseFloat(a.price?.toString().replace('K', '')) || 0;
            const priceB = parseFloat(b.price?.toString().replace('K', '')) || 0;
            return priceA - priceB;
          case 'price-high':
            const priceA2 = parseFloat(a.price?.toString().replace('K', '')) || 0;
            const priceB2 = parseFloat(b.price?.toString().replace('K', '')) || 0;
            return priceB2 - priceA2;
          case 'name':
          default:
            const nameA = a.title || a.name || '';
            const nameB = b.title || b.name || '';
            return nameA.localeCompare(nameB);
        }
      });

      return items;
    } catch (error) {
      console.error('Error in filteredProducts:', error);
      return [];
    }
  }, [metadataProducts, images, contextProducts, selectedCategory, searchTerm, sortBy]);

  // Calculate category counts
  const getCategoryCount = (category) => {
    try {
      const allItems = filteredProducts || [];
      
      if (!Array.isArray(allItems)) {
        return 0;
      }

      if (category === 'All') {
        return allItems.length;
      }

      return allItems.filter(item => 
        item && item.category === category
      ).length;
    } catch (error) {
      console.warn('Error calculating category count:', error);
      return 0;
    }
  };

  const handleViewDetails = (product) => {
    navigate(`/product/${product.id}`);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shop Temporarily Unavailable</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">We're experiencing technical difficulties. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                </h1>
                <p className="text-gray-600 mt-2">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Search and Controls */}
              <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors duration-200 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    title="Grid View"
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors duration-200 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    title="List View"
                  >
                    <List size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('metadata')}
                    className={`p-2 transition-colors duration-200 ${viewMode === 'metadata' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    title="Metadata View (Fast Loading)"
                  >
                    <FileText size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
                  <Filter className="mr-2" size={20} />
                  Categories
                </h3>
                <div className="space-y-2">
                  {/* All Products Option */}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'All'
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Products
                    <span className="float-right text-sm opacity-75">
                      {getCategoryCount('All')}
                    </span>
                  </button>

                  {/* Dynamic Categories */}
                  {(categories || []).filter(cat => cat !== 'All').map((cat) => {
                    const categoryName = typeof cat === 'string' ? cat : cat?.name || cat;
                    
                    if (!categoryName) {
                      return null;
                    }
                    
                    const count = getCategoryCount(categoryName);
                    return (
                      <button
                        key={categoryName}
                        onClick={() => setSelectedCategory(categoryName)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === categoryName
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {categoryName}
                        <span className="float-right text-sm opacity-75">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
                  {searchTerm.trim() ? (
                    <SearchEmptyState searchTerm={searchTerm} />
                  ) : selectedCategory !== 'All' ? (
                    <CategoryEmptyState category={selectedCategory} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 text-lg">
                        No products available. Add products through the admin panel.
                      </p>
                    </div>
                  )}
                </div>
              ) : viewMode === 'metadata' ? (
                <ProductMetadataList showOnHomepage={false} className="w-full" />
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {(filteredProducts || []).map((item) => {
                    try {
                      if (!item || (!item.id && !item.name)) {
                        return null;
                      }

                      const key = item.id || item.name || Math.random().toString();
                      
                      return viewMode === 'grid' ? (
                        <ProductCard
                          key={key}
                          product={item}
                          onAddToCart={handleAddToCart}
                          onViewDetails={handleViewDetails}
                          onViewProduct={handleViewProduct}
                        />
                      ) : (
                        <ProductListItem
                          key={key}
                          product={item}
                          onAddToCart={handleAddToCart}
                          onViewDetails={handleViewDetails}
                          onViewProduct={handleViewProduct}
                        />
                      );
                    } catch (renderError) {
                      console.error('Error rendering item:', item, renderError);
                      return (
                        <div key={item?.id || Math.random()} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-600 text-sm">Error loading product</p>
                        </div>
                      );
                    }
                  }).filter(Boolean)}
                </div>
              )}
            </div>
          </div>
        </div>
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
                    <img
                      src={selectedProduct.publicUrl || selectedProduct.image || '/placeholder-product.jpg'}
                      alt={selectedProduct.title || selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
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
                        {typeof selectedProduct.price === 'string' && selectedProduct.price.startsWith('K')
                          ? selectedProduct.price
                          : `K${selectedProduct.price}`
                        }
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
                      onClick={() => {
                        handleViewDetails(selectedProduct);
                        closeProductModal();
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  } catch (shopError) {
    console.error('Critical error in Shop component:', shopError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">💥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">The shop page encountered an error. Please refresh to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

// Product Card Component for Grid View
const ProductCard = ({ product, onAddToCart, onViewDetails, onViewProduct }) => {
  const { isInCart, getItemQuantity, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showQuantity, setShowQuantity] = useState(false);

  const inCart = isInCart(product.id);
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onAddToCart(product);
    setIsAdding(false);
    setShowQuantity(true);
    setTimeout(() => setShowQuantity(false), 3000);
  };

  const handleQuantityChange = (newQuantity) => {
    updateQuantity(product.id, newQuantity);
    if (newQuantity === 0) {
      setShowQuantity(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Stock Status Badge */}
      {product.inStock && (
        <div className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 text-center">
          In Stock
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden p-4 transition-colors duration-200">
        <RobustImage
          src={enhancedImageService.getOptimizedUrl(product.publicUrl || product.image, { width: 400, height: 400 })}
          alt={product.title || product.name}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          fallbackType="electronics"
          loading={enhancedImageService.isVercelBlobUrl(product.publicUrl || product.image) ? "eager" : "lazy"}
          {...(enhancedImageService.isVercelBlobUrl(product.publicUrl || product.image) && {
            srcSet: enhancedImageService.generateSrcSet(product.publicUrl || product.image),
            sizes: "(max-width: 768px) 300px, 400px"
          })}
        />
        {product.featured && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="text-sm text-green-600 font-medium">
          {product.category}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
          {product.title || product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {product.description}
        </p>

        {/* Price */}
        {product.price && (
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof product.price === 'string' && product.price.startsWith('K')
              ? product.price
              : `K${product.price}`
            }
          </div>
        )}

        {/* Compact Bulk Discount Display */}
        <BulkDiscountDisplay
          product={product}
          currentQuantity={quantity}
          compact={true}
        />

        {/* Actions */}
        <div className="space-y-2">
          {/* View Details Button */}
          <button
            onClick={() => onViewProduct && onViewProduct(product)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </button>

          {/* Add to Cart Button */}
          {product.price && product.inStock && !inCart && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
            >
              {isAdding ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </button>
          )}

          {/* Quantity Controls */}
          {inCart && (showQuantity || quantity > 0) && (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2 transition-colors duration-200">
              <span className="text-sm text-green-600 font-medium flex items-center">
                <Check size={16} className="mr-1" />
                In Cart: {quantity}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 p-1 rounded transition-colors duration-200"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="bg-primary-500 hover:bg-primary-600 text-white p-1 rounded"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Out of Stock Button */}
          {product.price && !product.inStock && (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}

          {/* View Details Button */}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(product)}
              className="w-full text-primary-500 hover:text-primary-600 text-sm font-medium py-2"
            >
              View Details →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Product List Item Component for List View
const ProductListItem = ({ product, onAddToCart, onViewDetails, onViewProduct }) => {
  const { isInCart, getItemQuantity, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start space-x-4">
        {/* Image */}
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 p-2 transition-colors duration-200">
          <RobustImage
            src={enhancedImageService.getOptimizedUrl(product.publicUrl || product.image, { width: 96, height: 96 })}
            alt={product.title || product.name}
            className="w-full h-full object-contain"
            fallbackType="electronics"
            loading={enhancedImageService.isVercelBlobUrl(product.publicUrl || product.image) ? "eager" : "lazy"}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Stock Status */}
              {product.inStock && (
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  In Stock
                </span>
              )}

              {/* Category */}
              <div className="text-sm text-green-600 font-medium">
                {product.category}
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                {product.title || product.name}
                {product.featured && (
                  <Star className="w-4 h-4 text-yellow-500 inline ml-2" />
                )}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>

              {/* Price */}
              {product.price && (
                <div className="text-xl font-bold text-gray-900">
                  {typeof product.price === 'string' && product.price.startsWith('K')
                    ? product.price
                    : `K${product.price}`
                  }
                </div>
              )}

              {/* Compact Bulk Discount Display */}
              <BulkDiscountDisplay
                product={product}
                currentQuantity={quantity}
                compact={true}
              />
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 ml-4 space-y-2">
              {/* View Details Button */}
              <button
                onClick={() => onViewProduct && onViewProduct(product)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>

              {product.price && product.inStock && !inCart && (
                <button
                  onClick={handleAddToCart}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg flex items-center transition-colors duration-200"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              )}

              {inCart && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-green-600 font-medium flex items-center">
                    <Check size={16} className="mr-1" />
                    In Cart: {quantity}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="bg-primary-500 hover:bg-primary-600 text-white p-1 rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {product.price && !product.inStock && (
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 font-medium px-6 py-3 rounded-lg cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}

              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(product)}
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium block"
                >
                  View Details →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
