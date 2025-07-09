import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fotcjsmnerawpqzhldhq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mzg5MjYsImV4cCI6MjA2NDExNDkyNn0.cMIRbKVsw-gvOu53IaZzrABpngZ4O-hsMV7sWqLehK4';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Create Supabase client (database only - no storage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper function to get public URL for uploaded files (Vercel Blob URLs)
export const getPublicUrl = (filePath) => {
  if (!filePath) return null;

  // All images should now be Vercel Blob URLs (full URLs)
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // Log warning for any non-URL paths
  console.warn('Non-URL image path detected:', filePath);
  return null;
};

// Helper function to upload file
export const uploadFile = async (file, filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    return {
      success: true,
      data,
      publicUrl: getPublicUrl(filePath)
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to delete file
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Delete failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to list files
export const listFiles = async (folder = '') => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('List files error:', error);
      throw error;
    }

    return {
      success: true,
      files: data || []
    };
  } catch (error) {
    console.error('List files failed:', error);
    return {
      success: false,
      error: error.message,
      files: []
    };
  }
};

// Helper function to create storage bucket (admin only)
export const createBucket = async () => {
  try {
    const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error && error.message !== 'Bucket already exists') {
      console.error('Create bucket error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Create bucket failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default supabase;
