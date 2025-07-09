import React, { useState } from 'react';

const TestPaymentConnection = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');
    
    try {
      // Test health endpoint
      const healthResponse = await fetch('http://localhost:5000/api/health');
      const healthData = await healthResponse.json();
      
      setResult(prev => prev + '\n✅ Health check: ' + JSON.stringify(healthData, null, 2));
      
      // Test payment initiation
      const paymentData = {
        amount: 100,
        phone_number: '260123456789',
        order_id: 'TEST-' + Date.now(),
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        currency: 'EUR'
      };
      
      setResult(prev => prev + '\n\n🔄 Testing payment initiation...');
      
      const paymentResponse = await fetch('http://localhost:5000/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      
      const paymentResult = await paymentResponse.json();
      
      if (paymentResponse.ok) {
        setResult(prev => prev + '\n✅ Payment initiation: ' + JSON.stringify(paymentResult, null, 2));
      } else {
        setResult(prev => prev + '\n❌ Payment initiation failed: ' + JSON.stringify(paymentResult, null, 2));
      }
      
    } catch (error) {
      setResult(prev => prev + '\n❌ Connection error: ' + error.message);
      console.error('Connection test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Server Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Payment Server Connection'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected Results:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>✅ Health check should return server status</li>
            <li>✅ Payment initiation should return transaction details</li>
            <li>❌ If you see CORS errors, check browser console</li>
            <li>❌ If you see network errors, check if server is running on port 5000</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPaymentConnection;
