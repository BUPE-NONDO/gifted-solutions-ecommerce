/**
 * Discount Service - Handles bulk discount calculations and management
 */

class DiscountService {
  constructor() {
    this.discounts = [];
    this.loadDiscounts();
  }

  /**
   * Load discounts from localStorage
   */
  loadDiscounts() {
    try {
      const savedDiscounts = localStorage.getItem('bulkDiscounts');
      if (savedDiscounts) {
        this.discounts = JSON.parse(savedDiscounts);
      }
    } catch (error) {
      console.error('Error loading discounts:', error);
      this.discounts = [];
    }
  }

  /**
   * Get all active discounts
   */
  getActiveDiscounts() {
    const now = new Date();
    return this.discounts.filter(discount => {
      if (!discount.isActive) return false;
      
      // Check date range
      if (discount.startDate && new Date(discount.startDate) > now) return false;
      if (discount.endDate && new Date(discount.endDate) < now) return false;
      
      return true;
    });
  }

  /**
   * Check if a product is eligible for a specific discount
   */
  isProductEligible(product, discount) {
    switch (discount.applicableProducts) {
      case 'all':
        return true;
      
      case 'category':
        return product.category && 
               product.category.toLowerCase() === discount.categoryFilter.toLowerCase();
      
      case 'specific':
        return discount.specificProducts.includes(product.id);
      
      default:
        return false;
    }
  }

  /**
   * Calculate the best discount for a cart item
   */
  calculateItemDiscount(product, quantity) {
    const activeDiscounts = this.getActiveDiscounts();
    let bestDiscount = null;
    let maxSavings = 0;

    for (const discount of activeDiscounts) {
      // Check if product is eligible
      if (!this.isProductEligible(product, discount)) continue;

      // Check quantity requirements
      if (quantity < discount.minQuantity) continue;
      if (discount.maxQuantity && quantity > discount.maxQuantity) continue;

      // Calculate savings
      const itemPrice = parseFloat(product.price) || 0;
      const totalPrice = itemPrice * quantity;
      let savings = 0;

      if (discount.type === 'percentage') {
        savings = totalPrice * (discount.value / 100);
      } else if (discount.type === 'fixed') {
        savings = discount.value * quantity; // Fixed amount per item
      }

      // Keep track of best discount
      if (savings > maxSavings) {
        maxSavings = savings;
        bestDiscount = {
          ...discount,
          savings: savings,
          originalPrice: totalPrice,
          discountedPrice: totalPrice - savings
        };
      }
    }

    return bestDiscount;
  }

  /**
   * Calculate discounts for entire cart
   */
  calculateCartDiscounts(cartItems) {
    const discountedItems = [];
    let totalSavings = 0;
    let totalOriginal = 0;

    for (const item of cartItems) {
      const itemPrice = parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      const itemTotal = itemPrice * quantity;
      
      totalOriginal += itemTotal;

      const discount = this.calculateItemDiscount(item, quantity);
      
      if (discount) {
        totalSavings += discount.savings;
        discountedItems.push({
          ...item,
          discount: discount,
          originalPrice: itemTotal,
          discountedPrice: discount.discountedPrice,
          savings: discount.savings
        });
      } else {
        discountedItems.push({
          ...item,
          originalPrice: itemTotal,
          discountedPrice: itemTotal,
          savings: 0
        });
      }
    }

    return {
      items: discountedItems,
      totalOriginal: totalOriginal,
      totalSavings: totalSavings,
      totalDiscounted: totalOriginal - totalSavings,
      hasDiscounts: totalSavings > 0
    };
  }

  /**
   * Get available discounts for a specific product
   */
  getAvailableDiscountsForProduct(product) {
    const activeDiscounts = this.getActiveDiscounts();
    return activeDiscounts.filter(discount => this.isProductEligible(product, discount));
  }

  /**
   * Get discount tiers for a product (for display purposes)
   */
  getDiscountTiers(product) {
    const availableDiscounts = this.getAvailableDiscountsForProduct(product);
    const tiers = [];

    for (const discount of availableDiscounts) {
      const itemPrice = parseFloat(product.price) || 0;
      
      // Calculate savings at minimum quantity
      let savings = 0;
      if (discount.type === 'percentage') {
        savings = itemPrice * discount.minQuantity * (discount.value / 100);
      } else if (discount.type === 'fixed') {
        savings = discount.value * discount.minQuantity;
      }

      const originalPrice = itemPrice * discount.minQuantity;
      const discountedPrice = originalPrice - savings;

      tiers.push({
        name: discount.name,
        description: discount.description,
        minQuantity: discount.minQuantity,
        maxQuantity: discount.maxQuantity,
        type: discount.type,
        value: discount.value,
        savings: savings,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        savingsPercentage: originalPrice > 0 ? (savings / originalPrice) * 100 : 0
      });
    }

    // Sort by minimum quantity
    return tiers.sort((a, b) => a.minQuantity - b.minQuantity);
  }

  /**
   * Format discount display text
   */
  formatDiscountText(discount) {
    if (discount.type === 'percentage') {
      return `${discount.value}% off`;
    } else {
      return `K${discount.value} off per item`;
    }
  }

  /**
   * Format savings amount
   */
  formatSavings(amount) {
    return `K${amount.toFixed(2)}`;
  }

  /**
   * Get discount summary for display
   */
  getDiscountSummary(cartCalculation) {
    if (!cartCalculation.hasDiscounts) {
      return null;
    }

    const appliedDiscounts = cartCalculation.items
      .filter(item => item.discount)
      .map(item => item.discount.name)
      .filter((name, index, array) => array.indexOf(name) === index); // Remove duplicates

    return {
      totalSavings: cartCalculation.totalSavings,
      totalOriginal: cartCalculation.totalOriginal,
      totalDiscounted: cartCalculation.totalDiscounted,
      appliedDiscounts: appliedDiscounts,
      savingsPercentage: (cartCalculation.totalSavings / cartCalculation.totalOriginal) * 100
    };
  }

  /**
   * Check if quantity qualifies for any discount
   */
  qualifiesForDiscount(product, quantity) {
    const availableDiscounts = this.getAvailableDiscountsForProduct(product);
    return availableDiscounts.some(discount => 
      quantity >= discount.minQuantity && 
      (!discount.maxQuantity || quantity <= discount.maxQuantity)
    );
  }

  /**
   * Get next discount tier (for "buy X more to save Y" messages)
   */
  getNextDiscountTier(product, currentQuantity) {
    const availableDiscounts = this.getAvailableDiscountsForProduct(product);
    
    // Find the next tier that the user hasn't reached yet
    const nextTier = availableDiscounts
      .filter(discount => discount.minQuantity > currentQuantity)
      .sort((a, b) => a.minQuantity - b.minQuantity)[0];

    if (nextTier) {
      const itemPrice = parseFloat(product.price) || 0;
      const quantityNeeded = nextTier.minQuantity - currentQuantity;
      
      let potentialSavings = 0;
      if (nextTier.type === 'percentage') {
        potentialSavings = itemPrice * nextTier.minQuantity * (nextTier.value / 100);
      } else {
        potentialSavings = nextTier.value * nextTier.minQuantity;
      }

      return {
        discount: nextTier,
        quantityNeeded: quantityNeeded,
        potentialSavings: potentialSavings,
        message: `Buy ${quantityNeeded} more to save ${this.formatSavings(potentialSavings)} with ${nextTier.name}`
      };
    }

    return null;
  }

  /**
   * Refresh discounts from storage
   */
  refresh() {
    this.loadDiscounts();
  }
}

// Create singleton instance
const discountService = new DiscountService();

export default discountService;
