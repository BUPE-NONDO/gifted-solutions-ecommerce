/**
 * Mobile Image Refresh Service
 * Handles real-time image updates specifically for mobile devices
 */

import { 
  createMobileFriendlyImageUrl, 
  forceImageRefresh, 
  isMobile,
  clearMobileImageCache 
} from '../utils/mobileImageUtils';

class MobileImageRefreshService {
  constructor() {
    this.listeners = new Map();
    this.refreshQueue = new Set();
    this.isProcessing = false;
    this.init();
  }

  init() {
    // Listen for product image updates
    window.addEventListener('mobileImageUpdate', this.handleImageUpdate.bind(this));
    window.addEventListener('productDataUpdated', this.handleProductUpdate.bind(this));
    
    // Listen for network changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', this.handleNetworkChange.bind(this));
    }
    
    // Listen for page visibility changes (mobile app switching)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Periodic refresh for mobile devices
    if (isMobile()) {
      this.startPeriodicRefresh();
    }
  }

  // Handle specific image updates
  handleImageUpdate(event) {
    const { productId, imageUrl } = event.detail;
    console.log('Mobile image update received:', { productId, imageUrl });
    
    this.refreshProductImages(productId, imageUrl);
  }

  // Handle general product updates
  handleProductUpdate(event) {
    console.log('Product data updated, refreshing mobile images');
    this.refreshAllImages();
  }

  // Handle network changes (mobile switching between WiFi/cellular)
  handleNetworkChange() {
    console.log('Network changed, clearing mobile image cache');
    clearMobileImageCache();
    
    // Refresh images after network change
    setTimeout(() => {
      this.refreshAllImages();
    }, 1000);
  }

  // Handle app visibility changes (mobile app switching)
  handleVisibilityChange() {
    if (!document.hidden && isMobile()) {
      console.log('App became visible, refreshing mobile images');
      this.refreshAllImages();
    }
  }

  // Refresh images for a specific product
  refreshProductImages(productId, newImageUrl) {
    const images = document.querySelectorAll(`img[alt*="${productId}"], img[data-product-id="${productId}"]`);
    
    images.forEach(img => {
      const mobileUrl = createMobileFriendlyImageUrl(newImageUrl || img.src, true);
      forceImageRefresh(img, mobileUrl);
    });

    // Also refresh any background images
    const elements = document.querySelectorAll(`[data-product-id="${productId}"]`);
    elements.forEach(el => {
      if (el.style.backgroundImage) {
        const mobileUrl = createMobileFriendlyImageUrl(newImageUrl, true);
        el.style.backgroundImage = `url(${mobileUrl})`;
      }
    });
  }

  // Refresh all product images
  refreshAllImages() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    
    // Get all product images
    const productImages = document.querySelectorAll('img[src*="firebase"], img[src*="product"], .product-image img');
    
    console.log(`Refreshing ${productImages.length} mobile images`);
    
    // Process images in batches to avoid overwhelming mobile browsers
    this.processBatch(Array.from(productImages), 0, 3);
  }

  // Process images in batches
  processBatch(images, startIndex, batchSize) {
    const endIndex = Math.min(startIndex + batchSize, images.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const img = images[i];
      if (img.src) {
        const mobileUrl = createMobileFriendlyImageUrl(img.src, true);
        forceImageRefresh(img, mobileUrl);
      }
    }

    // Process next batch
    if (endIndex < images.length) {
      setTimeout(() => {
        this.processBatch(images, endIndex, batchSize);
      }, 500); // Delay between batches for mobile performance
    } else {
      this.isProcessing = false;
      console.log('Mobile image refresh complete');
    }
  }

  // Start periodic refresh for mobile devices
  startPeriodicRefresh() {
    // Refresh images every 30 seconds on mobile
    setInterval(() => {
      if (!document.hidden && isMobile()) {
        this.refreshAllImages();
      }
    }, 30000);
  }

  // Force refresh specific image element
  forceRefreshImage(imageElement, newUrl) {
    if (!imageElement) return;
    
    const mobileUrl = createMobileFriendlyImageUrl(newUrl || imageElement.src, true);
    forceImageRefresh(imageElement, mobileUrl);
  }

  // Register a listener for image updates
  registerListener(productId, callback) {
    if (!this.listeners.has(productId)) {
      this.listeners.set(productId, new Set());
    }
    this.listeners.get(productId).add(callback);
  }

  // Unregister a listener
  unregisterListener(productId, callback) {
    if (this.listeners.has(productId)) {
      this.listeners.get(productId).delete(callback);
      if (this.listeners.get(productId).size === 0) {
        this.listeners.delete(productId);
      }
    }
  }

  // Notify listeners of image updates
  notifyListeners(productId, imageUrl) {
    if (this.listeners.has(productId)) {
      this.listeners.get(productId).forEach(callback => {
        try {
          callback(imageUrl);
        } catch (error) {
          console.error('Error in image update listener:', error);
        }
      });
    }
  }

  // Clear all caches and force complete refresh
  forceCompleteRefresh() {
    console.log('Forcing complete mobile image refresh');
    
    // Clear all caches
    clearMobileImageCache();
    
    // Clear browser cache for images
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
    
    // Refresh all images
    setTimeout(() => {
      this.refreshAllImages();
    }, 1000);
  }

  // Get mobile-optimized URL for any image
  getMobileImageUrl(originalUrl, forceRefresh = false) {
    return createMobileFriendlyImageUrl(originalUrl, forceRefresh);
  }

  // Check if mobile refresh is needed
  shouldRefreshForMobile() {
    return isMobile() && !document.hidden;
  }

  // Destroy service and cleanup
  destroy() {
    window.removeEventListener('mobileImageUpdate', this.handleImageUpdate);
    window.removeEventListener('productDataUpdated', this.handleProductUpdate);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    if ('connection' in navigator) {
      navigator.connection.removeEventListener('change', this.handleNetworkChange);
    }
    
    this.listeners.clear();
    this.refreshQueue.clear();
  }
}

// Create singleton instance
const mobileImageRefreshService = new MobileImageRefreshService();

// Export service and utilities
export default mobileImageRefreshService;

export const {
  refreshProductImages,
  refreshAllImages,
  forceRefreshImage,
  registerListener,
  unregisterListener,
  forceCompleteRefresh,
  getMobileImageUrl,
  shouldRefreshForMobile
} = mobileImageRefreshService;
