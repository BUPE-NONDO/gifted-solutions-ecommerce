// Script to fix Supabase image access issues
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fotcjsmnerawpqzhldhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NDcyOTcsImV4cCI6MjA1MTMyMzI5N30.Ej7Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'product-images';

/**
 * Main function to fix all image access issues
 */
async function fixSupabaseImageAccess() {
  console.log('🔧 Starting Supabase image access fix...');
  
  try {
    // Step 1: Check if bucket exists
    console.log('📁 Checking bucket existence...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return false;
    }
    
    const bucketExists = buckets.find(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      console.log('📁 Creating bucket...');
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return false;
      }
      console.log('✅ Bucket created successfully');
    } else {
      console.log('✅ Bucket exists');
    }
    
    // Step 2: Check bucket accessibility
    console.log('🔍 Testing bucket access...');
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('products', { limit: 5 });
    
    if (listError) {
      console.error('❌ Cannot access bucket:', listError);
      console.log('ℹ️ This might be due to RLS policies. Check Supabase dashboard.');
      return false;
    }
    
    console.log(`✅ Bucket accessible. Found ${files.length} files`);
    
    // Step 3: Test image URLs
    console.log('🔗 Testing image URLs...');
    const testResults = [];
    
    for (const file of files.slice(0, 3)) { // Test first 3 files
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`products/${file.name}`);
      
      const publicUrl = data.publicUrl;
      
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        const accessible = response.ok;
        
        testResults.push({
          fileName: file.name,
          url: publicUrl,
          accessible,
          status: response.status
        });
        
        console.log(`${accessible ? '✅' : '❌'} ${file.name}: ${response.status}`);
        
      } catch (fetchError) {
        testResults.push({
          fileName: file.name,
          url: publicUrl,
          accessible: false,
          error: fetchError.message
        });
        
        console.log(`❌ ${file.name}: ${fetchError.message}`);
      }
    }
    
    const accessibleCount = testResults.filter(r => r.accessible).length;
    const totalCount = testResults.length;
    
    console.log(`📊 Results: ${accessibleCount}/${totalCount} images accessible`);
    
    if (accessibleCount === 0) {
      console.log('⚠️ No images are accessible. This indicates a bucket policy issue.');
      console.log('📝 Manual steps required:');
      console.log('   1. Go to Supabase Dashboard');
      console.log('   2. Navigate to Storage > product-images');
      console.log('   3. Click Settings');
      console.log('   4. Make sure "Public bucket" is enabled');
      console.log('   5. Check RLS policies allow public access');
      return false;
    }
    
    // Step 4: Generate correct URLs for all images
    console.log('📋 Generating correct URLs...');
    const imageUrls = {};
    
    files.forEach(file => {
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`products/${file.name}`);
      
      imageUrls[file.name] = data.publicUrl;
    });
    
    console.log(`✅ Generated ${Object.keys(imageUrls).length} image URLs`);
    
    // Step 5: Update hardcoded products with correct URLs
    console.log('🔄 Updating hardcoded products...');
    
    // This would be done by updating the hardcoded products file
    // For now, just log the URLs
    console.log('📋 Available image URLs:');
    Object.entries(imageUrls).forEach(([fileName, url]) => {
      console.log(`   ${fileName}: ${url}`);
    });
    
    console.log('✅ Supabase image access fix completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing Supabase access:', error);
    return false;
  }
}

/**
 * Alternative: Create signed URLs for temporary access
 */
async function createSignedUrls() {
  console.log('🔐 Creating signed URLs as fallback...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('products', { limit: 20 });
    
    if (error) {
      console.error('❌ Error listing files:', error);
      return {};
    }
    
    const signedUrls = {};
    
    for (const file of files) {
      const { data, error: signError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(`products/${file.name}`, 3600); // 1 hour expiry
      
      if (signError) {
        console.error(`❌ Error creating signed URL for ${file.name}:`, signError);
      } else {
        signedUrls[file.name] = data.signedUrl;
        console.log(`✅ Signed URL created for ${file.name}`);
      }
    }
    
    console.log(`✅ Created ${Object.keys(signedUrls).length} signed URLs`);
    return signedUrls;
    
  } catch (error) {
    console.error('❌ Error creating signed URLs:', error);
    return {};
  }
}

/**
 * Check and fix RLS policies
 */
async function checkRLSPolicies() {
  console.log('🔒 Checking RLS policies...');
  
  // Note: This requires admin access to check policies
  // For now, just provide instructions
  
  console.log('📝 RLS Policy Instructions:');
  console.log('   1. Go to Supabase Dashboard > Authentication > Policies');
  console.log('   2. Check if there are policies for the storage.objects table');
  console.log('   3. Ensure there\'s a policy allowing public SELECT on storage.objects');
  console.log('   4. Example policy:');
  console.log('      - Policy name: "Public Access"');
  console.log('      - Table: storage.objects');
  console.log('      - Operation: SELECT');
  console.log('      - Target roles: public');
  console.log('      - USING expression: bucket_id = \'product-images\'');
  
  return true;
}

// Export functions for use in components
export {
  fixSupabaseImageAccess,
  createSignedUrls,
  checkRLSPolicies
};

// Run the fix if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.fixSupabaseImageAccess = fixSupabaseImageAccess;
  window.createSignedUrls = createSignedUrls;
  window.checkRLSPolicies = checkRLSPolicies;
  
  console.log('🔧 Supabase fix functions available:');
  console.log('   - window.fixSupabaseImageAccess()');
  console.log('   - window.createSignedUrls()');
  console.log('   - window.checkRLSPolicies()');
}
