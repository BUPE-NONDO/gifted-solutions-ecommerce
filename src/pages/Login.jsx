import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import SocialLoginButtons from '../components/SocialLoginButtons';
import DemoSocialAuth from '../components/DemoSocialAuth';

const Login = () => {
  const { login, loginWithGoogle, loginWithTwitter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const from = location.state?.from?.pathname || '/super-admin';

  const onSubmit = async (data, event) => {
    // Prevent form submission and page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔥 Attempting login with:', data.email);
      console.log('🔥 Current domain:', window.location.origin);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('❌ Login error details:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setError(`Firebase: Error (${error.code || 'unknown'})`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSuccess = async (userData, provider) => {
    console.log(`✅ ${provider} login successful:`, userData);
    setError('');

    // For demo purposes, show success message
    alert(`Demo ${provider} authentication successful!\n\nUser: ${userData.displayName}\nEmail: ${userData.email}\n\nIn production, this would create/login the user automatically.`);

    // In production, this would automatically log the user in
    // For now, just redirect to home
    navigate(from, { replace: true });
  };

  const handleSocialError = (error, provider) => {
    console.error(`❌ ${provider} login failed:`, error);
    setError(`${provider} sign-in failed: ${error}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg transition-colors duration-200">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-green-600 hover:text-green-700"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  defaultValue="admin@giftedsolutions.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-600 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-green-600 hover:text-green-700">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6">
            <SocialLoginButtons
              onSuccess={handleSocialSuccess}
              onError={handleSocialError}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
