import React, { useState, useEffect } from 'react';

/**
 * Vercel Blob Image Component - Fast CDN Loading!
 * Automatically handles image loading with fallbacks
 */
const VercelBlobImage = ({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    // All images should now be Vercel Blob URLs (full URLs)
    if (src.startsWith('http')) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // Fallback for any non-URL paths
    console.warn('Non-URL image path detected:', src, 'Using fallback');
    setImageSrc(fallbackSrc);
    setIsLoading(false);
    setHasError(true);
  }, [src, fallbackSrc]);

  const handleImageError = () => {
    if (!hasError) {
      console.warn('Image failed to load:', imageSrc);
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
      
      {hasError && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
          Fallback
        </div>
      )}
    </div>
  );
};

export default VercelBlobImage;
