import React from 'react';
import { ShoppingCart as CartIconSvg } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartIcon = ({ onClick, className = '' }) => {
  const { itemCount } = useCart();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-primary-500 transition-colors ${className}`}
    >
      <CartIconSvg className="h-6 w-6" />

      {/* Cart Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
