/**
 * Cache Service for persisting products and images state
 * Handles localStorage operations with expiration and validation
 */

class CacheService {
  constructor() {
    this.CACHE_KEYS = {
      PRODUCTS: 'gifted_solutions_products',
      IMAGES: 'gifted_solutions_images',
      METADATA: 'gifted_solutions_metadata',
      USER_PREFERENCES: 'gifted_solutions_user_prefs'
    };
    
    // Cache expiration times (in milliseconds)
    this.CACHE_EXPIRY = {
      PRODUCTS: 24 * 60 * 60 * 1000, // 24 hours
      IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 days
      METADATA: 12 * 60 * 60 * 1000, // 12 hours
      USER_PREFERENCES: 30 * 24 * 60 * 60 * 1000 // 30 days
    };
  }

  /**
   * Set cache with expiration
   */
  setCache(key, data, customExpiry = null) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiry: customExpiry || this.CACHE_EXPIRY[key] || this.CACHE_EXPIRY.PRODUCTS
      };
      
      localStorage.setItem(this.CACHE_KEYS[key] || key, JSON.stringify(cacheData));
      console.log(`Cache set for ${key}:`, { dataLength: Array.isArray(data) ? data.length : 'object' });
      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  /**
   * Get cache with expiration check
   */
  getCache(key) {
    try {
      const cached = localStorage.getItem(this.CACHE_KEYS[key] || key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache has expired
      if (now - cacheData.timestamp > cacheData.expiry) {
        this.clearCache(key);
        console.log(`Cache expired for ${key}`);
        return null;
      }

      console.log(`Cache hit for ${key}:`, { 
        age: Math.round((now - cacheData.timestamp) / 1000 / 60), 
        dataLength: Array.isArray(cacheData.data) ? cacheData.data.length : 'object' 
      });
      return cacheData.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      this.clearCache(key);
      return null;
    }
  }

  /**
   * Clear specific cache
   */
  clearCache(key) {
    try {
      localStorage.removeItem(this.CACHE_KEYS[key] || key);
      console.log(`Cache cleared for ${key}`);
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    try {
      Object.values(this.CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Error clearing all caches:', error);
      return false;
    }
  }

  /**
   * Get cache info for debugging
   */
  getCacheInfo() {
    const info = {};
    Object.entries(this.CACHE_KEYS).forEach(([name, key]) => {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const cacheData = JSON.parse(cached);
          const age = Date.now() - cacheData.timestamp;
          info[name] = {
            size: cached.length,
            age: Math.round(age / 1000 / 60), // minutes
            expired: age > cacheData.expiry,
            dataLength: Array.isArray(cacheData.data) ? cacheData.data.length : 'object'
          };
        } catch (error) {
          info[name] = { error: 'Invalid cache data' };
        }
      } else {
        info[name] = { status: 'No cache' };
      }
    });
    return info;
  }

  /**
   * Products specific methods
   */
  setProducts(products) {
    return this.setCache('PRODUCTS', products);
  }

  getProducts() {
    return this.getCache('PRODUCTS');
  }

  /**
   * Images specific methods
   */
  setImages(images) {
    return this.setCache('IMAGES', images);
  }

  getImages() {
    return this.getCache('IMAGES');
  }

  /**
   * Metadata specific methods
   */
  setMetadata(metadata) {
    return this.setCache('METADATA', metadata);
  }

  getMetadata() {
    return this.getCache('METADATA');
  }

  /**
   * User preferences methods
   */
  setUserPreferences(preferences) {
    return this.setCache('USER_PREFERENCES', preferences);
  }

  getUserPreferences() {
    return this.getCache('USER_PREFERENCES');
  }

  /**
   * Check if cache is available and working
   */
  isCacheAvailable() {
    try {
      const testKey = 'cache_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo() {
    if (!this.isCacheAvailable()) return null;

    let totalSize = 0;
    const details = {};

    Object.entries(this.CACHE_KEYS).forEach(([name, key]) => {
      const item = localStorage.getItem(key);
      if (item) {
        const size = item.length;
        totalSize += size;
        details[name] = {
          size: size,
          sizeKB: Math.round(size / 1024 * 100) / 100
        };
      }
    });

    return {
      totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
      details,
      available: this.isCacheAvailable()
    };
  }
}

// Create and export singleton instance
const cacheService = new CacheService();
export default cacheService;
