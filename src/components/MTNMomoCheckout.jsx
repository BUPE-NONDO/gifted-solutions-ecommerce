import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import supabaseService from '../services/supabase';
import {
  CreditCard,
  Phone,
  User,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  LogIn,
  X
} from 'lucide-react';

const MTNMomoCheckout = ({ isOpen, onClose, onSuccess }) => {
  const { items, total, formatCurrency, clearCart } = useCart();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
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

  // Initialize customer details from user profile
  useEffect(() => {
    if (user && userProfile) {
      setCustomerDetails({
        name: userProfile.displayName || user.displayName || '',
        email: user.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        city: userProfile.city || ''
      });
    }
  }, [user, userProfile]);

  // Check if user is authenticated
  if (!user) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Login Required</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center">
            <LogIn className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              You need to create an account or login to complete your purchase.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Existing Account
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/register');
                }}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create New Account
              </button>

              <button
                onClick={onClose}
                className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
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
        customer_email: customerDetails.email,
        currency: 'EUR' // Default to EUR for sandbox
      };

      console.log('Initiating payment with data:', paymentData);

      const response = await fetch('http://localhost:5000/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      console.log('Payment initiation result:', result);

      if (result.success) {
        setTransactionId(result.transaction_id);

        // Create order in database
        try {
          const orderData = {
            userId: user.uid,
            userEmail: user.email,
            paymentMethod: 'mtn_momo',
            paymentStatus: 'pending',
            paymentReference: result.transaction_id,
            totalAmount: total,
            currency: 'EUR',
            customerDetails: customerDetails,
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              total: item.price * item.quantity
            })),
            shippingAddress: {
              address: customerDetails.address,
              city: customerDetails.city,
              phone: customerDetails.phone
            }
          };

          console.log('Creating order with data:', orderData);
          const createdOrder = await supabaseService.createOrder(orderData);
          console.log('Order created in database:', createdOrder);

          setStep(3); // Move to verification step
          startPaymentVerification(result.transaction_id, createdOrder.id);
        } catch (orderError) {
          console.error('Failed to create order:', orderError);
          console.error('Order error details:', {
            message: orderError.message,
            stack: orderError.stack,
            orderData: orderData
          });
          setError(`Failed to create order: ${orderError.message}. Please try again.`);
        }
      } else {
        setError(result.error || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Network error. Please check if the payment server is running.');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentVerification = (txnId, orderId) => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/payment/verify/${txnId}`);
        const result = await response.json();

        console.log('Payment verification result:', result);

        if (result.success && result.status === 'completed') {
          // Update order status to paid
          try {
            await supabaseService.updateOrderStatus(orderId, 'paid', 'Payment completed successfully');

            // Add initial tracking update
            await supabaseService.addTrackingUpdate(orderId, {
              trackingNumber: await supabaseService.generateTrackingNumber(),
              status: 'payment_confirmed',
              location: 'Lusaka, Zambia',
              description: 'Payment confirmed. Order is being prepared for shipment.',
              createdBy: 'system'
            });

            console.log('Order status updated to paid');
          } catch (updateError) {
            console.error('Failed to update order status:', updateError);
          }

          setStep(4); // Move to success step
          setTimeout(() => {
            clearCart();
            onSuccess && onSuccess();
            handleClose();
          }, 3000);
        } else if (result.status === 'failed') {
          // Update order status to failed
          try {
            await supabaseService.updateOrderStatus(orderId, 'failed', 'Payment failed');
          } catch (updateError) {
            console.error('Failed to update order status:', updateError);
          }

          setError('Payment failed. Please try again.');
          setStep(2); // Go back to payment step
        }
        // If still pending, continue polling
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment status');
      }
    };

    // Start verification polling
    const verificationInterval = setInterval(verifyPayment, 3000);
    
    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(verificationInterval);
      if (step === 3) {
        setError('Payment verification timeout. Please contact support.');
      }
    }, 300000);

    // Store interval ID to clear it when component unmounts or payment completes
    return verificationInterval;
  };

  const handleClose = () => {
    setStep(1);
    setLoading(false);
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

  const handleNextStep = () => {
    const validationError = validateDetails();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 && 'Customer Details'}
            {step === 2 && 'Payment Confirmation'}
            {step === 3 && 'Payment Processing'}
            {step === 4 && 'Payment Successful'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum < step ? '✓' : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-8 h-1 ${
                    stepNum < step ? 'bg-yellow-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Customer Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number (MTN MOMO) *
                </label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="260779421717"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use test number: 260779421717 for sandbox testing
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={customerDetails.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Items ({items.length})</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleNextStep}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment Confirmation */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">Payment Details</h3>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Amount:</strong> {formatCurrency(total)}</p>
                  <p><strong>Phone:</strong> {customerDetails.phone}</p>
                  <p><strong>Name:</strong> {customerDetails.name}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Click "Pay with MTN MOMO" below</li>
                  <li>You'll receive a payment prompt on your phone</li>
                  <li>Enter your MTN MOMO PIN to confirm</li>
                  <li>Payment will be verified automatically</li>
                </ol>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

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
            </div>
          )}

          {/* Step 3: Payment Verification */}
          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <Loader className="h-12 w-12 animate-spin text-yellow-500" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Complete payment on your phone
                </h3>
                <p className="text-gray-600 mb-4">
                  Check your phone for the MTN MOMO payment prompt and enter your PIN to complete the transaction.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-blue-800 mb-2">Payment Details:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Amount:</strong> {formatCurrency(total)}</p>
                    <p><strong>Order ID:</strong> {orderId}</p>
                    <p><strong>Transaction ID:</strong> {transactionId}</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>⏱️ Waiting for payment confirmation...</p>
                <p>This usually takes 10-30 seconds</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  Payment Successful! 🎉
                </h3>
                <p className="text-gray-600 mb-4">
                  Your order has been confirmed and will be processed shortly.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Order Details:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Order ID:</strong> {orderId}</p>
                    <p><strong>Amount Paid:</strong> {formatCurrency(total)}</p>
                    <p><strong>Payment Method:</strong> MTN MOMO</p>
                    <p><strong>Status:</strong> Confirmed ✅</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>📧 A confirmation email has been sent to {customerDetails.email}</p>
                <p>📱 You will receive SMS updates about your order</p>
              </div>

              <p className="text-sm text-gray-600">
                This window will close automatically in a few seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MTNMomoCheckout;
