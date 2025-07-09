import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Home } from 'lucide-react';

const SafeLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'admin@giftedsolutions.com',
    password: 'admin123456'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      console.log('🔥 Attempting safe login...');

      // Import Firebase auth functions dynamically
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../services/firebase');

      // Attempt login
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      const user = userCredential.user;
      console.log('✅ Login successful:', user.email);

      setMessage({
        type: 'success',
        text: 'Login successful! Redirecting to admin panel...'
      });

      // Redirect to super admin
      setTimeout(() => {
        navigate('/super-admin');
      }, 2000);

    } catch (error) {
      console.error('❌ Login error:', error);

      let errorMessage = 'Login failed';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Create an admin account first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your internet connection.';
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Admin Account',
      description: 'Set up a new admin user',
      action: () => navigate('/create-admin'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Super Admin Panel',
      description: 'Access super admin dashboard',
      action: () => navigate('/super-admin'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Database Test',
      description: 'Test database connections',
      action: () => navigate('/database-test'),
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Image Tools',
      description: 'Manage product images',
      action: () => navigate('/image-tools'),
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600">Sign in to Gifted Solutions Admin Panel</p>
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

          <form onSubmit={handleLogin} className="space-y-4">
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="admin@giftedsolutions.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white px-3 py-2 rounded text-xs hover:opacity-90 transition-opacity`}
                  title={action.description}
                >
                  {action.title}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Website
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🔑 Default Credentials</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p><strong>Email:</strong> admin@giftedsolutions.com</p>
              <p><strong>Password:</strong> admin123456</p>
              <p className="mt-2 text-xs">If this doesn't work, create an admin account first.</p>
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Troubleshooting</h3>
            <div className="text-yellow-700 text-sm space-y-1">
              <p>• If login fails, try "Create Admin Account" first</p>
              <p>• Use "Simple Admin" for basic functions without auth</p>
              <p>• Check "Debug Tools" if you encounter errors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeLogin;
