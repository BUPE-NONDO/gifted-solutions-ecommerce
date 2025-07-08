import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Category Service for Firebase Firestore
 * Handles all category-related database operations
 */
export const categoryService = {
  // Get all categories
  async getAllCategories() {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('name', 'asc'));
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
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get active categories only
  async getActiveCategories() {
    try {
      const categories = await this.getAllCategories();
      return categories.filter(category => category.isActive);
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw error;
    }
  },

  // Add new category
  async addCategory(categoryData) {
    try {
      const categoriesRef = collection(db, 'categories');
      const newCategory = {
        ...categoryData,
        productCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(categoriesRef, newCategory);
      
      return {
        id: docRef.id,
        ...newCategory,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(categoryId, updateData) {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(categoryRef, updatedData);
      
      return {
        id: categoryId,
        ...updatedData,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(categoryId) {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await deleteDoc(categoryRef);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Toggle category active status
  async toggleCategoryStatus(categoryId, currentStatus) {
    try {
      return await this.updateCategory(categoryId, {
        isActive: !currentStatus
      });
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }
  },

  // Update product count for a category
  async updateProductCount(categoryId, count) {
    try {
      return await this.updateCategory(categoryId, {
        productCount: count
      });
    } catch (error) {
      console.error('Error updating product count:', error);
      throw error;
    }
  },

  // Get category names for dropdown/select
  async getCategoryNames() {
    try {
      const categories = await this.getActiveCategories();
      return categories.map(category => category.name);
    } catch (error) {
      console.error('Error fetching category names:', error);
      throw error;
    }
  },

  // Create initial categories if none exist
  async createInitialCategories() {
    try {
      const existingCategories = await this.getAllCategories();
      
      if (existingCategories.length > 0) {
        console.log('Categories already exist, skipping initialization');
        return existingCategories;
      }

      const initialCategories = [
        {
          name: 'Arduino Boards',
          description: 'Arduino microcontroller boards and compatible devices',
          isActive: true
        },
        {
          name: 'Sensors',
          description: 'Various sensors for Arduino and Raspberry Pi projects',
          isActive: true
        },
        {
          name: 'Components',
          description: 'Electronic components, resistors, capacitors, and more',
          isActive: true
        },
        {
          name: 'Raspberry Pi',
          description: 'Raspberry Pi boards and accessories',
          isActive: true
        },
        {
          name: 'Tools',
          description: 'Development tools and equipment',
          isActive: true
        }
      ];

      const createdCategories = [];
      
      for (const categoryData of initialCategories) {
        const category = await this.addCategory(categoryData);
        createdCategories.push(category);
      }

      console.log('Initial categories created successfully:', createdCategories.length);
      return createdCategories;
    } catch (error) {
      console.error('Error creating initial categories:', error);
      throw error;
    }
  }
};

export default categoryService;
