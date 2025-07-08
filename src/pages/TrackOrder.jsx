import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import supabaseService from '../services/supabase';
import {
  Package,
  Search,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
  Loader,
  ArrowLeft,
  Eye
} from 'lucide-react';

const TrackOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [searchTracking, setSearchTracking] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await supabaseService.getUserOrders(user.uid);
      setOrders(userOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const searchByTracking = async () => {
    if (!searchTracking.trim()) return;
    
    try {
      setSearchLoading(true);
      setError('');
      const order = await supabaseService.searchOrderByTracking(searchTracking.trim());
      
      if (order) {
        setSelectedOrder(order);
        const history = await supabaseService.getTrackingHistory(order.id);
        setTrackingHistory(history);
      } else {
        setError('No order found with this tracking number');
      }
    } catch (err) {
      console.error('Error searching order:', err);
      setError('Failed to search order');
    } finally {
      setSearchLoading(false);
    }
  };

  const viewOrderDetails = async (order) => {
    try {
      setSelectedOrder(order);
      const history = await supabaseService.getTrackingHistory(order.id);
      setTrackingHistory(history);
    } catch (err) {
      console.error('Error loading tracking history:', err);
      setError('Failed to load tracking details');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'order_placed':
      case 'payment_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
      case 'preparing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <Package className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return `K${new Intl.NumberFormat('en-US').format(amount)}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to track your orders</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Orders</h1>
          <p className="text-gray-600 mt-2">Monitor your order status and delivery progress</p>
        </div>

        {/* Search by Tracking Number */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search by Tracking Number</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter tracking number (e.g., GS12345678ABCD)"
                value={searchTracking}
                onChange={(e) => setSearchTracking(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && searchByTracking()}
              />
            </div>
            <button
              onClick={searchByTracking}
              disabled={searchLoading || !searchTracking.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {searchLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span className="ml-2">Search</span>
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">#{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            {order.items?.length || 0} item(s) • {formatCurrency(order.total_amount)}
                          </p>
                          {order.tracking_number && (
                            <p className="text-xs text-blue-600 mt-1">
                              Tracking: {order.tracking_number}
                            </p>
                          )}
                        </div>
                        <Eye className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Details & Tracking */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedOrder ? 'Order Details' : 'Select an Order'}
              </h2>
            </div>
            
            <div className="p-6">
              {!selectedOrder ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select an order to view tracking details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{selectedOrder.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium">{formatCurrency(selectedOrder.total_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{selectedOrder.payment_method?.toUpperCase()}</span>
                      </div>
                      {selectedOrder.tracking_number && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tracking Number:</span>
                          <span className="font-medium text-blue-600">{selectedOrder.tracking_number}</span>
                        </div>
                      )}
                      {selectedOrder.estimated_delivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Delivery:</span>
                          <span className="font-medium">
                            {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Tracking Timeline</h3>
                    <div className="space-y-4">
                      {selectedOrder.tracking_updates?.map((update, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(update.status)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {update.status.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">{update.description}</p>
                            {update.location && (
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {update.location}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(update.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Items Ordered</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.total || item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
