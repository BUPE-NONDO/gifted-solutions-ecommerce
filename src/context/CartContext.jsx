import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import discountService from '../services/discountService';

// Cart Actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, { ...product, quantity }]
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.productId)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== productId)
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      };
    }

    case CART_ACTIONS.LOAD_CART: {
      return {
        ...state,
        items: action.payload.items || []
      };
    }

    default:
      return state;
  }
};

// Initial State
const initialState = {
  items: []
};

// Create Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gifted-solutions-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gifted-solutions-cart', JSON.stringify(state));
  }, [state]);

  // Helper Functions
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Calculated Values
  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return state.items.reduce((total, item) => {
      // Safely extract numeric price value
      let price = 0;
      if (typeof item.price === 'string') {
        price = parseFloat(item.price.replace(/[^\d.,]/g, '').replace(',', ''));
      } else if (typeof item.price === 'number') {
        price = item.price;
      }
      return total + (price * item.quantity);
    }, 0);
  };

  const getShipping = () => {
    // No shipping charges - all handled via WhatsApp
    return 0;
  };

  const getTax = () => {
    // No tax calculations - prices are final
    return 0;
  };

  // Calculate discounts using the discount service
  const getDiscountCalculation = () => {
    return discountService.calculateCartDiscounts(state.items);
  };

  const getTotal = () => {
    // Calculate total with discounts applied
    const discountCalc = getDiscountCalculation();
    return discountCalc.totalDiscounted;
  };

  const getTotalSavings = () => {
    const discountCalc = getDiscountCalculation();
    return discountCalc.totalSavings;
  };

  const getOriginalSubtotal = () => {
    const discountCalc = getDiscountCalculation();
    return discountCalc.totalOriginal;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const formatCurrency = (amount) => {
    // Format number with commas and add K prefix (no space)
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return `K${formatted}`;
  };

  // Context Value
  const value = {
    // State
    items: state.items,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Calculations
    getItemCount,
    getSubtotal,
    getShipping,
    getTax,
    getTotal,
    isInCart,
    getItemQuantity,
    formatCurrency,

    // Discount Calculations
    getDiscountCalculation,
    getTotalSavings,
    getOriginalSubtotal,

    // Computed Values
    itemCount: getItemCount(),
    subtotal: getSubtotal(),
    shipping: getShipping(),
    tax: getTax(),
    total: getTotal(),

    // Computed Discount Values
    discountCalculation: getDiscountCalculation(),
    totalSavings: getTotalSavings(),
    originalSubtotal: getOriginalSubtotal()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
