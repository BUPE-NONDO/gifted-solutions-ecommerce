import { supabase, STORAGE_BUCKET } from '../services/supabase';

/**
 * Proper Supabase Setup with Correct Credentials
 * Uses the provided credentials and handles bucket creation properly
 */

console.log('🔧 Supabase Configuration:');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Bucket:', STORAGE_BUCKET);

/**
 * 1. Check Supabase Connection
 */
export async function checkSupabaseConnection() {
  console.log('🔗 Checking Supabase connection...');
  
  try {
    // Test basic connection by trying to list buckets
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return { connected: false, error: error.message };
    }
    
    console.log('✅ Connected to Supabase successfully');
    console.log('📁 Available buckets:', data.map(b => b.name));
    
    return { 
      connected: true, 
      buckets: data,
      targetBucket: STORAGE_BUCKET
    };
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    return { connected: false, error: error.message };
  }
}

/**
 * 2. Check if our bucket exists
 */
export async function checkBucketExists() {
  console.log(`🪣 Checking if bucket '${STORAGE_BUCKET}' exists...`);
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error checking buckets:', error);
      return { exists: false, error: error.message };
    }
    
    const bucket = buckets.find(b => b.name === STORAGE_BUCKET);
    
    if (bucket) {
      console.log('✅ Bucket exists:', bucket);
      
      // Test access by trying to list files
      const { data: files, error: listError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list('', { limit: 1 });
      
      if (listError) {
        console.warn('⚠️ Bucket exists but access failed:', listError);
        return { 
          exists: true, 
          accessible: false, 
          bucket: bucket,
          error: listError.message 
        };
      }
      
      console.log('✅ Bucket is accessible');
      return { 
        exists: true, 
        accessible: true, 
        bucket: bucket 
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
 * 3. Create bucket if it doesn't exist
 */
export async function createBucketIfNeeded() {
  console.log(`🏗️ Creating bucket '${STORAGE_BUCKET}' if needed...`);
  
  try {
    const bucketCheck = await checkBucketExists();
    
    if (bucketCheck.exists && bucketCheck.accessible) {
      console.log('✅ Bucket already exists and is accessible');
      return { created: false, exists: true, bucket: bucketCheck.bucket };
    }
    
    if (bucketCheck.exists && !bucketCheck.accessible) {
      console.log('⚠️ Bucket exists but not accessible - may need manual policy setup');
      return { 
        created: false, 
        exists: true, 
        needsManualSetup: true,
        error: bucketCheck.error 
      };
    }
    
    // Try to create bucket
    console.log('🔨 Creating new bucket...');
    const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error('❌ Bucket creation failed:', error);
      return { 
        created: false, 
        exists: false, 
        error: error.message,
        needsManualSetup: true 
      };
    }
    
    console.log('✅ Bucket created successfully:', data);
    return { created: true, exists: true, bucket: data };
    
  } catch (error) {
    console.error('❌ Bucket creation error:', error);
    return { 
      created: false, 
      exists: false, 
      error: error.message,
      needsManualSetup: true 
    };
  }
}

/**
 * 4. Test upload functionality
 */
export async function testUploadFunctionality() {
  console.log('🧪 Testing upload functionality...');
  
  try {
    // Create test image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TEST', 50, 55);
    
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const testPath = `test/connection-test-${Date.now()}.png`;
    
    // Upload test file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(testPath, blob, {
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
      .from(STORAGE_BUCKET)
      .getPublicUrl(testPath);
    
    console.log('✅ Public URL generated:', publicUrl);
    
    // Clean up
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([testPath]);
    
    if (deleteError) {
      console.warn('⚠️ Cleanup warning:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    return { 
      success: true, 
      uploadData: data,
      publicUrl: publicUrl 
    };
    
  } catch (error) {
    console.error('❌ Upload test error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Upload sample product images
 */
export async function uploadSampleProducts() {
  console.log('📦 Uploading sample product images...');
  
  const products = [
    { name: 'Arduino Uno R3', price: 650, color: '#FF6B6B' },
    { name: 'ESP32 Development Board', price: 800, color: '#4ECDC4' },
    { name: 'HC-SR04 Ultrasonic Sensor', price: 250, color: '#45B7D1' },
    { name: '9g Servo Motor', price: 180, color: '#96CEB4' },
    { name: '16x2 LCD Display', price: 350, color: '#FFEAA7' }
  ];
  
  const uploadedProducts = [];
  
  try {
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Create product image
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, product.color);
      gradient.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      // Product info
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 200, 180);
      
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#E74C3C';
      ctx.fillText(`K${product.price}`, 200, 220);
      
      ctx.font = '16px Arial';
      ctx.fillStyle = '#7F8C8D';
      ctx.fillText('Gifted Solutions', 200, 260);
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const fileName = `${product.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const filePath = `products/${fileName}`;
      
      // Upload
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`❌ Failed to upload ${fileName}:`, error);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);
        
        console.log(`✅ Uploaded ${fileName}`);
        uploadedProducts.push({
          ...product,
          fileName,
          path: filePath,
          url: publicUrl
        });
      }
      
      // Delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Successfully uploaded ${uploadedProducts.length} product images`);
    return uploadedProducts;
    
  } catch (error) {
    console.error('❌ Product upload failed:', error);
    return uploadedProducts;
  }
}

/**
 * 6. Complete setup process
 */
export async function runCompleteProperSetup() {
  console.log('🚀 Running complete proper Supabase setup...');
  
  const results = {
    connection: null,
    bucket: null,
    upload: null,
    products: [],
    success: false,
    manualSteps: []
  };
  
  try {
    // Step 1: Check connection
    console.log('\n--- STEP 1: Check Connection ---');
    results.connection = await checkSupabaseConnection();
    
    if (!results.connection.connected) {
      console.log('❌ Cannot proceed - connection failed');
      return results;
    }
    
    // Step 2: Create bucket if needed
    console.log('\n--- STEP 2: Setup Bucket ---');
    results.bucket = await createBucketIfNeeded();
    
    if (results.bucket.needsManualSetup) {
      console.log('⚠️ Manual bucket setup required');
      results.manualSteps.push(
        'Go to https://fotcjsmnerawpqzhldhq.supabase.co',
        'Navigate to Storage section',
        'Create bucket named "product-images"',
        'Set as public bucket',
        'Enable public read/write policies'
      );
    }
    
    // Step 3: Test upload
    console.log('\n--- STEP 3: Test Upload ---');
    results.upload = await testUploadFunctionality();
    
    if (!results.upload.success) {
      console.log('❌ Upload test failed - check bucket permissions');
      if (!results.bucket.needsManualSetup) {
        results.manualSteps.push('Check bucket permissions in Supabase dashboard');
      }
    }
    
    // Step 4: Upload products (if upload works)
    if (results.upload.success) {
      console.log('\n--- STEP 4: Upload Sample Products ---');
      results.products = await uploadSampleProducts();
    }
    
    results.success = results.connection.connected && 
                     results.bucket.exists && 
                     results.upload.success;
    
    console.log('\n🎉 Setup Summary:');
    console.log(`✅ Connection: ${results.connection.connected ? 'OK' : 'FAILED'}`);
    console.log(`✅ Bucket: ${results.bucket.exists ? 'EXISTS' : 'MISSING'}`);
    console.log(`✅ Upload: ${results.upload.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Products: ${results.products.length} uploaded`);
    
    if (results.manualSteps.length > 0) {
      console.log('\n📋 Manual steps required:');
      results.manualSteps.forEach((step, i) => {
        console.log(`${i + 1}. ${step}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Complete setup failed:', error);
    results.error = error.message;
    return results;
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.properSupabase = {
    checkSupabaseConnection,
    checkBucketExists,
    createBucketIfNeeded,
    testUploadFunctionality,
    uploadSampleProducts,
    runCompleteProperSetup
  };
  
  console.log('🔧 Proper Supabase setup available in window.properSupabase');
}

export default {
  checkSupabaseConnection,
  checkBucketExists,
  createBucketIfNeeded,
  testUploadFunctionality,
  uploadSampleProducts,
  runCompleteProperSetup
};
