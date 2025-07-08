import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './firebase';

export const imageService = {
  // Upload product image
  async uploadProductImage(file, productId = null) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      // Create unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop().toLowerCase();
      const filename = productId
        ? `product_${productId}_${timestamp}.${extension}`
        : `product_${timestamp}_${randomId}.${extension}`;

      // Create storage reference
      const storageRef = ref(storage, `products/${filename}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: `products/${filename}`
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete product image
  async deleteProductImage(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  // Upload category image
  async uploadCategoryImage(file, categoryName) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      // Create filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop().toLowerCase();
      const filename = `${categoryName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.${extension}`;

      // Create storage reference
      const storageRef = ref(storage, `categories/${filename}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: `categories/${filename}`
      };
    } catch (error) {
      console.error('Error uploading category image:', error);
      throw error;
    }
  },

  // Upload user file (for custom requests)
  async uploadUserFile(file, userId, requestId = null) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Check file size (max 10MB for user uploads)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      // Create filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop().toLowerCase();
      const filename = requestId
        ? `request_${requestId}_${timestamp}.${extension}`
        : `upload_${timestamp}_${randomId}.${extension}`;

      // Create storage reference
      const storageRef = ref(storage, `user-uploads/${userId}/${filename}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: `user-uploads/${userId}/${filename}`
      };
    } catch (error) {
      console.error('Error uploading user file:', error);
      throw error;
    }
  },

  // Get all product images
  async getProductImages() {
    try {
      const productsRef = ref(storage, 'products');
      const result = await listAll(productsRef);

      const images = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            url: url,
            path: itemRef.fullPath
          };
        })
      );

      return images;
    } catch (error) {
      console.error('Error getting product images:', error);
      throw error;
    }
  },

  // Validate image file
  validateImageFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file selected');
      return errors;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push('File size too large. Maximum size is 5MB.');
    }

    // Check image dimensions (optional)
    return new Promise((resolve) => {
      if (errors.length > 0) {
        resolve(errors);
        return;
      }

      const img = new Image();
      img.onload = function() {
        // Check minimum dimensions
        if (this.width < 100 || this.height < 100) {
          errors.push('Image too small. Minimum size is 100x100 pixels.');
        }

        // Check maximum dimensions
        if (this.width > 4000 || this.height > 4000) {
          errors.push('Image too large. Maximum size is 4000x4000 pixels.');
        }

        resolve(errors);
      };

      img.onerror = function() {
        errors.push('Invalid image file.');
        resolve(errors);
      };

      // Use FileReader instead of createObjectURL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  // Get image URL from path
  async getImageUrl(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw error;
    }
  }
};

export default imageService;
