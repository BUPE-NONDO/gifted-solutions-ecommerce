/**
 * Mobile Image Proxy Service - DISABLED
 * Firebase disabled - using Supabase only
 */

// import { getDownloadURL, ref } from 'firebase/storage'; // Disabled
// import { storage } from './firebase'; // Disabled

class MobileImageProxyService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // Check if URL is a Firebase Storage URL
  isFirebaseStorageUrl(url) {
    return url && (
      url.includes('firebasestorage.googleapis.com') ||
      url.includes('firebasestorage.app') ||
      url.includes('storage.googleapis.com') ||
      false // Blob URLs are no longer supported
    );
  }

  // Extract storage path from Firebase URL
  extractStoragePath(firebaseUrl) {
    try {
      const url = new URL(firebaseUrl);
      const pathMatch = url.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+)$/);
      if (pathMatch) {
        return decodeURIComponent(pathMatch[1]);
      }
      return null;
    } catch (error) {
      console.error('Error extracting storage path:', error);
      return null;
    }
  }

  // Get fresh download URL from Firebase Storage
  async getFreshDownloadUrl(storagePath) {
    try {
      const storageRef = ref(storage, storagePath);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error getting fresh download URL:', error);
      throw error;
    }
  }

  // Create mobile-friendly image URL with multiple fallback strategies
  async createMobileFriendlyUrl(originalUrl, options = {}) {
    const { forceRefresh = false, useProxy = true } = options;

    if (!originalUrl) return '';

    // If it's not a Firebase Storage URL, return as-is with cache busting
    if (!this.isFirebaseStorageUrl(originalUrl)) {
      return this.addCacheBusting(originalUrl, forceRefresh);
    }

    // Check cache first (unless force refresh)
    const cacheKey = `${originalUrl}_${forceRefresh}`;
    if (!forceRefresh && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Create loading promise
    const loadingPromise = this.loadImageWithFallbacks(originalUrl, options);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  // Load image with multiple fallback strategies
  async loadImageWithFallbacks(originalUrl, options = {}) {
    // Blob URLs are no longer supported - skip directly to fallback
    if (originalUrl.startsWith('blob:')) {
      console.log('Blob URLs are not supported, using fallback strategy immediately');
      return await this.tryFallbackImage();
    }

    const strategies = [
      () => this.tryOriginalUrl(originalUrl),
      () => this.tryFreshDownloadUrl(originalUrl),
      () => this.tryCorsWorkaround(originalUrl),
      () => this.tryProxiedUrl(originalUrl),
      () => this.tryDirectStorageAccess(originalUrl),
      () => this.tryFallbackImage()
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = await this.retryWithBackoff(strategies[i], this.retryAttempts);
        if (result) {
          console.log(`Mobile image loaded with strategy ${i + 1}:`, result);
          return result;
        }
      } catch (error) {
        console.warn(`Strategy ${i + 1} failed:`, error.message);
        if (i === strategies.length - 1) {
          // If all strategies fail, ensure we return a working fallback
          console.log('All strategies failed, using guaranteed fallback');
          return await this.tryFallbackImage();
        }
      }
    }

    // This should never be reached, but just in case
    return await this.tryFallbackImage();
  }

  // Strategy 1: Try original URL with cache busting
  async tryOriginalUrl(originalUrl) {
    const urlWithCacheBusting = this.addCacheBusting(originalUrl, true);
    await this.testImageLoad(urlWithCacheBusting);
    return urlWithCacheBusting;
  }

  // Strategy 2: Get fresh download URL from Firebase
  async tryFreshDownloadUrl(originalUrl) {
    const storagePath = this.extractStoragePath(originalUrl);
    if (!storagePath) throw new Error('Could not extract storage path');

    const freshUrl = await this.getFreshDownloadUrl(storagePath);
    const urlWithCacheBusting = this.addCacheBusting(freshUrl, true);
    await this.testImageLoad(urlWithCacheBusting);
    return urlWithCacheBusting;
  }

  // Strategy 3: CORS workaround with alternative URL formats
  async tryCorsWorkaround(originalUrl) {
    // Try different URL formats that might bypass CORS
    const corsWorkarounds = [
      // Add CORS bypass parameters
      originalUrl.includes('?')
        ? `${originalUrl}&cors=bypass&origin=*`
        : `${originalUrl}?cors=bypass&origin=*`,

      // Try without token parameter
      originalUrl.replace(/&token=[^&]*/, '').replace(/\?token=[^&]*&?/, '?').replace(/\?$/, ''),

      // Try with different alt parameter
      originalUrl.replace(/alt=media/, 'alt=media&cors=true'),

      // Try direct bucket access format
      originalUrl.replace(
        /firebasestorage\.googleapis\.com\/v0\/b\/([^\/]+)\/o\/(.+)\?alt=media/,
        '$1/$2'
      )
    ];

    for (const workaroundUrl of corsWorkarounds) {
      try {
        await this.testImageLoad(workaroundUrl, 5000); // Shorter timeout for workarounds
        return workaroundUrl;
      } catch (error) {
        console.warn(`CORS workaround failed: ${workaroundUrl}`, error.message);
        continue;
      }
    }

    throw new Error('All CORS workarounds failed');
  }

  // Strategy 4: Try proxied URL (for CORS issues)
  async tryProxiedUrl(originalUrl) {
    // Create a proxied version of the URL
    const proxiedUrl = this.createProxiedUrl(originalUrl);
    await this.testImageLoad(proxiedUrl);
    return proxiedUrl;
  }

  // Strategy 5: Try direct storage access
  async tryDirectStorageAccess(originalUrl) {
    const storagePath = this.extractStoragePath(originalUrl);
    if (!storagePath) throw new Error('Could not extract storage path');

    // Try alternative Firebase Storage URL format
    const directUrl = `https://firebasestorage.googleapis.com/v0/b/gifted-solutions-shop.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media&token=${Date.now()}`;
    await this.testImageLoad(directUrl);
    return directUrl;
  }

  // Strategy 6: Fallback to placeholder image
  async tryFallbackImage() {
    // Try multiple fallback options
    const fallbackOptions = [
      // High-quality tech product image from Unsplash
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center',
      // Electronics/components image
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center',
      // Generic product placeholder
      'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Product+Image',
      // SVG fallback as last resort
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwSDIyNVYyNTBIMTc1VjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE1MCAyMDBIMjUwVjMwMEgxNTBWMjAwWiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K'
    ];

    // Try each fallback option
    for (const fallbackUrl of fallbackOptions) {
      try {
        await this.testImageLoad(fallbackUrl, 3000); // Shorter timeout for fallbacks
        return fallbackUrl;
      } catch (error) {
        console.warn(`Fallback image failed: ${fallbackUrl}`, error.message);
        continue;
      }
    }

    // If all fallbacks fail, return the SVG as last resort
    return fallbackOptions[fallbackOptions.length - 1];
  }

  // Create proxied URL to bypass CORS issues
  createProxiedUrl(originalUrl) {
    // For now, just add aggressive cache busting
    // In production, you might want to use a CORS proxy service
    return this.addCacheBusting(originalUrl, true);
  }

  // Add cache busting parameters
  addCacheBusting(url, aggressive = false) {
    if (!url) return '';

    const separator = url.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);

    let cacheBustParams = `t=${timestamp}&r=${random}`;

    if (aggressive) {
      cacheBustParams += `&v=mobile&refresh=1&bust=${timestamp}&mobile=1`;
    }

    return `${url}${separator}${cacheBustParams}`;
  }

  // Test if image can be loaded (with CORS handling)
  testImageLoad(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error(`Image load timeout: ${url}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(url);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Image load failed: ${url}`));
      };

      // Handle CORS for Firebase Storage URLs
      if (url.includes('firebasestorage.googleapis.com') || url.includes('.firebasestorage.app')) {
        img.crossOrigin = 'anonymous';
      }

      img.src = url;
    });
  }

  // Retry with exponential backoff
  async retryWithBackoff(fn, maxAttempts) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }

        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Preload images for better mobile performance
  async preloadImages(urls, options = {}) {
    const { maxConcurrent = 2, timeout = 10000 } = options;
    const results = [];

    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(async (url) => {
        try {
          const mobileUrl = await this.createMobileFriendlyUrl(url, { forceRefresh: true });
          await this.testImageLoad(mobileUrl, timeout);
          return { url, mobileUrl, success: true };
        } catch (error) {
          return { url, error: error.message, success: false };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result =>
        result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
      ));
    }

    return results;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      loadingPromises: this.loadingPromises.size
    };
  }
}

// Create singleton instance
const mobileImageProxyService = new MobileImageProxyService();

export default mobileImageProxyService;

// Export utility functions
export const {
  createMobileFriendlyUrl,
  preloadImages,
  clearCache,
  getCacheStats,
  isFirebaseStorageUrl
} = mobileImageProxyService;
