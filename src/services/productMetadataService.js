/**
 * Product Metadata Service
 * Comprehensive CRUD operations for product metadata
 */

import { supabase } from '../lib/supabase';

class ProductMetadataService {
  constructor() {
    this.tableName = 'product_metadata';
    this.categoriesTable = 'product_categories';
    this.reviewsTable = 'product_reviews';
  }

  // ==================== PRODUCT METADATA CRUD ====================

  /**
   * Create a new product with metadata
   */
  async createProduct(productData) {
    try {
      console.log('🔄 Creating product with metadata...', productData);

      // Generate unique IDs if not provided
      const productId = productData.product_id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const sku = productData.sku || `SKU_${Date.now()}`;

      const insertData = {
        product_id: productId,
        name: productData.name || 'Untitled Product',
        description: productData.description || '',
        short_description: productData.short_description || '',
        category: productData.category || 'Uncategorized',
        subcategory: productData.subcategory || null,
        brand: productData.brand || null,
        model: productData.model || null,
        sku: sku,
        price: productData.price ? parseFloat(productData.price) : 0,
        original_price: productData.original_price ? parseFloat(productData.original_price) : null,
        currency: productData.currency || 'K',
        discount_percentage: productData.discount_percentage ? parseInt(productData.discount_percentage) : 0,
        stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : 0,
        low_stock_threshold: productData.low_stock_threshold ? parseInt(productData.low_stock_threshold) : 5,
        in_stock: productData.in_stock !== false,
        track_inventory: productData.track_inventory !== false,
        status: productData.status || 'active',
        featured: productData.featured || false,
        bestseller: productData.bestseller || false,
        new_arrival: productData.new_arrival || false,
        on_sale: productData.on_sale || false,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        dimensions_length: productData.dimensions_length ? parseFloat(productData.dimensions_length) : null,
        dimensions_width: productData.dimensions_width ? parseFloat(productData.dimensions_width) : null,
        dimensions_height: productData.dimensions_height ? parseFloat(productData.dimensions_height) : null,
        color: productData.color || null,
        size: productData.size || null,
        primary_image_url: productData.primary_image_url || productData.image || null,
        image_urls: Array.isArray(productData.image_urls) ? productData.image_urls : [],
        video_url: productData.video_url || null,
        specifications: typeof productData.specifications === 'object' ? productData.specifications : {},
        features: Array.isArray(productData.features) ? productData.features : [],
        compatibility: Array.isArray(productData.compatibility) ? productData.compatibility : [],
        meta_title: productData.meta_title || productData.name,
        meta_description: productData.meta_description || productData.description,
        keywords: Array.isArray(productData.keywords) ? productData.keywords : [],
        tags: Array.isArray(productData.tags) ? productData.tags : [],
        supplier_name: productData.supplier_name || null,
        supplier_sku: productData.supplier_sku || null,
        supplier_price: productData.supplier_price ? parseFloat(productData.supplier_price) : null,
        shipping_weight: productData.shipping_weight ? parseFloat(productData.shipping_weight) : null,
        shipping_class: productData.shipping_class || null,
        free_shipping: productData.free_shipping || false,
        warranty_period: productData.warranty_period || null,
        return_policy: productData.return_policy || null,
        care_instructions: productData.care_instructions || null,
        average_rating: 0.00,
        review_count: 0
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating product:', error);
        throw error;
      }

      console.log('✅ Product created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in createProduct:', error);
      throw error;
    }
  }

  /**
   * Get all products with optional filtering
   */
  async getProducts(filters = {}) {
    try {
      console.log('🔄 Fetching products with filters:', filters);

      let query = supabase
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // Default to active products only
        query = query.eq('status', 'active');
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters.in_stock !== undefined) {
        query = query.eq('in_stock', filters.in_stock);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Sorting
      if (filters.sort_by) {
        const ascending = filters.sort_order !== 'desc';
        query = query.order(filters.sort_by, { ascending });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data.length} products`);
      return data;
    } catch (error) {
      console.error('❌ Error in getProducts:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(productId) {
    try {
      console.log('🔄 Fetching product by ID:', productId);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) {
        console.error('❌ Error fetching product:', error);
        throw error;
      }

      console.log('✅ Product fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in getProductById:', error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  async updateProduct(productId, updateData) {
    try {
      console.log('🔄 Updating product:', productId, updateData);

      // Remove undefined values and prepare update object
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      // Convert numeric fields
      if (cleanUpdateData.price) {
        cleanUpdateData.price = parseFloat(cleanUpdateData.price);
      }
      if (cleanUpdateData.stock_quantity) {
        cleanUpdateData.stock_quantity = parseInt(cleanUpdateData.stock_quantity);
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(cleanUpdateData)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating product:', error);
        throw error;
      }

      console.log('✅ Product updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in updateProduct:', error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId) {
    try {
      console.log('🔄 Deleting product:', productId);

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('product_id', productId);

      if (error) {
        console.error('❌ Error deleting product:', error);
        throw error;
      }

      console.log('✅ Product deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error in deleteProduct:', error);
      throw error;
    }
  }

  /**
   * Update product stock
   */
  async updateStock(productId, quantity, operation = 'set') {
    try {
      console.log('🔄 Updating stock:', productId, quantity, operation);

      if (operation === 'increment') {
        const { data, error } = await supabase.rpc('increment_stock', {
          product_id: productId,
          increment_by: quantity
        });

        if (error) throw error;
        return data;
      } else if (operation === 'decrement') {
        const { data, error } = await supabase.rpc('decrement_stock', {
          product_id: productId,
          decrement_by: quantity
        });

        if (error) throw error;
        return data;
      } else {
        // Set operation
        return await this.updateProduct(productId, {
          stock_quantity: quantity,
          in_stock: quantity > 0
        });
      }
    } catch (error) {
      console.error('❌ Error in updateStock:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category) {
    return await this.getProducts({ category, status: 'active' });
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts() {
    return await this.getProducts({ featured: true, status: 'active' });
  }

  /**
   * Search products
   */
  async searchProducts(searchTerm, filters = {}) {
    return await this.getProducts({ 
      ...filters, 
      search: searchTerm,
      status: 'active'
    });
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .lt('stock_quantity', supabase.raw('low_stock_threshold'))
        .eq('track_inventory', true)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error getting low stock products:', error);
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, in_stock, featured')
        .eq('status', 'active');

      if (error) throw error;

      const stats = {
        total: data.length,
        in_stock: data.filter(p => p.in_stock).length,
        out_of_stock: data.filter(p => !p.in_stock).length,
        featured: data.filter(p => p.featured).length
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting product stats:', error);
      throw error;
    }
  }

  // ==================== CATEGORY MANAGEMENT ====================

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    try {
      console.log('🔄 Creating category:', categoryData);

      const { data, error } = await supabase
        .from(this.categoriesTable)
        .insert([{
          name: categoryData.name,
          slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
          description: categoryData.description,
          parent_id: categoryData.parent_id,
          image_url: categoryData.image_url,
          icon: categoryData.icon,
          sort_order: categoryData.sort_order || 0,
          is_active: categoryData.is_active !== false,
          meta_title: categoryData.meta_title,
          meta_description: categoryData.meta_description
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Category created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(includeInactive = false) {
    try {
      let query = supabase
        .from(this.categoriesTable)
        .select('*')
        .order('sort_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Update a category
   */
  async updateCategory(categoryId, updateData) {
    try {
      const { data, error } = await supabase
        .from(this.categoriesTable)
        .update(updateData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId) {
    try {
      const { error } = await supabase
        .from(this.categoriesTable)
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      throw error;
    }
  }

  // ==================== REVIEW MANAGEMENT ====================

  /**
   * Add a product review
   */
  async addReview(reviewData) {
    try {
      const { data, error } = await supabase
        .from(this.reviewsTable)
        .insert([{
          product_id: reviewData.product_id,
          customer_name: reviewData.customer_name,
          customer_email: reviewData.customer_email,
          rating: parseInt(reviewData.rating),
          title: reviewData.title,
          review_text: reviewData.review_text,
          is_verified: reviewData.is_verified || false,
          is_approved: reviewData.is_approved || false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update product average rating
      await this.updateProductRating(reviewData.product_id);

      return data;
    } catch (error) {
      console.error('❌ Error adding review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(productId, approvedOnly = true) {
    try {
      let query = supabase
        .from(this.reviewsTable)
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Update product average rating
   */
  async updateProductRating(productId) {
    try {
      const reviews = await this.getProductReviews(productId, true);

      if (reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        await this.updateProduct(productId, {
          average_rating: Math.round(averageRating * 100) / 100,
          review_count: reviews.length
        });
      }
    } catch (error) {
      console.error('❌ Error updating product rating:', error);
      throw error;
    }
  }
}

// Create singleton instance
const productMetadataService = new ProductMetadataService();

export default productMetadataService;

// Export individual methods for convenience
export const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getLowStockProducts,
  getProductStats,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  addReview,
  getProductReviews,
  updateProductRating
} = productMetadataService;
