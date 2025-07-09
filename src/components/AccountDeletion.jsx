import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useDarkMode } from '../context/DarkModeContext';
import { Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const AccountDeletion = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: confirmation, 2: password, 3: final confirmation
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finalConfirmation, setFinalConfirmation] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const needsPassword = user && authService.needsReauthentication(user);
  const isEmailProvider = user?.providerData?.some(p => p.providerId === 'password');

  const handleDeleteAccount = async () => {
    if (step === 1) {
      if (needsPassword && isEmailProvider) {
        setStep(2);
      } else {
        setStep(3);
      }
      return;
    }

    if (step === 2) {
      if (!password.trim()) {
        setError('Please enter your password');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (finalConfirmation !== 'DELETE') {
        setError('Please type "DELETE" to confirm');
        return;
      }

      setLoading(true);
      setError('');

      try {
        await authService.deleteAccount(isEmailProvider ? password : null);
        
        // Clear any cached data
        localStorage.clear();
        sessionStorage.clear();
        
        // Navigate to home page
        navigate('/');
        
        // Show success message
        alert('Your account has been successfully deleted.');
      } catch (error) {
        console.error('Account deletion error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
        <AlertTriangle className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Delete Account</h3>
      </div>
      
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
          This action cannot be undone
        </h4>
        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
          <li>• Your account will be permanently deleted</li>
          <li>• All your data will be removed from our servers</li>
          <li>• Your order history will be lost</li>
          <li>• You will be immediately signed out</li>
        </ul>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Account Information
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Display Name:</strong> {user?.displayName || 'Not set'}</p>
          <p><strong>Account Type:</strong> {isEmailProvider ? 'Email/Password' : 'Social Login'}</p>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteAccount}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
        <AlertTriangle className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Confirm Your Password</h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        For security reasons, please enter your password to continue with account deletion.
      </p>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={!password.trim()}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
        <Trash2 className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Final Confirmation</h3>
      </div>
      
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-300 font-medium mb-2">
          This is your last chance to cancel!
        </p>
        <p className="text-red-700 dark:text-red-400 text-sm">
          Once you confirm, your account and all associated data will be permanently deleted.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type "DELETE" to confirm:
        </label>
        <input
          type="text"
          value={finalConfirmation}
          onChange={(e) => setFinalConfirmation(e.target.value)}
          placeholder="Type DELETE here"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          autoFocus
        />
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(needsPassword && isEmailProvider ? 2 : 1)}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={loading || finalConfirmation !== 'DELETE'}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Delete Account'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default AccountDeletion;
