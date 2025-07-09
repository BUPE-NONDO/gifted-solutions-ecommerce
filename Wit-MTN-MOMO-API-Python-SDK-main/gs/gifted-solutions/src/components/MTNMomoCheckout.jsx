import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  CreditCard,
  Phone,
  User,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft
} from 'lucide-react';

const MTNMomoCheckout = ({ isOpen, onClose, onSuccess }) => {
  const { items, total, formatCurrency, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Verification, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [orderId, setOrderId] = useState('');

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const generateOrderId = () => {
    return `GS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleInputChange = (field, value) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateDetails = () => {
    const { name, email, phone } = customerDetails;
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    if (!phone.trim()) return 'Phone number is required';
    if (!/^[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number (10-15 digits)';
    }
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    return null;
  };

  const handleProceedToPayment = () => {
    const validation = validateDetails();
    if (validation) {
      setError(validation);
      return;
    }
    setStep(2);
  };

  const initiatePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const newOrderId = generateOrderId();
      setOrderId(newOrderId);

      const paymentData = {
        amount: total,
        phone_number: customerDetails.phone.replace(/\s/g, ''),
        order_id: newOrderId,
        customer_name: customerDetails.name,
        currency: 'EUR' // Using EUR for sandbox
      };

      const response = await fetch('http://localhost:5000/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.success) {
        setTransactionId(result.transaction_id);
        setStep(3);
        // Start verification polling
        startVerificationPolling(result.transaction_id);
      } else {
        setError(result.error || 'Payment initiation failed');
      }
    } catch (err) {
      setError('Network error. Please check if the payment server is running.');
    } finally {
      setLoading(false);
    }
  };

  const startVerificationPolling = (txnId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/payment/verify/${txnId}`);
        const result = await response.json();

        if (result.success) {
          if (result.status === 'SUCCESSFUL') {
            clearInterval(pollInterval);
            setStep(4);
            clearCart();
            if (onSuccess) onSuccess(result);
          } else if (result.status === 'FAILED') {
            clearInterval(pollInterval);
            setError('Payment failed. Please try again.');
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Verification polling error:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (step === 3) {
        setError('Payment verification timeout. Please contact support.');
        setStep(2);
      }
    }, 300000);
  };

  const handleClose = () => {
    setStep(1);
    setError('');
    setTransactionId('');
    setOrderId('');
    setCustomerDetails({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="bg-primary-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {step === 1 && 'Customer Details'}
                {step === 2 && 'MTN MOMO Payment'}
                {step === 3 && 'Verifying Payment'}
                {step === 4 && 'Payment Successful'}
              </h2>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 flex space-x-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-2 flex-1 rounded ${
                    stepNum <= step ? 'bg-white' : 'bg-primary-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 flex items-center rounded-lg bg-red-50 p-3 text-red-700">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Step 1: Customer Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    MTN Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., 260779421717"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your MTN MOMO number (without spaces)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={customerDetails.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="Enter delivery address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={customerDetails.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="Enter your city"
                  />
                </div>

                {/* Order Summary */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Items ({items.length})</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-lg bg-yellow-50 p-4">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-yellow-800">MTN MOMO Payment</h3>
                      <p className="text-sm text-yellow-700">
                        Amount: {formatCurrency(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Customer:</strong> {customerDetails.name}</p>
                  <p><strong>Phone:</strong> {customerDetails.phone}</p>
                  <p><strong>Order ID:</strong> {orderId || 'Will be generated'}</p>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Payment Instructions:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Click "Pay with MTN MOMO" below</li>
                    <li>2. Check your phone for MTN MOMO prompt</li>
                    <li>3. Enter your MTN MOMO PIN</li>
                    <li>4. Confirm the payment</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {step === 3 && (
              <div className="text-center space-y-4">
                <Loader className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
                <h3 className="text-lg font-medium">Verifying Payment...</h3>
                <p className="text-gray-600">
                  Please complete the payment on your phone. We're waiting for confirmation.
                </p>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Transaction ID:</strong> {transactionId}
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-xl font-bold text-green-800">Payment Successful!</h3>
                <p className="text-gray-600">
                  Thank you for your purchase. Your order has been confirmed.
                </p>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-700">
                    <strong>Order ID:</strong> {orderId}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Amount:</strong> {formatCurrency(total)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4">
            {step === 1 && (
              <button
                onClick={handleProceedToPayment}
                className="w-full rounded-lg bg-primary-600 py-3 text-white font-medium hover:bg-primary-700"
              >
                Proceed to Payment
              </button>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <button
                  onClick={initiatePayment}
                  disabled={loading}
                  className="w-full rounded-lg bg-yellow-600 py-3 text-white font-medium hover:bg-yellow-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Initiating Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with MTN MOMO
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Details
                </button>
              </div>
            )}

            {step === 4 && (
              <button
                onClick={handleClose}
                className="w-full rounded-lg bg-green-600 py-3 text-white font-medium hover:bg-green-700"
              >
                Continue Shopping
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MTNMomoCheckout;
