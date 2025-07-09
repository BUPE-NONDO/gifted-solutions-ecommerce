import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { RefreshCw, CheckCircle, AlertCircle, Package, Plus } from 'lucide-react';

const RealTimeProductTest = () => {
  const { products, loading, addProduct, refreshProducts } = useProducts();
  const [testStatus, setTestStatus] = useState('idle');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [eventLog, setEventLog] = useState([]);

  // Listen for product update events
  useEffect(() => {
    const handleProductUpdate = (event) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = {
        timestamp,
        type: event.detail.type,
        data: event.detail,
        id: Date.now()
      };
      
      setEventLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 events
      setLastUpdate(timestamp);
    };

    window.addEventListener('productDataUpdated', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productDataUpdated', handleProductUpdate);
    };
  }, []);

  const addTestProduct = async () => {
    setTestStatus('adding');
    try {
      const testProduct = {
        name: `Test Product ${Date.now()}`,
        description: 'This is a test product added to verify real-time updates',
        price: `K${Math.floor(Math.random() * 1000) + 100}`,
        category: 'Test Category',
        image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
        inStock: true,
        featured: false
      };

      await addProduct(testProduct);
      setTestStatus('success');
      
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (error) {
      console.error('Test product addition failed:', error);
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const clearEventLog = () => {
    setEventLog([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Product Updates Test</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshProducts}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={addTestProduct}
            disabled={testStatus === 'adding'}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            {testStatus === 'adding' ? 'Adding...' : 'Add Test Product'}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Total Products</p>
              <p className="text-xl font-bold text-blue-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Last Update</p>
              <p className="text-sm font-bold text-green-900">{lastUpdate || 'None'}</p>
            </div>
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${
          testStatus === 'success' ? 'bg-green-50 border-green-200' :
          testStatus === 'error' ? 'bg-red-50 border-red-200' :
          testStatus === 'adding' ? 'bg-yellow-50 border-yellow-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center">
            {testStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : testStatus === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            ) : testStatus === 'adding' ? (
              <RefreshCw className="w-5 h-5 text-yellow-600 mr-2 animate-spin" />
            ) : (
              <Package className="w-5 h-5 text-gray-600 mr-2" />
            )}
            <div>
              <p className="text-sm font-medium">Test Status</p>
              <p className="text-sm font-bold capitalize">{testStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Real-Time Event Log</h4>
          <button
            onClick={clearEventLog}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Log
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {eventLog.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No events yet. Try adding a product from the admin panel.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {eventLog.map((event) => (
                <div key={event.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        event.type === 'added' ? 'bg-green-500' :
                        event.type === 'updated' ? 'bg-blue-500' :
                        event.type === 'deleted' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        Product {event.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                  {event.data.product && (
                    <p className="text-xs text-gray-600 mt-1 ml-4">
                      {event.data.product.name} - {event.data.product.price}
                    </p>
                  )}
                  {event.data.productId && !event.data.product && (
                    <p className="text-xs text-gray-600 mt-1 ml-4">
                      Product ID: {event.data.productId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 mb-2">How to Test Real-Time Updates:</h5>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Open the admin panel in another tab (/admin)</li>
          <li>2. Add, edit, or delete a product in the admin panel</li>
          <li>3. Watch this component update in real-time without refreshing</li>
          <li>4. Check the event log to see the update events</li>
          <li>5. Verify the product count changes immediately</li>
        </ol>
      </div>
    </div>
  );
};

export default RealTimeProductTest;
