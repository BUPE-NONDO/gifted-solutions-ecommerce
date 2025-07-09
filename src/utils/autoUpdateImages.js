/**
 * Automatic Image Update System
 * Generates unique images for each product and updates the product data
 */

import { uploadFile } from '../lib/supabase';

// Generate a unique image URL for each product using different parameters
export const generateUniqueImageUrl = (productId, category, name) => {
  const baseUrls = [
    'https://images.unsplash.com/photo-1608564697071-ddf911d81370',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d'
  ];
  
  // Use product ID to determine base URL
  const baseIndex = productId % baseUrls.length;
  const baseUrl = baseUrls[baseIndex];
  
  // Generate unique parameters based on product ID and category
  const hue = (productId * 37) % 360; // Unique hue for each product
  const saturation = 50 + (productId * 13) % 50; // Saturation between 50-100
  const brightness = 80 + (productId * 7) % 20; // Brightness between 80-100
  const contrast = 100 + (productId * 11) % 50; // Contrast between 100-150
  
  return `${baseUrl}?w=400&h=400&fit=crop&crop=center&hue=${hue}&sat=${saturation}&bri=${brightness}&con=${contrast}`;
};

// Product categories for better image selection
export const productCategories = {
  'Microcontrollers': 'electronics',
  'WiFi Modules': 'wireless',
  'Sensors': 'sensors',
  'Motor Drivers': 'motors',
  'Motors': 'motors',
  'Relay Modules': 'relays',
  'Displays': 'displays',
  'Components': 'components',
  'ICs': 'chips',
  'Audio': 'audio',
  'Power & Accessories': 'power',
  'Starter Kits': 'kits'
};

/**
 * Create a canvas-based unique image for each product
 */
export const generateProductImage = (productId, productName, category) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    // Generate unique colors based on product ID
    const hue = (productId * 37) % 360;
    const saturation = 60 + (productId * 13) % 40;
    const lightness = 45 + (productId * 7) % 20;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 400);
    gradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
    gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness + 10}%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);
    
    // Add product category icon/shape
    ctx.fillStyle = `hsl(${(hue + 180) % 360}, ${saturation + 20}%, ${lightness + 30}%)`;
    
    // Draw different shapes based on category
    const centerX = 200;
    const centerY = 200;
    
    switch (category) {
      case 'Microcontrollers':
        // Draw a circuit board pattern
        ctx.fillRect(centerX - 80, centerY - 60, 160, 120);
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness + 40}%)`;
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 6; j++) {
            ctx.fillRect(centerX - 70 + i * 20, centerY - 50 + j * 20, 8, 8);
          }
        }
        break;
        
      case 'Sensors':
        // Draw a sensor-like circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness + 40}%)`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'Components':
        // Draw component-like rectangles
        ctx.fillRect(centerX - 60, centerY - 20, 120, 40);
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness + 40}%)`;
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(centerX - 50 + i * 20, centerY - 10, 8, 20);
        }
        break;
        
      default:
        // Default shape - hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = centerX + 80 * Math.cos(angle);
          const y = centerY + 80 * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    // Add product ID text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`#${productId}`, centerX, centerY + 120);
    
    // Add category text
    ctx.font = '16px Arial';
    ctx.fillText(category, centerX, centerY + 145);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      const file = new File([blob], `product-${productId}.png`, { type: 'image/png' });
      resolve(file);
    }, 'image/png', 0.9);
  });
};

/**
 * Upload generated image to Supabase
 */
export const uploadGeneratedImage = async (productId, productName, category) => {
  try {
    console.log(`Generating image for product ${productId}: ${productName}`);
    
    // Generate unique image
    const imageFile = await generateProductImage(productId, productName, category);
    
    // Upload to Supabase
    const fileName = `generated-product-${productId}-${Date.now()}.png`;
    const result = await uploadFile(imageFile, `products/${fileName}`);
    
    if (result.success) {
      console.log(`Successfully uploaded image for product ${productId}: ${result.publicUrl}`);
      return {
        success: true,
        productId,
        imageUrl: result.publicUrl,
        fileName
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`Error generating image for product ${productId}:`, error);
    return {
      success: false,
      productId,
      error: error.message
    };
  }
};

/**
 * Update all products with generated images
 */
export const updateAllProductsWithGeneratedImages = async (products, onProgress = null) => {
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
        status: 'generating'
      });
    }
    
    const result = await uploadGeneratedImage(product.id, product.name, product.category);
    results.push(result);
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
};

/**
 * Generate updated product data with new image URLs
 */
export const generateUpdatedProductData = (products, imageResults) => {
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
  generateUniqueImageUrl,
  generateProductImage,
  uploadGeneratedImage,
  updateAllProductsWithGeneratedImages,
  generateUpdatedProductData
};
