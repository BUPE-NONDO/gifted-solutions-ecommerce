// Utility to clear all existing images and start fresh
import { firebaseMetadataService } from '../services/firebaseMetadataService';

/**
 * Clear all existing product images and metadata
 */
export async function clearAllImages() {
  try {
    console.log('🧹 Starting fresh - clearing all existing images...');
    
    // Get all existing products
    const existingProducts = await firebaseMetadataService.getAllProducts();
    
    if (existingProducts && existingProducts.length > 0) {
      console.log(`Found ${existingProducts.length} existing products to clear`);
      
      // Delete all products from Firebase
      for (const product of existingProducts) {
        try {
          await firebaseMetadataService.deleteProduct(product.id);
          console.log(`✅ Deleted product: ${product.title || product.id}`);
        } catch (error) {
          console.error(`❌ Failed to delete product ${product.id}:`, error);
        }
      }
    }
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear localStorage cache
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.includes('image') || key.includes('product') || key.includes('cache')
      );
      
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared cache: ${key}`);
      });
      
      // Clear sessionStorage cache
      const sessionKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('image') || key.includes('product') || key.includes('cache')
      );
      
      sessionKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Cleared session cache: ${key}`);
      });
    }
    
    console.log('✅ All existing images and metadata cleared successfully!');
    console.log('🎯 Ready for fresh admin uploads to Vercel Blob');
    
    return {
      success: true,
      message: 'All images cleared successfully',
      clearedCount: existingProducts?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Error clearing images:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to clear images'
    };
  }
}

/**
 * Reset the entire product database
 */
export async function resetProductDatabase() {
  try {
    console.log('🔄 Resetting entire product database...');
    
    const result = await clearAllImages();
    
    if (result.success) {
      // Force page refresh to clear any component state
      if (typeof window !== 'undefined') {
        console.log('🔄 Refreshing page to clear component state...');
        window.location.reload();
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.clearAllImages = clearAllImages;
  window.resetProductDatabase = resetProductDatabase;
}
