// Supabase setup utilities for ensuring public access to images

export const SUPABASE_CONFIG = {
  url: 'https://fotcjsmnerawpqzhldhq.supabase.co',
  bucket: 'product-images',
  publicUrl: 'https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images'
};

// SQL policies for public access
export const PUBLIC_ACCESS_POLICIES = `
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to product-images bucket
CREATE POLICY "Public read access for product images" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- Policy 2: Allow unauthenticated users to view images
CREATE POLICY "Allow unauthenticated read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images' AND auth.role() IS NULL);

-- Policy 3: Allow authenticated users to upload images (for admin)
CREATE POLICY "Allow authenticated upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to update images (for admin)
CREATE POLICY "Allow authenticated update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Policy 5: Allow authenticated users to delete images (for admin)
CREATE POLICY "Allow authenticated delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
`;

// Test image URLs to verify public access
export const TEST_IMAGE_URLS = [
  'https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg',
  'https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/esp32-development-board-1748603955352-1tqsnv.jpg',
  'https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-nano-1748603956926-vinm1g.jpg',
  'https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-mega-2560-1748603960736-c7v4ia.jpg',
  'https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/ultrasonic-sensor-hc-sr04-1748603963344-8gl2xh.jpg'
];

// Convert any Supabase URL to public format
export const ensurePublicUrl = (url) => {
  if (!url) return null;
  
  // If it's already a public URL, return as is
  if (url.includes('/storage/v1/object/public/')) {
    return url;
  }
  
  // If it's a Supabase URL but not public, convert it
  if (url.includes('supabase.co/storage/v1/object/')) {
    return url.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }
  
  // If it's a relative path, make it absolute and public
  if (url.startsWith('product-images/') || url.startsWith('products/')) {
    return `${SUPABASE_CONFIG.publicUrl}/${url}`;
  }
  
  return url;
};

// Test if an image URL is accessible
export const testImageAccess = async (url) => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'cors'
    });
    
    return {
      success: response.ok,
      status: response.status,
      accessible: response.ok,
      cors: true
    };
  } catch (error) {
    // Fallback test with image loading
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          resolve({
            success: true,
            accessible: true,
            cors: true,
            method: 'image-load'
          });
        };
        
        img.onerror = () => {
          resolve({
            success: false,
            accessible: false,
            cors: false,
            error: 'Image load failed',
            method: 'image-load'
          });
        };
        
        // Timeout after 5 seconds
        setTimeout(() => {
          resolve({
            success: false,
            accessible: false,
            error: 'Timeout',
            method: 'timeout'
          });
        }, 5000);
        
        img.src = url;
      });
    } catch (fallbackError) {
      return {
        success: false,
        accessible: false,
        error: fallbackError.message
      };
    }
  }
};

// Test all uploaded images for accessibility
export const testAllImages = async (onProgress = null) => {
  const results = {};
  
  for (let i = 0; i < TEST_IMAGE_URLS.length; i++) {
    const url = TEST_IMAGE_URLS[i];
    const imageName = url.split('/').pop().split('-')[0];
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: TEST_IMAGE_URLS.length,
        image: imageName,
        status: 'testing'
      });
    }
    
    const result = await testImageAccess(url);
    results[imageName] = {
      url,
      ...result
    };
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: TEST_IMAGE_URLS.length,
        image: imageName,
        status: result.success ? 'success' : 'failed'
      });
    }
  }
  
  return results;
};

// Generate setup instructions
export const getSetupInstructions = () => {
  return {
    step1: {
      title: "Make Bucket Public",
      description: "Enable public access to the storage bucket",
      url: `https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/storage`,
      instructions: [
        "Go to Supabase Storage Dashboard",
        "Click on 'product-images' bucket",
        "Go to Settings tab",
        "Enable 'Public bucket' toggle",
        "Save changes"
      ]
    },
    step2: {
      title: "Add Storage Policies",
      description: "Create policies for public read access",
      url: `https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/storage/policies`,
      instructions: [
        "Go to Storage Policies",
        "Click 'New Policy'",
        "Add the SQL policies provided",
        "Enable the policies"
      ],
      sql: PUBLIC_ACCESS_POLICIES
    },
    step3: {
      title: "Test Access",
      description: "Verify images are publicly accessible",
      instructions: [
        "Use the Public Access Checker",
        "Test image URLs in browser",
        "Check on different devices",
        "Verify incognito mode works"
      ]
    }
  };
};

// Check if setup is complete
export const checkSetupStatus = async () => {
  const testResults = await testAllImages();
  const totalTests = Object.keys(testResults).length;
  const successfulTests = Object.values(testResults).filter(r => r.success).length;
  
  return {
    isComplete: successfulTests === totalTests,
    successRate: totalTests > 0 ? (successfulTests / totalTests) * 100 : 0,
    totalTests,
    successfulTests,
    failedTests: totalTests - successfulTests,
    results: testResults
  };
};

// Generate direct links for manual setup
export const getDirectLinks = () => {
  return {
    dashboard: 'https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq',
    storage: 'https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/storage',
    policies: 'https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/storage/policies',
    bucket: 'https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/storage/buckets/product-images',
    sqlEditor: 'https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/sql'
  };
};

export default {
  SUPABASE_CONFIG,
  PUBLIC_ACCESS_POLICIES,
  TEST_IMAGE_URLS,
  ensurePublicUrl,
  testImageAccess,
  testAllImages,
  getSetupInstructions,
  checkSetupStatus,
  getDirectLinks
};
