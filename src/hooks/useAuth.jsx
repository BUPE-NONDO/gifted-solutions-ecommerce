import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { authService } from '../services/authService';
import {
  signInWithGoogle,

  signInWithTwitter,
  formatUserData
} from '../config/firebase';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('🔥 Setting up Firebase Auth listener...');

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        console.log('✅ User authenticated:', firebaseUser.email);
        setUser(firebaseUser);

        // Get user profile from Firestore
        try {
          const profile = await authService.getUserProfile(firebaseUser.uid);
          setUserProfile(profile);

          // Check admin status
          const adminStatus = await authService.isAdmin(firebaseUser);
          setIsAdmin(adminStatus);

          console.log('✅ User profile loaded:', profile?.role || 'customer');
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } else {
        console.log('🔓 User not authenticated');
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await authService.login(email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    try {
      await authService.register(email, password, displayName);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (user) {
        await authService.updateUserProfile(user.uid, profileData);
        // Update local state
        setUserProfile(prev => ({ ...prev, ...profileData }));
      }
    } catch (error) {
      throw error;
    }
  };

  // Social media authentication methods
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // Firebase auth state change will handle the rest
        return result;
      } else {
        setLoading(false);
        throw new Error(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };



  const loginWithTwitter = async () => {
    setLoading(true);
    try {
      const result = await signInWithTwitter();
      if (result.success) {
        // Firebase auth state change will handle the rest
        return result;
      } else {
        setLoading(false);
        throw new Error(result.error || 'Twitter sign-in failed');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    loginWithGoogle,
    loginWithTwitter
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
