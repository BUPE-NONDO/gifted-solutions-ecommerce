// Firebase Connection Test Utility - DISABLED (Using Supabase only)
// import { auth, db } from '../services/firebase'; // Disabled

/**
 * Test Firebase connection and services
 */
export const testFirebaseConnection = async () => {
  console.log('🚫 Firebase disabled - using Supabase only');
  return {
    auth: false,
    firestore: false,
    config: false,
    errors: ['Firebase disabled - using Supabase for all data storage']
  };
};

/**
 * Test admin user creation functionality - DISABLED
 */
export const testAdminCreation = async () => {
  console.log('🚫 Admin creation test disabled - using Supabase only');
  return false;
};

/**
 * Check Firebase project configuration - DISABLED
 */
export const checkFirebaseConfig = () => {
  console.log('🚫 Firebase configuration disabled - using Supabase only');
  return { disabled: true };
};

/**
 * Run comprehensive Firebase integration test - DISABLED
 */
export const runFirebaseIntegrationTest = async () => {
  console.log('🚫 Firebase integration test disabled - using Supabase only');
  return {
    success: false,
    results: { auth: false, firestore: false, config: false, errors: ['Firebase disabled'] },
    config: { disabled: true },
    adminTest: false
  };
};

// Auto-run test disabled
console.log('🚫 Firebase auto-test disabled - using Supabase for all data storage');
