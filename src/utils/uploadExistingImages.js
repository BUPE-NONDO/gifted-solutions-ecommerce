import supabaseService from '../services/supabase';

/**
 * Upload existing local images to Supabase Storage
 * This script helps migrate from local images to cloud storage
 */

// Real product images from Gifted Solutions inventory
const existingImages = [
  // Arduino Boards
  {
    localPath: '/images/arduino-uno.jpg',
    productId: 'arduino-uno',
    category: 'arduino',
    name: 'Arduino Uno + USB Cable',
    price: 650
  },
  {
    localPath: '/images/arduino-mega.jpg',
    productId: 'arduino-mega',
    category: 'arduino',
    name: 'Arduino Mega (Atmega2560 + USB Cable)',
    price: 1000
  },
  {
    localPath: '/images/arduino-nano.jpg',
    productId: 'arduino-nano',
    category: 'arduino',
    name: 'Arduino Nano',
    price: 450
  },
  {
    localPath: '/images/esp32.jpg',
    productId: 'esp32',
    category: 'wifi',
    name: 'ESP8266 NodeMCU WiFi Module',
    price: 800
  },
  {
    localPath: '/images/esp32-cam.jpg',
    productId: 'esp32-cam',
    category: 'wifi',
    name: 'ESP32 WiFi module with OV2640 Cam Version',
    price: 800
  },

  // Sensors
  {
    localPath: '/images/ultrasonic-sensor.jpg',
    productId: 'hc-sr04',
    category: 'sensors',
    name: 'HC-SR04 Ultrasonic Sensor',
    price: 250
  },
  {
    localPath: '/images/dht11-sensor.jpg',
    productId: 'dht11',
    category: 'sensors',
    name: 'DHT11 Temperature & Humidity sensor',
    price: 250
  },
  {
    localPath: '/images/pir-sensor.jpg',
    productId: 'hc-sr501',
    category: 'sensors',
    name: 'HC-SR501 PIR Motion Sensor',
    price: 250
  },
  {
    localPath: '/images/lm35-sensor.jpg',
    productId: 'lm35',
    category: 'sensors',
    name: 'LM35 Temperature Sensor',
    price: 250
  },

  // Motors & Drivers
  {
    localPath: '/images/servo-motor.jpg',
    productId: 'servo-9g',
    category: 'motors',
    name: '9g Micro Servo Motor',
    price: 180
  },
  {
    localPath: '/images/stepper-motor.jpg',
    productId: 'nema17',
    category: 'motors',
    name: 'Nema 17 Stepper Motor',
    price: 450
  },
  {
    localPath: '/images/l298n-driver.jpg',
    productId: 'l298n',
    category: 'motors',
    name: 'L298N Motor Driver',
    price: 250
  },

  // Displays
  {
    localPath: '/images/lcd-16x2.jpg',
    productId: 'lcd-16x2-i2c',
    category: 'displays',
    name: '16x2 LCD Display (with I2C)',
    price: 350
  },
  {
    localPath: '/images/lcd-20x4.jpg',
    productId: 'lcd-20x4-i2c',
    category: 'displays',
    name: '20x4 Alphanumeric LCD Display (with I2C)',
    price: 450
  },

  // Components
  {
    localPath: '/images/breadboard.jpg',
    productId: 'breadboard-170',
    category: 'components',
    name: '170-Point Breadboard',
    price: 100
  },
  {
    localPath: '/images/jumper-wires.jpg',
    productId: 'jumper-wires',
    category: 'components',
    name: 'Jumper Wires',
    price: 4
  },
  {
    localPath: '/images/resistors.jpg',
    productId: 'resistors',
    category: 'components',
    name: 'Resistor (per unit)',
    price: 25
  },
  {
    localPath: '/images/leds.jpg',
    productId: 'leds',
    category: 'components',
    name: 'LEDs (per unit)',
    price: 10
  },

  // Relay Modules
  {
    localPath: '/images/relay-1ch.jpg',
    productId: 'relay-1ch',
    category: 'relays',
    name: '5V,10A, single Channel Relay Module',
    price: 150
  },
  {
    localPath: '/images/relay-2ch.jpg',
    productId: 'relay-2ch',
    category: 'relays',
    name: '5V 2-Channel Relay Module',
    price: 250
  },
  {
    localPath: '/images/relay-4ch.jpg',
    productId: 'relay-4ch',
    category: 'relays',
    name: '5V 4-Channel Relay Module',
    price: 350
  }
];

/**
 * Convert local image URL to File object for upload
 */
async function urlToFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error(`Error converting ${url} to file:`, error);
    throw error;
  }
}

/**
 * Upload a single image to Supabase
 */
async function uploadSingleImage(imageInfo) {
  try {
    console.log(`Uploading ${imageInfo.localPath}...`);

    // Convert local path to full URL (assuming images are in public folder)
    const fullUrl = window.location.origin + imageInfo.localPath;

    // Extract filename from path
    const filename = imageInfo.localPath.split('/').pop();

    // Convert to File object
    const file = await urlToFile(fullUrl, filename);

    // Upload to Supabase
    const result = await supabaseService.uploadProductImage(file, imageInfo.productId);

    console.log(`✅ Uploaded ${filename}:`, result.publicUrl);

    return {
      ...imageInfo,
      supabaseUrl: result.publicUrl,
      supabasePath: result.path,
      success: true
    };

  } catch (error) {
    console.error(`❌ Failed to upload ${imageInfo.localPath}:`, error);
    return {
      ...imageInfo,
      error: error.message,
      success: false
    };
  }
}

/**
 * Upload all existing images to Supabase
 */
export async function uploadAllExistingImages() {
  console.log('🚀 Starting bulk image upload to Supabase...');

  const results = [];

  for (const imageInfo of existingImages) {
    try {
      const result = await uploadSingleImage(imageInfo);
      results.push(result);

      // Add delay between uploads to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error processing ${imageInfo.localPath}:`, error);
      results.push({
        ...imageInfo,
        error: error.message,
        success: false
      });
    }
  }

  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (successful.length > 0) {
    console.log('\n✅ Successfully uploaded:');
    successful.forEach(result => {
      console.log(`  - ${result.localPath} → ${result.supabaseUrl}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed uploads:');
    failed.forEach(result => {
      console.log(`  - ${result.localPath}: ${result.error}`);
    });
  }

  return results;
}

/**
 * Upload images from pngwing.com (as per user preference)
 */
export async function uploadFromPngwing(imageUrls, productIds) {
  console.log('🖼️ Uploading images from pngwing.com...');

  const results = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const productId = productIds[i] || `product-${Date.now()}-${i}`;

    try {
      console.log(`Downloading and uploading: ${url}`);

      // Extract filename from URL or generate one
      const filename = url.split('/').pop().split('?')[0] || `image-${Date.now()}.png`;

      // Convert to File object
      const file = await urlToFile(url, filename);

      // Upload to Supabase
      const result = await supabaseService.uploadProductImage(file, productId);

      console.log(`✅ Uploaded ${filename}:`, result.publicUrl);

      results.push({
        originalUrl: url,
        productId,
        supabaseUrl: result.publicUrl,
        supabasePath: result.path,
        success: true
      });

      // Add delay between uploads
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.error(`❌ Failed to upload ${url}:`, error);
      results.push({
        originalUrl: url,
        productId,
        error: error.message,
        success: false
      });
    }
  }

  return results;
}

/**
 * Helper function to get Supabase URLs for products
 */
export function getSupabaseImageUrls() {
  // This would typically come from your database
  // For now, return the expected URLs after upload
  return existingImages.map(img => ({
    productId: img.productId,
    category: img.category,
    supabaseUrl: `https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/product-${img.productId}-${Date.now()}.jpg`
  }));
}

/**
 * Test function to verify Supabase storage is working
 */
export async function testSupabaseUpload() {
  try {
    console.log('🧪 Testing Supabase upload...');

    // Create a test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 1, 1);

    // Convert to blob then file
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const testFile = new File([blob], 'test-image.png', { type: 'image/png' });

    // Upload test file
    const result = await supabaseService.uploadProductImage(testFile, 'test');

    console.log('✅ Supabase upload test successful:', result.publicUrl);

    // Clean up test file
    await supabaseService.deleteImage(result.path);
    console.log('🧹 Test file cleaned up');

    return true;

  } catch (error) {
    console.error('❌ Supabase upload test failed:', error);
    return false;
  }
}

// Export for use in browser console
window.uploadUtils = {
  uploadAllExistingImages,
  uploadFromPngwing,
  testSupabaseUpload,
  getSupabaseImageUrls
};

export default {
  uploadAllExistingImages,
  uploadFromPngwing,
  testSupabaseUpload,
  getSupabaseImageUrls
};
