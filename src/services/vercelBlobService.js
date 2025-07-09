// Vercel Blob Storage Service for Fast Image Loading
import { put, del, list } from '@vercel/blob';

class VercelBlobService {
  constructor() {
    this.bucket = 'product-images'; // Default bucket name for compatibility
  }

  /**
   * Upload image to Vercel Blob storage
   * @param {File} file - Image file to upload
   * @param {string} path - Path including folder and filename
   * @returns {Promise<Object>} - Upload result with URL and metadata
   */
  async uploadImage(file, path) {
    try {
      // Ensure path format is correct
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;

      const blob = await put(cleanPath, file, {
        access: 'public',
        addRandomSuffix: true,
      });

      return {
        path: blob.pathname,
        fullPath: blob.url,
        url: blob.url,
        size: blob.size
      };
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Get public URL for image (Vercel Blob URLs are already public)
   * @param {string} path - Image path or URL
   * @returns {string} - Public URL
   */
  getPublicUrl(path) {
    if (!path) return null;

    // If it's already a full URL, return as is
    if (path.startsWith('http')) {
      return path;
    }

    // For legacy paths, return as is (they should be migrated)
    return path;
  }

  /**
   * Upload product image with optimized naming
   * @param {File} file - Image file
   * @param {string} productId - Product identifier
   * @param {string} category - Product category
   * @returns {Promise<string>} - Optimized image URL
   */
  async uploadProductImage(file, productId, category = 'general') {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `products/${category}/${productId}-${timestamp}.${extension}`;
    
    return await this.uploadImage(file, filename);
  }

  /**
   * Delete image from Vercel Blob storage
   * @param {string} path - Image path or URL to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteImage(path) {
    try {
      // If it's a full URL, use it directly
      const urlToDelete = path.startsWith('http') ? path : null;

      if (!urlToDelete) {
        console.warn('Cannot delete image: invalid path or URL');
        return false;
      }

      await del(urlToDelete);
      return true;
    } catch (error) {
      console.error('Error deleting from Vercel Blob:', error);
      return false;
    }
  }

  /**
   * List all images in storage
   * @param {string} prefix - Optional prefix filter
   * @returns {Promise<Array>} - List of image objects
   */
  async listImages(prefix = '') {
    try {
      const { blobs } = await list({ prefix });
      return blobs;
    } catch (error) {
      console.error('Error listing Vercel Blob images:', error);
      return [];
    }
  }

  /**
   * Upload multiple images at once
   * @param {Array} files - Array of File objects
   * @param {string} folder - Folder name
   * @returns {Promise<Array>} - Array of upload results
   */
  async uploadMultipleImages(files, folder = 'uploads') {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${folder}-${Date.now()}-${index}.${fileExt}`
        const filePath = `${folder}/${fileName}`

        const result = await this.uploadImage(file, filePath)
        return {
          ...result,
          publicUrl: result.url, // Vercel Blob returns full URL
          fileName,
          originalName: file.name
        }
      })

      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading multiple images to Vercel Blob:', error)
      throw error
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param {string} url - Original image URL
   * @param {Object} options - Optimization options
   * @returns {string} - Optimized image URL
   */
  getOptimizedImageUrl(url, options = {}) {
    const {
      width = 400,
      height = 300,
      quality = 80,
      format = 'webp'
    } = options;

    // Vercel automatically optimizes images
    return `${url}?w=${width}&h=${height}&q=${quality}&f=${format}`;
  }

  /**
   * Batch upload multiple images
   * @param {Array<File>} files - Array of image files
   * @param {string} category - Category for organization
   * @returns {Promise<Array<string>>} - Array of uploaded URLs
   */
  async batchUploadImages(files, category = 'general') {
    const uploadPromises = files.map((file, index) => {
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${category}/batch-${timestamp}-${index}.${extension}`;
      return this.uploadImage(file, filename);
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in batch upload:', error);
      throw new Error('Failed to upload some images');
    }
  }

  /**
   * Generate thumbnail URL
   * @param {string} originalUrl - Original image URL
   * @returns {string} - Thumbnail URL
   */
  getThumbnailUrl(originalUrl) {
    return this.getOptimizedImageUrl(originalUrl, {
      width: 150,
      height: 150,
      quality: 70
    });
  }

  /**
   * Generate responsive image URLs for different screen sizes
   * @param {string} originalUrl - Original image URL
   * @returns {Object} - Object with different sized URLs
   */
  getResponsiveUrls(originalUrl) {
    return {
      thumbnail: this.getOptimizedImageUrl(originalUrl, { width: 150, height: 150 }),
      small: this.getOptimizedImageUrl(originalUrl, { width: 300, height: 225 }),
      medium: this.getOptimizedImageUrl(originalUrl, { width: 600, height: 450 }),
      large: this.getOptimizedImageUrl(originalUrl, { width: 1200, height: 900 }),
      original: originalUrl
    };
  }

  /**
   * Migrate existing images from other services
   * @param {Array} imageUrls - Array of existing image URLs
   * @param {string} category - Category for new images
   * @returns {Promise<Array>} - Array of new Vercel Blob URLs
   */
  async migrateImages(imageUrls, category = 'migrated') {
    const migratedUrls = [];

    for (const url of imageUrls) {
      try {
        // Fetch the image
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Create a file-like object
        const filename = url.split('/').pop() || `image-${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: blob.type });
        
        // Upload to Vercel Blob
        const newUrl = await this.uploadImage(file, `${category}/${filename}`);
        migratedUrls.push(newUrl);
        
        console.log(`Migrated: ${url} -> ${newUrl}`);
      } catch (error) {
        console.error(`Failed to migrate ${url}:`, error);
        migratedUrls.push(url); // Keep original if migration fails
      }
    }

    return migratedUrls;
  }
}

// Export singleton instance
export const vercelBlobService = new VercelBlobService();
export default vercelBlobService;
