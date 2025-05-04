import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import Button from '../../components/ui/Button';
import { Order, OrderItem } from '../../types';
import { supabase, getPendingOrders } from '../../lib/supabase';

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { orders, loading, error, updateOrder } = useOrders();
  // We'll keep the selectedOrder state for future implementation
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOrderComplete = async (orderId: string) => {
    try {
      await updateOrder(orderId, 'completed');
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  useEffect(() => {
    if (!user?.counter_type) {
      console.error('No counter type assigned');
      return;
    }

    const fetchOrders = async () => {
      try {
        await getPendingOrders(user.counter_type || '');
        // No need to set orders here since we're using OrdersContext
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-gold-100 p-4">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <Button onClick={logout}>Logout</Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending orders</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                      <p className="text-gray-600">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">Total: ${order.total.toFixed(2)}</p>
                      <p className="text-yellow-500 font-medium">Status: {order.status}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item: OrderItem) => (
                      <div key={item.product_id} className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.customizations && item.customizations.length > 0 && (
                            <p className="text-sm text-gray-500">
                              {item.customizations?.join(', ')}
                            </p>
                          )}
                        </div>
                        <p className="text-gray-600">x{item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        onClick={() => updateOrder(order.id, 'preparing')}
                        disabled={loading}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        onClick={() => handleOrderComplete(order.id)}
                        disabled={loading}
                      >
                        Complete Order
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
