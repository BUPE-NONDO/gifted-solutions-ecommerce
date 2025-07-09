#!/usr/bin/env node

/**
 * Firebase Configuration Debug Script
 * Helps diagnose Firebase authentication issues
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzcS3-kg7tOCdxWTYiMxogtHoVVsftbTI",
  authDomain: "gifted-solutions-shop.firebaseapp.com",
  projectId: "gifted-solutions-shop",
  storageBucket: "gifted-solutions-shop.firebasestorage.app",
  messagingSenderId: "364632918810",
  appId: "1:364632918810:web:1d16bf7738d2e723febaa3"
};

console.log('🔥 Firebase Configuration Debug');
console.log('================================');

// Test 1: Configuration validation
console.log('\n1. Configuration Validation:');
console.log('✓ API Key:', firebaseConfig.apiKey ? 'Present' : 'Missing');
console.log('✓ Auth Domain:', firebaseConfig.authDomain);
console.log('✓ Project ID:', firebaseConfig.projectId);
console.log('✓ Storage Bucket:', firebaseConfig.storageBucket);
console.log('✓ App ID:', firebaseConfig.appId);

// Test 2: Initialize Firebase
console.log('\n2. Firebase Initialization:');
try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  // Test 3: Authentication service
  console.log('\n3. Authentication Service:');
  const auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');
  
  // Test 4: Firestore service
  console.log('\n4. Firestore Service:');
  const db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
  // Test 5: Domain check
  console.log('\n5. Domain Configuration:');
  console.log('Current domains that should be authorized:');
  console.log('- localhost:3000 (development)');
  console.log('- localhost:5173 (Vite dev server)');
  console.log('- gifted-solutions-shop.web.app (production)');
  console.log('- gifted-solutions-shop.firebaseapp.com (Firebase hosting)');
  
  console.log('\n6. Common Issues & Solutions:');
  console.log('❌ auth/network-request-failed:');
  console.log('   - Check authorized domains in Firebase Console');
  console.log('   - Verify network connectivity');
  console.log('   - Check CORS settings');
  console.log('   - Ensure form submission doesn\'t refresh page');
  
  console.log('\n7. Next Steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/gifted-solutions-shop/authentication/settings');
  console.log('2. Navigate to Authentication > Settings > Authorized domains');
  console.log('3. Add these domains if not present:');
  console.log('   - gifted-solutions-shop.web.app');
  console.log('   - gifted-solutions-shop.firebaseapp.com');
  console.log('   - localhost (for development)');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('Error details:', error.message);
}

console.log('\n🔧 Debug complete!');
