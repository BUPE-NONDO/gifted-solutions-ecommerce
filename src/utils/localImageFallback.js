/**
 * Local Image Fallback System
 * Uses base64 encoded placeholder images to avoid CORS issues
 */

// Base64 encoded placeholder images (small, optimized)
const BASE64_IMAGES = {
  // Electronics component placeholder (Arduino-style)
  electronics: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHJ4PSIxMCIgZmlsbD0iIzFGMkEzNyIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjE1IiBmaWxsPSIjRkY2B0I0Ii8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjEwMCIgcj0iMTUiIGZpbGw9IiNGRjY3QjQiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMzAwIiByPSIxNSIgZmlsbD0iI0ZGNjdCNCIvPgo8Y2lyY2xlIGN4PSIzMDAiIGN5PSIzMDAiIHI9IjE1IiBmaWxsPSIjRkY2N0I0Ii8+CjxyZWN0IHg9IjE1MCIgeT0iMTgwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiByeD0iNSIgZmlsbD0iIzM3NEE1QyIvPgo8dGV4dCB4PSIyMDAiIHk9IjIwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QXJkdWlubzwvdGV4dD4KPC9zdmc+',
  
  // Arduino board placeholder
  arduino: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSIxMDAiIHdpZHRoPSIzMjAiIGhlaWdodD0iMjAwIiByeD0iMTAiIGZpbGw9IiMwMDc5QzEiLz4KPGNpcmNsZSBjeD0iODAiIGN5PSIxNDAiIHI9IjEwIiBmaWxsPSIjRkZGRkZGIi8+CjxjaXJjbGUgY3g9IjMyMCIgY3k9IjE0MCIgcj0iMTAiIGZpbGw9IiNGRkZGRkYiLz4KPGNpcmNsZSBjeD0iODAiIGN5PSIyNjAiIHI9IjEwIiBmaWxsPSIjRkZGRkZGIi8+CjxjaXJjbGUgY3g9IjMyMCIgY3k9IjI2MCIgcj0iMTAiIGZpbGw9IiNGRkZGRkYiLz4KPHJlY3QgeD0iMTIwIiB5PSIxNjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iODAiIHJ4PSI1IiBmaWxsPSIjMzc0QTVDIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjA1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5VTk88L3RleHQ+Cjwvdmc+',
  
  // Sensor module placeholder
  sensors: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjgwIiB5PSIxMDAiIHdpZHRoPSIyNDAiIGhlaWdodD0iMjAwIiByeD0iMTAiIGZpbGw9IiMyMkM1NUUiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSI0MCIgZmlsbD0iIzM3NEE1QyIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjIwIiBmaWxsPSIjRkY2N0I0Ii8+CjxyZWN0IHg9IjEwMCIgeT0iMTIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIGZpbGw9IiNGRkZGRkYiLz4KPHJlY3QgeD0iMTMwIiB5PSIxMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI0ZGRkZGRiIvPgo8cmVjdCB4PSIxNjAiIHk9IjEyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TZW5zb3I8L3RleHQ+Cjwvc3ZnPg==',
  
  // Electronic components placeholder
  components: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEwMCIgeT0iMTUwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgcng9IjEwIiBmaWxsPSIjRkY2N0I0Ii8+CjxyZWN0IHg9IjkwIiB5PSIxODAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzM3NEE1QyIvPgo8cmVjdCB4PSIyOTAiIHk9IjE4MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0QTVDIi8+CjxyZWN0IHg9IjEyMCIgeT0iMTcwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjYwIiByeD0iNSIgZmlsbD0iIzIyQzU1RSIvPgo8dGV4dCB4PSIyMDAiIHk9IjIwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29tcG9uZW50PC90ZXh0Pgo8L3N2Zz4=',
  
  // Product placeholder
  product: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcng9IjIwIiBmaWxsPSIjMzc0QTVDIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iMjAiIGZpbGw9IiNGRjY3QjQiLz4KPHJlY3QgeD0iMTUwIiB5PSIyMDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjMjJDNTVFIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0PC90ZXh0Pgo8dGV4dCB4PSIyMDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HaWZ0ZWQgU29sdXRpb25zPC90ZXh0Pgo8L3N2Zz4=',
  
  // Default fallback
  default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcng9IjIwIiBmaWxsPSIjMzc0QTVDIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE1MCIgcj0iMTAiIGZpbGw9IiNGRjY3QjQiLz4KPGNpcmNsZSBjeD0iMjUwIiBjeT0iMTUwIiByPSIxMCIgZmlsbD0iI0ZGNjdCNCIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIyNTAiIHI9IjEwIiBmaWxsPSIjRkY2N0I0Ii8+CjxjaXJjbGUgY3g9IjI1MCIgY3k9IjI1MCIgcj0iMTAiIGZpbGw9IiNGRjY3QjQiLz4KPHJlY3QgeD0iMTcwIiB5PSIxODAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgcng9IjUiIGZpbGw9IiMyMkM1NUUiLz4KPHRleHQgeD0iMjAwIiB5PSIzMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R2lmdGVkIFNvbHV0aW9uczwvdGV4dD4KPC9zdmc+'
};

// Get local fallback image by type
export const getLocalFallbackImage = (type = 'default') => {
  return BASE64_IMAGES[type] || BASE64_IMAGES.default;
};

// Check if URL is external and might have CORS issues
export const hasCorsPotential = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check for external URLs that might have CORS issues
  const corsProblematicDomains = [
    'unsplash.com',
    'images.unsplash.com',
    'pixabay.com',
    'pexels.com',
    'freepik.com'
  ];
  
  return corsProblematicDomains.some(domain => url.includes(domain));
};

// Smart image URL resolver
export const resolveImageUrl = (originalUrl, fallbackType = 'default') => {
  // If no URL provided, return local fallback immediately
  if (!originalUrl) {
    return getLocalFallbackImage(fallbackType);
  }
  
  // If it's already a data URL, return as-is
  if (originalUrl.startsWith('data:')) {
    return originalUrl;
  }
  
  // If it's a Firebase Storage URL, it should be safe
  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    return originalUrl;
  }
  
  // If it's a relative URL, it should be safe
  if (originalUrl.startsWith('/') || originalUrl.startsWith('./')) {
    return originalUrl;
  }
  
  // If it's from the same domain, it should be safe
  if (typeof window !== 'undefined' && originalUrl.includes(window.location.hostname)) {
    return originalUrl;
  }
  
  // For external URLs that might have CORS issues, return local fallback
  if (hasCorsPotential(originalUrl)) {
    console.warn(`Using local fallback for potentially problematic URL: ${originalUrl}`);
    return getLocalFallbackImage(fallbackType);
  }
  
  // For other URLs, try the original first
  return originalUrl;
};

// Create a safe image loader that falls back to local images
export const createSafeImageLoader = (originalUrl, fallbackType = 'default') => {
  return new Promise((resolve) => {
    // First, try to resolve the URL
    const resolvedUrl = resolveImageUrl(originalUrl, fallbackType);
    
    // If we already resolved to a local fallback, return it immediately
    if (resolvedUrl.startsWith('data:')) {
      resolve(resolvedUrl);
      return;
    }
    
    // Try to load the resolved URL
    const img = new Image();
    const timeout = setTimeout(() => {
      console.warn(`Image load timeout for: ${resolvedUrl}`);
      resolve(getLocalFallbackImage(fallbackType));
    }, 5000); // 5 second timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(resolvedUrl);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      console.warn(`Image load failed for: ${resolvedUrl}, using local fallback`);
      resolve(getLocalFallbackImage(fallbackType));
    };
    
    // Set CORS to anonymous to try to avoid CORS issues
    img.crossOrigin = 'anonymous';
    img.src = resolvedUrl;
  });
};

// Determine fallback type from product category
export const getFallbackTypeFromCategory = (category) => {
  if (!category) return 'default';
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('arduino') || categoryLower.includes('microcontroller')) {
    return 'arduino';
  }
  
  if (categoryLower.includes('sensor')) {
    return 'sensors';
  }
  
  if (categoryLower.includes('component') || categoryLower.includes('module')) {
    return 'components';
  }
  
  return 'electronics';
};

// Batch process multiple image URLs
export const batchResolveImages = async (imageUrls, fallbackTypes = []) => {
  const promises = imageUrls.map((url, index) => {
    const fallbackType = fallbackTypes[index] || 'default';
    return createSafeImageLoader(url, fallbackType);
  });
  
  return Promise.all(promises);
};

export default {
  getLocalFallbackImage,
  hasCorsPotential,
  resolveImageUrl,
  createSafeImageLoader,
  getFallbackTypeFromCategory,
  batchResolveImages,
  BASE64_IMAGES
};
