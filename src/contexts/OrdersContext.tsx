import React, { createContext, useContext, useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Order, OrdersContextType } from '../types';

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders function that can be called from components
  const fetchOrders = async () => {
    try {
      if (!user?.counter_type) return;
      setLoading(true);
      const data = await getOrders(user.counter_type);
      setOrders(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrder = async (orderId: string, status: string) => {
    try {
      setLoading(true); // Show loading state while updating
      
      // Update the order status in the database
      await updateOrderStatus(orderId, status);
      
      // Optimistically update the local state to immediately reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            // Ensure status is a valid enum value
            const validStatus = status as 'pending' | 'in-progress' | 'completed' | 'cancelled';
            return { ...order, status: validStatus };
          }
          return order;
        })
      );
      
      // Then refresh all orders to ensure we have the latest data
      await fetchOrders();
      
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  // Initial fetch when component mounts or user changes
  useEffect(() => {
    if (user?.counter_type) {
      fetchOrders();
    }
  }, [user?.counter_type]);

  // DISABLED: No real-time subscriptions or polling - user prefers manual refresh only
  // useEffect(() => {
  //   if (!user?.counter_type) return;
  //   // Real-time subscriptions have been disabled
  // }, [user?.counter_type]);

  return (
    <OrdersContext.Provider value={{ orders, loading, error, updateOrder, fetchOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};
