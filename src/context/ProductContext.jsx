import React, { createContext, useContext, useState, useEffect } from 'react';
import supabaseService from '../services/supabase';
import firebaseMetadataService from '../services/firebaseMetadataService';
import {
  emitProductAdded,
  emitProductUpdated,
  emitProductDeleted,
  emitProductImageUpdated,
  emitProductStockUpdated,
  forceProductRefresh
} from '../utils/productEvents';
// Removed problematic mobile image utils import

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  // Initialize products from localStorage or empty array
  const [products, setProducts] = useState(() => {
    try {
      const savedProducts = localStorage.getItem('gifted-solutions-products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        console.log('🔄 Loaded products from localStorage:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load products from localStorage:', error);
    }
    return []; // Return empty array instead of undefined initialProducts
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Save products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('gifted-solutions-products', JSON.stringify(products));
      console.log('💾 Saved products to localStorage:', products.length);
    } catch (error) {
      console.warn('Failed to save products to localStorage:', error);
    }
  }, [products]);

  // Load products - from metadata service and Supabase
  const loadProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading products from metadata service and Supabase...');

      let allProducts = [];

      // Try to get products from Firebase metadata service first (priority)
      try {
        const firebaseProducts = await firebaseMetadataService.getProducts({ status: 'active' });
        if (firebaseProducts && firebaseProducts.length > 0) {
          console.log(`✅ Found ${firebaseProducts.length} products from Firebase metadata service`);
          allProducts = [...allProducts, ...firebaseProducts];
        }
      } catch (firebaseError) {
        console.log('⚠️ Firebase metadata service not available, trying Supabase fallback');
      }

      // Fallback to legacy Supabase products if metadata service fails or has no products
      if (allProducts.length === 0) {
        try {
          const supabaseProducts = await supabaseService.getProducts();
          if (supabaseProducts && supabaseProducts.length > 0) {
            console.log(`✅ Found ${supabaseProducts.length} products from Supabase fallback`);
            allProducts = [...allProducts, ...supabaseProducts];
          }
        } catch (supabaseError) {
          console.log('⚠️ Supabase fallback also failed');
        }
      }

      setProducts(allProducts);
      setLastUpdated(new Date());
      console.log(`✅ Total products loaded: ${allProducts.length}`);

    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError(error.message);
      setProducts([]); // Empty array if no products available
    } finally {
      setLoading(false);
    }
  };

  // Load categories from Supabase products
  const loadCategories = async () => {
    try {
      // Extract categories from current products
      console.log('Loading categories from Supabase products...');
      const productCategories = [...new Set(products.map(product => product.category))];

      const categoryData = productCategories.map(name => ({
        name,
        isActive: true,
        productCount: products.filter(p => p.category === name).length
      }));

      setCategories(categoryData);
      console.log('Categories loaded from Supabase:', categoryData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  // Refresh products (for admin updates)
  const refreshProducts = () => {
    return loadProducts(true);
  };

  // Clear localStorage cache and reload from Supabase
  const clearProductCache = () => {
    try {
      localStorage.removeItem('gifted-solutions-products');
      loadProducts(true);
      console.log('🗑️ Cleared product cache and reloading from Supabase');
    } catch (error) {
      console.warn('Failed to clear product cache:', error);
    }
  };

  // Get product by ID
  const getProductById = (productId) => {
    return products.find(product => product.id === parseInt(productId));
  };

  // Get products by category
  const getProductsByCategory = (category) => {
    if (category === 'All') return products;
    return products.filter(product => product.category === category);
  };

  // Search products
  const searchProducts = (searchTerm) => {
    if (!searchTerm) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  };

  // Get unique categories
  const getCategories = () => {
    const categories = [...new Set(products.map(product => product.category))];
    return ['All', ...categories];
  };

  // Get featured products
  const getFeaturedProducts = () => {
    // First try to get products marked as featured
    const featuredProducts = products.filter(product => product.featured === true && product.inStock);

    // If no featured products, fallback to products with badges
    if (featuredProducts.length === 0) {
      return products.filter(product => product.badge && product.inStock);
    }

    return featuredProducts;
  };

  // Get products in stock
  const getInStockProducts = () => {
    return products.filter(product => product.inStock);
  };

  // Add product (for admin) - Supabase integration
  const addProduct = async (productData) => {
    try {
      console.log('☁️ Adding product to Supabase...');

      // Add to Supabase first
      const supabaseProduct = await supabaseService.addProduct(productData);

      // Update local state
      setProducts(prev => [...prev, supabaseProduct]);

      // Emit event for real-time updates
      emitProductAdded(supabaseProduct);
      forceProductRefresh();

      console.log('✅ Product added successfully:', supabaseProduct.id);
      return supabaseProduct;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      throw error;
    }
  };

  // Update product (for admin) - Supabase integration
  const updateProduct = async (productId, productData) => {
    try {
      console.log('☁️ ProductContext: Updating product in Supabase...', { productId, productData });

      // Validate inputs
      if (!productId) {
        throw new Error('Product ID is required');
      }

      if (!productData || Object.keys(productData).length === 0) {
        throw new Error('Product data is required');
      }

      // Update in Supabase first
      const updatedProduct = await supabaseService.updateProduct(productId, productData);

      if (!updatedProduct) {
        throw new Error('No data returned from Supabase update');
      }

      // Update local state
      setProducts(prev =>
        prev.map(product =>
          product.id === productId ? { ...product, ...updatedProduct } : product
        )
      );

      // Emit event for real-time updates
      emitProductUpdated(productId, updatedProduct);
      forceProductRefresh();

      console.log('✅ ProductContext: Product updated successfully:', { productId, updatedProduct });
      return updatedProduct;
    } catch (error) {
      console.error('❌ ProductContext: Error updating product:', error);
      throw error;
    }
  };

  // Delete product (for admin) - Supabase integration
  const deleteProduct = async (productId) => {
    try {
      console.log('☁️ Deleting product from Supabase...');

      // Delete from Supabase first
      await supabaseService.deleteProduct(productId);

      // Update local state
      setProducts(prev => prev.filter(product => product.id !== productId));

      // Emit event for real-time updates
      emitProductDeleted(productId);
      forceProductRefresh();

      console.log('✅ Product deleted successfully:', productId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  };

  // Update product image (for admin) - Supabase integration
  const updateProductImage = async (productId, imageUrl) => {
    try {
      console.log('☁️ Updating product image in Supabase...');

      // Update in Supabase first
      await supabaseService.updateProduct(productId, { image: imageUrl });

      // Update local state without mobile image processing
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? {
                ...product,
                image: imageUrl,
                updatedAt: new Date(),
                imageVersion: Date.now() // Version for cache busting
              }
            : product
        )
      );
      setLastUpdated(new Date());

      // Emit event for real-time updates
      emitProductImageUpdated(productId, imageUrl);
      forceProductRefresh();

      // Removed mobile image refresh to avoid errors

      // Force a complete refresh to ensure all components see the update
      setTimeout(() => {
        refreshProducts();
      }, 1000);

      console.log('✅ Product image updated successfully:', productId);
      return true;
    } catch (error) {
      console.error('❌ Error updating product image:', error);
      throw error;
    }
  };

  // Toggle product stock (for admin) - Supabase integration
  const toggleProductStock = async (productId) => {
    try {
      console.log('☁️ Toggling product stock in Supabase...');

      const product = products.find(p => p.id === productId);
      const newStockStatus = !product.inStock;

      // Update in Supabase first
      await supabaseService.updateProduct(productId, { inStock: newStockStatus });

      // Update local state
      setProducts(prev =>
        prev.map(product =>
          product.id === productId ? { ...product, inStock: newStockStatus } : product
        )
      );

      console.log('✅ Product stock updated successfully:', productId);
      return newStockStatus;
    } catch (error) {
      console.error('❌ Error toggling product stock:', error);
      throw error;
    }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Load categories when products change
  useEffect(() => {
    if (products.length > 0) {
      loadCategories();
    }
  }, [products]);

  // Listen for real-time product updates from admin panel
  useEffect(() => {
    const handleProductUpdate = (event) => {
      console.log('🔄 Product update event received:', event.detail);

      // Force refresh products from Supabase to ensure consistency
      setTimeout(() => {
        loadProducts(true);
      }, 500);
    };

    const handleStorageUpdate = (event) => {
      if (event.key === 'gifted-solutions-last-update') {
        console.log('🔄 Storage update event received, refreshing products...');
        setTimeout(() => {
          loadProducts(true);
        }, 500);
      }
    };

    // Listen for custom product update events
    window.addEventListener('productDataUpdated', handleProductUpdate);

    // Listen for storage events (cross-tab updates)
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('productDataUpdated', handleProductUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const value = {
    // State
    products,
    categories,
    loading,
    error,
    lastUpdated,

    // Actions
    loadProducts,
    loadCategories,
    refreshProducts,
    clearProductCache,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductImage,
    toggleProductStock,

    // Getters
    getProductById,
    getProductsByCategory,
    searchProducts,
    getCategories,
    getFeaturedProducts,
    getInStockProducts,

    // Computed values
    productCategories: getCategories(), // Categories from products
    dbCategories: categories, // Categories from database
    featuredProducts: getFeaturedProducts(),
    inStockProducts: getInStockProducts(),
    totalProducts: products.length,
    inStockCount: getInStockProducts().length,
    outOfStockCount: products.length - getInStockProducts().length
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
