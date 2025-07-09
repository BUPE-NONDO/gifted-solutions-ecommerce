/**
 * Database Configuration
 * Centralized configuration for Firebase and Supabase
 */

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBzcS3-kg7tOCdxWTYiMxogtHoVVsftbTI",
  authDomain: "gifted-solutions-shop.firebaseapp.com",
  projectId: "gifted-solutions-shop",
  storageBucket: "gifted-solutions-shop.firebasestorage.app",
  messagingSenderId: "364632918810",
  appId: "1:364632918810:web:1d16bf7738d2e723febaa3"
};

// Supabase removed - using Firebase + Vercel Blob only

// Vercel Blob configuration
export const vercelBlobConfig = {
  token: import.meta.env.BLOB_READ_WRITE_TOKEN,
  enabled: true
};

// Database status
export const databaseStatus = {
  firebase: {
    enabled: true,
    purpose: 'Authentication, user data, and product database'
  },
  vercelBlob: {
    enabled: true,
    purpose: 'Image storage and CDN'
  }
};

// Export database references for backward compatibility
export const database = {
  firebase: firebaseConfig,
  supabase: supabaseConfig,
  status: databaseStatus
};

export default database;
