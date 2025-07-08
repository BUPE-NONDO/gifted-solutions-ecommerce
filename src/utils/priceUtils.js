/**
 * Utility functions for handling price formatting and parsing
 */

/**
 * Safely extract numeric value from price (handles both string and number formats)
 * @param {string|number} price - The price value to parse
 * @returns {number} - The numeric price value
 */
export const parsePrice = (price) => {
  if (typeof price === 'number') {
    return price;
  }

  if (typeof price === 'string') {
    // Remove all non-digit characters except decimal points
    const numericString = price.replace(/[^\d.,]/g, '').replace(',', '');
    const parsed = parseFloat(numericString);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

/**
 * Format a numeric price value to display format (K1,000)
 * @param {number} price - The numeric price value
 * @returns {string} - The formatted price string
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'K0';
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);

  return `K${formatted}`;
};

/**
 * Extract numeric value from price string for calculations
 * @param {string|number} price - The price value
 * @returns {number} - The numeric value for calculations
 */
export const getPriceValue = (price) => {
  return parsePrice(price);
};

/**
 * Calculate total price for quantity
 * @param {string|number} price - The unit price
 * @param {number} quantity - The quantity
 * @returns {number} - The total price
 */
export const calculateTotal = (price, quantity) => {
  const unitPrice = parsePrice(price);
  return unitPrice * (quantity || 0);
};

/**
 * Validate if a price value is valid
 * @param {string|number} price - The price to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidPrice = (price) => {
  const parsed = parsePrice(price);
  return parsed > 0;
};

/**
 * Convert price from display format to numeric for editing
 * @param {string|number} price - The price in display format
 * @returns {string} - The numeric string for input fields
 */
export const priceToEditValue = (price) => {
  const numeric = parsePrice(price);
  return numeric.toString();
};

/**
 * Convert numeric input value to display format
 * @param {string|number} value - The input value
 * @returns {string} - The formatted display price
 */
export const editValueToPrice = (value) => {
  const numeric = parseFloat(value) || 0;
  return formatPrice(numeric);
};

/**
 * Sort products by price
 * @param {Array} products - Array of products
 * @param {string} direction - 'asc' for low to high, 'desc' for high to low
 * @returns {Array} - Sorted products array
 */
export const sortByPrice = (products, direction = 'asc') => {
  return [...products].sort((a, b) => {
    const priceA = parsePrice(a.price);
    const priceB = parsePrice(b.price);

    if (direction === 'desc') {
      return priceB - priceA;
    }
    return priceA - priceB;
  });
};

/**
 * Filter products by price range
 * @param {Array} products - Array of products
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Array} - Filtered products array
 */
export const filterByPriceRange = (products, minPrice = 0, maxPrice = Infinity) => {
  return products.filter(product => {
    const price = parsePrice(product.price);
    return price >= minPrice && price <= maxPrice;
  });
};

/**
 * Get price statistics for a list of products
 * @param {Array} products - Array of products
 * @returns {Object} - Price statistics (min, max, average)
 */
export const getPriceStats = (products) => {
  if (!products || products.length === 0) {
    return { min: 0, max: 0, average: 0 };
  }

  const prices = products.map(product => parsePrice(product.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return {
    min,
    max,
    average: Math.round(average)
  };
};

/**
 * Format currency for display (same as formatPrice but more explicit name)
 * @param {number} amount - The amount to format
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount) => {
  return formatPrice(amount);
};

export default {
  parsePrice,
  formatPrice,
  getPriceValue,
  calculateTotal,
  isValidPrice,
  priceToEditValue,
  editValueToPrice,
  sortByPrice,
  filterByPriceRange,
  getPriceStats,
  formatCurrency
};
