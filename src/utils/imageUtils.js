/**
 * Image utility functions for handling local image uploads
 */

// Simulate image storage (in real app, this would be a server/cloud storage)
const imageStorage = new Map();

/**
 * Upload image and return a URL
 * In production, this would upload to a server or cloud storage
 */
export const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        reject(new Error('Invalid file type'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('File too large'));
        return;
      }

      // Create a unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop();
      const filename = `product_${timestamp}_${randomId}.${extension}`;

      // Create a placeholder URL (in real implementation, this would be Firebase Storage URL)
      const placeholderUrl = `https://firebasestorage.googleapis.com/v0/b/gifted-solutions-shop.firebasestorage.app/o/${filename}?alt=media`;

      // Store in our mock storage
      imageStorage.set(filename, {
        file,
        url: placeholderUrl,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date()
      });

      // Simulate upload delay
      setTimeout(() => {
        resolve({
          url: placeholderUrl,
          filename,
          originalName: file.name,
          size: file.size
        });
      }, 1000);

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete an uploaded image
 */
export const deleteImage = (filename) => {
  const imageData = imageStorage.get(filename);
  if (imageData) {
    imageStorage.delete(filename);
    return true;
  }
  return false;
};

/**
 * Get image data by filename
 */
export const getImageData = (filename) => {
  return imageStorage.get(filename);
};

/**
 * Get all uploaded images
 */
export const getAllImages = () => {
  return Array.from(imageStorage.entries()).map(([filename, data]) => ({
    filename,
    ...data
  }));
};

/**
 * Compress image before upload
 */
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to data URL instead of blob
      const dataUrl = canvas.toDataURL(file.type, quality);

      // Convert data URL back to File object
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        });
    };

    // Use FileReader instead of createObjectURL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Generate thumbnail from image file
 */
export const generateThumbnail = (file, size = 150) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;

      // Calculate crop dimensions for square thumbnail
      const { width, height } = img;
      const minDimension = Math.min(width, height);
      const x = (width - minDimension) / 2;
      const y = (height - minDimension) / 2;

      // Draw cropped and resized image
      ctx.drawImage(
        img,
        x, y, minDimension, minDimension,
        0, 0, size, size
      );

      // Convert to data URL instead of blob
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailDataUrl);
    };

    // Use FileReader instead of createObjectURL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minWidth = 100,
    minHeight = 100
  } = options;

  return new Promise((resolve, reject) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      reject(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      reject(new Error(`File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`));
      return;
    }

    // Check image dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width < minWidth || img.height < minHeight) {
        reject(new Error(`Image too small. Minimum dimensions: ${minWidth}x${minHeight}px`));
        return;
      }
      resolve(true);
    };

    img.onerror = () => {
      reject(new Error('Invalid image file'));
    };

    // Use FileReader instead of createObjectURL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Create a data URL from file (for immediate preview)
 */
export const createPreviewUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Clean up preview URLs (no longer needed for data URLs)
 */
export const cleanupPreviewUrl = () => {
  // Data URLs don't need cleanup like blob URLs did
  // This function is kept for backward compatibility
  return;
};
