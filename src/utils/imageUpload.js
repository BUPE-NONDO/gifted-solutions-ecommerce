import { uploadFile, deleteFile, getPublicUrl, STORAGE_BUCKET } from '../lib/supabase';

// Generate unique filename
export const generateFileName = (originalName, category = 'general') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop().toLowerCase();
  const cleanName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with dash
    .toLowerCase();
  
  return `${category}/${cleanName}-${timestamp}-${randomString}.${extension}`;
};

// Validate image file
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please upload images smaller than 5MB.'
    };
  }

  return { valid: true };
};

// Resize image before upload (optional)
export const resizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Upload single image
export const uploadProductImage = async (file, productName, category = 'products') => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate filename
    const fileName = generateFileName(file.name, category);

    // Optional: Resize image
    const resizedFile = await resizeImage(file);
    const fileToUpload = resizedFile || file;

    // Upload to Supabase
    const result = await uploadFile(fileToUpload, fileName);

    if (!result.success) {
      throw new Error(result.error);
    }

    return {
      success: true,
      fileName,
      publicUrl: result.publicUrl,
      filePath: fileName
    };

  } catch (error) {
    console.error('Image upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files, productName, category = 'products') => {
  const results = [];
  
  for (const file of files) {
    const result = await uploadProductImage(file, productName, category);
    results.push({
      file: file.name,
      ...result
    });
  }

  return results;
};

// Delete product image
export const deleteProductImage = async (filePath) => {
  try {
    const result = await deleteFile(filePath);
    return result;
  } catch (error) {
    console.error('Image delete failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get optimized image URL with transformations
export const getOptimizedImageUrl = (filePath, options = {}) => {
  if (!filePath) return null;

  const {
    width = null,
    height = null,
    quality = 80,
    format = 'webp'
  } = options;

  let url = getPublicUrl(filePath);
  
  if (!url) return null;

  // Add transformation parameters if supported
  const params = new URLSearchParams();
  if (width) params.append('width', width);
  if (height) params.append('height', height);
  if (quality) params.append('quality', quality);
  if (format) params.append('format', format);

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

// Batch operations
export const batchUploadImages = async (imageFiles, onProgress = null) => {
  const results = [];
  let completed = 0;

  for (const { file, productName, category } of imageFiles) {
    const result = await uploadProductImage(file, productName, category);
    results.push(result);
    completed++;

    if (onProgress) {
      onProgress({
        completed,
        total: imageFiles.length,
        percentage: Math.round((completed / imageFiles.length) * 100)
      });
    }
  }

  return results;
};

export default {
  uploadProductImage,
  uploadMultipleImages,
  deleteProductImage,
  getOptimizedImageUrl,
  batchUploadImages,
  validateImageFile,
  generateFileName
};
