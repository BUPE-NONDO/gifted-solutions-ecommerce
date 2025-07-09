/**
 * Admin Settings Service
 * Manages site-wide settings including footer, categories, and other admin configurations
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
  serverTimestamp 
} from 'firebase/firestore';

class AdminSettingsService {
  constructor() {
    this.settingsCollection = 'site_settings';
    this.categoriesCollection = 'admin_categories';
    this.footerCollection = 'footer_settings';
  }

  // ==================== SITE SETTINGS ====================

  /**
   * Get site settings
   */
  async getSiteSettings() {
    try {
      const settingsDoc = doc(db, this.settingsCollection, 'main');
      const docSnap = await getDoc(settingsDoc);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Return default settings
        return this.getDefaultSettings();
      }
    } catch (error) {
      console.error('❌ Error getting site settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Update site settings
   */
  async updateSiteSettings(settings) {
    try {
      console.log('🔄 Updating site settings:', settings);

      const settingsDoc = doc(db, this.settingsCollection, 'main');

      const settingsToSave = {
        ...settings,
        updated_at: serverTimestamp()
      };

      console.log('📤 Saving to Firebase:', settingsToSave);
      await setDoc(settingsDoc, settingsToSave, { merge: true });

      console.log('✅ Site settings updated successfully');
      return settingsToSave;
    } catch (error) {
      console.error('❌ Error updating site settings:', error);
      console.error('❌ Error details:', error.message);
      throw error;
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      site_name: 'Gifted Solutions',
      site_description: 'Your trusted electronics components supplier',
      contact_phone: '0779421717',
      contact_phone_2: '0961288156',
      whatsapp_number: '260779421717',
      email: 'giftedsolutions20@gmail.com',
      address: 'Lusaka, Zambia',
      currency: 'K',
      social_media: {
        twitter: '@giftedsolutionz',
        facebook: 'bupelifestyle',
        tiktok: 'bupelifestyle'
      },
      business_hours: {
        monday: '8:00 AM - 6:00 PM',
        tuesday: '8:00 AM - 6:00 PM',
        wednesday: '8:00 AM - 6:00 PM',
        thursday: '8:00 AM - 6:00 PM',
        friday: '8:00 AM - 6:00 PM',
        saturday: '9:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
  }

  // ==================== FOOTER SETTINGS ====================

  /**
   * Get footer settings
   */
  async getFooterSettings() {
    try {
      const footerDoc = doc(db, this.footerCollection, 'main');
      const docSnap = await getDoc(footerDoc);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return this.getDefaultFooterSettings();
      }
    } catch (error) {
      console.error('❌ Error getting footer settings:', error);
      return this.getDefaultFooterSettings();
    }
  }

  /**
   * Update footer settings
   */
  async updateFooterSettings(footerData) {
    try {
      const footerDoc = doc(db, this.footerCollection, 'main');
      
      const footerToSave = {
        ...footerData,
        updated_at: serverTimestamp()
      };

      await setDoc(footerDoc, footerToSave, { merge: true });
      
      console.log('✅ Footer settings updated successfully');
      return footerToSave;
    } catch (error) {
      console.error('❌ Error updating footer settings:', error);
      throw error;
    }
  }

  /**
   * Get default footer settings
   */
  getDefaultFooterSettings() {
    return {
      company_name: 'Gifted Solutions',
      tagline: 'Your trusted electronics components supplier',
      description: 'We provide high-quality electronic components for all your project needs.',
      contact_info: {
        phone: '0779421717',
        phone_2: '0961288156',
        whatsapp: '260779421717',
        email: 'giftedsolutions20@gmail.com',
        address: 'Lusaka, Zambia'
      },
      quick_links: [
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
        { name: 'Gallery', url: '/gallery' },
        { name: 'About', url: '/about' },
        { name: 'Contact', url: '/contact' }
      ],
      categories: [
        'Microcontrollers',
        'Sensors',
        'Displays',
        'Components',
        'Power Supply'
      ],
      social_media: {
        twitter: { url: 'https://twitter.com/giftedsolutionz', display: '@giftedsolutionz' },
        facebook: { url: 'https://facebook.com/bupelifestyle', display: 'bupelifestyle' },
        tiktok: { url: 'https://tiktok.com/@bupelifestyle', display: 'bupelifestyle' }
      },
      copyright_text: '© 2024 Gifted Solutions. All rights reserved.',
      show_whatsapp_button: true,
      show_social_media: true,
      show_quick_links: true,
      show_categories: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
  }

  // ==================== CATEGORIES MANAGEMENT ====================

  /**
   * Get all admin categories
   */
  async getAdminCategories() {
    try {
      const q = query(
        collection(db, this.categoriesCollection),
        orderBy('sort_order', 'asc')
      );
      
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
      console.error('❌ Error getting admin categories:', error);
      return [];
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    try {
      const categoryToSave = {
        name: categoryData.name || '',
        slug: categoryData.slug || categoryData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        description: categoryData.description || '',
        icon: categoryData.icon || '',
        color: categoryData.color || '#3B82F6',
        sort_order: categoryData.sort_order || 0,
        is_active: categoryData.is_active !== false,
        show_in_menu: categoryData.show_in_menu !== false,
        show_in_footer: categoryData.show_in_footer !== false,
        product_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.categoriesCollection), categoryToSave);
      
      console.log('✅ Category created successfully:', docRef.id);
      return { id: docRef.id, ...categoryToSave };
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update a category
   */
  async updateCategory(categoryId, categoryData) {
    try {
      const categoryDoc = doc(db, this.categoriesCollection, categoryId);
      
      const updateData = {
        ...categoryData,
        updated_at: serverTimestamp()
      };

      await updateDoc(categoryDoc, updateData);
      
      console.log('✅ Category updated successfully');
      return { id: categoryId, ...updateData };
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
      await deleteDoc(doc(db, this.categoriesCollection, categoryId));
      
      console.log('✅ Category deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Initialize default settings
   */
  async initializeDefaultSettings() {
    try {
      console.log('🔄 Initializing default settings...');

      // Initialize site settings
      await this.updateSiteSettings(this.getDefaultSettings());
      
      // Initialize footer settings
      await this.updateFooterSettings(this.getDefaultFooterSettings());
      
      // Create default categories
      const defaultCategories = [
        { name: 'Microcontrollers', description: 'Arduino, ESP32, and other development boards', sort_order: 1 },
        { name: 'Sensors', description: 'Temperature, motion, and other sensor modules', sort_order: 2 },
        { name: 'Displays', description: 'LCD, OLED, and LED display modules', sort_order: 3 },
        { name: 'Components', description: 'Resistors, capacitors, and basic components', sort_order: 4 },
        { name: 'Power Supply', description: 'Batteries, adapters, and power modules', sort_order: 5 }
      ];

      for (const category of defaultCategories) {
        try {
          await this.createCategory(category);
        } catch (error) {
          console.log(`Category ${category.name} might already exist`);
        }
      }

      console.log('✅ Default settings initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing default settings:', error);
      throw error;
    }
  }

  /**
   * Test connection and permissions
   */
  async testConnection() {
    try {
      console.log('🔄 Testing admin settings service connection...');

      // Test 1: Try to read settings
      const settings = await this.getSiteSettings();
      console.log('✅ Read test successful:', settings);

      // Test 2: Try to write a test setting
      const testSettings = {
        test_field: 'test_value',
        test_timestamp: new Date().toISOString()
      };

      await this.updateSiteSettings(testSettings);
      console.log('✅ Write test successful');

      // Test 3: Try to read back the test setting
      const updatedSettings = await this.getSiteSettings();
      if (updatedSettings.test_field === 'test_value') {
        console.log('✅ Read-after-write test successful');
      }

      console.log('✅ Admin settings service connection successful');
      return true;
    } catch (error) {
      console.error('❌ Admin settings service connection failed:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
const adminSettingsService = new AdminSettingsService();
export default adminSettingsService;
