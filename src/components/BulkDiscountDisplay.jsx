import React from 'react';
import { Percent, Tag, TrendingDown, Users } from 'lucide-react';
import discountService from '../services/discountService';

const BulkDiscountDisplay = ({ product, currentQuantity = 0, compact = false }) => {
  const discountTiers = discountService.getDiscountTiers(product);
  const nextTier = discountService.getNextDiscountTier(product, currentQuantity);
  const qualifiesForDiscount = discountService.qualifiesForDiscount(product, currentQuantity);

  if (discountTiers.length === 0) {
    return null;
  }

  if (compact) {
    // Compact view for product cards
    const bestTier = discountTiers[0]; // First tier (lowest quantity requirement)
    
    return (
      <div className="mt-2">
        {qualifiesForDiscount ? (
          <div className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
            <Tag className="w-3 h-3 mr-1" />
            <span className="font-medium">
              {discountService.formatDiscountText(bestTier)} applied!
            </span>
          </div>
        ) : nextTier ? (
          <div className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
            <TrendingDown className="w-3 h-3 mr-1" />
            <span>
              Buy {nextTier.quantityNeeded} more for {discountService.formatDiscountText(bestTier)}
            </span>
          </div>
        ) : (
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs">
            <Percent className="w-3 h-3 mr-1" />
            <span>
              {bestTier.minQuantity}+ items: {discountService.formatDiscountText(bestTier)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full view for product detail modals or dedicated sections
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
      <div className="flex items-center mb-3">
        <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Discounts Available</h3>
      </div>

      {/* Current Status */}
      {currentQuantity > 0 && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Current quantity: {currentQuantity}
              </span>
            </div>
            {qualifiesForDiscount ? (
              <div className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm">
                <Tag className="w-4 h-4 mr-1" />
                Discount Applied!
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No discount yet
              </div>
            )}
          </div>
          
          {nextTier && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              💡 {nextTier.message}
            </div>
          )}
        </div>
      )}

      {/* Discount Tiers */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Discounts:</h4>
        {discountTiers.map((tier, index) => {
          const isActive = currentQuantity >= tier.minQuantity && (!tier.maxQuantity || currentQuantity <= tier.maxQuantity);
          const isReachable = currentQuantity < tier.minQuantity;
          
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                  : isReachable
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isActive ? 'bg-green-500' : isReachable ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    isActive 
                      ? 'text-green-800 dark:text-green-200' 
                      : isReachable 
                      ? 'text-blue-800 dark:text-blue-200'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {tier.name}
                  </span>
                </div>
                <div className={`text-sm font-bold ${
                  isActive 
                    ? 'text-green-600 dark:text-green-400' 
                    : isReachable 
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {discountService.formatDiscountText(tier)}
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div className={`${
                  isActive 
                    ? 'text-green-700 dark:text-green-300' 
                    : isReachable 
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  <span className="font-medium">Quantity:</span> {tier.minQuantity}
                  {tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} items
                </div>
                
                {tier.description && (
                  <div className={`${
                    isActive 
                      ? 'text-green-600 dark:text-green-400' 
                      : isReachable 
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {tier.description}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-current border-opacity-20">
                  <div className={`text-xs ${
                    isActive 
                      ? 'text-green-600 dark:text-green-400' 
                      : isReachable 
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    <span className="line-through">
                      {discountService.formatSavings(tier.originalPrice)}
                    </span>
                    <span className="ml-2 font-bold">
                      {discountService.formatSavings(tier.discountedPrice)}
                    </span>
                  </div>
                  <div className={`text-xs font-medium ${
                    isActive 
                      ? 'text-green-600 dark:text-green-400' 
                      : isReachable 
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    Save {discountService.formatSavings(tier.savings)} ({tier.savingsPercentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
              
              {isActive && (
                <div className="mt-2 flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                  <Tag className="w-4 h-4 mr-1" />
                  Currently Applied
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      {!qualifiesForDiscount && nextTier && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-lg border border-blue-300 dark:border-blue-600">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              💰 Start Saving Now!
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Add {nextTier.quantityNeeded} more item{nextTier.quantityNeeded > 1 ? 's' : ''} to unlock{' '}
              <span className="font-bold">{discountService.formatDiscountText(nextTier.discount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkDiscountDisplay;
