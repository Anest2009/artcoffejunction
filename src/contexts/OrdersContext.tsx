import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getPendingOrders, updateOrderStatus, subscribeToNewOrders, subscribeToOrderStatusChanges } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  updateOrder: (orderId: string, status: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

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

  const fetchOrders = async () => {
    try {
      if (!user?.counter_type) return;
      
      setLoading(true);
      const data = await getPendingOrders(user.counter_type);
      setOrders(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user?.counter_type) return;

    fetchOrders();

    // Set up real-time subscription
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.counter_type]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user?.counter_type) return;

    fetchOrders();

    // Subscribe to new orders
    const newOrdersSubscription = subscribeToNewOrders(user.counter_type, fetchOrders);

    // Subscribe to order status changes
    const statusChangesSubscription = subscribeToOrderStatusChanges(user.counter_type, fetchOrders);

    return () => {
      newOrdersSubscription.unsubscribe();
      statusChangesSubscription.unsubscribe();
    };
  }, [user?.counter_type]);

  const updateOrder = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };



  return (
    <OrdersContext.Provider value={{ orders, loading, error, fetchOrders, updateOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};
