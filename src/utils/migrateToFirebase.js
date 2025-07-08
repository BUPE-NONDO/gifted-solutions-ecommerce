import { products as hardcodedProducts } from '../data/newProducts';
import { productService } from '../services/productService';
import { imageService } from '../services/imageService';

/**
 * Migration utility to move from Supabase to Firebase
 * This will:
 * 1. Download images from Supabase URLs
 * 2. Upload them to Firebase Storage
 * 3. Create products in Firebase Firestore with new image URLs
 */

// Helper function to download image from URL
const downloadImageFromUrl = async (url, filename) => {
  try {
    console.log(`📥 Downloading image: ${filename}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Create a File object from the blob
    const file = new File([blob], filename, { type: blob.type });
    
    return file;
  } catch (error) {
    console.error(`❌ Error downloading image ${filename}:`, error);
    throw error;
  }
};

// Extract filename from Supabase URL
const extractFilenameFromUrl = (url) => {
  try {
    // Extract filename from Supabase URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // If filename doesn't have extension, add .jpg as default
    if (!filename.includes('.')) {
      return `${filename}.jpg`;
    }
    
    return filename;
  } catch (error) {
    console.error('Error extracting filename:', error);
    return `product_${Date.now()}.jpg`;
  }
};

// Migrate a single product
const migrateProduct = async (product, index, total) => {
  try {
    console.log(`\n🔄 Migrating product ${index + 1}/${total}: ${product.name}`);
    
    let firebaseImageUrl = product.image;
    
    // If the image is from Supabase, migrate it to Firebase
    if (product.image && product.image.includes('supabase.co')) {
      console.log('📸 Migrating image from Supabase to Firebase...');
      
      // Download image from Supabase
      const filename = extractFilenameFromUrl(product.image);
      const imageFile = await downloadImageFromUrl(product.image, filename);
      
      // Upload to Firebase Storage
      const uploadResult = await imageService.uploadProductImage(imageFile, product.id);
      firebaseImageUrl = uploadResult.url;
      
      console.log(`✅ Image migrated: ${firebaseImageUrl}`);
    }
    
    // Prepare product data for Firebase
    const productData = {
      ...product,
      image: firebaseImageUrl,
      migrated: true,
      migratedAt: new Date(),
      originalSupabaseUrl: product.image
    };
    
    // Remove the ID since Firebase will generate a new one
    delete productData.id;
    
    // Add product to Firebase
    const firebaseProduct = await productService.addProduct(productData);
    
    console.log(`✅ Product migrated: ${product.name} (Firebase ID: ${firebaseProduct.id})`);
    
    return {
      success: true,
      originalId: product.id,
      firebaseId: firebaseProduct.id,
      name: product.name,
      imageUrl: firebaseImageUrl
    };
    
  } catch (error) {
    console.error(`❌ Error migrating product ${product.name}:`, error);
    return {
      success: false,
      originalId: product.id,
      name: product.name,
      error: error.message
    };
  }
};

// Main migration function
export const migrateAllProductsToFirebase = async () => {
  console.log('🚀 Starting migration from Supabase to Firebase...');
  console.log(`📦 Found ${hardcodedProducts.length} products to migrate`);
  
  const results = {
    successful: [],
    failed: [],
    total: hardcodedProducts.length,
    startTime: new Date()
  };
  
  try {
    // Check if products already exist in Firebase
    const existingProducts = await productService.getAllProducts();
    
    if (existingProducts.length > 0) {
      console.log(`⚠️ Found ${existingProducts.length} existing products in Firebase`);
      const proceed = confirm(
        `There are already ${existingProducts.length} products in Firebase. ` +
        'Do you want to continue and add more products? This might create duplicates.'
      );
      
      if (!proceed) {
        console.log('❌ Migration cancelled by user');
        return results;
      }
    }
    
    // Migrate products one by one to avoid overwhelming the services
    for (let i = 0; i < hardcodedProducts.length; i++) {
      const product = hardcodedProducts[i];
      const result = await migrateProduct(product, i, hardcodedProducts.length);
      
      if (result.success) {
        results.successful.push(result);
      } else {
        results.failed.push(result);
      }
      
      // Add a small delay to avoid rate limiting
      if (i < hardcodedProducts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⏱️ Duration: ${Math.round(results.duration / 1000)}s`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed products:');
      results.failed.forEach(failure => {
        console.log(`- ${failure.name}: ${failure.error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    results.error = error.message;
    return results;
  }
};

// Quick migration function for testing (migrates first 5 products)
export const migrateTestProducts = async () => {
  console.log('🧪 Starting test migration (first 5 products)...');
  
  const testProducts = hardcodedProducts.slice(0, 5);
  const results = {
    successful: [],
    failed: [],
    total: testProducts.length,
    startTime: new Date()
  };
  
  try {
    for (let i = 0; i < testProducts.length; i++) {
      const product = testProducts[i];
      const result = await migrateProduct(product, i, testProducts.length);
      
      if (result.success) {
        results.successful.push(result);
      } else {
        results.failed.push(result);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;
    
    console.log('\n🎉 Test migration completed!');
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Test migration failed:', error);
    results.error = error.message;
    return results;
  }
};

// Export for browser console access
if (typeof window !== 'undefined') {
  window.firebaseMigration = {
    migrateAllProductsToFirebase,
    migrateTestProducts,
    hardcodedProducts
  };
}
