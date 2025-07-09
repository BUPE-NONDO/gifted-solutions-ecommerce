/**
 * Create Supabase Bucket via API
 * Alternative method when dashboard access is not working
 */

const SUPABASE_URL = 'https://fotcjsmnerawpqzhldhq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mzg5MjYsImV4cCI6MjA2NDExNDkyNn0.cMIRbKVsw-gvOu53IaZzrABpngZ4O-hsMV7sWqLehK4';
const BUCKET_NAME = 'product-images';

/**
 * Create bucket using REST API
 */
export async function createBucketViaAPI() {
  console.log('🔨 Creating bucket via REST API...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        id: BUCKET_NAME,
        name: BUCKET_NAME,
        public: true,
        file_size_limit: 5242880,
        allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ API bucket creation failed:', result);
      return { success: false, error: result.message || 'Unknown error' };
    }
    
    console.log('✅ Bucket created via API:', result);
    return { success: true, data: result };
    
  } catch (error) {
    console.error('❌ API request failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List existing buckets via API
 */
export async function listBucketsViaAPI() {
  console.log('📋 Listing buckets via API...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    const buckets = await response.json();
    
    if (!response.ok) {
      console.error('❌ Failed to list buckets:', buckets);
      return { success: false, error: buckets.message };
    }
    
    console.log('✅ Buckets found:', buckets);
    
    const targetBucket = buckets.find(b => b.name === BUCKET_NAME);
    if (targetBucket) {
      console.log(`✅ Target bucket '${BUCKET_NAME}' exists:`, targetBucket);
    } else {
      console.log(`❌ Target bucket '${BUCKET_NAME}' not found`);
    }
    
    return { 
      success: true, 
      buckets: buckets,
      targetExists: !!targetBucket,
      targetBucket: targetBucket
    };
    
  } catch (error) {
    console.error('❌ List buckets failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test upload to bucket via API
 */
export async function testUploadViaAPI() {
  console.log('🧪 Testing upload via API...');
  
  try {
    // Create test file
    const testContent = `API Test Upload - ${new Date().toISOString()}`;
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testPath = `test/api-test-${Date.now()}.txt`;
    
    const formData = new FormData();
    formData.append('file', testBlob, 'api-test.txt');
    
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${testPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ API upload failed:', result);
      return { success: false, error: result.message };
    }
    
    console.log('✅ API upload successful:', result);
    
    // Get public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${testPath}`;
    console.log('✅ Public URL:', publicUrl);
    
    return { 
      success: true, 
      uploadResult: result,
      publicUrl: publicUrl,
      testPath: testPath
    };
    
  } catch (error) {
    console.error('❌ API upload test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Complete API setup
 */
export async function runCompleteAPISetup() {
  console.log('🚀 Running complete API setup...');
  
  const results = {
    listBuckets: null,
    createBucket: null,
    testUpload: null,
    success: false
  };
  
  try {
    // Step 1: List existing buckets
    console.log('\n--- STEP 1: List Buckets ---');
    results.listBuckets = await listBucketsViaAPI();
    
    if (!results.listBuckets.success) {
      console.log('❌ Cannot list buckets - check credentials');
      return results;
    }
    
    // Step 2: Create bucket if needed
    if (!results.listBuckets.targetExists) {
      console.log('\n--- STEP 2: Create Bucket ---');
      results.createBucket = await createBucketViaAPI();
      
      if (!results.createBucket.success) {
        console.log('❌ Bucket creation failed');
        return results;
      }
    } else {
      console.log('\n--- STEP 2: Bucket Already Exists ---');
      results.createBucket = { success: true, existed: true };
    }
    
    // Step 3: Test upload
    console.log('\n--- STEP 3: Test Upload ---');
    results.testUpload = await testUploadViaAPI();
    
    results.success = results.listBuckets.success && 
                     results.createBucket.success && 
                     results.testUpload.success;
    
    console.log('\n🎉 API Setup Summary:');
    console.log(`✅ List Buckets: ${results.listBuckets.success ? 'OK' : 'FAILED'}`);
    console.log(`✅ Create Bucket: ${results.createBucket.success ? 'OK' : 'FAILED'}`);
    console.log(`✅ Test Upload: ${results.testUpload.success ? 'OK' : 'FAILED'}`);
    console.log(`✅ Overall: ${results.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (results.success) {
      console.log('\n🎉 Bucket is ready! You can now upload images.');
      console.log('Try running: window.properSupabase.uploadSampleProducts()');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Complete API setup failed:', error);
    results.error = error.message;
    return results;
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.bucketAPI = {
    createBucketViaAPI,
    listBucketsViaAPI,
    testUploadViaAPI,
    runCompleteAPISetup
  };
  
  console.log('🔧 Bucket API commands available in window.bucketAPI');
}

export default {
  createBucketViaAPI,
  listBucketsViaAPI,
  testUploadViaAPI,
  runCompleteAPISetup
};
