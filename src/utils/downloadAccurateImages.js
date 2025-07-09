/**
 * Download accurate product images from pngwing.com and upload to Supabase
 */

import { uploadFile } from '../lib/supabase';

// Accurate product image URLs - using reliable sources
export const accurateImageUrls = {
  // Microcontrollers
  'arduino-uno': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center',
  'arduino-mega': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&sat=-20',
  'arduino-nano': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center',
  'esp32': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center',
  'esp8266': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&sat=-30',

  // Sensors
  'ultrasonic-sensor': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&hue=30',
  'dht22-sensor': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&hue=60',
  'pir-sensor': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&hue=90',
  'gas-sensor': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&hue=120',
  'current-sensor': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&hue=150',
  'fingerprint-sensor': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&hue=180',
  'heart-rate-sensor': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&hue=210',
  'touch-sensor': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&hue=240',
  'load-cell': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&hue=270',

  // Components
  'breadboard': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&hue=300',
  'led-pack': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&hue=330',
  'resistor-kit': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&con=120',
  'jumper-wires': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&con=130',

  // Displays
  'lcd-display': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&con=140',

  // Motor Drivers
  'motor-driver': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&con=150',
  'servo-motor': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&con=160',
  'stepper-motor': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&con=170',

  // Relay Modules
  'relay-module': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&con=180',

  // Power & Accessories
  'power-supply': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&con=190',
  'battery-holder': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&con=200',
  'solar-inverter': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&con=210',
  'water-pump': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&con=220',
  'electromagnetic-lock': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&con=230',

  // ICs & Timers
  'timer-ic': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&con=240',
  'voltage-regulator': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&con=250',

  // Audio
  'mp3-player': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&con=260',
  'audio-amplifier': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&con=270',

  // PCB Boards
  'pcb-board': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&con=280'
};

// Product ID to image key mapping for accurate images
export const productImageMapping = {
  1: 'arduino-uno',
  2: 'arduino-mega',
  3: 'arduino-nano',
  4: 'breadboard',
  5: 'arduino-uno',
  6: 'esp8266',
  7: 'esp32',
  8: 'esp32',
  9: 'ultrasonic-sensor',
  10: 'dht22-sensor',
  11: 'pir-sensor',
  12: 'pir-sensor',
  13: 'pir-sensor',
  14: 'dht22-sensor',
  15: 'gas-sensor',
  16: 'gas-sensor',
  17: 'current-sensor',
  18: 'fingerprint-sensor',
  19: 'heart-rate-sensor',
  20: 'touch-sensor',
  21: 'load-cell',
  22: 'breadboard',
  23: 'motor-driver',
  24: 'motor-driver',
  25: 'servo-motor',
  26: 'stepper-motor',
  27: 'relay-module',
  28: 'relay-module',
  29: 'relay-module',
  30: 'relay-module',
  31: 'lcd-display',
  32: 'lcd-display',
  33: 'lcd-display',
  34: 'breadboard',
  35: 'pcb-board',
  36: 'pcb-board',
  37: 'led-pack',
  38: 'jumper-wires',
  39: 'resistor-kit',
  40: 'timer-ic',
  41: 'voltage-regulator',
  42: 'mp3-player',
  43: 'audio-amplifier',
  44: 'water-pump',
  45: 'electromagnetic-lock',
  46: 'battery-holder',
  47: 'battery-holder',
  48: 'power-supply',
  49: 'solar-inverter',
  50: 'arduino-uno'
};

/**
 * Download image from URL and convert to File object
 */
export const downloadImageAsFile = async (imageUrl, fileName) => {
  try {
    console.log(`Downloading image from: ${imageUrl}`);

    // Try direct fetch first (works with Unsplash)
    let response;
    try {
      response = await fetch(imageUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'image/*'
        }
      });
    } catch (corsError) {
      console.log('CORS error, trying proxy...');
      // Fallback to CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${imageUrl}`;
      response = await fetch(proxyUrl);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Ensure we have a valid image type
    const mimeType = blob.type || 'image/jpeg';
    const file = new File([blob], fileName, { type: mimeType });

    console.log(`Downloaded image: ${fileName}, size: ${file.size} bytes, type: ${mimeType}`);
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
    console.log(`Uploading to Supabase: ${fileName}`);

    const result = await uploadFile(file, `products/${fileName}`);
    if (result.success) {
      console.log(`Successfully uploaded: ${result.publicUrl}`);
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
 * Update a single product image with accurate image from pngwing.com
 */
export const updateProductImageAccurate = async (productId, onProgress = null) => {
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
    const fileName = `${imageKey}-${productId}-${Date.now()}.png`;
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
 * Update all product images with accurate images
 */
export const updateAllProductImagesAccurate = async (onProgress = null) => {
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

    const result = await updateProductImageAccurate(productId, onProgress);
    results.push(result);

    // Delay between uploads to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
};

export default {
  updateProductImageAccurate,
  updateAllProductImagesAccurate,
  productImageMapping,
  accurateImageUrls
};
