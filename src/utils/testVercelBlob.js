// Test utility for Vercel Blob Storage
import { vercelBlobService } from '../services/vercelBlobService.js';

/**
 * Test Vercel Blob storage functionality
 */
export async function testVercelBlobStorage() {
  console.log('🧪 Testing Vercel Blob Storage...');
  
  try {
    // Create a test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, 1, 1);
    
    // Convert to blob then file
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const testFile = new File([blob], 'test-vercel-blob.png', { type: 'image/png' });
    
    console.log('📤 Testing upload...');
    
    // Test upload
    const uploadResult = await vercelBlobService.uploadImage(testFile, 'test/test-upload.png');
    console.log('✅ Upload successful:', uploadResult);
    
    // Test public URL
    const publicUrl = vercelBlobService.getPublicUrl(uploadResult.url);
    console.log('✅ Public URL:', publicUrl);
    
    // Test image loading
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image loads successfully from Vercel Blob');
    };
    img.onerror = () => {
      console.error('❌ Image failed to load from Vercel Blob');
    };
    img.src = publicUrl;
    
    // Test delete (optional - comment out to keep test image)
    // console.log('🗑️ Testing delete...');
    // const deleteResult = await vercelBlobService.deleteImage(uploadResult.url);
    // console.log('✅ Delete successful:', deleteResult);
    
    return {
      success: true,
      uploadResult,
      publicUrl
    };
    
  } catch (error) {
    console.error('❌ Vercel Blob test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test storage service integration
 */
export async function testStorageServiceIntegration() {
  console.log('🔗 Testing storage service integration...');
  
  try {
    // Import the main supabase service (which now uses Vercel Blob)
    const { default: supabaseService } = await import('../services/supabase.js');
    
    // Create test file
    const testBlob = new Blob(['test content'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'integration-test.txt', { type: 'text/plain' });
    
    // Test upload through main service
    const result = await supabaseService.uploadImage(testFile, 'test/integration-test.txt');
    console.log('✅ Integration test successful:', result);
    
    // Test URL generation
    const url = supabaseService.getPublicUrl(result.url);
    console.log('✅ URL generation successful:', url);
    
    return {
      success: true,
      result,
      url
    };
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testVercelBlob = testVercelBlobStorage;
  window.testStorageIntegration = testStorageServiceIntegration;
}
