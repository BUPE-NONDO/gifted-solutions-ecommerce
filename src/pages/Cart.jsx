import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, parsePrice } from '../utils/priceUtils';
import MTNMomoCheckout from '../components/MTNMomoCheckout';
import CartDiscountSummary from '../components/CartDiscountSummary';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Calculator,
  CreditCard,
  ShoppingCart as CartIcon,
  Smartphone
} from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    formatCurrency,
    subtotal,
    shipping,
    tax,
    total,
    itemCount
  } = useCart();

  const [showMTNCheckout, setShowMTNCheckout] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    // Create WhatsApp message with cart details
    const cartDetails = items.map(item => {
      const formattedPrice = typeof item.price === 'string' && item.price.startsWith('K')
        ? item.price
        : formatPrice(parsePrice(item.price));
      return `${item.name} - Qty: ${item.quantity} - ${formattedPrice} each`;
    }).join('\n');

    const message = `Hello! I would like to order the following items:\n\n${cartDetails}\n\nTotal: ${formatCurrency(total)}\n\nPlease let me know about payment and delivery options.`;

    const whatsappUrl = `https://wa.me/260779421717?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMTNMomoCheckout = () => {
    setShowMTNCheckout(true);
  };

  const handleMTNMomoSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    setShowMTNCheckout(false);
    navigate('/');
  };

  const handleMTNMomoClose = () => {
    setShowMTNCheckout(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link
            to="/shop"
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="mr-2" size={20} />
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center transition-colors duration-200">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/shop"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
            >
              <CartIcon className="mr-2" size={20} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <p className="text-sm font-medium text-primary-600 mt-1">
                            {typeof item.price === 'string' && item.price.startsWith('K')
                              ? item.price
                              : formatPrice(parsePrice(item.price))
                            } each
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="rounded-full p-1 text-gray-400 hover:text-gray-600 border border-gray-300 hover:border-gray-400"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="rounded-full p-1 text-gray-400 hover:text-gray-600 border border-gray-300 hover:border-gray-400"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(
                              (() => {
                                let price = 0;
                                if (typeof item.price === 'string') {
                                  price = parseFloat(item.price.replace(/[^\d.,]/g, '').replace(',', ''));
                                } else if (typeof item.price === 'number') {
                                  price = item.price;
                                }
                                return price * item.quantity;
                              })()
                            )}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-full p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bulk Discount Summary */}
            <div className="lg:col-span-1 mb-6">
              <CartDiscountSummary />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({itemCount}):</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-3 mb-4">
                  {/* MTN MOMO Payment Button */}
                  <button
                    onClick={handleMTNMomoCheckout}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                  >
                    <Smartphone className="h-5 w-5 mr-2" />
                    Pay with MTN MOMO
                  </button>

                  {/* Divider */}
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  {/* WhatsApp Order Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                    </svg>
                    Order via WhatsApp
                  </button>
                </div>

                {/* Payment Methods */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Secure payment options available:</p>
                  <div className="flex justify-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      MTN MOMO
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      WhatsApp
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      Cash on Delivery
                    </span>
                  </div>
                </div>

                {/* Contact Notice */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    📞 Direct contact: 0779421717
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MTN MOMO Checkout Modal */}
      <MTNMomoCheckout
        isOpen={showMTNCheckout}
        onClose={handleMTNMomoClose}
        onSuccess={handleMTNMomoSuccess}
      />
    </div>
  );
};

export default Cart;
