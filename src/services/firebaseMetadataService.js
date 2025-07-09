/**
 * Firebase Metadata Service
 * Handles all product and image metadata using Firebase Firestore
 * NO automatic data generation - all data must be added by admin
 */

import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp
} from 'firebase/firestore';

class FirebaseMetadataService {
  constructor() {
    this.productsCollection = 'product_metadata';
    this.categoriesCollection = 'product_categories';
    this.reviewsCollection = 'product_reviews';
    this.imageMetadataCollection = 'image_metadata';
  }

  // ==================== IMAGE METADATA MANAGEMENT ====================

  /**
   * Save image metadata to Firebase (admin only)
   */
  async saveImageMetadata(imageName, metadata) {
    try {
      console.log('🔄 Saving image metadata to Firebase:', imageName, metadata);

      // Clean the image name to be a valid document ID
      const cleanImageName = imageName.replace(/[^a-zA-Z0-9_-]/g, '_');

      const metadataToSave = {
        name: imageName,
        original_name: imageName,
        title: metadata.title || '',
        description: metadata.description || '',
        category: metadata.category || '',
        price: metadata.price ? parseFloat(metadata.price) : null,
        currency: metadata.currency || 'K',
        tags: metadata.tags || [],
        public_url: metadata.public_url || metadata.publicUrl || '',
        file_path: metadata.file_path || metadata.fullPath || '',
        is_visible: metadata.is_visible !== false,
        in_stock: metadata.inStock !== false, // Fix: use inStock instead of in_stock
        featured: metadata.featured || false,
        // Video fields
        video_url: metadata.video_url || metadata.videoUrl || '',
        youtube_tutorial_url: metadata.youtube_tutorial_url || metadata.youtubeTutorialUrl || '',
        video_title: metadata.video_title || metadata.videoTitle || '',
        video_description: metadata.video_description || metadata.videoDescription || '',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      console.log('📝 Metadata to save:', metadataToSave);

      // Use setDoc instead of updateDoc to ensure document creation
      const imageDocRef = doc(db, this.imageMetadataCollection, cleanImageName);
      await setDoc(imageDocRef, metadataToSave, { merge: true });

      console.log('✅ Image metadata saved to Firebase successfully');
      return metadataToSave;
    } catch (error) {
      console.error('❌ Error saving image metadata to Firebase:', error);
      console.error('❌ Error details:', error.message);
      throw error;
    }
  }

  /**
   * Get image metadata from Firebase
   */
  async getImageMetadata(imageName) {
    try {
      // Clean the image name to match the document ID format
      const cleanImageName = imageName.replace(/[^a-zA-Z0-9_-]/g, '_');

      const imageDoc = doc(db, this.imageMetadataCollection, cleanImageName);
      const docSnap = await getDoc(imageDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Found Firebase metadata for:', imageName, data);
        return data;
      } else {
        console.log('ℹ️ No Firebase metadata found for:', imageName);
        return null; // No metadata found - image has no admin-added data
      }
    } catch (error) {
      console.error('❌ Error getting image metadata from Firebase:', error);
      return null;
    }
  }

  /**
   * Get all image metadata
   */
  async getAllImageMetadata() {
    try {
      const q = query(
        collection(db, this.imageMetadataCollection),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const metadata = [];
      
      querySnapshot.forEach((doc) => {
        metadata.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return metadata;
    } catch (error) {
      console.error('❌ Error getting all image metadata from Firebase:', error);
      return [];
    }
  }

  /**
   * Delete image metadata from Firebase
   */
  async deleteImageMetadata(imageName) {
    try {
      const imageDoc = doc(db, this.imageMetadataCollection, imageName);
      await deleteDoc(imageDoc);
      console.log('✅ Image metadata deleted from Firebase');
    } catch (error) {
      console.error('❌ Error deleting image metadata from Firebase:', error);
      throw error;
    }
  }

  // ==================== PRODUCT METADATA MANAGEMENT ====================

  /**
   * Create a new product with metadata (admin only)
   */
  async createProduct(productData) {
    try {
      console.log('🔄 Creating product in Firebase...', productData);

      const productId = productData.product_id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      const productToSave = {
        product_id: productId,
        name: productData.name || '',
        description: productData.description || '',
        short_description: productData.short_description || '',
        category: productData.category || '',
        subcategory: productData.subcategory || '',
        brand: productData.brand || '',
        model: productData.model || '',
        sku: productData.sku || `SKU_${Date.now()}`,
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
        color: productData.color || '',
        size: productData.size || '',
        primary_image_url: productData.primary_image_url || productData.image || '',
        image_urls: Array.isArray(productData.image_urls) ? productData.image_urls : [],
        video_url: productData.video_url || '',
        specifications: typeof productData.specifications === 'object' ? productData.specifications : {},
        features: Array.isArray(productData.features) ? productData.features : [],
        compatibility: Array.isArray(productData.compatibility) ? productData.compatibility : [],
        meta_title: productData.meta_title || productData.name || '',
        meta_description: productData.meta_description || productData.description || '',
        keywords: Array.isArray(productData.keywords) ? productData.keywords : [],
        tags: Array.isArray(productData.tags) ? productData.tags : [],
        supplier_name: productData.supplier_name || '',
        supplier_sku: productData.supplier_sku || '',
        supplier_price: productData.supplier_price ? parseFloat(productData.supplier_price) : null,
        shipping_weight: productData.shipping_weight ? parseFloat(productData.shipping_weight) : null,
        shipping_class: productData.shipping_class || '',
        free_shipping: productData.free_shipping || false,
        warranty_period: productData.warranty_period || '',
        return_policy: productData.return_policy || '',
        care_instructions: productData.care_instructions || '',
        average_rating: 0.00,
        review_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.productsCollection), productToSave);
      
      console.log('✅ Product created in Firebase successfully:', docRef.id);
      return { id: docRef.id, ...productToSave };
    } catch (error) {
      console.error('❌ Error creating product in Firebase:', error);
      throw error;
    }
  }

  /**
   * Get all products with optional filtering (simplified to avoid index requirements)
   */
  async getProducts(filters = {}) {
    try {
      console.log('🔄 Fetching products from Firebase with filters:', filters);

      // Start with simple query to avoid index requirements
      let q = collection(db, this.productsCollection);
      const constraints = [];

      // Only add simple filters that don't require composite indexes
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      // Simple ordering without combining with where clauses
      if (constraints.length === 0) {
        // Only add ordering if no where clauses to avoid index requirements
        constraints.push(orderBy('created_at', 'desc'));
      }

      // Add limit
      if (filters.limit && constraints.length === 0) {
        constraints.push(firestoreLimit(filters.limit));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const querySnapshot = await getDocs(q);
      let products = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Apply all other filters client-side to avoid index requirements
      if (filters.category) {
        products = products.filter(product => product.category === filters.category);
      }

      if (filters.featured !== undefined) {
        products = products.filter(product => product.featured === filters.featured);
      }

      if (filters.in_stock !== undefined) {
        products = products.filter(product => product.in_stock === filters.in_stock);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(product =>
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Client-side sorting if needed
      if (filters.sort_by && filters.sort_by !== 'created_at') {
        products.sort((a, b) => {
          const aValue = a[filters.sort_by];
          const bValue = b[filters.sort_by];
          const direction = filters.sort_order === 'desc' ? -1 : 1;

          if (aValue < bValue) return -1 * direction;
          if (aValue > bValue) return 1 * direction;
          return 0;
        });
      }

      // Apply limit after filtering
      if (filters.limit) {
        products = products.slice(0, filters.limit);
      }

      console.log(`✅ Fetched ${products.length} products from Firebase`);
      return products;
    } catch (error) {
      console.error('❌ Error fetching products from Firebase:', error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  async updateProduct(productId, updateData) {
    try {
      console.log('🔄 Updating product in Firebase:', productId, updateData);

      // Find the document by product_id
      const q = query(
        collection(db, this.productsCollection),
        where('product_id', '==', productId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const docRef = querySnapshot.docs[0].ref;
      
      const updateDataWithTimestamp = {
        ...updateData,
        updated_at: serverTimestamp()
      };

      await updateDoc(docRef, updateDataWithTimestamp);
      
      console.log('✅ Product updated in Firebase successfully');
      return { id: docRef.id, product_id: productId, ...updateDataWithTimestamp };
    } catch (error) {
      console.error('❌ Error updating product in Firebase:', error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId) {
    try {
      console.log('🔄 Deleting product from Firebase:', productId);

      const q = query(
        collection(db, this.productsCollection),
        where('product_id', '==', productId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      await deleteDoc(querySnapshot.docs[0].ref);
      
      console.log('✅ Product deleted from Firebase successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting product from Firebase:', error);
      throw error;
    }
  }

  // ==================== CATEGORY MANAGEMENT ====================

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    try {
      console.log('🔄 Creating category in Firebase:', categoryData);

      const categoryToSave = {
        name: categoryData.name || '',
        slug: categoryData.slug || categoryData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        description: categoryData.description || '',
        parent_id: categoryData.parent_id || null,
        image_url: categoryData.image_url || '',
        icon: categoryData.icon || '',
        sort_order: categoryData.sort_order || 0,
        is_active: categoryData.is_active !== false,
        meta_title: categoryData.meta_title || '',
        meta_description: categoryData.meta_description || '',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.categoriesCollection), categoryToSave);
      
      console.log('✅ Category created in Firebase successfully:', docRef.id);
      return { id: docRef.id, ...categoryToSave };
    } catch (error) {
      console.error('❌ Error creating category in Firebase:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(includeInactive = false) {
    try {
      let q = collection(db, this.categoriesCollection);
      const constraints = [orderBy('sort_order', 'asc')];

      if (!includeInactive) {
        constraints.push(where('is_active', '==', true));
      }

      q = query(q, ...constraints);
      
      const querySnapshot = await getDocs(q);
      const categories = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories from Firebase:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Test Firebase connection and permissions
   */
  async testConnection() {
    try {
      console.log('🔄 Testing Firebase connection...');

      // Test 1: Try to read from image metadata collection
      const q = query(collection(db, this.imageMetadataCollection), firestoreLimit(1));
      const snapshot = await getDocs(q);
      console.log('✅ Firebase read test successful, docs found:', snapshot.size);

      // Test 2: Try to write a test document
      const testDocRef = doc(db, this.imageMetadataCollection, 'test_connection');
      await setDoc(testDocRef, {
        test: true,
        timestamp: serverTimestamp()
      }, { merge: true });
      console.log('✅ Firebase write test successful');

      // Test 3: Try to read the test document back
      const testDoc = await getDoc(testDocRef);
      if (testDoc.exists()) {
        console.log('✅ Firebase read-after-write test successful');
      }

      // Clean up test document
      await deleteDoc(testDocRef);
      console.log('✅ Firebase delete test successful');

      console.log('✅ All Firebase tests passed - connection is working');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    try {
      const products = await this.getProducts({ status: 'active' });
      
      const stats = {
        total: products.length,
        in_stock: products.filter(p => p.in_stock).length,
        out_of_stock: products.filter(p => !p.in_stock).length,
        featured: products.filter(p => p.featured).length
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting product stats from Firebase:', error);
      throw error;
    }
  }
}

// Export singleton instance
const firebaseMetadataService = new FirebaseMetadataService();
export default firebaseMetadataService;
