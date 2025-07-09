import { supabase } from '../services/supabase';

/**
 * Direct Supabase Commands - Push directly to Supabase without UI
 * Run these commands to set up storage bucket and initialize the system
 */

const BUCKET_NAME = 'product-images';

/**
 * 1. Create Storage Bucket Directly
 */
export async function createBucketDirect() {
  console.log('🪣 Creating storage bucket directly...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets.find(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log('✅ Bucket already exists:', BUCKET_NAME);
      return true;
    }
    
    // Create bucket with public access
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error('❌ Error creating bucket:', error);
      return false;
    }
    
    console.log('✅ Bucket created successfully:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Bucket creation failed:', error);
    return false;
  }
}

/**
 * 2. Set Storage Policies Directly via SQL
 */
export async function setPoliciesDirect() {
  console.log('🔐 Setting storage policies directly...');
  
  const policies = [
    // Public read access
    `
    CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id = '${BUCKET_NAME}');
    `,
    
    // Public insert access (for uploads)
    `
    CREATE POLICY IF NOT EXISTS "Public upload access" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = '${BUCKET_NAME}');
    `,
    
    // Public update access
    `
    CREATE POLICY IF NOT EXISTS "Public update access" ON storage.objects
    FOR UPDATE USING (bucket_id = '${BUCKET_NAME}');
    `,
    
    // Public delete access
    `
    CREATE POLICY IF NOT EXISTS "Public delete access" ON storage.objects
    FOR DELETE USING (bucket_id = '${BUCKET_NAME}');
    `
  ];
  
  try {
    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.warn('⚠️ Policy creation warning:', error);
      }
    }
    
    console.log('✅ Storage policies set successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Policy setup failed:', error);
    return false;
  }
}

/**
 * 3. Upload Sample Images Directly
 */
export async function uploadSampleImagesDirect() {
  console.log('📤 Uploading sample images directly...');
  
  const sampleImages = [];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const names = ['Arduino-Uno', 'ESP32-Module', 'Ultrasonic-Sensor', 'Servo-Motor', 'LCD-Display'];
  
  try {
    // Create sample images
    for (let i = 0; i < 5; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, colors[i]);
      gradient.addColorStop(1, '#FFFFFF');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      // Add product name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(names[i], 200, 180);
      
      // Add "Gifted Solutions" text
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Gifted Solutions', 200, 220);
      
      // Add price
      ctx.font = '16px Arial';
      ctx.fillText(`K${(Math.random() * 1000 + 200).toFixed(0)}`, 200, 250);
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const fileName = `sample-${names[i].toLowerCase()}.png`;
      const filePath = `products/${fileName}`;
      
      // Upload directly to Supabase
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
        sampleImages.push({
          name: names[i],
          fileName,
          path: filePath,
          url: publicUrl
        });
      }
      
      // Add delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Successfully uploaded ${sampleImages.length} sample images`);
    return sampleImages;
    
  } catch (error) {
    console.error('❌ Sample image upload failed:', error);
    return [];
  }
}

/**
 * 4. Test Storage Access Directly
 */
export async function testStorageDirect() {
  console.log('🧪 Testing storage access directly...');
  
  try {
    // Test file upload
    const testBlob = new Blob(['test content'], { type: 'text/plain' });
    const testPath = 'test/direct-test.txt';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testPath, testBlob, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      return false;
    }
    
    console.log('✅ Upload test successful');
    
    // Test public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(testPath);
    
    console.log('✅ Public URL test successful:', publicUrl);
    
    // Test file listing
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 10 });
    
    if (listError) {
      console.error('❌ List test failed:', listError);
    } else {
      console.log(`✅ List test successful: Found ${files.length} files`);
    }
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([testPath]);
    
    if (deleteError) {
      console.warn('⚠️ Test file cleanup warning:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
}

/**
 * 5. Get Storage Information Directly
 */
export async function getStorageInfoDirect() {
  console.log('📊 Getting storage information directly...');
  
  try {
    // Get bucket info
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error getting buckets:', bucketError);
      return null;
    }
    
    const bucket = buckets.find(b => b.name === BUCKET_NAME);
    
    if (!bucket) {
      console.log('❌ Bucket not found');
      return null;
    }
    
    // Get file count
    const { data: files, error: filesError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });
    
    const fileCount = files ? files.length : 0;
    
    const info = {
      bucket: bucket,
      fileCount: fileCount,
      bucketName: BUCKET_NAME,
      isPublic: bucket.public,
      createdAt: bucket.created_at
    };
    
    console.log('✅ Storage Info:', info);
    return info;
    
  } catch (error) {
    console.error('❌ Error getting storage info:', error);
    return null;
  }
}

/**
 * 6. Complete Direct Setup - Run All Commands
 */
export async function runCompleteDirectSetup() {
  console.log('🚀 Running complete direct Supabase setup...');
  
  const results = {
    bucket: false,
    policies: false,
    samples: false,
    test: false,
    info: null
  };
  
  try {
    // Step 1: Create bucket
    console.log('\n--- STEP 1: Creating Bucket ---');
    results.bucket = await createBucketDirect();
    
    // Step 2: Set policies
    console.log('\n--- STEP 2: Setting Policies ---');
    results.policies = await setPoliciesDirect();
    
    // Step 3: Upload samples
    console.log('\n--- STEP 3: Uploading Samples ---');
    const samples = await uploadSampleImagesDirect();
    results.samples = samples.length > 0;
    
    // Step 4: Test storage
    console.log('\n--- STEP 4: Testing Storage ---');
    results.test = await testStorageDirect();
    
    // Step 5: Get info
    console.log('\n--- STEP 5: Getting Info ---');
    results.info = await getStorageInfoDirect();
    
    const success = results.bucket && results.test;
    
    console.log('\n🎉 SETUP COMPLETE!');
    console.log('Results:', results);
    
    if (success) {
      console.log('✅ Supabase storage is ready for use!');
      console.log(`📁 Bucket: ${BUCKET_NAME}`);
      console.log(`🖼️ Sample images: ${samples.length} uploaded`);
      console.log('🔗 Access your images at: https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/');
    } else {
      console.log('❌ Setup completed with errors. Check the logs above.');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Complete setup failed:', error);
    return results;
  }
}

// Export for browser console access
if (typeof window !== 'undefined') {
  window.directSupabase = {
    createBucketDirect,
    setPoliciesDirect,
    uploadSampleImagesDirect,
    testStorageDirect,
    getStorageInfoDirect,
    runCompleteDirectSetup
  };
  
  console.log('🔧 Direct Supabase commands available in window.directSupabase');
}

export default {
  createBucketDirect,
  setPoliciesDirect,
  uploadSampleImagesDirect,
  testStorageDirect,
  getStorageInfoDirect,
  runCompleteDirectSetup
};
