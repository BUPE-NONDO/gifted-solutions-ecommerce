import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export const productService = {
  // Get all products
  async getAllProducts() {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(productId) {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        return {
          id: productSnap.id,
          ...productSnap.data()
        };
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Add new product
  async addProduct(productData) {
    try {
      const productsRef = collection(db, 'products');
      
      // Prepare product data with timestamps
      const newProduct = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        visible: true
      };
      
      const docRef = await addDoc(productsRef, newProduct);
      
      // Return the product with the generated ID
      return {
        id: docRef.id,
        ...newProduct,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Update existing product
  async updateProduct(productId, productData) {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Prepare update data with timestamp
      const updateData = {
        ...productData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(productRef, updateData);
      
      // Return updated product
      return {
        id: productId,
        ...productData,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Update product image
  async updateProductImage(productId, imageUrl) {
    try {
      const productRef = doc(db, 'products', productId);
      
      await updateDoc(productRef, {
        image: imageUrl,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating product image:', error);
      throw error;
    }
  },

  // Toggle product stock status
  async toggleProductStock(productId, inStock) {
    try {
      const productRef = doc(db, 'products', productId);
      
      await updateDoc(productRef, {
        inStock: inStock,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling product stock:', error);
      throw error;
    }
  },

  // Update product field
  async updateProductField(productId, field, value) {
    try {
      const productRef = doc(db, 'products', productId);
      
      await updateDoc(productRef, {
        [field]: value,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating product field:', error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('category', '==', category),
        where('visible', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(searchTerm) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or similar
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('visible', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const products = [];
      querySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        
        // Client-side filtering for search
        if (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          products.push(product);
        }
      });
      
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Seed initial products (for first-time setup)
  async seedProducts(productsData) {
    try {
      const promises = productsData.map(product => this.addProduct(product));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error seeding products:', error);
      throw error;
    }
  }
};

export default productService;
