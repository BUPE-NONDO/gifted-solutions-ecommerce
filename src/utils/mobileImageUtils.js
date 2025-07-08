/**
 * Mobile-specific image optimization utilities
 * Handles aggressive caching, slow networks, and mobile browser quirks
 */

// Fallback images for different contexts
export const FALLBACK_IMAGES = {
  product: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&q=80',
  electronics: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=center&q=80',
  components: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&q=80',
  arduino: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop&crop=center&q=80',
  sensors: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&q=80',
  default: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center&q=80'
};

// Get fallback image by type
export const getFallbackImage = (type = 'default') => {
  return FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default;
};

// Mobile detection
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Network detection
export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

// Check if network is slow
export const isSlowNetwork = () => {
  const network = getNetworkInfo();
  if (!network) return false;

  return network.effectiveType === 'slow-2g' ||
         network.effectiveType === '2g' ||
         network.saveData === true ||
         network.downlink < 1.5;
};

// Enhanced cache busting for mobile
export const createMobileFriendlyImageUrl = (originalUrl, forceRefresh = false) => {
  if (!originalUrl) return '';

  // Remove existing cache busting parameters
  const cleanUrl = originalUrl.split('?')[0];

  // Create multiple cache busting parameters for aggressive cache clearing
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const mobileId = isMobile() ? 'mobile' : 'desktop';

  // Add multiple cache busting parameters
  const params = new URLSearchParams();
  params.set('t', timestamp.toString());
  params.set('r', random);
  params.set('v', '2'); // Version parameter
  params.set('device', mobileId);

  if (forceRefresh) {
    params.set('refresh', '1');
    params.set('bust', Date.now().toString());
  }

  return `${cleanUrl}?${params.toString()}`;
};

// Progressive image loading for mobile
export const createProgressiveImageLoader = (imageUrl, options = {}) => {
  const {
    lowQualityPlaceholder = null,
    onLoad = () => {},
    onError = () => {},
    timeout = 15000 // 15 seconds timeout for mobile
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    let timeoutId;

    // Set timeout for slow networks
    timeoutId = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      reject(new Error('Image load timeout'));
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId);
      onLoad(img);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      onError(new Error('Image failed to load'));
      reject(new Error('Image failed to load'));
    };

    // Add cache busting for mobile
    const mobileUrl = createMobileFriendlyImageUrl(imageUrl, true);
    img.src = mobileUrl;

    // Preload with low quality placeholder if available
    if (lowQualityPlaceholder) {
      const placeholder = new Image();
      placeholder.src = lowQualityPlaceholder;
    }
  });
};

// Force image refresh on mobile browsers
export const forceImageRefresh = (imageElement, newUrl) => {
  if (!imageElement || !newUrl) return;

  // Create mobile-friendly URL with aggressive cache busting
  const refreshUrl = createMobileFriendlyImageUrl(newUrl, true);

  // Multiple strategies to force refresh on mobile
  if (isMobile()) {
    // Strategy 1: Clear src and set again
    imageElement.src = '';
    imageElement.removeAttribute('src');

    // Strategy 2: Force reflow
    imageElement.style.display = 'none';
    imageElement.offsetHeight; // Trigger reflow
    imageElement.style.display = '';

    // Strategy 3: Set new URL with cache busting
    setTimeout(() => {
      imageElement.src = refreshUrl;
    }, 100);
  } else {
    imageElement.src = refreshUrl;
  }
};

// Mobile-optimized image preloader
export const preloadImagesForMobile = (imageUrls, options = {}) => {
  const {
    maxConcurrent = 2, // Limit concurrent loads on mobile
    timeout = 10000,
    onProgress = () => {},
    onComplete = () => {}
  } = options;

  return new Promise((resolve) => {
    const results = [];
    let completed = 0;
    let currentIndex = 0;

    const loadNext = () => {
      if (currentIndex >= imageUrls.length) {
        if (completed === imageUrls.length) {
          onComplete(results);
          resolve(results);
        }
        return;
      }

      const url = imageUrls[currentIndex++];
      const mobileUrl = createMobileFriendlyImageUrl(url);

      createProgressiveImageLoader(mobileUrl, { timeout })
        .then((img) => {
          results.push({ url, success: true, image: img });
        })
        .catch((error) => {
          results.push({ url, success: false, error });
        })
        .finally(() => {
          completed++;
          onProgress(completed, imageUrls.length);
          loadNext();
        });
    };

    // Start loading with limited concurrency
    for (let i = 0; i < Math.min(maxConcurrent, imageUrls.length); i++) {
      loadNext();
    }
  });
};

// Mobile image optimization settings
export const getMobileImageSettings = () => {
  const network = getNetworkInfo();
  const slow = isSlowNetwork();

  return {
    quality: slow ? 0.6 : 0.8,
    maxWidth: isMobile() ? 800 : 1200,
    format: 'webp', // Use WebP for better compression
    progressive: true,
    timeout: slow ? 20000 : 10000,
    retryAttempts: slow ? 3 : 1,
    cacheStrategy: 'aggressive'
  };
};

// Retry mechanism for failed image loads
export const retryImageLoad = (imageUrl, maxRetries = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryLoad = () => {
      attempts++;
      const retryUrl = createMobileFriendlyImageUrl(imageUrl, true);

      createProgressiveImageLoader(retryUrl)
        .then(resolve)
        .catch((error) => {
          if (attempts < maxRetries) {
            setTimeout(tryLoad, delay * attempts); // Exponential backoff
          } else {
            reject(error);
          }
        });
    };

    tryLoad();
  });
};

// Clear mobile browser cache for images
export const clearMobileImageCache = () => {
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (cacheName.includes('image') || cacheName.includes('static')) {
          caches.delete(cacheName);
        }
      });
    });
  }
};

// Mobile-specific image error handling
export const handleMobileImageError = (imageElement, fallbackUrl = null) => {
  if (!imageElement) return;

  // Add error class for styling
  imageElement.classList.add('image-error');

  // Try fallback URL if provided
  if (fallbackUrl) {
    const fallbackMobileUrl = createMobileFriendlyImageUrl(fallbackUrl, true);
    imageElement.src = fallbackMobileUrl;
    return;
  }

  // Create placeholder
  const placeholder = document.createElement('div');
  placeholder.className = 'image-placeholder bg-gray-200 flex items-center justify-center';
  placeholder.innerHTML = `
    <div class="text-center text-gray-500">
      <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>
      <p class="text-xs">Image unavailable</p>
    </div>
  `;

  // Replace image with placeholder
  if (imageElement.parentNode) {
    imageElement.parentNode.replaceChild(placeholder, imageElement);
  }
};

// Force reload all images on page
export const forceReloadAllImages = () => {
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (img.src) {
      const newUrl = createMobileFriendlyImageUrl(img.src, true);
      forceImageRefresh(img, newUrl);
    }
  });
};

export default {
  FALLBACK_IMAGES,
  getFallbackImage,
  isMobile,
  getNetworkInfo,
  isSlowNetwork,
  createMobileFriendlyImageUrl,
  createProgressiveImageLoader,
  forceImageRefresh,
  preloadImagesForMobile,
  getMobileImageSettings,
  retryImageLoad,
  clearMobileImageCache,
  handleMobileImageError,
  forceReloadAllImages
};
