/**
 * Supabase Image Checker and Updater
 * Checks for new photos in Supabase storage and updates product data
 */

import { supabase } from '../lib/supabase';
import { products } from '../data/newProducts';

/**
 * List all files in Supabase storage bucket
 */
export const listSupabaseImages = async () => {
  try {
    console.log('🔍 Checking Supabase storage for images...');
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .list('products', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Error listing Supabase images:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Found ${data.length} images in Supabase storage`);
    return { success: true, images: data };
  } catch (error) {
    console.error('❌ Error accessing Supabase storage:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get public URL for a Supabase storage file
 */
export const getSupabaseImageUrl = (fileName) => {
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(`products/${fileName}`);
  
  return data.publicUrl;
};

/**
 * Check for new images uploaded to Supabase
 */
export const checkForNewImages = async () => {
  try {
    console.log('🔍 Checking for new images in Supabase...');
    
    const result = await listSupabaseImages();
    if (!result.success) {
      return result;
    }

    const supabaseImages = result.images;
    const currentProductImages = products.map(p => p.image);
    
    // Find images in Supabase that aren't being used by products
    const newImages = supabaseImages.filter(img => {
      const imageUrl = getSupabaseImageUrl(img.name);
      return !currentProductImages.includes(imageUrl) && 
             img.name.endsWith('.jpg') || img.name.endsWith('.png') || img.name.endsWith('.jpeg');
    });

    console.log(`✅ Found ${newImages.length} new images not currently used`);
    
    return {
      success: true,
      totalImages: supabaseImages.length,
      newImages: newImages,
      newImageUrls: newImages.map(img => ({
        fileName: img.name,
        url: getSupabaseImageUrl(img.name),
        uploadedAt: img.created_at,
        size: img.metadata?.size || 'Unknown'
      }))
    };
  } catch (error) {
    console.error('❌ Error checking for new images:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Suggest product updates based on new images
 */
export const suggestProductUpdates = async () => {
  try {
    console.log('🤖 Analyzing new images for product updates...');
    
    const newImagesResult = await checkForNewImages();
    if (!newImagesResult.success) {
      return newImagesResult;
    }

    const suggestions = [];
    
    newImagesResult.newImageUrls.forEach((imageInfo, index) => {
      const fileName = imageInfo.fileName.toLowerCase();
      
      // Try to match image names to products
      const matchedProducts = products.filter(product => {
        const productName = product.name.toLowerCase();
        const productCategory = product.category.toLowerCase();
        
        // Check if filename contains product keywords
        return fileName.includes('arduino') && productName.includes('arduino') ||
               fileName.includes('esp32') && productName.includes('esp32') ||
               fileName.includes('esp8266') && productName.includes('esp8266') ||
               fileName.includes('sensor') && productCategory.includes('sensor') ||
               fileName.includes('lcd') && productName.includes('lcd') ||
               fileName.includes('motor') && productName.includes('motor') ||
               fileName.includes('relay') && productName.includes('relay') ||
               fileName.includes('breadboard') && productName.includes('breadboard') ||
               fileName.includes('led') && productName.includes('led');
      });

      if (matchedProducts.length > 0) {
        suggestions.push({
          imageInfo,
          suggestedProducts: matchedProducts.map(p => ({
            id: p.id,
            name: p.name,
            currentImage: p.image,
            category: p.category
          })),
          confidence: matchedProducts.length === 1 ? 'high' : 'medium'
        });
      } else {
        suggestions.push({
          imageInfo,
          suggestedProducts: [],
          confidence: 'low',
          note: 'No automatic match found - manual assignment needed'
        });
      }
    });

    console.log(`✅ Generated ${suggestions.length} update suggestions`);
    
    return {
      success: true,
      suggestions,
      summary: {
        totalNewImages: newImagesResult.newImages.length,
        highConfidenceMatches: suggestions.filter(s => s.confidence === 'high').length,
        mediumConfidenceMatches: suggestions.filter(s => s.confidence === 'medium').length,
        lowConfidenceMatches: suggestions.filter(s => s.confidence === 'low').length
      }
    };
  } catch (error) {
    console.error('❌ Error generating suggestions:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Apply suggested image updates to products
 */
export const applyImageUpdates = async (updates) => {
  try {
    console.log('🔄 Applying image updates to products...');
    
    const updatedProducts = [...products];
    const appliedUpdates = [];
    
    updates.forEach(update => {
      const { productId, newImageUrl } = update;
      const productIndex = updatedProducts.findIndex(p => p.id === productId);
      
      if (productIndex !== -1) {
        const oldImageUrl = updatedProducts[productIndex].image;
        updatedProducts[productIndex].image = newImageUrl;
        
        appliedUpdates.push({
          productId,
          productName: updatedProducts[productIndex].name,
          oldImageUrl,
          newImageUrl,
          status: 'updated'
        });
        
        console.log(`✅ Updated product ${productId}: ${updatedProducts[productIndex].name}`);
      } else {
        appliedUpdates.push({
          productId,
          status: 'error',
          error: 'Product not found'
        });
      }
    });

    // Generate updated products.js file content
    const updatedProductsFileContent = `export const products = ${JSON.stringify(updatedProducts, null, 2)};`;
    
    return {
      success: true,
      appliedUpdates,
      updatedProducts,
      updatedProductsFileContent,
      summary: {
        totalUpdates: updates.length,
        successfulUpdates: appliedUpdates.filter(u => u.status === 'updated').length,
        failedUpdates: appliedUpdates.filter(u => u.status === 'error').length
      }
    };
  } catch (error) {
    console.error('❌ Error applying updates:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all current product images from Supabase
 */
export const getCurrentSupabaseImages = async () => {
  try {
    console.log('📋 Getting current product images from Supabase...');
    
    const currentImages = products
      .filter(p => p.image && p.image.includes('supabase.co'))
      .map(p => ({
        productId: p.id,
        productName: p.name,
        imageUrl: p.image,
        fileName: p.image.split('/').pop()
      }));

    console.log(`✅ Found ${currentImages.length} products using Supabase images`);
    
    return {
      success: true,
      currentImages,
      totalProducts: products.length,
      supabaseImageCount: currentImages.length,
      otherImageCount: products.length - currentImages.length
    };
  } catch (error) {
    console.error('❌ Error getting current images:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Full image sync - check, analyze, and suggest updates
 */
export const performFullImageSync = async () => {
  try {
    console.log('🔄 Performing full image sync with Supabase...');
    
    // Step 1: Check for new images
    const newImagesResult = await checkForNewImages();
    if (!newImagesResult.success) {
      return newImagesResult;
    }

    // Step 2: Get current image usage
    const currentImagesResult = await getCurrentSupabaseImages();
    if (!currentImagesResult.success) {
      return currentImagesResult;
    }

    // Step 3: Generate suggestions
    const suggestionsResult = await suggestProductUpdates();
    if (!suggestionsResult.success) {
      return suggestionsResult;
    }

    console.log('✅ Full image sync completed');
    
    return {
      success: true,
      newImages: newImagesResult,
      currentImages: currentImagesResult,
      suggestions: suggestionsResult,
      summary: {
        totalSupabaseImages: newImagesResult.totalImages,
        newUnusedImages: newImagesResult.newImages.length,
        currentlyUsedImages: currentImagesResult.supabaseImageCount,
        updateSuggestions: suggestionsResult.suggestions.length,
        highConfidenceMatches: suggestionsResult.summary.highConfidenceMatches
      }
    };
  } catch (error) {
    console.error('❌ Error performing full sync:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enhanced image name mapping for manual assignments
 */
export const suggestProductByImageName = (imageName) => {
  const fileName = imageName.toLowerCase();

  // Enhanced keyword matching for better suggestions
  const suggestions = products.filter(product => {
    const productName = product.name.toLowerCase();
    const productCategory = product.category.toLowerCase();

    // Direct name matches
    if (fileName.includes(productName.replace(/\s+/g, '-')) ||
        fileName.includes(productName.replace(/\s+/g, '_')) ||
        fileName.includes(productName.replace(/\s+/g, ''))) {
      return true;
    }

    // Category and keyword matches
    const keywords = [
      { pattern: /arduino.*uno/i, match: () => productName.includes('arduino') && productName.includes('uno') },
      { pattern: /arduino.*nano/i, match: () => productName.includes('arduino') && productName.includes('nano') },
      { pattern: /arduino.*mega/i, match: () => productName.includes('arduino') && productName.includes('mega') },
      { pattern: /esp32/i, match: () => productName.includes('esp32') },
      { pattern: /esp8266/i, match: () => productName.includes('esp8266') },
      { pattern: /nodemcu/i, match: () => productName.includes('nodemcu') },
      { pattern: /wemos/i, match: () => productName.includes('wemos') },
      { pattern: /raspberry.*pi/i, match: () => productName.includes('raspberry') },
      { pattern: /sensor.*ultrasonic/i, match: () => productName.includes('ultrasonic') },
      { pattern: /sensor.*temperature/i, match: () => productName.includes('temperature') || productName.includes('dht') },
      { pattern: /sensor.*humidity/i, match: () => productName.includes('humidity') || productName.includes('dht') },
      { pattern: /lcd.*display/i, match: () => productName.includes('lcd') || productName.includes('display') },
      { pattern: /led.*strip/i, match: () => productName.includes('led') && productName.includes('strip') },
      { pattern: /motor.*servo/i, match: () => productName.includes('servo') },
      { pattern: /motor.*stepper/i, match: () => productName.includes('stepper') },
      { pattern: /relay/i, match: () => productName.includes('relay') },
      { pattern: /breadboard/i, match: () => productName.includes('breadboard') },
      { pattern: /jumper.*wire/i, match: () => productName.includes('jumper') || productName.includes('wire') },
      { pattern: /resistor/i, match: () => productName.includes('resistor') },
      { pattern: /capacitor/i, match: () => productName.includes('capacitor') },
      { pattern: /transistor/i, match: () => productName.includes('transistor') }
    ];

    return keywords.some(keyword => {
      if (keyword.pattern.test(fileName)) {
        return keyword.match();
      }
      return false;
    });
  });

  // Sort by confidence (exact matches first, then partial matches)
  return suggestions.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const cleanFileName = fileName.replace(/[^a-z0-9]/g, '');

    const aExact = cleanFileName.includes(aName.replace(/[^a-z0-9]/g, ''));
    const bExact = cleanFileName.includes(bName.replace(/[^a-z0-9]/g, ''));

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });
};

/**
 * Get image assignment statistics
 */
export const getImageAssignmentStats = async () => {
  try {
    const result = await listSupabaseImages();
    if (!result.success) return result;

    const totalImages = result.images.length;
    const assignedImages = result.images.filter(img => {
      const imageUrl = getSupabaseImageUrl(img.name);
      return products.some(product => product.image === imageUrl);
    });

    const unassignedImages = result.images.filter(img => {
      const imageUrl = getSupabaseImageUrl(img.name);
      return !products.some(product => product.image === imageUrl);
    });

    return {
      success: true,
      stats: {
        totalImages,
        assignedCount: assignedImages.length,
        unassignedCount: unassignedImages.length,
        assignmentPercentage: Math.round((assignedImages.length / totalImages) * 100),
        assignedImages: assignedImages.map(img => ({
          name: img.name,
          url: getSupabaseImageUrl(img.name),
          assignedTo: products.filter(p => p.image === getSupabaseImageUrl(img.name))
        })),
        unassignedImages: unassignedImages.map(img => ({
          name: img.name,
          url: getSupabaseImageUrl(img.name),
          suggestions: suggestProductByImageName(img.name)
        }))
      }
    };
  } catch (error) {
    console.error('❌ Error getting assignment stats:', error);
    return { success: false, error: error.message };
  }
};

export default {
  listSupabaseImages,
  checkForNewImages,
  suggestProductUpdates,
  applyImageUpdates,
  getCurrentSupabaseImages,
  performFullImageSync,
  getSupabaseImageUrl,
  suggestProductByImageName,
  getImageAssignmentStats
};
