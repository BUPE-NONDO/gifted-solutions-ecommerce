import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import MTNMomoCheckout from './MTNMomoCheckout';
import CartDiscountSummary from './CartDiscountSummary';
import {
  ShoppingCart as CartIcon,
  Plus,
  Minus,
  Trash2,
  X,
  ShoppingBag,
  CreditCard,
  Truck,
  Calculator,
  Smartphone
} from 'lucide-react';

const ShoppingCart = ({ isOpen, onClose }) => {
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

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showMTNCheckout, setShowMTNCheckout] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);

    // Create WhatsApp message with cart details
    const cartDetails = items.map(item =>
      `${item.name} - Qty: ${item.quantity} - ${item.price} each`
    ).join('\n');

    const message = `Hello! I would like to order the following items:\n\n${cartDetails}\n\nTotal: ${formatCurrency(total)}\n\nPlease let me know about payment and delivery options.`;

    const whatsappUrl = `https://wa.me/260779421717?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setIsCheckingOut(false);
    onClose();
  };

  const handleMTNMomoCheckout = () => {
    setShowMTNCheckout(true);
  };

  const handleMTNMomoSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    setShowMTNCheckout(false);
    onClose();
  };

  const handleMTNMomoClose = () => {
    setShowMTNCheckout(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <CartIcon className="mr-2 h-6 w-6 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Shopping Cart ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Add some products to get started
                </p>
                <button
                  onClick={onClose}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                    {/* Product Image */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
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
                      <p className="text-sm font-medium text-primary-600">
                        {item.price}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-full p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Clear Cart Button */}
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-sm text-red-600 hover:text-red-700 py-2"
                  >
                    Clear all items
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bulk Discount Summary */}
          {items.length > 0 && (
            <div className="px-6 py-4">
              <CartDiscountSummary />
            </div>
          )}

          {/* Cart Summary */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              {/* Calculations */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({itemCount}):</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
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
                  <span className="px-3 text-xs text-gray-500 bg-white">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* WhatsApp Order Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Opening WhatsApp...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                      </svg>
                      Order via WhatsApp
                    </>
                  )}
                </button>
              </div>

              {/* Payment Methods Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">Secure payment options available</p>
                <div className="flex justify-center space-x-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                    MTN MOMO
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    WhatsApp
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">📞 0779421717</p>
              </div>
            </div>
          )}
        </div>
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

export default ShoppingCart;
