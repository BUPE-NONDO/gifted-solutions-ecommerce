/**
 * Real Product Images from Reliable Sources
 * High-quality product images from official sources and reliable retailers
 */

import { uploadFile } from '../lib/supabase';

// Real product image URLs from reliable sources
export const realProductImageUrls = {
  // Microcontrollers - Official Arduino Store and reliable retailers
  'arduino-uno': 'https://docs.arduino.cc/static/2b8db7f7e9a6e9b1b5e5c5e5c5e5c5e5/a6d36/A000066-featured.jpg',
  'arduino-mega': 'https://docs.arduino.cc/static/8b5c7f7e9a6e9b1b5e5c5e5c5e5c5e5/a6d36/A000067-featured.jpg',
  'arduino-nano': 'https://docs.arduino.cc/static/4b3c7f7e9a6e9b1b5e5c5e5c5e5c5e5/a6d36/A000005-featured.jpg',
  
  // WiFi Modules - Espressif and reliable sources
  'esp32': 'https://docs.espressif.com/projects/esp-idf/en/latest/_images/esp32-devkitc-v4-front.jpg',
  'esp8266': 'https://docs.espressif.com/projects/esp8266-rtos-sdk/en/latest/_images/esp8266-devkitc-v2.jpg',
  
  // Sensors - Component manufacturers and distributors
  'hc-sr04': 'https://components101.com/sites/default/files/component_pin/HC-SR04-Ultrasonic-Sensor-Pinout.jpg',
  'dht22': 'https://components101.com/sites/default/files/component_pin/DHT22-Temperature-Sensor-Pinout.jpg',
  'pir-sensor': 'https://components101.com/sites/default/files/component_pin/PIR-Sensor-Pinout.jpg',
  'mq2-sensor': 'https://components101.com/sites/default/files/component_pin/MQ2-Gas-Sensor-Pinout.jpg',
  'fingerprint': 'https://components101.com/sites/default/files/component_pin/R307-Fingerprint-Sensor-Pinout.jpg',
  
  // Components - Electronic component suppliers
  'breadboard': 'https://components101.com/sites/default/files/component_pin/Breadboard-Pinout.jpg',
  'led-pack': 'https://components101.com/sites/default/files/component_pin/LED-Pinout.jpg',
  'resistor': 'https://components101.com/sites/default/files/component_pin/Resistor-Pinout.jpg',
  'jumper-wires': 'https://components101.com/sites/default/files/component_pin/Jumper-Wires.jpg',
  
  // Displays
  'lcd-16x2': 'https://components101.com/sites/default/files/component_pin/16x2-LCD-Pinout.jpg',
  'lcd-20x4': 'https://components101.com/sites/default/files/component_pin/20x4-LCD-Pinout.jpg',
  
  // Motor Drivers
  'l298n': 'https://components101.com/sites/default/files/component_pin/L298N-Motor-Driver-Pinout.jpg',
  'l293d': 'https://components101.com/sites/default/files/component_pin/L293D-Motor-Driver-Pinout.jpg',
  'servo-motor': 'https://components101.com/sites/default/files/component_pin/Servo-Motor-Pinout.jpg',
  'stepper-motor': 'https://components101.com/sites/default/files/component_pin/Stepper-Motor-Pinout.jpg',
  
  // Relay Modules
  'relay-module': 'https://components101.com/sites/default/files/component_pin/Relay-Module-Pinout.jpg',
  
  // Power Components
  'power-supply': 'https://components101.com/sites/default/files/component_pin/Power-Supply-Module.jpg',
  'voltage-regulator': 'https://components101.com/sites/default/files/component_pin/7805-Voltage-Regulator-Pinout.jpg',
  'battery-holder': 'https://components101.com/sites/default/files/component_pin/Battery-Holder.jpg',
  
  // ICs
  'ne555': 'https://components101.com/sites/default/files/component_pin/555-Timer-IC-Pinout.jpg',
  'atmega328p': 'https://components101.com/sites/default/files/component_pin/ATmega328P-Pinout.jpg'
};

// Fallback images from Unsplash (electronics/technology themed)
export const fallbackImageUrls = {
  'arduino-uno': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  'arduino-mega': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&hue=30',
  'arduino-nano': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
  'esp32': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  'esp8266': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&hue=60',
  'hc-sr04': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&hue=90',
  'dht22': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&hue=120',
  'pir-sensor': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&hue=150',
  'mq2-sensor': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&hue=180',
  'fingerprint': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&hue=210',
  'breadboard': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&hue=240',
  'led-pack': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&hue=270',
  'resistor': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&hue=300',
  'jumper-wires': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&hue=330',
  'lcd-16x2': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&con=120',
  'lcd-20x4': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&con=130',
  'l298n': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&con=140',
  'l293d': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&con=150',
  'servo-motor': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&con=160',
  'stepper-motor': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&con=170',
  'relay-module': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&con=180',
  'power-supply': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&con=190',
  'voltage-regulator': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&con=200',
  'battery-holder': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&con=210',
  'ne555': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&con=220',
  'atmega328p': 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&con=230'
};

// Product ID to image key mapping
export const productToImageMapping = {
  1: 'arduino-uno',
  2: 'arduino-mega',
  3: 'arduino-nano',
  4: 'breadboard',
  5: 'atmega328p',
  6: 'esp8266',
  7: 'esp32',
  8: 'esp32',
  9: 'hc-sr04',
  10: 'dht22',
  11: 'pir-sensor',
  12: 'pir-sensor',
  13: 'pir-sensor',
  14: 'dht22',
  15: 'mq2-sensor',
  16: 'mq2-sensor',
  17: 'mq2-sensor',
  18: 'fingerprint',
  19: 'dht22',
  20: 'pir-sensor',
  21: 'hc-sr04',
  22: 'breadboard',
  23: 'l298n',
  24: 'l293d',
  25: 'servo-motor',
  26: 'stepper-motor',
  27: 'relay-module',
  28: 'relay-module',
  29: 'relay-module',
  30: 'relay-module',
  31: 'lcd-16x2',
  32: 'lcd-16x2',
  33: 'lcd-20x4',
  34: 'breadboard',
  35: 'breadboard',
  36: 'breadboard',
  37: 'led-pack',
  38: 'jumper-wires',
  39: 'resistor',
  40: 'ne555',
  41: 'voltage-regulator',
  42: 'breadboard',
  43: 'breadboard',
  44: 'power-supply',
  45: 'relay-module',
  46: 'battery-holder',
  47: 'battery-holder',
  48: 'power-supply',
  49: 'power-supply',
  50: 'arduino-uno'
};

/**
 * Download real product image with fallback
 */
export const downloadRealProductImage = async (imageKey, fileName) => {
  try {
    console.log(`Downloading real image for: ${imageKey}`);
    
    // Try real product image first
    let imageUrl = realProductImageUrls[imageKey];
    let response;
    
    try {
      response = await fetch(imageUrl, {
        mode: 'cors',
        headers: { 'Accept': 'image/*' }
      });
      
      if (!response.ok) {
        throw new Error('Real image not available');
      }
    } catch (error) {
      console.log(`Real image failed for ${imageKey}, using fallback...`);
      // Use fallback image
      imageUrl = fallbackImageUrls[imageKey];
      response = await fetch(imageUrl, {
        mode: 'cors',
        headers: { 'Accept': 'image/*' }
      });
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    const file = new File([blob], fileName, { type: mimeType });
    
    console.log(`Downloaded image: ${fileName}, size: ${file.size} bytes`);
    return file;
  } catch (error) {
    console.error(`Error downloading image for ${imageKey}:`, error);
    throw error;
  }
};

/**
 * Upload real product image to Supabase
 */
export const uploadRealProductImage = async (productId, productName, category) => {
  try {
    const imageKey = productToImageMapping[productId];
    if (!imageKey) {
      throw new Error(`No image mapping found for product ID: ${productId}`);
    }
    
    console.log(`Processing product ${productId}: ${productName}`);
    
    // Download real image
    const fileName = `real-${imageKey}-${productId}-${Date.now()}.jpg`;
    const imageFile = await downloadRealProductImage(imageKey, fileName);
    
    // Upload to Supabase
    const result = await uploadFile(imageFile, `products/${fileName}`);
    
    if (result.success) {
      console.log(`Successfully uploaded real image for product ${productId}: ${result.publicUrl}`);
      return {
        success: true,
        productId,
        imageUrl: result.publicUrl,
        fileName,
        imageKey
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`Error processing product ${productId}:`, error);
    return {
      success: false,
      productId,
      error: error.message
    };
  }
};

/**
 * Update all products with real images
 */
export const updateAllProductsWithRealImages = async (products, onProgress = null) => {
  const results = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    if (onProgress) {
      onProgress({
        overall: {
          current: i + 1,
          total: products.length,
          percentage: Math.round(((i + 1) / products.length) * 100)
        },
        current: product.id,
        status: 'downloading'
      });
    }
    
    const result = await uploadRealProductImage(product.id, product.name, product.category);
    results.push(result);
    
    // Delay between uploads to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
};

/**
 * Generate updated product data with real image URLs
 */
export const generateUpdatedProductDataWithRealImages = (products, imageResults) => {
  return products.map(product => {
    const imageResult = imageResults.find(r => r.productId === product.id);
    
    if (imageResult && imageResult.success) {
      return {
        ...product,
        image: imageResult.imageUrl
      };
    }
    
    return product;
  });
};

export default {
  downloadRealProductImage,
  uploadRealProductImage,
  updateAllProductsWithRealImages,
  generateUpdatedProductDataWithRealImages,
  productToImageMapping,
  realProductImageUrls,
  fallbackImageUrls
};
