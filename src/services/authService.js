// Firebase authentication enabled - using Supabase for storage
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  GoogleAuthProvider,

  signInWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const authService = {
  // Register new user
  async register(email, password, displayName) {
    try {
      console.log('🔥 Creating user with Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || '',
        role: 'customer',
        createdAt: new Date().toISOString(),
        isAdmin: false
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log('✅ User registered successfully');
      return { user, userProfile };
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  // Sign in user
  async login(email, password) {
    try {
      console.log('🔥 Signing in with Firebase Auth...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile from Firestore
      const userProfile = await this.getUserProfile(user.uid);
      console.log('✅ User signed in successfully');
      return { user, userProfile };
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  // Sign out user
  async logout() {
    try {
      console.log('🔥 Signing out...');
      await signOut(auth);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },

  // Get user profile from Firestore
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  },

  // Check if user is admin
  async isAdmin(user) {
    try {
      if (!user) return false;
      const userProfile = await this.getUserProfile(user.uid);
      return userProfile?.isAdmin === true || userProfile?.role === 'admin';
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }
  },

  // Update user profile
  async updateUserProfile(uid, profileData) {
    try {
      console.log('🔥 Updating user profile...');
      await updateDoc(doc(db, 'users', uid), {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ User profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  },

  // Create admin user
  async createAdminUser(email, password, displayName) {
    try {
      console.log('🔥 Creating admin user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create admin profile in Firestore
      const adminProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || '',
        role: 'admin',
        isAdmin: true,
        createdAt: new Date().toISOString(),
        permissions: ['read', 'write', 'delete', 'admin']
      };

      await setDoc(doc(db, 'users', user.uid), adminProfile);
      console.log('✅ Admin user created successfully');
      return { user, userProfile: adminProfile };
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      throw error;
    }
  },

  // Google Sign In
  async signInWithGoogle() {
    try {
      console.log('🔥 Signing in with Google...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists, create if not
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'customer',
          createdAt: new Date().toISOString(),
          isAdmin: false,
          provider: 'google'
        };
        await setDoc(userDocRef, userProfile);
        console.log('✅ New Google user profile created');
        return { user, userProfile };
      } else {
        const userProfile = userDoc.data();
        console.log('✅ Existing Google user signed in');
        return { user, userProfile };
      }
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      throw error;
    }
  },



  // Delete Account
  async deleteAccount(password = null) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      console.log('🗑️ Deleting user account...');

      // Re-authenticate if password provided (for email/password users)
      if (password && user.providerData[0]?.providerId === 'password') {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        console.log('✅ User re-authenticated');
      }

      // Delete user profile from Firestore
      try {
        await deleteDoc(doc(db, 'users', user.uid));
        console.log('✅ User profile deleted from Firestore');
      } catch (firestoreError) {
        console.warn('⚠️ Could not delete user profile from Firestore:', firestoreError);
      }

      // Delete user from Firebase Auth
      await deleteUser(user);
      console.log('✅ User account deleted successfully');

      return true;
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      throw error;
    }
  },

  // Check if user needs re-authentication for account deletion
  needsReauthentication(user) {
    if (!user) return false;

    // Check if user signed in with email/password
    const emailProvider = user.providerData.find(p => p.providerId === 'password');
    if (emailProvider) {
      // Check if last sign in was more than 5 minutes ago
      const lastSignIn = new Date(user.metadata.lastSignInTime);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return lastSignIn < fiveMinutesAgo;
    }

    return false;
  }
};
