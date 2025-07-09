import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { enhancedImageService } from '../services/enhancedImageService';

// Hardcoded fallback images - Base64 encoded or data URLs for offline reliability
const fallbackImages = {
  'arduino-uno': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDA5N0Q0Ii8+CjxyZWN0IHg9IjUwIiB5PSIxMDAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiByeD0iMTAiIGZpbGw9IiMwMDY5OUMiLz4KPHN2ZyB4PSI3NSIgeT0iMTI1IiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE1MCI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMDA0NzY2Ii8+Cjx0ZXh0IHg9IjEyNSIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFyZHVpbm8gVW5vPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+',
  'arduino-mega': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDA5N0Q0Ii8+CjxyZWN0IHg9IjMwIiB5PSI4MCIgd2lkdGg9IjM0MCIgaGVpZ2h0PSIyNDAiIHJ4PSIxMCIgZmlsbD0iIzAwNjk5QyIvPgo8c3ZnIHg9IjU1IiB5PSIxMDUiIHdpZHRoPSIyOTAiIGhlaWdodD0iMTkwIj4KPHN2ZyB3aWR0aD0iMjkwIiBoZWlnaHQ9IjE5MCI+CjxyZWN0IHdpZHRoPSIyOTAiIGhlaWdodD0iMTkwIiBmaWxsPSIjMDA0NzY2Ii8+Cjx0ZXh0IHg9IjE0NSIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcmR1aW5vIE1lZ2E8L3RleHQ+CjwvdGV4dD4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+',
  'arduino-nano': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDA5N0Q0Ii8+CjxyZWN0IHg9IjEwMCIgeT0iMTIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgcng9IjgiIGZpbGw9IiMwMDY5OUMiLz4KPHN2ZyB4PSIxMjUiIHk9IjE0NSIgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxMTAiPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjExMCIgZmlsbD0iIzAwNDc2NiIvPgo8dGV4dCB4PSI3NSIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFyZHVpbm8gTmFubzwvdGV4dD4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+',
  'esp32': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkY2QjM1Ii8+CjxyZWN0IHg9IjYwIiB5PSIxMDAiIHdpZHRoPSIyODAiIGhlaWdodD0iMjAwIiByeD0iMTAiIGZpbGw9IiNFNTUzMDAiLz4KPHN2ZyB4PSI4NSIgeT0iMTI1IiB3aWR0aD0iMjMwIiBoZWlnaHQ9IjE1MCI+CjxyZWN0IHdpZHRoPSIyMzAiIGhlaWdodD0iMTUwIiBmaWxsPSIjQjM0MzAwIi8+Cjx0ZXh0IHg9IjExNSIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVTUDMyPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+',
  'sensor': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTBCOTgxIi8+CjxyZWN0IHg9IjgwIiB5PSIxNDAiIHdpZHRoPSIyNDAiIGhlaWdodD0iMTIwIiByeD0iOCIgZmlsbD0iIzA1OTY2OSIvPgo8c3ZnIHg9IjEwNSIgeT0iMTY1IiB3aWR0aD0iMTkwIiBoZWlnaHQ9IjcwIj4KPHN2ZyB3aWR0aD0iMTkwIiBoZWlnaHQ9IjcwIj4KPHN2ZyB3aWR0aD0iMTkwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjMDQ3ODU3Ii8+Cjx0ZXh0IHg9Ijk1IiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2Vuc29yPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+',
  'component': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjODMzNUQ0Ii8+CjxyZWN0IHg9IjcwIiB5PSIxMjAiIHdpZHRoPSIyNjAiIGhlaWdodD0iMTYwIiByeD0iMTAiIGZpbGw9IiM2QjIxQzgiLz4KPHN2ZyB4PSI5NSIgeT0iMTQ1IiB3aWR0aD0iMjEwIiBoZWlnaHQ9IjExMCI+CjxyZWN0IHdpZHRoPSIyMTAiIGhlaWdodD0iMTEwIiBmaWxsPSIjNTUxQTk5Ii8+Cjx0ZXh0IHg9IjEwNSIgeT0iNjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbXBvbmVudDwvdGV4dD4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+',
  'breadboard': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjU5RTBCIi8+CjxyZWN0IHg9IjQwIiB5PSI4MCIgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyNDAiIHJ4PSIxMiIgZmlsbD0iI0Q5NzcwNCIvPgo8c3ZnIHg9IjY1IiB5PSIxMDUiIHdpZHRoPSIyNzAiIGhlaWdodD0iMTkwIj4KPHN2ZyB3aWR0aD0iMjcwIiBoZWlnaHQ9IjE5MCI+CjxyZWN0IHdpZHRoPSIyNzAiIGhlaWdodD0iMTkwIiBmaWxsPSIjQTg1QjA0Ii8+Cjx0ZXh0IHg9IjEzNSIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CcmVhZGJvYXJkPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+',
  'default': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNkI3MjgwIi8+CjxyZWN0IHg9IjUwIiB5PSIxMDAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiByeD0iMTAiIGZpbGw9IiM0QjU1NjMiLz4KPHN2ZyB4PSI3NSIgeT0iMTI1IiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE1MCI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEyNSIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVsZWN0cm9uaWNzPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+'
};

// Convert any Supabase URL to public format
const ensurePublicUrl = (url) => {
  if (!url) return null;

  // If it's already a public URL, return as is
  if (url.includes('/storage/v1/object/public/')) {
    return url;
  }

  // If it's a Supabase URL but not public, convert it
  if (url.includes('supabase.co/storage/v1/object/')) {
    return url.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }

  // If it's a relative Supabase path, make it absolute and public
  if (url.startsWith('product-images/') || url.startsWith('products/')) {
    return `https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/${url}`;
  }

  // If it's just a filename, assume it's in the products folder
  if (!url.includes('http') && !url.includes('/')) {
    return `https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/${url}`;
  }

  return url;
};

// Get appropriate fallback image based on product name
const getFallbackImage = (productName, category) => {
  if (!productName) return fallbackImages.default;

  const name = productName.toLowerCase();

  if (name.includes('uno')) return fallbackImages['arduino-uno'];
  if (name.includes('mega')) return fallbackImages['arduino-mega'];
  if (name.includes('nano')) return fallbackImages['arduino-nano'];
  if (name.includes('esp32') || name.includes('esp8266')) return fallbackImages['esp32'];
  if (name.includes('sensor')) return fallbackImages['sensor'];
  if (name.includes('breadboard')) return fallbackImages['breadboard'];
  if (category && category.toLowerCase().includes('sensor')) return fallbackImages['sensor'];
  if (category && category.toLowerCase().includes('component')) return fallbackImages['component'];

  return fallbackImages['default'];
};

const RobustImage = ({
  src,
  alt,
  productName,
  category,
  className = '',
  loading = 'lazy',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 2;

  // Process the source URL
  useEffect(() => {
    if (!src) {
      setCurrentSrc(getFallbackImage(productName, category));
      setIsLoading(false);
      return;
    }

    // Use enhanced image service for URL processing if available
    let processedUrl = src;
    try {
      // If it's already optimized by enhanced service, use as-is
      if (src.includes('vercel-storage.com') || src.includes('?')) {
        processedUrl = src;
      } else {
        // Ensure URL is in public format for non-optimized URLs
        processedUrl = ensurePublicUrl(src);
      }
    } catch (error) {
      console.warn('Error processing image URL:', error);
      processedUrl = ensurePublicUrl(src);
    }

    setCurrentSrc(processedUrl);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src, productName, category]);

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle image load error with retry logic
  const handleError = () => {
    console.warn(`Image failed to load: ${currentSrc}`);

    if (retryCount < maxRetries) {
      // Retry with a delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Force reload by adding timestamp
        const retryUrl = currentSrc.includes('?')
          ? `${currentSrc}&retry=${Date.now()}`
          : `${currentSrc}?retry=${Date.now()}`;
        setCurrentSrc(retryUrl);
      }, 1000 * (retryCount + 1)); // Exponential backoff
    } else {
      // Use fallback image after max retries
      setHasError(true);
      setIsLoading(false);
      setCurrentSrc(getFallbackImage(productName, category));
    }
  };

  // Loading placeholder
  if (isLoading && !hasError) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`} {...props}>
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || productName || 'Product image'}
      className={className}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default RobustImage;
