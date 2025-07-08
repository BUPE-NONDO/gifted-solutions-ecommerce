import React, { useState, useEffect } from 'react';
import { Package, Tag, DollarSign, CheckCircle, XCircle, Star, Eye, ShoppingCart, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import firebaseMetadataService from '../services/firebaseMetadataService';
import { useCart } from '../context/CartContext';

const ProductMetadataList = ({ showOnHomepage = false, className = "" }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    loadProductMetadata();
  }, []);

  const loadProductMetadata = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get images from Supabase
      const { data: images, error: supabaseError } = await supabase.storage
        .from('product-images')
        .list('', { limit: 100 });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (!images || images.length === 0) {
        setProducts([]);
        return;
      }

      // Get metadata for each image
      const productsWithMetadata = await Promise.all(
        images
          .filter(file => file.name !== '.emptyFolderPlaceholder')
          .map(async (file) => {
            try {
              const metadata = await firebaseMetadataService.getImageMetadata(file.name);
              
              return {
                id: file.name,
                name: file.name,
                title: metadata?.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
                description: metadata?.description || 'No description available',
                price: metadata?.price || 'Contact for price',
                category: metadata?.category || 'Components',
                inStock: metadata?.inStock !== undefined ? metadata.inStock : true,
                featured: metadata?.featured || false,
                sku: metadata?.sku || file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
                brand: metadata?.brand || 'Gifted Solutions',
                weight: metadata?.weight || 'N/A',
                dimensions: metadata?.dimensions || 'N/A',
                warranty: metadata?.warranty || '1 Year',
                tags: metadata?.tags || [],
                specifications: metadata?.specifications || {},
                lastUpdated: metadata?.lastUpdated || file.updated_at
              };
            } catch (metadataError) {
              console.warn(`Failed to load metadata for ${file.name}:`, metadataError);
              
              return {
                id: file.name,
                name: file.name,
                title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
                description: 'No description available',
                price: 'Contact for price',
                category: 'Components',
                inStock: true,
                featured: false,
                sku: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
                brand: 'Gifted Solutions',
                weight: 'N/A',
                dimensions: 'N/A',
                warranty: '1 Year',
                tags: [],
                specifications: {},
                lastUpdated: file.updated_at
              };
            }
          })
      );

      setProducts(productsWithMetadata);
    } catch (err) {
      console.error('Error loading product metadata:', err);
      setError(err.message);

      // Fallback to sample data if Firebase fails
      const sampleProducts = [
        {
          id: 'arduino-uno',
          name: 'arduino-uno.jpg',
          title: 'Arduino Uno R3',
          description: 'Microcontroller board based on the ATmega328P with 14 digital I/O pins',
          price: 150,
          category: 'Microcontrollers',
          inStock: true,
          featured: true,
          sku: 'ARD-UNO-R3',
          brand: 'Arduino',
          weight: '25g',
          dimensions: '68.6 × 53.4 mm',
          warranty: '1 Year',
          tags: ['microcontroller', 'arduino', 'development'],
          specifications: { voltage: '5V', pins: '14 digital, 6 analog' }
        },
        {
          id: 'esp32-dev',
          name: 'esp32-dev.jpg',
          title: 'ESP32 Development Board',
          description: 'WiFi and Bluetooth enabled microcontroller with dual-core processor',
          price: 200,
          category: 'Microcontrollers',
          inStock: true,
          featured: false,
          sku: 'ESP32-DEV',
          brand: 'Espressif',
          weight: '10g',
          dimensions: '55 × 28 mm',
          warranty: '1 Year',
          tags: ['esp32', 'wifi', 'bluetooth'],
          specifications: { voltage: '3.3V', cores: '2', wifi: 'Yes' }
        },
        {
          id: 'raspberry-pi-4',
          name: 'raspberry-pi-4.jpg',
          title: 'Raspberry Pi 4 Model B',
          description: 'Single board computer with quad-core ARM processor and 4GB RAM',
          price: 800,
          category: 'Single Board Computers',
          inStock: true,
          featured: true,
          sku: 'RPI4-4GB',
          brand: 'Raspberry Pi Foundation',
          weight: '46g',
          dimensions: '85 × 56 mm',
          warranty: '1 Year',
          tags: ['raspberry pi', 'computer', 'linux'],
          specifications: { ram: '4GB', cpu: 'Quad-core ARM', usb: '4 ports' }
        }
      ];
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'in-stock' && product.inStock) ||
                          (stockFilter === 'out-of-stock' && !product.inStock);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: typeof product.price === 'string' ? 0 : product.price,
      image: '/placeholder-product.jpg',
      category: product.category
    });
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <Package className="w-8 h-8 animate-pulse text-gray-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading product metadata...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-red-600 dark:text-red-400">Error loading product metadata: {error}</p>
        </div>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Product Metadata ({filteredProducts.length})
          </h2>
          {!showOnHomepage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Fast loading without images
            </span>
          )}
        </div>

        {/* Filters */}
        {!showOnHomepage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        )}
      </div>

      {/* Product List */}
      <div className="p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.slice(0, showOnHomepage ? 10 : undefined).map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  {/* Product Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{product.title}</h3>
                      <div className="flex items-center space-x-2">
                        {product.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        {product.inStock ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{product.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {product.sku}
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="text-sm">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                      <div>Brand: {product.brand}</div>
                      <div>Weight: {product.weight}</div>
                      <div>Warranty: {product.warranty}</div>
                      {product.dimensions !== 'N/A' && (
                        <div>Size: {product.dimensions}</div>
                      )}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {typeof product.price === 'number' ? `K${product.price}` : product.price}
                    </div>
                    <div className="space-y-2">
                      {product.inStock ? (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors duration-200 flex items-center justify-center"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add to Cart
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-3 py-2 rounded text-sm cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMetadataList;
