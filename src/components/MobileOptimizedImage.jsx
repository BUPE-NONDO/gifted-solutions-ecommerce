import React, { useState, useEffect, useRef } from 'react';
import {
  createMobileFriendlyImageUrl,
  retryImageLoad,
  isMobile,
  isSlowNetwork,
  handleMobileImageError,
  getFallbackImage
} from '../utils/mobileImageUtils';
import mobileImageProxyService from '../services/mobileImageProxyService';

const MobileOptimizedImage = ({
  src,
  alt,
  className = '',
  fallbackSrc = null,
  fallbackType = 'product', // product, electronics, components, default
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  forceRefresh = false,
  retryAttempts = 3,
  lazy = true,
  quality = 'auto', // auto, high, medium, low
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get appropriate fallback image
  const getAppropriateeFallback = () => {
    if (fallbackSrc) return fallbackSrc;
    return getFallbackImage(fallbackType);
  };

  // Generate mobile-friendly URL using proxy service
  useEffect(() => {
    if (!src) {
      setImageSrc(getAppropriateeFallback());
      setIsLoading(false);
      return;
    }

    const loadMobileUrl = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Multiple fallback strategies for maximum compatibility
        const strategies = [
          // Strategy 1: Use proxy service for Firebase URLs
          async () => {
            if (src.includes('firebase') || src.includes('googleapis')) {
              return await mobileImageProxyService.createMobileFriendlyUrl(src, {
                forceRefresh: forceRefresh,
                useProxy: true,
                quality: quality
              });
            }
            throw new Error('Not a Firebase URL');
          },

          // Strategy 2: Direct URL with cache busting
          async () => {
            return createMobileFriendlyImageUrl(src, forceRefresh);
          },

          // Strategy 3: Original URL
          async () => {
            return src;
          },

          // Strategy 4: Fallback image
          async () => {
            return getAppropriateeFallback();
          }
        ];

        let finalUrl = null;
        for (const strategy of strategies) {
          try {
            finalUrl = await strategy();
            // Test if the URL actually works
            await testImageLoad(finalUrl);
            break;
          } catch (error) {
            console.warn('Image strategy failed:', error.message);
            continue;
          }
        }

        setImageSrc(finalUrl || getAppropriateeFallback());
        setRetryCount(0);
      } catch (error) {
        console.error('All image loading strategies failed:', error);
        setImageSrc(getAppropriateeFallback());
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadMobileUrl();
  }, [src, forceRefresh, refreshKey, fallbackType, quality]);

  // Test if image URL is valid
  const testImageLoad = (url, timeout = 5000) => {
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
      if (url.includes('firebase') || url.includes('googleapis')) {
        img.crossOrigin = 'anonymous';
      }

      img.src = url;
    });
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad();
  };

  // Handle image error with retry logic using proxy service
  const handleError = async () => {
    console.log(`Image load failed for: ${imageSrc}, retry count: ${retryCount}`);

    if (retryCount < retryAttempts) {
      setRetryCount(prev => prev + 1);

      try {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));

        // Try with proxy service for more robust loading
        const retryUrl = await mobileImageProxyService.createMobileFriendlyUrl(src, {
          forceRefresh: true,
          useProxy: true
        });
        setImageSrc(retryUrl);
      } catch (error) {
        console.error('Proxy service retry failed, using fallback:', error);
        // Fallback to basic cache busting
        const basicRetryUrl = createMobileFriendlyImageUrl(src, true);
        setImageSrc(basicRetryUrl);
      }
    } else {
      // All retries failed
      setIsLoading(false);
      setHasError(true);

      if (fallbackSrc) {
        try {
          const fallbackUrl = await mobileImageProxyService.createMobileFriendlyUrl(fallbackSrc, {
            forceRefresh: true,
            useProxy: true
          });
          setImageSrc(fallbackUrl);
          setRetryCount(0); // Reset for fallback
        } catch (error) {
          console.error('Fallback image also failed:', error);
          onError();
        }
      } else {
        onError();
      }
    }
  };

  // Force refresh function
  const handleForceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Render loading placeholder
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs">Loading...</p>
        </div>
      </div>
    );
  };

  // Render error placeholder
  const renderError = () => (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}>
      <div className="text-center text-gray-500">
        <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        <p className="text-xs mb-2">Image unavailable</p>
        {retryCount < retryAttempts && (
          <button
            onClick={handleForceRefresh}
            className="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );

  // Show loading placeholder
  if (isLoading && !hasError) {
    return renderPlaceholder();
  }

  // Show error placeholder
  if (hasError && !imageSrc) {
    return renderError();
  }

  return (
    <div className="relative">
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        {...props}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
            <p className="text-xs">Loading...</p>
          </div>
        </div>
      )}

      {/* Retry indicator */}
      {retryCount > 0 && retryCount < retryAttempts && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
          Retry {retryCount}/{retryAttempts}
        </div>
      )}

      {/* Mobile network indicator */}
      {isMobile() && isSlowNetwork() && (
        <div className="absolute bottom-2 left-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
          Slow network
        </div>
      )}
    </div>
  );
};

// Higher-order component for existing images
export const withMobileOptimization = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const { src, ...otherProps } = props;
    const [optimizedSrc, setOptimizedSrc] = useState('');

    useEffect(() => {
      if (src) {
        const mobileUrl = createMobileFriendlyImageUrl(src, true);
        setOptimizedSrc(mobileUrl);
      }
    }, [src]);

    return (
      <WrappedComponent
        ref={ref}
        src={optimizedSrc || src}
        {...otherProps}
      />
    );
  });
};

// Hook for mobile image optimization
export const useMobileOptimizedImage = (src, options = {}) => {
  const { forceRefresh = false, retryAttempts = 3 } = options;
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (src) {
      const mobileUrl = createMobileFriendlyImageUrl(src, forceRefresh);
      setOptimizedSrc(mobileUrl);
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src, forceRefresh]);

  const retry = () => {
    if (retryCount < retryAttempts) {
      setRetryCount(prev => prev + 1);
      const retryUrl = createMobileFriendlyImageUrl(src, true);
      setOptimizedSrc(retryUrl);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (retryCount < retryAttempts) {
      setTimeout(retry, 1000 * (retryCount + 1));
    } else {
      setHasError(true);
    }
  };

  return {
    src: optimizedSrc,
    isLoading,
    hasError,
    retryCount,
    retry,
    handleLoad,
    handleError
  };
};

export default MobileOptimizedImage;
