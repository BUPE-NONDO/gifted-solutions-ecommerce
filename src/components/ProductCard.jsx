import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart as CartIcon, Plus, Minus, Check, Eye, Star } from 'lucide-react';
import RobustImage from './RobustImage';
import { formatPrice, parsePrice } from '../utils/priceUtils';

const ProductCard = ({ product, onViewDetails }) => {
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showQuantity, setShowQuantity] = useState(false);

  const inCart = isInCart(product.id);
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const cartItem = {
      id: product.id,
      name: product.title || product.name,
      price: product.price,
      image: product.publicUrl || product.image,
      category: product.category,
      description: product.description
    };

    addToCart(cartItem);
    setIsAdding(false);
    setShowQuantity(true);
    setTimeout(() => setShowQuantity(false), 3000);
  };

  const handleQuantityChange = (newQuantity) => {
    updateQuantity(product.id, newQuantity);
    if (newQuantity === 0) {
      setShowQuantity(false);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 group">
      <div className="relative">
        <RobustImage
          src={product.publicUrl || product.image}
          alt={product.title || product.name}
          productName={product.title || product.name}
          category={product.category}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10 flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </span>
        )}

        {/* Stock Status */}
        {product.inStock && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
              In Stock
            </span>
          </div>
        )}

        {/* Quick View Button */}
        {onViewDetails && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center z-10">
            <button
              onClick={handleViewDetails}
              className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              Quick View
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-primary-500 font-medium">{product.category}</div>
        </div>
        
        <h3 className="text-sm font-semibold text-black mb-2 line-clamp-2 hover:text-primary-600 cursor-pointer" onClick={handleViewDetails}>
          {product.title || product.name}
        </h3>
        
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-black">
            {typeof product.price === 'string' && product.price.startsWith('K')
              ? product.price
              : `K${product.price}`
            }
          </div>
        </div>

        {/* Cart Controls */}
        <div className="space-y-2">
          {!inCart ? (
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                !product.inStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isAdding
                  ? 'bg-primary-400 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-md'
              }`}
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : !product.inStock ? (
                'Out of Stock'
              ) : (
                <>
                  <CartIcon className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              {/* In Cart Indicator */}
              <div className="flex items-center justify-center py-1 text-green-600 text-sm font-medium">
                <Check className="h-4 w-4 mr-1" />
                In Cart ({quantity})
              </div>

              {/* Quantity Controls */}
              {(showQuantity || inCart) && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <span className="text-sm font-medium px-3">
                    Qty: {quantity}
                  </span>

                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
