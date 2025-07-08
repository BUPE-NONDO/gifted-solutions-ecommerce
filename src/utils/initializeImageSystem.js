import supabaseService from '../services/supabase';
import { setupSupabaseStorage, testStorageSetup } from './setupSupabaseStorage';

/**
 * Complete initialization script for Supabase Image System
 * Run this to set up everything needed for image management
 */

// Sample product images to upload (using pngwing.com as per user preference)
const sampleProductImages = [
  {
    name: 'Arduino Uno R3',
    productId: 'arduino-uno',
    imageUrl: 'https://www.pngwing.com/en/free-png-nxqxz/download',
    category: 'Arduino Boards'
  },
  {
    name: 'ESP32 Development Board',
    productId: 'esp32',
    imageUrl: 'https://www.pngwing.com/en/free-png-bvxyz/download',
    category: 'WiFi Modules'
  },
  {
    name: 'HC-SR04 Ultrasonic Sensor',
    productId: 'ultrasonic-sensor',
    imageUrl: 'https://www.pngwing.com/en/free-png-cdefg/download',
    category: 'Sensors'
  },
  {
    name: 'DHT11 Temperature Sensor',
    productId: 'dht11-sensor',
    imageUrl: 'https://www.pngwing.com/en/free-png-hijkl/download',
    category: 'Sensors'
  },
  {
    name: '9g Servo Motor',
    productId: 'servo-motor',
    imageUrl: 'https://www.pngwing.com/en/free-png-mnopq/download',
    category: 'Motors'
  }
];

/**
 * Step 1: Initialize Supabase Storage
 */
export async function step1_InitializeStorage() {
  console.log('🚀 Step 1: Initializing Supabase Storage...');
  
  try {
    const result = await setupSupabaseStorage();
    
    if (result.success) {
      console.log('✅ Storage initialization successful!');
      return true;
    } else {
      console.error('❌ Storage initialization failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Storage initialization error:', error);
    return false;
  }
}

/**
 * Step 2: Test Storage Connection
 */
export async function step2_TestConnection() {
  console.log('🧪 Step 2: Testing Storage Connection...');
  
  try {
    const success = await testStorageSetup();
    
    if (success) {
      console.log('✅ Storage connection test successful!');
      return true;
    } else {
      console.error('❌ Storage connection test failed!');
      return false;
    }
  } catch (error) {
    console.error('❌ Storage connection test error:', error);
    return false;
  }
}

/**
 * Step 3: Create sample images for testing
 */
export async function step3_CreateSampleImages() {
  console.log('🖼️ Step 3: Creating Sample Images...');
  
  const sampleImages = [];
  
  try {
    // Create different colored sample images
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    const names = ['Arduino', 'ESP32', 'Sensor', 'Motor', 'Display'];
    
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
      
      // Add text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(names[i], 200, 200);
      ctx.fillText('Sample Image', 200, 240);
      
      // Convert to blob then file
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `sample-${names[i].toLowerCase()}.png`, { type: 'image/png' });
      
      sampleImages.push({
        file,
        name: names[i],
        productId: `sample-${names[i].toLowerCase()}`
      });
    }
    
    console.log('✅ Created 5 sample images for testing');
    return sampleImages;
    
  } catch (error) {
    console.error('❌ Error creating sample images:', error);
    return [];
  }
}

/**
 * Step 4: Upload sample images to Supabase
 */
export async function step4_UploadSampleImages() {
  console.log('📤 Step 4: Uploading Sample Images...');
  
  try {
    const sampleImages = await step3_CreateSampleImages();
    const uploadResults = [];
    
    for (const sample of sampleImages) {
      try {
        console.log(`Uploading ${sample.name}...`);
        
        const result = await supabaseService.uploadProductImage(sample.file, sample.productId);
        
        uploadResults.push({
          name: sample.name,
          productId: sample.productId,
          url: result.publicUrl,
          success: true
        });
        
        console.log(`✅ Uploaded ${sample.name}: ${result.publicUrl}`);
        
        // Add delay between uploads
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to upload ${sample.name}:`, error);
        uploadResults.push({
          name: sample.name,
          productId: sample.productId,
          error: error.message,
          success: false
        });
      }
    }
    
    const successful = uploadResults.filter(r => r.success);
    console.log(`✅ Successfully uploaded ${successful.length}/${uploadResults.length} images`);
    
    return uploadResults;
    
  } catch (error) {
    console.error('❌ Error uploading sample images:', error);
    return [];
  }
}

/**
 * Step 5: Test image retrieval and display
 */
export async function step5_TestImageRetrieval() {
  console.log('🔍 Step 5: Testing Image Retrieval...');
  
  try {
    // List all images in storage
    const images = await supabaseService.listImages('products');
    
    console.log(`📁 Found ${images.length} images in storage:`);
    
    for (const image of images) {
      const publicUrl = supabaseService.getPublicUrl(`products/${image.name}`);
      console.log(`  - ${image.name}: ${publicUrl}`);
    }
    
    return images;
    
  } catch (error) {
    console.error('❌ Error retrieving images:', error);
    return [];
  }
}

/**
 * Step 6: Create image gallery for testing
 */
export async function step6_CreateTestGallery() {
  console.log('🖼️ Step 6: Creating Test Gallery...');
  
  try {
    const images = await step5_TestImageRetrieval();
    
    // Create gallery container
    const galleryContainer = document.createElement('div');
    galleryContainer.id = 'supabase-test-gallery';
    galleryContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      background: white;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      overflow-y: auto;
    `;
    
    galleryContainer.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #4CAF50;">✅ Supabase Images</h3>
      <div id="gallery-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;"></div>
      <button onclick="document.getElementById('supabase-test-gallery').remove()" 
              style="margin-top: 16px; padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Close Gallery
      </button>
    `;
    
    const grid = galleryContainer.querySelector('#gallery-grid');
    
    for (const image of images) {
      const publicUrl = supabaseService.getPublicUrl(`products/${image.name}`);
      
      const imageElement = document.createElement('div');
      imageElement.style.cssText = 'text-align: center;';
      imageElement.innerHTML = `
        <img src="${publicUrl}" 
             style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'" />
        <div style="font-size: 10px; margin-top: 4px; color: #666;">${image.name.substring(0, 15)}...</div>
      `;
      
      grid.appendChild(imageElement);
    }
    
    // Remove existing gallery if present
    const existing = document.getElementById('supabase-test-gallery');
    if (existing) existing.remove();
    
    // Add to page
    document.body.appendChild(galleryContainer);
    
    console.log('✅ Test gallery created and displayed');
    return true;
    
  } catch (error) {
    console.error('❌ Error creating test gallery:', error);
    return false;
  }
}

/**
 * Complete initialization process
 */
export async function initializeCompleteImageSystem() {
  console.log('🚀 Starting Complete Supabase Image System Initialization...');
  
  const results = {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
    overall: false
  };
  
  try {
    // Step 1: Initialize Storage
    results.step1 = await step1_InitializeStorage();
    if (!results.step1) throw new Error('Storage initialization failed');
    
    // Step 2: Test Connection
    results.step2 = await step2_TestConnection();
    if (!results.step2) throw new Error('Connection test failed');
    
    // Step 3 & 4: Create and Upload Sample Images
    const uploadResults = await step4_UploadSampleImages();
    results.step4 = uploadResults.some(r => r.success);
    
    // Step 5: Test Retrieval
    const images = await step5_TestImageRetrieval();
    results.step5 = images.length > 0;
    
    // Step 6: Create Gallery
    results.step6 = await step6_CreateTestGallery();
    
    results.overall = Object.values(results).every(Boolean);
    
    if (results.overall) {
      console.log('🎉 Complete initialization successful!');
      
      // Show success notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10001;
        font-weight: bold;
      `;
      notification.textContent = '🎉 Supabase Image System Initialized Successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => notification.remove(), 5000);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    results.error = error.message;
    return results;
  }
}

// Export for browser console access
if (typeof window !== 'undefined') {
  window.initializeImageSystem = {
    step1_InitializeStorage,
    step2_TestConnection,
    step3_CreateSampleImages,
    step4_UploadSampleImages,
    step5_TestImageRetrieval,
    step6_CreateTestGallery,
    initializeCompleteImageSystem
  };
}

export default {
  step1_InitializeStorage,
  step2_TestConnection,
  step3_CreateSampleImages,
  step4_UploadSampleImages,
  step5_TestImageRetrieval,
  step6_CreateTestGallery,
  initializeCompleteImageSystem
};
