import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'admin@giftedsolutions.com',
    password: 'admin123456',
    displayName: 'Admin User'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createAdminUser = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Import Firebase auth functions
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore');
      const { auth, db } = await import('../services/firebase');

      console.log('🔥 Creating admin user...');

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // Update profile with display name
      if (formData.displayName) {
        await updateProfile(user, { displayName: formData.displayName });
      }

      // Create admin profile in Firestore
      const adminProfile = {
        uid: user.uid,
        email: user.email,
        displayName: formData.displayName || '',
        role: 'admin',
        isAdmin: true,
        createdAt: new Date().toISOString(),
        permissions: ['read', 'write', 'delete', 'admin']
      };

      await setDoc(doc(db, 'users', user.uid), adminProfile);

      setMessage({
        type: 'success',
        text: `Admin user created successfully! Email: ${formData.email}`
      });

      console.log('✅ Admin user created successfully');

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      
      let errorMessage = 'Failed to create admin user';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../services/firebase');

      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setMessage({
        type: 'success',
        text: 'Login test successful! Redirecting to admin panel...'
      });

      setTimeout(() => {
        navigate('/super-admin');
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: `Login test failed: ${error.message}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Admin User</h1>
            <p className="text-gray-600">Set up your admin account for Gifted Solutions</p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                {message.text}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Admin User"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="giftedsolutions20@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter password (min 6 characters)"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={createAdminUser}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Admin...' : 'Create Admin User'}
            </button>

            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Login
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Go to Login
            </button>

            <button
              onClick={() => navigate('/admin-access')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Admin Access Panel
            </button>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Default Credentials</h3>
            <div className="text-yellow-700 text-sm space-y-1">
              <p><strong>Email:</strong> admin@giftedsolutions.com</p>
              <p><strong>Password:</strong> admin123456</p>
              <p className="mt-2">Change these credentials after first login!</p>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📝 Instructions</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p>1. Click "Create Admin User" to set up the account</p>
              <p>2. Click "Test Login" to verify it works</p>
              <p>3. Use "Go to Login" to access the admin panel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;
