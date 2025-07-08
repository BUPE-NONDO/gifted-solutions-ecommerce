// Firebase configuration - Full Firebase integration with Storage
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for Gifted Solutions
const firebaseConfig = {
  apiKey: "AIzaSyBzcS3-kg7tOCdxWTYiMxogtHoVVsftbTI",
  authDomain: "gifted-solutions-shop.firebaseapp.com",
  projectId: "gifted-solutions-shop",
  storageBucket: "gifted-solutions-shop.firebasestorage.app",
  messagingSenderId: "364632918810",
  appId: "1:364632918810:web:1d16bf7738d2e723febaa3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore (for user profiles and admin data)
export const db = getFirestore(app);

// Initialize Firebase Storage (for product images)
export const storage = getStorage(app);

// Configure authentication providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');



export const twitterProvider = new TwitterAuthProvider();

// Firebase is now fully integrated
console.log('🔥 Firebase Authentication enabled');
console.log('🔥 Firebase Firestore enabled');
console.log('🔥 Firebase Storage enabled');
console.log('🔥 Social Auth Providers configured');

// Test Firebase connection
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ Firebase Auth: User is signed in:', user.email);
  } else {
    console.log('🔓 Firebase Auth: No user signed in');
  }
}, (error) => {
  console.error('❌ Firebase Auth Error:', error);
});

export default {
  auth,
  db,
  storage
};
