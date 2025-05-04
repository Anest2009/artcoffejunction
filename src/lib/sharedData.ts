/**
 * sharedData.ts
 * This module provides a simple way to share data between the customer app and the pastry app.
 * It uses localStorage with special keys that are easily identifiable.
 */

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

// Special keys for shared data
const KEYS = {
  LATEST_ORDER: 'CAFE_LATEST_ORDER',
  ALL_ORDERS: 'CAFE_ALL_ORDERS',
  NEW_ORDER_FLAG: 'CAFE_NEW_ORDER_FLAG',
  LAST_ORDER_TIME: 'CAFE_LAST_ORDER_TIME',
};

/**
 * Debug logger that only logs when DEBUG is true
 */
const debugLog = (message: string, ...data: any[]) => {
  if (DEBUG) {
    console.log(`[SharedData] ${message}`, ...data);
  }
};

/**
 * Save an order to the shared data layer
 */
export const saveOrder = (order: any) => {
  try {
    debugLog('Saving order to shared data layer:', order);
    
    // Generate a timestamp for this order
    const timestamp = Date.now();
    const orderId = `order-${timestamp}`;
    
    // Create a simplified order object that's easy to parse
    const simpleOrder = {
      id: orderId,
      timestamp,
      tableNumber: order.tableNumber || 1,
      totalAmount: order.total || 0,
      status: 'pending',
      items: order.items.map((item: any) => ({
        name: item.name || item.product?.name || 'Unknown Item',
        price: item.price || item.product?.price || 0,
        quantity: item.quantity || 1,
        category: 'pastry' // Force all items to be pastry for testing
      }))
    };
    
    debugLog('Simplified order:', simpleOrder);
    
    // Save the latest order
    window.localStorage.setItem(KEYS.LATEST_ORDER, JSON.stringify(simpleOrder));
    
    // Update the all orders list
    const allOrdersString = window.localStorage.getItem(KEYS.ALL_ORDERS);
    let allOrders = [];
    
    if (allOrdersString) {
      try {
        allOrders = JSON.parse(allOrdersString);
        debugLog('Existing orders found:', allOrders.length);
      } catch (e) {
        debugLog('Error parsing existing orders:', e);
      }
    }
    
    // Add the new order
    allOrders.push(simpleOrder);
    window.localStorage.setItem(KEYS.ALL_ORDERS, JSON.stringify(allOrders));
    
    // Set the flags
    window.localStorage.setItem(KEYS.NEW_ORDER_FLAG, 'true');
    window.localStorage.setItem(KEYS.LAST_ORDER_TIME, timestamp.toString());
    
    debugLog('Order saved successfully with ID:', orderId);
    
    // Return the order ID
    return orderId;
  } catch (e) {
    console.error('[SharedData] Error saving order:', e);
    return null;
  }
};

/**
 * Get all orders from the shared data layer
 */
export const getAllOrders = () => {
  try {
    debugLog('Getting all orders from shared data layer');
    
    const allOrdersString = window.localStorage.getItem(KEYS.ALL_ORDERS);
    if (!allOrdersString) {
      debugLog('No orders found');
      return [];
    }
    
    const allOrders = JSON.parse(allOrdersString);
    debugLog('Found orders:', allOrders.length);
    
    return allOrders;
  } catch (e) {
    console.error('[SharedData] Error getting all orders:', e);
    return [];
  }
};

/**
 * Check if there are new orders
 */
export const hasNewOrders = () => {
  try {
    const flag = window.localStorage.getItem(KEYS.NEW_ORDER_FLAG);
    const hasNew = flag === 'true';
    debugLog('Checking for new orders:', hasNew);
    return hasNew;
  } catch (e) {
    console.error('[SharedData] Error checking for new orders:', e);
    return false;
  }
};

/**
 * Reset the new order flag
 */
export const resetNewOrderFlag = () => {
  try {
    debugLog('Resetting new order flag');
    window.localStorage.setItem(KEYS.NEW_ORDER_FLAG, 'false');
  } catch (e) {
    console.error('[SharedData] Error resetting new order flag:', e);
  }
};

/**
 * Get the latest order
 */
export const getLatestOrder = () => {
  try {
    debugLog('Getting latest order');
    
    const latestOrderString = window.localStorage.getItem(KEYS.LATEST_ORDER);
    if (!latestOrderString) {
      debugLog('No latest order found');
      return null;
    }
    
    const latestOrder = JSON.parse(latestOrderString);
    debugLog('Found latest order:', latestOrder);
    
    return latestOrder;
  } catch (e) {
    console.error('[SharedData] Error getting latest order:', e);
    return null;
  }
};

export default {
  saveOrder,
  getAllOrders,
  hasNewOrders,
  resetNewOrderFlag,
  getLatestOrder,
};
