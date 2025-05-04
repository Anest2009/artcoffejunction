import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import Button from '../../components/ui/Button';
import { User, Order, Product, UserRoles, OrderItem } from '../../types';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { orders, loading, error, updateOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [staff, setStaff] = useState<UserRoles[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .order('role', { ascending: true });

        if (error) throw error;
        setStaff(data || []);
        setStaffError(null);
      } catch (err) {
        setStaffError(err instanceof Error ? err.message : 'Failed to fetch staff');
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();

    // Set up real-time subscriptions for staff
    const staffSubscription = supabase
      .channel('staff')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_roles',
      }, () => {
        fetchStaff();
      })
      .subscribe();

    return () => {
      staffSubscription.unsubscribe();
    };
  }, []);

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-gold-100 p-4">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={logout}>Logout</Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {staffError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {staffError}
          </div>
        )}

        {loading || staffLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Orders Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg shadow-md p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">Order #{order.id}</h3>
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
                                  {item.customizations.join(', ')}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Staff Members</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Active Staff</h3>
                  <Button>Add Staff</Button>
                </div>
                <div className="space-y-4">
                  {staff.map((staffMember: UserRoles) => (
                    <div key={staffMember.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{staffMember.role}</p>
                        <p className="text-sm text-gray-500">Counter: {staffMember.counter_type || 'All'}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="secondary">Edit</Button>
                        <Button variant="danger">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
