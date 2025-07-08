// Fix Supabase image access issues - make all images publicly accessible
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fotcjsmnerawpqzhldhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NDcyOTcsImV4cCI6MjA1MTMyMzI5N30.Ej7Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'product-images';

/**
 * Check if bucket exists and is publicly accessible
 */
export async function checkBucketAccess() {
  console.log('🔍 Checking bucket access...');
  
  try {
    // List files to check if bucket is accessible
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('products', { limit: 10 });
    
    if (error) {
      console.error('❌ Bucket access error:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`✅ Bucket accessible. Found ${files.length} files`);
    return { success: true, files };
    
  } catch (error) {
    console.error('❌ Error checking bucket:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Make bucket public (if not already)
 */
export async function makeBucketPublic() {
  console.log('🔓 Making bucket public...');
  
  try {
    // Note: This requires admin privileges
    // The bucket should be made public via Supabase dashboard
    console.log('ℹ️ Bucket publicity must be set via Supabase dashboard');
    console.log('ℹ️ Go to Storage > product-images > Settings > Make Public');
    
    return { success: true, message: 'Check Supabase dashboard to make bucket public' };
    
  } catch (error) {
    console.error('❌ Error making bucket public:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test image URLs to see which ones work
 */
export async function testImageUrls() {
  console.log('🧪 Testing image URLs...');
  
  const testImages = [
    'arduino-uno-r3-1748603951988-impc78.jpg',
    'esp32-development-board-1748603955352-1tqsnv.jpg',
    'lcd-display-16x2-1748603992345-jkl345.jpg',
    'breadboard-1748603978848-arhihy.jpg',
    'led-5mm-red-1748603982123-xyz123.jpg'
  ];
  
  const results = [];
  
  for (const imageName of testImages) {
    try {
      // Get public URL
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`products/${imageName}`);
      
      const publicUrl = data.publicUrl;
      
      // Test if URL is accessible
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        const accessible = response.ok;
        
        results.push({
          imageName,
          publicUrl,
          accessible,
          status: response.status,
          statusText: response.statusText
        });
        
        console.log(`${accessible ? '✅' : '❌'} ${imageName}: ${response.status} ${response.statusText}`);
        
      } catch (fetchError) {
        results.push({
          imageName,
          publicUrl,
          accessible: false,
          error: fetchError.message
        });
        
        console.log(`❌ ${imageName}: Fetch error - ${fetchError.message}`);
      }
      
    } catch (error) {
      results.push({
        imageName,
        accessible: false,
        error: error.message
      });
      
      console.log(`❌ ${imageName}: URL error - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Get correct public URLs for all images
 */
export async function getCorrectImageUrls() {
  console.log('🔗 Getting correct image URLs...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('products', { limit: 100 });
    
    if (error) {
      console.error('❌ Error listing files:', error);
      return { success: false, error: error.message };
    }
    
    const imageUrls = {};
    
    files.forEach(file => {
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`products/${file.name}`);
      
      imageUrls[file.name] = data.publicUrl;
    });
    
    console.log(`✅ Generated URLs for ${Object.keys(imageUrls).length} images`);
    return { success: true, imageUrls };
    
  } catch (error) {
    console.error('❌ Error getting URLs:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fix image access by updating URLs and checking permissions
 */
export async function fixImageAccess() {
  console.log('🔧 Fixing image access...');
  
  // Step 1: Check bucket access
  const bucketCheck = await checkBucketAccess();
  if (!bucketCheck.success) {
    console.error('❌ Cannot access bucket:', bucketCheck.error);
    return { success: false, step: 'bucket_access', error: bucketCheck.error };
  }
  
  // Step 2: Test image URLs
  const urlTests = await testImageUrls();
  const accessibleImages = urlTests.filter(test => test.accessible);
  const inaccessibleImages = urlTests.filter(test => !test.accessible);
  
  console.log(`✅ ${accessibleImages.length} images accessible`);
  console.log(`❌ ${inaccessibleImages.length} images inaccessible`);
  
  // Step 3: Get correct URLs
  const urlResult = await getCorrectImageUrls();
  if (!urlResult.success) {
    console.error('❌ Cannot get URLs:', urlResult.error);
    return { success: false, step: 'get_urls', error: urlResult.error };
  }
  
  return {
    success: true,
    bucketAccessible: bucketCheck.success,
    totalImages: urlTests.length,
    accessibleImages: accessibleImages.length,
    inaccessibleImages: inaccessibleImages.length,
    imageUrls: urlResult.imageUrls,
    testResults: urlTests
  };
}

/**
 * Alternative: Use signed URLs for temporary access
 */
export async function getSignedUrls(expiresIn = 3600) {
  console.log('🔐 Getting signed URLs...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('products', { limit: 100 });
    
    if (error) {
      console.error('❌ Error listing files:', error);
      return { success: false, error: error.message };
    }
    
    const signedUrls = {};
    
    for (const file of files) {
      try {
        const { data, error: signError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(`products/${file.name}`, expiresIn);
        
        if (signError) {
          console.error(`❌ Error creating signed URL for ${file.name}:`, signError);
        } else {
          signedUrls[file.name] = data.signedUrl;
        }
      } catch (error) {
        console.error(`❌ Error with ${file.name}:`, error);
      }
    }
    
    console.log(`✅ Generated signed URLs for ${Object.keys(signedUrls).length} images`);
    return { success: true, signedUrls };
    
  } catch (error) {
    console.error('❌ Error getting signed URLs:', error);
    return { success: false, error: error.message };
  }
}

// Export main function
export { fixImageAccess as default };
