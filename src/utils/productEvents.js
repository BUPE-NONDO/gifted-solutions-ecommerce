/**
 * Simple event system for product updates
 * This allows the admin panel to notify other parts of the app about product changes
 */

class ProductEventEmitter {
  constructor() {
    this.listeners = {};
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Emit event
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in product event listener:', error);
      }
    });
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// Create global instance
const productEvents = new ProductEventEmitter();

// Event types
export const PRODUCT_EVENTS = {
  PRODUCT_ADDED: 'product_added',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',
  PRODUCT_IMAGE_UPDATED: 'product_image_updated',
  PRODUCT_STOCK_UPDATED: 'product_stock_updated',
  PRODUCTS_REFRESHED: 'products_refreshed'
};

// Helper functions for common operations
export const emitProductAdded = (product) => {
  productEvents.emit(PRODUCT_EVENTS.PRODUCT_ADDED, product);
};

export const emitProductUpdated = (productId, updatedData) => {
  productEvents.emit(PRODUCT_EVENTS.PRODUCT_UPDATED, { productId, updatedData });
};

export const emitProductDeleted = (productId) => {
  productEvents.emit(PRODUCT_EVENTS.PRODUCT_DELETED, { productId });
};

export const emitProductImageUpdated = (productId, imageUrl) => {
  productEvents.emit(PRODUCT_EVENTS.PRODUCT_IMAGE_UPDATED, { productId, imageUrl });
};

export const emitProductStockUpdated = (productId, inStock) => {
  productEvents.emit(PRODUCT_EVENTS.PRODUCT_STOCK_UPDATED, { productId, inStock });
};

export const emitProductsRefreshed = () => {
  productEvents.emit(PRODUCT_EVENTS.PRODUCTS_REFRESHED);
};

// Subscribe to product events
export const onProductAdded = (callback) => {
  productEvents.on(PRODUCT_EVENTS.PRODUCT_ADDED, callback);
  return () => productEvents.off(PRODUCT_EVENTS.PRODUCT_ADDED, callback);
};

export const onProductUpdated = (callback) => {
  productEvents.on(PRODUCT_EVENTS.PRODUCT_UPDATED, callback);
  return () => productEvents.off(PRODUCT_EVENTS.PRODUCT_UPDATED, callback);
};

export const onProductDeleted = (callback) => {
  productEvents.on(PRODUCT_EVENTS.PRODUCT_DELETED, callback);
  return () => productEvents.off(PRODUCT_EVENTS.PRODUCT_DELETED, callback);
};

export const onProductImageUpdated = (callback) => {
  productEvents.on(PRODUCT_EVENTS.PRODUCT_IMAGE_UPDATED, callback);
  return () => productEvents.off(PRODUCT_EVENTS.PRODUCT_IMAGE_UPDATED, callback);
};

export const onProductStockUpdated = (callback) => {
  productEvents.on(PRODUCT_EVENTS.PRODUCT_STOCK_UPDATED, callback);
  return () => productEvents.off(PRODUCT_EVENTS.PRODUCT_STOCK_UPDATED, callback);
};

export const onProductsRefreshed = (callback) => {
  productEvents.on(PRODUCT_EVENTS.PRODUCTS_REFRESHED, callback);
  return () => productEvents.off(PRODUCT_EVENTS.PRODUCTS_REFRESHED, callback);
};

// Force refresh all product displays
export const forceProductRefresh = () => {
  // Emit refresh event
  emitProductsRefreshed();
  
  // Also trigger a page refresh for components that might not be listening
  if (typeof window !== 'undefined') {
    // Use a custom event for browser environments
    window.dispatchEvent(new CustomEvent('productDataUpdated', {
      detail: { timestamp: Date.now() }
    }));
  }
};

export default productEvents;
