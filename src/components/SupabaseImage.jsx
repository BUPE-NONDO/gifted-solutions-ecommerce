import React, { useState, useEffect } from 'react';
import supabaseStorage from '../services/supabase';

/**
 * Supabase Image Component - No CORS Issues!
 * Automatically handles image loading with fallbacks
 */
const SupabaseImage = ({ 
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

    // Check if it's already a full URL
    if (src.startsWith('http')) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // Get Supabase public URL (no CORS issues!)
    try {
      const publicUrl = supabaseStorage.getPublicUrl(src);
      setImageSrc(publicUrl);
      setIsLoading(false);
    } catch (error) {
      console.warn('Error getting Supabase URL:', error);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      setHasError(true);
    }
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

export default SupabaseImage;
