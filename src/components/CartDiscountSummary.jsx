import React from 'react';
import { Tag, TrendingDown, Percent, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import discountService from '../services/discountService';

const CartDiscountSummary = () => {
  const { 
    items, 
    discountCalculation, 
    totalSavings, 
    originalSubtotal, 
    formatCurrency,
    getItemQuantity 
  } = useCart();

  if (!items || items.length === 0) {
    return null;
  }

  const hasDiscounts = totalSavings > 0;
  const nextTierOpportunities = [];

  // Find next tier opportunities for each product
  items.forEach(item => {
    const nextTier = discountService.getNextDiscountTier(item, item.quantity);
    if (nextTier) {
      nextTierOpportunities.push({
        product: item,
        nextTier,
        quantityNeeded: nextTier.quantityNeeded
      });
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Current Savings Display */}
      {hasDiscounts && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Tag className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Bulk Discounts Applied!
              </span>
            </div>
            <div className="text-green-600 dark:text-green-400 font-bold">
              -{formatCurrency(totalSavings)}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
            <div className="flex justify-between">
              <span>Original Total:</span>
              <span className="line-through">{formatCurrency(originalSubtotal)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Discounted Total:</span>
              <span>{formatCurrency(originalSubtotal - totalSavings)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Next Tier Opportunities */}
      {nextTierOpportunities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center">
            <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Save More with Bulk Discounts
            </h3>
          </div>
          
          {nextTierOpportunities.slice(0, 3).map((opportunity, index) => (
            <div 
              key={index}
              className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    {opportunity.product.title || opportunity.product.name}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">
                    Add {opportunity.quantityNeeded} more to unlock{' '}
                    <span className="font-bold">
                      {discountService.formatDiscountText(opportunity.nextTier.discount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs">
                  <Percent className="w-3 h-3 mr-1" />
                  Save {formatCurrency(opportunity.nextTier.potentialSavings || 0)}
                </div>
              </div>
            </div>
          ))}
          
          {nextTierOpportunities.length > 3 && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              +{nextTierOpportunities.length - 3} more discount opportunities available
            </div>
          )}
        </div>
      )}

      {/* Bulk Discount Info */}
      {!hasDiscounts && nextTierOpportunities.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
          <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
            <Gift className="w-4 h-4 mr-2" />
            <span className="text-sm">
              Add more items to unlock bulk discounts
            </span>
          </div>
        </div>
      )}

      {/* Discount Breakdown */}
      {hasDiscounts && discountCalculation.itemDiscounts && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Discount Breakdown:
          </div>
          <div className="space-y-1">
            {discountCalculation.itemDiscounts.map((itemDiscount, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">
                  {itemDiscount.product.title || itemDiscount.product.name} 
                  <span className="text-gray-500 dark:text-gray-400">
                    {' '}(×{itemDiscount.quantity})
                  </span>
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  -{formatCurrency(itemDiscount.totalSavings)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDiscountSummary;
