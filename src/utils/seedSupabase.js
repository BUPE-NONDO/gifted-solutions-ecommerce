import { products as hardcodedProducts } from '../data/newProducts';
import supabaseService from '../services/supabase';

/**
 * Seed Supabase database with hardcoded products
 * This will populate the Supabase database with all products
 */

// Seed a single product
const seedProduct = async (product, index, total) => {
  try {
    console.log(`\n☁️ Seeding product ${index + 1}/${total}: ${product.name}`);
    
    // Prepare product data for Supabase
    const productData = {
      ...product,
      seeded: true,
      seededAt: new Date(),
      originalId: product.id
    };
    
    // Remove the ID since Supabase will generate a new one
    delete productData.id;
    
    // Add product to Supabase
    const supabaseProduct = await supabaseService.addProduct(productData);
    
    console.log(`✅ Product seeded: ${product.name} (Supabase ID: ${supabaseProduct.id})`);
    
    return {
      success: true,
      originalId: product.id,
      supabaseId: supabaseProduct.id,
      name: product.name
    };
    
  } catch (error) {
    console.error(`❌ Error seeding product ${product.name}:`, error);
    return {
      success: false,
      originalId: product.id,
      name: product.name,
      error: error.message
    };
  }
};

// Main seeding function
export const seedAllProductsToSupabase = async () => {
  console.log('🚀 Starting Supabase database seeding...');
  console.log(`📦 Found ${hardcodedProducts.length} products to seed`);
  
  const results = {
    successful: [],
    failed: [],
    total: hardcodedProducts.length,
    startTime: new Date()
  };
  
  try {
    // Check if products already exist in Supabase
    const existingProducts = await supabaseService.getProducts();
    
    if (existingProducts.length > 0) {
      console.log(`⚠️ Found ${existingProducts.length} existing products in Supabase`);
      const proceed = confirm(
        `There are already ${existingProducts.length} products in Supabase. ` +
        'Do you want to continue and add more products? This might create duplicates.'
      );
      
      if (!proceed) {
        console.log('❌ Seeding cancelled by user');
        return results;
      }
    }
    
    // Seed products one by one to avoid overwhelming the database
    for (let i = 0; i < hardcodedProducts.length; i++) {
      const product = hardcodedProducts[i];
      const result = await seedProduct(product, i, hardcodedProducts.length);
      
      if (result.success) {
        results.successful.push(result);
      } else {
        results.failed.push(result);
      }
      
      // Add a small delay to avoid rate limiting
      if (i < hardcodedProducts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;
    
    console.log('\n🎉 Seeding completed!');
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
    console.error('❌ Seeding failed:', error);
    results.error = error.message;
    return results;
  }
};

// Quick seeding function for testing (seeds first 5 products)
export const seedTestProducts = async () => {
  console.log('🧪 Starting test seeding (first 5 products)...');
  
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
      const result = await seedProduct(product, i, testProducts.length);
      
      if (result.success) {
        results.successful.push(result);
      } else {
        results.failed.push(result);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;
    
    console.log('\n🎉 Test seeding completed!');
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Test seeding failed:', error);
    results.error = error.message;
    return results;
  }
};

// Clear all products from Supabase
export const clearSupabaseProducts = async () => {
  console.log('🗑️ Clearing all products from Supabase...');
  
  try {
    const existingProducts = await supabaseService.getProducts();
    
    if (existingProducts.length === 0) {
      console.log('ℹ️ No products found in Supabase to clear');
      return { cleared: 0 };
    }
    
    console.log(`Found ${existingProducts.length} products to delete`);
    
    const deletePromises = existingProducts.map(product => 
      supabaseService.deleteProduct(product.id)
    );
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Cleared ${existingProducts.length} products from Supabase`);
    
    return { cleared: existingProducts.length };
    
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    throw error;
  }
};

// Get Supabase status
export const getSupabaseStatus = async () => {
  try {
    const products = await supabaseService.getProducts();
    
    return {
      connected: true,
      productCount: products.length,
      products: products.slice(0, 5) // First 5 products for preview
    };
  } catch (error) {
    console.error('❌ Error getting Supabase status:', error);
    return {
      connected: false,
      error: error.message
    };
  }
};

// Export for browser console access
if (typeof window !== 'undefined') {
  window.supabaseSeeding = {
    seedAllProductsToSupabase,
    seedTestProducts,
    clearSupabaseProducts,
    getSupabaseStatus,
    hardcodedProducts
  };
}
