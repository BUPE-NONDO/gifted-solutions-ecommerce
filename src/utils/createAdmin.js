// Admin User Creation Utility
// This file helps create the first admin user for your application

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

/**
 * Creates an admin user in Firebase Auth and Firestore
 * This should only be used once to create the initial admin user
 * 
 * @param {string} email - Admin email address
 * @param {string} password - Admin password (minimum 6 characters)
 * @param {string} displayName - Admin display name
 * @returns {Promise} - Promise that resolves when admin is created
 */
export const createAdminUser = async (email, password, displayName) => {
  try {
    console.log('Creating admin user...');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User created in Firebase Auth:', user.uid);
    
    // Update user profile
    await updateProfile(user, { displayName });
    
    // Create admin user document in Firestore with admin role
    const adminProfile = {
      uid: user.uid,
      email: user.email,
      displayName,
      role: 'admin', // This is the key field that makes the user an admin
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      permissions: {
        manageProducts: true,
        manageOrders: true,
        manageUsers: true,
        manageCategories: true,
        viewAnalytics: true
      }
    };
    
    await setDoc(doc(db, 'users', user.uid), adminProfile);
    
    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('UID:', user.uid);
    console.log('Role: admin');
    
    return {
      success: true,
      user: user,
      profile: adminProfile
    };
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

/**
 * Promotes an existing user to admin
 * 
 * @param {string} userId - The UID of the user to promote
 * @returns {Promise} - Promise that resolves when user is promoted
 */
export const promoteToAdmin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      role: 'admin',
      updatedAt: new Date(),
      permissions: {
        manageProducts: true,
        manageOrders: true,
        manageUsers: true,
        manageCategories: true,
        viewAnalytics: true
      }
    }, { merge: true });
    
    console.log('User promoted to admin:', userId);
    return { success: true };
    
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};

// Example usage (uncomment and modify as needed):
/*
// To create your first admin user, you can call this function
// Make sure to do this only once and then remove/comment out the call

const setupInitialAdmin = async () => {
  try {
    await createAdminUser(
      'admin@giftedsolutions.com',  // Replace with your admin email
      'your-secure-password',       // Replace with a secure password
      'Admin User'                  // Replace with admin display name
    );
  } catch (error) {
    console.error('Failed to create admin:', error);
  }
};

// Uncomment the line below to create the admin user
// setupInitialAdmin();
*/
