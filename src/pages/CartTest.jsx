import React from 'react';
import { useCart } from '../context/CartContext';
import { products } from '../data/newProducts';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, Check } from 'lucide-react';

const CartTest = () => {
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    formatCurrency,
    subtotal,
    shipping,
    tax,
    total,
    itemCount,
    isInCart,
    getItemQuantity
  } = useCart();

  const testProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🛒 Shopping Cart Test Page
          </h1>
          <p className="text-gray-600">
            Test all cart functionality: add, remove, update quantities, and calculate totals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testProducts.map((product) => {
                  const inCart = isInCart(product.id);
                  const quantity = getItemQuantity(product.id);

                  return (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                      <h3 className="font-medium text-gray-900 mb-1 text-sm">
                        {product.name}
                      </h3>
                      <p className="text-primary-600 font-bold mb-3">{product.price}</p>

                      {!inCart ? (
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded text-sm flex items-center justify-center"
                        >
                          <CartIcon className="mr-2" size={16} />
                          Add to Cart
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center text-green-600 text-sm font-medium">
                            <Check className="mr-1" size={16} />
                            In Cart ({quantity})
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-medium">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="bg-primary-500 hover:bg-primary-600 text-white p-1 rounded"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Items Display */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Cart Items ({itemCount})
                </h2>
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items in cart</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <p className="text-sm font-medium text-primary-600">{item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-primary-500 hover:bg-primary-600 text-white p-1 rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{itemCount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (16.5%):</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Notice */}
              {shipping > 0 && subtotal < 100000 && subtotal > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-700">
                    Add {formatCurrency(100000 - subtotal)} more for FREE shipping!
                  </p>
                </div>
              )}

              {/* Test Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    testProducts.forEach(product => addToCart(product, 1));
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm"
                >
                  Add All Test Products
                </button>

                <button
                  onClick={() => {
                    items.forEach(item => updateQuantity(item.id, item.quantity + 1));
                  }}
                  disabled={items.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg text-sm"
                >
                  +1 to All Quantities
                </button>

                <button
                  onClick={clearCart}
                  disabled={items.length === 0}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg text-sm"
                >
                  Clear Cart
                </button>
              </div>

              {/* Cart State Debug */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info:</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Items in cart: {items.length}</div>
                  <div>Total quantity: {itemCount}</div>
                  <div>Subtotal: {subtotal.toFixed(2)}</div>
                  <div>Shipping: {shipping.toFixed(2)}</div>
                  <div>Tax: {tax.toFixed(2)}</div>
                  <div>Total: {total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-800 font-medium mb-2">🧪 Test Instructions:</h3>
          <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
            <li>Add products to cart using "Add to Cart" buttons</li>
            <li>Adjust quantities using +/- buttons</li>
            <li>Remove items using the trash icon</li>
            <li>Watch the cart summary update in real-time</li>
            <li>Test bulk actions with the action buttons</li>
            <li>Check localStorage persistence by refreshing the page</li>
            <li>Verify free shipping threshold at K 100,000</li>
            <li>Test VAT calculation (16.5%)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CartTest;
