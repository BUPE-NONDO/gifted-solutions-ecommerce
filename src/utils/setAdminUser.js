/**
 * Set Admin User Utility
 * Updates user privileges to admin status in Firebase Firestore
 */

import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Target user ID to make admin
const ADMIN_USER_ID = '91f02f22-c5db-4a6e-8e66-8fb739ddd475';

/**
 * Set user as admin in Firebase Firestore
 */
export const setUserAsAdmin = async (userId = ADMIN_USER_ID) => {
  try {
    console.log(`🔥 Setting user ${userId} as admin...`);
    
    // Check if user document exists
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing user to admin
      await updateDoc(userDocRef, {
        role: 'admin',
        isAdmin: true,
        permissions: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_products'],
        adminSince: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ User updated to admin successfully');
      return { success: true, action: 'updated', userId };
    } else {
      // Create new admin user document
      const adminProfile = {
        uid: userId,
        role: 'admin',
        isAdmin: true,
        permissions: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_products'],
        displayName: 'Admin User',
        email: 'admin@giftedsolutions.com', // You can update this
        createdAt: new Date().toISOString(),
        adminSince: new Date().toISOString(),
        notes: 'Admin user created via utility'
      };
      
      await setDoc(userDocRef, adminProfile);
      
      console.log('✅ Admin user created successfully');
      return { success: true, action: 'created', userId, profile: adminProfile };
    }
  } catch (error) {
    console.error('❌ Error setting user as admin:', error);
    return { success: false, error: error.message, userId };
  }
};

/**
 * Verify admin status
 */
export const verifyAdminStatus = async (userId = ADMIN_USER_ID) => {
  try {
    console.log(`🔍 Verifying admin status for user ${userId}...`);
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isAdmin = userData.isAdmin === true || userData.role === 'admin';
      
      console.log(`✅ User admin status: ${isAdmin ? 'ADMIN' : 'NOT ADMIN'}`);
      
      return {
        success: true,
        userId,
        isAdmin,
        role: userData.role,
        permissions: userData.permissions || [],
        profile: userData
      };
    } else {
      console.log('❌ User document not found');
      return { success: false, error: 'User not found', userId };
    }
  } catch (error) {
    console.error('❌ Error verifying admin status:', error);
    return { success: false, error: error.message, userId };
  }
};

/**
 * List all admin users
 */
export const listAdminUsers = async () => {
  try {
    console.log('🔍 Listing all admin users...');
    
    // Note: This would require a query, but for now we'll check the specific user
    const result = await verifyAdminStatus(ADMIN_USER_ID);
    
    if (result.success && result.isAdmin) {
      return {
        success: true,
        adminUsers: [result.profile],
        count: 1
      };
    } else {
      return {
        success: true,
        adminUsers: [],
        count: 0
      };
    }
  } catch (error) {
    console.error('❌ Error listing admin users:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove admin privileges
 */
export const removeAdminPrivileges = async (userId = ADMIN_USER_ID) => {
  try {
    console.log(`🔥 Removing admin privileges for user ${userId}...`);
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        role: 'customer',
        isAdmin: false,
        permissions: ['read'],
        adminRemovedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Admin privileges removed successfully');
      return { success: true, userId };
    } else {
      return { success: false, error: 'User not found', userId };
    }
  } catch (error) {
    console.error('❌ Error removing admin privileges:', error);
    return { success: false, error: error.message, userId };
  }
};

/**
 * Auto-run: Set the specified user as admin
 */
export const autoSetAdmin = async () => {
  console.log('🚀 Auto-setting admin user...');
  console.log(`Target User ID: ${ADMIN_USER_ID}`);
  
  try {
    // Set user as admin
    const setResult = await setUserAsAdmin(ADMIN_USER_ID);
    console.log('Set Admin Result:', setResult);
    
    // Verify the change
    const verifyResult = await verifyAdminStatus(ADMIN_USER_ID);
    console.log('Verification Result:', verifyResult);
    
    return {
      success: setResult.success && verifyResult.success && verifyResult.isAdmin,
      setResult,
      verifyResult,
      userId: ADMIN_USER_ID
    };
  } catch (error) {
    console.error('❌ Auto-set admin failed:', error);
    return { success: false, error: error.message };
  }
};

// Export the target user ID for reference
export const TARGET_ADMIN_USER_ID = ADMIN_USER_ID;

export default {
  setUserAsAdmin,
  verifyAdminStatus,
  listAdminUsers,
  removeAdminPrivileges,
  autoSetAdmin,
  TARGET_ADMIN_USER_ID
};
