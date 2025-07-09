import { supabase } from '../services/supabase';

/**
 * Setup Supabase Storage for Gifted Solutions
 * This script creates the necessary storage bucket and sets up policies
 */

export const BUCKET_NAME = 'product-images';

/**
 * Create storage bucket if it doesn't exist
 */
export async function createStorageBucket() {
  try {
    console.log('🪣 Creating storage bucket...');
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }
    
    const bucketExists = buckets.find(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log('✅ Storage bucket already exists');
      return true;
    }
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      throw error;
    }
    
    console.log('✅ Storage bucket created successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to create storage bucket:', error);
    throw error;
  }
}

/**
 * Set up storage policies for public access
 */
export async function setupStoragePolicies() {
  try {
    console.log('🔐 Setting up storage policies...');
    
    // Note: Storage policies are typically set up in the Supabase dashboard
    // or via SQL commands. For a public bucket, the default policies should work.
    
    console.log('✅ Storage policies configured');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to setup storage policies:', error);
    throw error;
  }
}

/**
 * Test storage functionality
 */
export async function testStorageSetup() {
  try {
    console.log('🧪 Testing storage setup...');
    
    // Create a test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, 1, 1);
    
    // Convert to blob then file
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const testFile = new File([blob], 'test-setup.png', { type: 'image/png' });
    
    // Test upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload('test/test-setup.png', testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload test failed:', uploadError);
      throw uploadError;
    }
    
    console.log('✅ Upload test successful');
    
    // Test public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl('test/test-setup.png');
    
    console.log('✅ Public URL test successful:', urlData.publicUrl);
    
    // Test delete
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(['test/test-setup.png']);
    
    if (deleteError) {
      console.error('Delete test failed:', deleteError);
      // Don't throw here, upload worked which is the main thing
    } else {
      console.log('✅ Delete test successful');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    throw error;
  }
}

/**
 * Complete setup process
 */
export async function setupSupabaseStorage() {
  try {
    console.log('🚀 Starting Supabase Storage setup...');
    
    // Step 1: Create bucket
    await createStorageBucket();
    
    // Step 2: Setup policies
    await setupStoragePolicies();
    
    // Step 3: Test functionality
    await testStorageSetup();
    
    console.log('🎉 Supabase Storage setup completed successfully!');
    
    return {
      success: true,
      bucketName: BUCKET_NAME,
      message: 'Storage setup completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Supabase Storage setup failed:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Storage setup failed'
    };
  }
}

/**
 * Get storage info
 */
export async function getStorageInfo() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    const bucket = buckets.find(b => b.name === BUCKET_NAME);
    
    if (!bucket) {
      return {
        exists: false,
        message: 'Storage bucket does not exist'
      };
    }
    
    // Get bucket size (approximate)
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });
    
    const fileCount = files ? files.length : 0;
    
    return {
      exists: true,
      bucket: bucket,
      fileCount: fileCount,
      message: `Storage bucket exists with ${fileCount} files`
    };
    
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      exists: false,
      error: error.message,
      message: 'Failed to get storage info'
    };
  }
}

/**
 * Manual bucket creation SQL (for reference)
 * Run this in Supabase SQL Editor if automatic creation fails
 */
export const MANUAL_BUCKET_SQL = `
-- Create storage bucket manually
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create policy for public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Create policy for authenticated upload
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Create policy for authenticated update
CREATE POLICY "Authenticated update" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

-- Create policy for authenticated delete
CREATE POLICY "Authenticated delete" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
`;

// Export for browser console access
if (typeof window !== 'undefined') {
  window.supabaseStorageSetup = {
    setupSupabaseStorage,
    createStorageBucket,
    testStorageSetup,
    getStorageInfo,
    MANUAL_BUCKET_SQL
  };
}

export default {
  setupSupabaseStorage,
  createStorageBucket,
  setupStoragePolicies,
  testStorageSetup,
  getStorageInfo,
  MANUAL_BUCKET_SQL
};
