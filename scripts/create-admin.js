#!/usr/bin/env node

/**
 * Create Admin User Script
 * Creates an admin user for testing Firebase authentication
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzcS3-kg7tOCdxWTYiMxogtHoVVsftbTI",
  authDomain: "gifted-solutions-shop.firebaseapp.com",
  projectId: "gifted-solutions-shop",
  storageBucket: "gifted-solutions-shop.firebasestorage.app",
  messagingSenderId: "364632918810",
  appId: "1:364632918810:web:1d16bf7738d2e723febaa3"
};

// Admin user details
const adminUser = {
  email: 'giftedsolutions20@gmail.com',
  password: 'GiftedAdmin2024!',
  displayName: 'Gifted Solutions Admin'
};

console.log('🔥 Creating Admin User');
console.log('=====================');

async function createAdminUser() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized');
    
    // Create user with email and password
    console.log(`📧 Creating user: ${adminUser.email}`);
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminUser.email, 
      adminUser.password
    );
    
    const user = userCredential.user;
    console.log('✅ User created successfully');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: adminUser.displayName
    });
    console.log('✅ Profile updated');
    
    // Create admin profile in Firestore
    const adminProfile = {
      uid: user.uid,
      email: user.email,
      displayName: adminUser.displayName,
      role: 'admin',
      isAdmin: true,
      createdAt: new Date().toISOString(),
      permissions: ['read', 'write', 'delete', 'admin'],
      createdBy: 'setup-script'
    };
    
    await setDoc(doc(db, 'users', user.uid), adminProfile);
    console.log('✅ Admin profile created in Firestore');
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('=====================================');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    console.log(`Display Name: ${adminUser.displayName}`);
    console.log(`Role: admin`);
    console.log('\nYou can now use these credentials to log in to the admin panel.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n⚠️  User already exists. You can use the existing credentials:');
      console.log(`Email: ${adminUser.email}`);
      console.log(`Password: ${adminUser.password}`);
    } else if (error.code === 'auth/weak-password') {
      console.log('\n⚠️  Password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n⚠️  Invalid email address format.');
    } else {
      console.log('\n❌ Unexpected error:', error.message);
    }
  }
}

// Run the script
createAdminUser();
