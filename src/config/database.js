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

// Supabase configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://fotcjsmnerawpqzhldhq.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mzg5MjYsImV4cCI6MjA2NDExNDkyNn0.cMIRbKVsw-gvOu53IaZzrABpngZ4O-hsMV7sWqLehK4',
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || 'product-images'
};

// Database status
export const databaseStatus = {
  firebase: {
    enabled: true,
    purpose: 'Authentication and user data'
  },
  supabase: {
    enabled: true,
    purpose: 'Product storage and images'
  }
};

// Export database references for backward compatibility
export const database = {
  firebase: firebaseConfig,
  supabase: supabaseConfig,
  status: databaseStatus
};

export default database;
