import { supabase } from '../services/supabase';

/**
 * Fixed Supabase Setup - Addresses the bucket creation issues
 * This version focuses on what's working and provides manual alternatives
 */

const BUCKET_NAME = 'product-images';

/**
 * Check if bucket exists and get its status
 */
export async function checkBucketStatus() {
  console.log('🔍 Checking bucket status...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error);
      return { exists: false, error: error.message };
    }
    
    const bucket = buckets.find(b => b.name === BUCKET_NAME);
    
    if (bucket) {
      console.log('✅ Bucket exists:', bucket);
      
      // Test if we can list files
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 5 });
      
      if (listError) {
        console.warn('⚠️ Bucket exists but listing failed:', listError);
        return { 
          exists: true, 
          accessible: false, 
          bucket: bucket,
          error: listError.message 
        };
      }
      
      console.log(`✅ Bucket is accessible with ${files.length} files`);
      return { 
        exists: true, 
        accessible: true, 
        bucket: bucket,
        fileCount: files.length 
      };
    } else {
      console.log('❌ Bucket does not exist');
      return { exists: false };
    }
    
  } catch (error) {
    console.error('❌ Error checking bucket:', error);
    return { exists: false, error: error.message };
  }
}

/**
 * Try to upload a test file to verify access
 */
export async function testUploadAccess() {
  console.log('🧪 Testing upload access...');
  
  try {
    // Create a small test file
    const testContent = `Test upload at ${new Date().toISOString()}`;
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testPath = `test/upload-test-${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testPath, testBlob, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Upload test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Upload test successful:', data);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(testPath);
    
    console.log('✅ Public URL generated:', publicUrl);
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([testPath]);
    
    if (deleteError) {
      console.warn('⚠️ Test file cleanup failed:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    return { 
      success: true, 
      publicUrl: publicUrl,
      uploadPath: testPath 
    };
    
  } catch (error) {
    console.error('❌ Upload test error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload working sample images (since this was successful)
 */
export async function uploadWorkingSamples() {
  console.log('📤 Uploading working sample images...');
  
  const samples = [];
  const products = [
    { name: 'Arduino Uno R3', color: '#FF6B6B', price: 650 },
    { name: 'ESP32 Module', color: '#4ECDC4', price: 800 },
    { name: 'Ultrasonic Sensor', color: '#45B7D1', price: 250 },
    { name: 'Servo Motor 9g', color: '#96CEB4', price: 180 },
    { name: 'LCD Display 16x2', color: '#FFEAA7', price: 350 }
  ];
  
  try {
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 300, 300);
      gradient.addColorStop(0, product.color);
      gradient.addColorStop(1, '#FFFFFF');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 300, 300);
      
      // Product name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 150, 130);
      
      // Price
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#2C3E50';
      ctx.fillText(`K${product.price}`, 150, 170);
      
      // Gifted Solutions
      ctx.font = '14px Arial';
      ctx.fillStyle = '#7F8C8D';
      ctx.fillText('Gifted Solutions', 150, 200);
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const fileName = `${product.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const filePath = `products/${fileName}`;
      
      // Upload
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`❌ Failed to upload ${fileName}:`, error);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
        
        console.log(`✅ Uploaded ${fileName}: ${publicUrl}`);
        samples.push({
          name: product.name,
          fileName,
          path: filePath,
          url: publicUrl,
          price: product.price
        });
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`✅ Successfully uploaded ${samples.length} sample images`);
    return samples;
    
  } catch (error) {
    console.error('❌ Sample upload failed:', error);
    return [];
  }
}

/**
 * Get all uploaded images
 */
export async function listUploadedImages() {
  console.log('📋 Listing uploaded images...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('products', { limit: 100 });
    
    if (error) {
      console.error('❌ Error listing images:', error);
      return [];
    }
    
    const images = files.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`products/${file.name}`);
      
      return {
        name: file.name,
        path: `products/${file.name}`,
        url: publicUrl,
        size: file.metadata?.size || 0,
        lastModified: file.updated_at
      };
    });
    
    console.log(`✅ Found ${images.length} images:`, images);
    return images;
    
  } catch (error) {
    console.error('❌ Error listing images:', error);
    return [];
  }
}

/**
 * Manual bucket creation instructions
 */
export function getManualSetupInstructions() {
  return {
    title: "Manual Supabase Bucket Setup",
    instructions: [
      "1. Go to https://fotcjsmnerawpqzhldhq.supabase.co",
      "2. Navigate to Storage section",
      "3. Click 'New bucket'",
      "4. Name: 'product-images'",
      "5. Set as Public bucket: YES",
      "6. Click 'Create bucket'",
      "7. Go to bucket settings and ensure public access is enabled",
      "8. Return here and test upload access"
    ],
    sql: `
-- If you have SQL access, run these commands:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Enable RLS policies
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public upload access" ON storage.objects  
FOR INSERT WITH CHECK (bucket_id = 'product-images');
    `
  };
}

/**
 * Working setup - focus on what works
 */
export async function runWorkingSetup() {
  console.log('🚀 Running working setup (upload-focused)...');
  
  const results = {
    bucketCheck: null,
    uploadTest: null,
    samples: [],
    images: [],
    manualInstructions: null
  };
  
  try {
    // Check bucket status
    console.log('\n--- STEP 1: Check Bucket Status ---');
    results.bucketCheck = await checkBucketStatus();
    
    if (!results.bucketCheck.exists) {
      console.log('❌ Bucket does not exist - providing manual setup instructions');
      results.manualInstructions = getManualSetupInstructions();
      return results;
    }
    
    // Test upload access
    console.log('\n--- STEP 2: Test Upload Access ---');
    results.uploadTest = await testUploadAccess();
    
    if (!results.uploadTest.success) {
      console.log('❌ Upload access failed - check bucket permissions');
      results.manualInstructions = getManualSetupInstructions();
      return results;
    }
    
    // Upload samples (this was working)
    console.log('\n--- STEP 3: Upload Sample Images ---');
    results.samples = await uploadWorkingSamples();
    
    // List all images
    console.log('\n--- STEP 4: List Uploaded Images ---');
    results.images = await listUploadedImages();
    
    console.log('\n🎉 Working setup completed!');
    console.log(`✅ Bucket exists and accessible`);
    console.log(`✅ Upload access working`);
    console.log(`✅ ${results.samples.length} sample images uploaded`);
    console.log(`✅ ${results.images.length} total images in storage`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Working setup failed:', error);
    results.error = error.message;
    return results;
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.fixSupabase = {
    checkBucketStatus,
    testUploadAccess,
    uploadWorkingSamples,
    listUploadedImages,
    runWorkingSetup,
    getManualSetupInstructions
  };
  
  console.log('🔧 Fixed Supabase commands available in window.fixSupabase');
}

export default {
  checkBucketStatus,
  testUploadAccess,
  uploadWorkingSamples,
  listUploadedImages,
  runWorkingSetup,
  getManualSetupInstructions
};
