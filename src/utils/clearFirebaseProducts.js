import { firebaseMetadataService } from '../services/firebaseMetadataService';

/**
 * Clear all products from Firebase Firestore
 */
export async function clearAllFirebaseProducts() {
  try {
    console.log('🧹 Clearing all products from Firebase...');
    
    // Get all existing products
    const existingProducts = await firebaseMetadataService.getAllProducts();
    
    if (!existingProducts || existingProducts.length === 0) {
      console.log('ℹ️ No products found in Firebase to clear');
      return {
        success: true,
        message: 'No products to clear',
        clearedCount: 0
      };
    }
    
    console.log(`Found ${existingProducts.length} products to delete`);
    
    // Delete all products
    let deletedCount = 0;
    for (const product of existingProducts) {
      try {
        await firebaseMetadataService.deleteProduct(product.id);
        deletedCount++;
        console.log(`✅ Deleted product: ${product.title || product.name || product.id}`);
      } catch (error) {
        console.error(`❌ Failed to delete product ${product.id}:`, error);
      }
    }
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear localStorage cache
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.includes('product') || key.includes('firebase') || key.includes('cache')
      );
      
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared cache: ${key}`);
      });
      
      // Clear sessionStorage cache
      const sessionKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('product') || key.includes('firebase') || key.includes('cache')
      );
      
      sessionKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Cleared session cache: ${key}`);
      });
      
      // Dispatch refresh event
      window.dispatchEvent(new CustomEvent('productsCleared', {
        detail: { clearedCount: deletedCount }
      }));
    }
    
    console.log(`✅ Successfully cleared ${deletedCount} products from Firebase!`);
    console.log('🎯 Ready for fresh admin uploads via Fresh Start Upload');
    
    return {
      success: true,
      message: `Cleared ${deletedCount} products successfully`,
      clearedCount: deletedCount
    };
    
  } catch (error) {
    console.error('❌ Error clearing Firebase products:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to clear products'
    };
  }
}

/**
 * Reset the entire Firebase product database
 */
export async function resetFirebaseDatabase() {
  try {
    console.log('🔄 Resetting entire Firebase product database...');
    
    const result = await clearAllFirebaseProducts();
    
    if (result.success) {
      console.log('🎉 Firebase database reset complete!');
      
      // Force page refresh to clear any component state
      if (typeof window !== 'undefined') {
        console.log('🔄 Refreshing page to clear component state...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error resetting Firebase database:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.clearAllFirebaseProducts = clearAllFirebaseProducts;
  window.resetFirebaseDatabase = resetFirebaseDatabase;
  
  console.log('🔧 Firebase clearing utilities available:');
  console.log('   - window.clearAllFirebaseProducts()');
  console.log('   - window.resetFirebaseDatabase()');
}
