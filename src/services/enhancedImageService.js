// Enhanced Image Service - Integrates Firebase Storage and Vercel Blob
import { vercelBlobService } from './vercelBlobService';
import { imageService as firebaseImageService } from './imageService';

class EnhancedImageService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.urlMapping = new Map(); // Maps old URLs to Vercel Blob URLs
    this.useVercelBlob = true;
    this.migrationCompleted = true; // Migration completed - all new uploads go to Vercel Blob
    this.preferredStorage = 'vercel'; // 'vercel' or 'firebase'
  }

  /**
   * Set URL mapping for legacy image URLs
   * @param {Object} mapping - URL mapping object
   */
  setUrlMapping(mapping) {
    this.urlMapping = new Map(Object.entries(mapping));
    console.log(`✅ URL mapping set for ${this.urlMapping.size} images`);
  }

  /**
   * Set preferred storage method
   * @param {string} storage - 'vercel' or 'firebase'
   */
  setPreferredStorage(storage) {
    this.preferredStorage = storage;
  }

  /**
   * Upload image to preferred storage
   * @param {File} file - Image file
   * @param {string} productId - Product ID
   * @param {string} category - Category
   * @returns {Promise<Object>} - Upload result
   */
  async uploadImage(file, productId = null, category = 'general') {
    try {
      if (this.preferredStorage === 'vercel' && this.useVercelBlob) {
        // Upload to Vercel Blob
        const url = await vercelBlobService.uploadProductImage(file, productId, category);
        return {
          url,
          filename: `${productId || 'product'}-${Date.now()}.${file.name.split('.').pop()}`,
          originalName: file.name,
          size: file.size,
          type: file.type,
          storage: 'vercel',
          optimized: true
        };
      } else {
        // Fallback to Firebase
        return await firebaseImageService.uploadProductImage(file, productId);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Try fallback storage
      if (this.preferredStorage === 'vercel') {
        console.log('Vercel upload failed, trying Firebase...');
        return await firebaseImageService.uploadProductImage(file, productId);
      } else {
        console.log('Firebase upload failed, trying Vercel...');
        const url = await vercelBlobService.uploadProductImage(file, productId, category);
        return {
          url,
          filename: `${productId || 'product'}-${Date.now()}.${file.name.split('.').pop()}`,
          originalName: file.name,
          size: file.size,
          type: file.type,
          storage: 'vercel',
          optimized: true
        };
      }
    }
  }

  /**
   * Get optimized image URL
   * @param {string} originalUrl - Original image URL
   * @param {Object} options - Optimization options
   * @returns {string} - Optimized image URL
   */
  getOptimizedUrl(originalUrl, options = {}) {
    if (!originalUrl) return originalUrl;

    // Check URL mapping for legacy URLs
    if (this.urlMapping.has(originalUrl)) {
      const vercelUrl = this.urlMapping.get(originalUrl);
      return vercelBlobService.getOptimizedImageUrl(vercelUrl, options);
    }

    // If it's already a Vercel Blob URL, optimize it
    if (originalUrl.includes('vercel-storage.com')) {
      return vercelBlobService.getOptimizedImageUrl(originalUrl, options);
    }

    // For other URLs (Firebase, external), return as-is
    return originalUrl;
  }

  /**
   * Get responsive image URLs
   * @param {string} originalUrl - Original image URL
   * @returns {Object} - Responsive image URLs
   */
  getResponsiveUrls(originalUrl) {
    // If migration completed and we have a Vercel Blob URL, use it
    if (this.migrationCompleted && this.urlMapping.has(originalUrl)) {
      const vercelUrl = this.urlMapping.get(originalUrl);
      return vercelBlobService.getResponsiveUrls(vercelUrl);
    }

    // If it's already a Vercel Blob URL, get responsive URLs
    if (originalUrl.includes('vercel-storage.com')) {
      return vercelBlobService.getResponsiveUrls(originalUrl);
    }

    // Fallback to original URL for all sizes (Firebase)
    return {
      thumbnail: originalUrl,
      small: originalUrl,
      medium: originalUrl,
      large: originalUrl,
      original: originalUrl
    };
  }

  /**
   * Load image with caching and optimization
   * @param {string} url - Image URL
   * @param {Object} options - Optimization options
   * @returns {Promise<string>} - Promise that resolves to the optimized image URL
   */
  async loadImage(url, options = {}) {
    const optimizedUrl = this.getOptimizedUrl(url, options);
    
    // Check cache first
    if (this.cache.has(optimizedUrl)) {
      return this.cache.get(optimizedUrl);
    }

    // Check if already loading
    if (this.loadingPromises.has(optimizedUrl)) {
      return this.loadingPromises.get(optimizedUrl);
    }

    // Start loading
    const loadingPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(optimizedUrl, optimizedUrl);
        this.loadingPromises.delete(optimizedUrl);
        resolve(optimizedUrl);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(optimizedUrl);
        // Fallback to original URL if optimized fails
        if (optimizedUrl !== url) {
          resolve(this.loadImage(url, {}));
        } else {
          reject(new Error(`Failed to load image: ${url}`));
        }
      };
      
      img.src = optimizedUrl;
    });

    this.loadingPromises.set(optimizedUrl, loadingPromise);
    return loadingPromise;
  }

  /**
   * Get thumbnail URL
   * @param {string} originalUrl - Original image URL
   * @returns {string} - Thumbnail URL
   */
  getThumbnailUrl(originalUrl) {
    return this.getOptimizedUrl(originalUrl, {
      width: 150,
      height: 150,
      quality: 70
    });
  }

  /**
   * Get product card image URL
   * @param {string} originalUrl - Original image URL
   * @returns {string} - Product card optimized URL
   */
  getProductCardUrl(originalUrl) {
    return this.getOptimizedUrl(originalUrl, {
      width: 400,
      height: 300,
      quality: 80
    });
  }

  /**
   * Get hero/featured image URL
   * @param {string} originalUrl - Original image URL
   * @returns {string} - Hero image optimized URL
   */
  getHeroImageUrl(originalUrl) {
    return this.getOptimizedUrl(originalUrl, {
      width: 800,
      height: 600,
      quality: 85
    });
  }

  /**
   * Generate srcSet for responsive images
   * @param {string} originalUrl - Original image URL
   * @returns {string} - srcSet string
   */
  generateSrcSet(originalUrl) {
    const urls = this.getResponsiveUrls(originalUrl);
    
    return [
      `${urls.small} 300w`,
      `${urls.medium} 600w`,
      `${urls.large} 1200w`
    ].join(', ');
  }

  /**
   * Get image props for React components
   * @param {string} originalUrl - Original image URL
   * @param {Object} options - Options for optimization
   * @returns {Object} - Image props object
   */
  getImageProps(originalUrl, options = {}) {
    const {
      responsive = true,
      loading = 'lazy',
      quality = 80,
      width = 400,
      height = 300
    } = options;

    const props = {
      src: this.getOptimizedUrl(originalUrl, { width, height, quality }),
      loading: this.isVercelBlobUrl(originalUrl) ? 'eager' : loading,
      alt: options.alt || 'Product image'
    };

    if (responsive && this.isVercelBlobUrl(originalUrl)) {
      props.srcSet = this.generateSrcSet(originalUrl);
      props.sizes = '(max-width: 768px) 300px, (max-width: 1024px) 600px, 1200px';
    }

    return props;
  }

  /**
   * Check if image is from Vercel Blob
   * @param {string} url - Image URL
   * @returns {boolean} - True if Vercel Blob URL
   */
  isVercelBlobUrl(url) {
    return this.urlMapping.has(url) || url.includes('vercel-storage.com');
  }

  /**
   * Check if image is from Firebase
   * @param {string} url - Image URL
   * @returns {boolean} - True if Firebase URL
   */
  isFirebaseUrl(url) {
    return url.includes('firebasestorage.googleapis.com');
  }

  /**
   * Preload multiple images with optimization
   * @param {string[]} urls - Array of image URLs
   * @param {Object} options - Optimization options
   * @returns {Promise<string[]>} - Promise that resolves when all images are loaded
   */
  async preloadImages(urls, options = {}) {
    const promises = urls.map(url => this.loadImage(url, options));
    return Promise.all(promises);
  }

  /**
   * Delete image from appropriate storage
   * @param {string} url - Image URL
   * @param {string} path - Image path (for Firebase)
   * @returns {Promise<boolean>} - Success status
   */
  async deleteImage(url, path = null) {
    try {
      if (this.isVercelBlobUrl(url)) {
        return await vercelBlobService.deleteImage(url);
      } else if (this.isFirebaseUrl(url) && path) {
        return await firebaseImageService.deleteProductImage(path);
      }
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get performance metrics
   * @returns {Object} - Performance metrics
   */
  getPerformanceMetrics() {
    const totalImages = this.urlMapping.size;
    const vercelImages = Array.from(this.urlMapping.values()).filter(url => 
      url.includes('vercel-storage.com')
    ).length;

    return {
      totalImages,
      vercelImages,
      firebaseImages: totalImages - vercelImages,
      migrationPercentage: totalImages > 0 ? (vercelImages / totalImages) * 100 : 0,
      usingVercelBlob: this.useVercelBlob,
      migrationCompleted: this.migrationCompleted,
      cacheSize: this.cache.size,
      preferredStorage: this.preferredStorage
    };
  }

  /**
   * Get storage statistics
   * @returns {Object} - Storage statistics
   */
  getStorageStats() {
    const metrics = this.getPerformanceMetrics();
    return {
      ...metrics,
      storageDistribution: {
        vercel: `${metrics.migrationPercentage.toFixed(1)}%`,
        firebase: `${(100 - metrics.migrationPercentage).toFixed(1)}%`
      },
      performanceGain: metrics.vercelImages > 0 ? '2-3x faster loading' : 'Standard loading'
    };
  }
}

// Export singleton instance
export const enhancedImageService = new EnhancedImageService();
export default enhancedImageService;
