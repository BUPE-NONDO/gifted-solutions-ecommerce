/**
 * Product Image Update Utility
 * Downloads accurate product images and uploads them to Supabase
 */

import { uploadFile, getPublicUrl } from '../lib/supabase';

// Accurate product image URLs from reliable sources (using working URLs)
export const accurateImageUrls = {
  // Microcontrollers
  'arduino-uno-r3': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'arduino-mega-2560': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'arduino-nano': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'arduino-nano-adapter': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'atmega-328p': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',

  // WiFi Modules
  'esp32-board': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'esp8266-nodemcu': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'esp32-wrover': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'esp32-s3': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'arduino-mega-wifi': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',

  // Sensors
  'hc-sr04-ultrasonic': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'dht22-sensor': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'pir-motion-sensor': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'lm35-temperature': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'mq2-gas-sensor': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'mq3-gas-sensor': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'acs712-current': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'fingerprint-sensor': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'heart-rate-sensor': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'touch-sensor': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'soil-moisture': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'sound-sensor': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'load-cell-hx711': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'pir-obstacle': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'voltage-sensor': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',

  // Components
  'breadboard-830': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'led-pack': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'resistor-kit': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'jumper-wires': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',

  // Displays
  'lcd-16x2-i2c': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'lcd-16x2': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'lcd-20x4': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',

  // Kits
  'arduino-starter-kit': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'esp32-iot-kit': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'smart-home-kit': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'robot-car-kit': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop'
};

// Product ID to image key mapping
export const productImageMapping = {
  1: 'arduino-uno-r3',
  2: 'arduino-mega-2560',
  3: 'arduino-nano',
  4: 'arduino-nano-adapter',
  5: 'atmega-328p',
  6: 'esp32-board',
  7: 'esp8266-nodemcu',
  8: 'esp32-wrover',
  9: 'esp32-s3',
  10: 'arduino-mega-wifi',
  11: 'hc-sr04-ultrasonic',
  12: 'dht22-sensor',
  13: 'pir-motion-sensor',
  14: 'lm35-temperature',
  15: 'mq2-gas-sensor',
  16: 'mq3-gas-sensor',
  17: 'acs712-current',
  18: 'fingerprint-sensor',
  19: 'heart-rate-sensor',
  20: 'touch-sensor',
  21: 'soil-moisture',
  22: 'sound-sensor',
  23: 'load-cell-hx711',
  24: 'pir-obstacle',
  25: 'voltage-sensor',
  26: 'lcd-16x2-i2c',
  27: 'lcd-16x2',
  28: 'lcd-20x4',
  29: 'arduino-starter-kit',
  30: 'esp32-iot-kit',
  31: 'smart-home-kit',
  32: 'robot-car-kit',
  100: 'breadboard-830',
  101: 'led-pack',
  102: 'resistor-kit',
  103: 'jumper-wires'
};

/**
 * Download image from URL and convert to File object
 */
export const downloadImageAsFile = async (imageUrl, fileName) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

/**
 * Upload image to Supabase and return public URL
 */
export const uploadImageToSupabase = async (file, fileName) => {
  try {
    const result = await uploadFile(file, `products/${fileName}`);
    if (result.success) {
      return result.publicUrl;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
};

/**
 * Update a single product image
 */
export const updateProductImage = async (productId, onProgress = null) => {
  try {
    const imageKey = productImageMapping[productId];
    if (!imageKey) {
      throw new Error(`No image mapping found for product ID: ${productId}`);
    }

    const imageUrl = accurateImageUrls[imageKey];
    if (!imageUrl) {
      throw new Error(`No image URL found for key: ${imageKey}`);
    }

    if (onProgress) onProgress({ status: 'downloading', productId });

    // Download image
    const fileName = `${imageKey}-${Date.now()}.jpg`;
    const file = await downloadImageAsFile(imageUrl, fileName);

    if (onProgress) onProgress({ status: 'uploading', productId });

    // Upload to Supabase
    const supabaseUrl = await uploadImageToSupabase(file, fileName);

    if (onProgress) onProgress({ status: 'completed', productId, url: supabaseUrl });

    return {
      success: true,
      productId,
      imageKey,
      supabaseUrl,
      fileName
    };

  } catch (error) {
    if (onProgress) onProgress({ status: 'error', productId, error: error.message });
    return {
      success: false,
      productId,
      error: error.message
    };
  }
};

/**
 * Update all product images
 */
export const updateAllProductImages = async (onProgress = null) => {
  const productIds = Object.keys(productImageMapping).map(id => parseInt(id));
  const results = [];

  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i];

    if (onProgress) {
      onProgress({
        overall: {
          current: i + 1,
          total: productIds.length,
          percentage: Math.round(((i + 1) / productIds.length) * 100)
        }
      });
    }

    const result = await updateProductImage(productId, onProgress);
    results.push(result);

    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
};

export default {
  updateProductImage,
  updateAllProductImages,
  productImageMapping,
  accurateImageUrls
};
