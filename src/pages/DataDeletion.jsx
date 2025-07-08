import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Mail, Phone, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

const DataDeletion = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);

  const handleDeleteRequest = async () => {
    if (!user) {
      alert('Please log in to delete your account');
      return;
    }

    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      setDeletionRequested(true);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (deletionRequested) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Account Deleted Successfully
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your account and all associated data have been permanently deleted.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
              <Trash2 className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Data Deletion Instructions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Learn how to delete your personal data from our platform
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          {/* Quick Account Deletion */}
          {user && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <div className="flex items-center mb-6">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Delete Your Account
                </h2>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                      Warning: This action is permanent
                    </h3>
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      Deleting your account will permanently remove all your data, including:
                    </p>
                    <ul className="list-disc list-inside text-red-700 dark:text-red-400 text-sm mt-2 ml-4">
                      <li>Profile information</li>
                      <li>Order history</li>
                      <li>Saved preferences</li>
                      <li>Account settings</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </button>
              </div>
            </div>
          )}

          {/* Manual Deletion Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Manual Data Deletion Request
              </h2>
            </div>

            <div className="space-y-6 text-gray-600 dark:text-gray-300">
              <p>
                If you prefer to request data deletion manually or need assistance, 
                you can contact us directly:
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                    <span>Email: privacy@giftedsolutions.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                    <span>Phone: +260 XXX XXX XXX</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Information to Include in Your Request:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your full name</li>
                  <li>Email address associated with your account</li>
                  <li>Phone number (if provided)</li>
                  <li>Specific data you want deleted</li>
                  <li>Reason for deletion (optional)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Processing Time:
                </h3>
                <p>
                  We will process your data deletion request within 30 days of receiving 
                  a valid request. You will receive a confirmation email once the deletion 
                  is complete.
                </p>
              </div>
            </div>
          </div>

          {/* What Data We Delete */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              What Data We Delete
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Personal Information:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                  <li>Name and contact details</li>
                  <li>Account credentials</li>
                  <li>Profile preferences</li>
                  <li>Communication history</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Transaction Data:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                  <li>Order history</li>
                  <li>Payment information</li>
                  <li>Shipping addresses</li>
                  <li>Purchase preferences</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                <strong>Note:</strong> Some data may be retained for legal or business purposes 
                as required by law, such as transaction records for tax purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="text-center mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Confirm Account Deletion
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to permanently delete your account? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRequest}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDeletion;
