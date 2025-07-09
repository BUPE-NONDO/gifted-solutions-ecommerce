import React, { useState, useEffect, useRef } from 'react';
import { 
  createSafeImageLoader, 
  getFallbackTypeFromCategory,
  getLocalFallbackImage,
  resolveImageUrl 
} from '../utils/localImageFallback';

const CORSSafeImage = ({
  src,
  alt,
  className = '',
  fallbackType = 'default',
  category = null,
  onLoad = () => {},
  onError = () => {},
  lazy = true,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Determine appropriate fallback type
  const determineFallbackType = () => {
    if (category) {
      return getFallbackTypeFromCategory(category);
    }
    return fallbackType;
  };

  // Load image with CORS safety
  useEffect(() => {
    if (!src) {
      const fallback = getLocalFallbackImage(determineFallbackType());
      setImageSrc(fallback);
      setIsLoading(false);
      return;
    }

    const loadSafeImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Use the safe image loader
        const safeUrl = await createSafeImageLoader(src, determineFallbackType());
        setImageSrc(safeUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Safe image loading failed:', error);
        const fallback = getLocalFallbackImage(determineFallbackType());
        setImageSrc(fallback);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadSafeImage();
  }, [src, category, fallbackType]);

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad();
  };

  // Handle image load error
  const handleError = () => {
    console.warn(`Image failed to load: ${imageSrc}`);
    
    // If we're not already using a fallback, switch to local fallback
    if (!imageSrc.startsWith('data:')) {
      const fallback = getLocalFallbackImage(determineFallbackType());
      setImageSrc(fallback);
    }
    
    setIsLoading(false);
    setHasError(true);
    onError();
  };

  // Render loading placeholder
  const renderPlaceholder = () => (
    <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
      <div className="text-center text-gray-400">
        <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        <p className="text-xs">Loading...</p>
      </div>
    </div>
  );

  // Show loading placeholder
  if (isLoading) {
    return renderPlaceholder();
  }

  return (
    <div className="relative">
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        {...props}
      />

      {/* Error indicator for development */}
      {process.env.NODE_ENV === 'development' && hasError && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
          Fallback
        </div>
      )}
    </div>
  );
};

export default CORSSafeImage;
