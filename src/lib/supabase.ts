import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role, counter_type')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Orders functions
export const getPendingOrders = async (counterType: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('counter_type', counterType)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
};

export const subscribeToNewOrders = (counterType: string, callback: () => void) => {
  return supabase
    .channel(`new_orders_${counterType}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'orders',
      filter: `counter_type=eq.${counterType}`,
    }, callback)
    .subscribe();
};

export const subscribeToOrderStatusChanges = (counterType: string, callback: () => void) => {
  return supabase
    .channel(`order_status_changes_${counterType}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `counter_type=eq.${counterType}`,
    }, callback)
    .subscribe();
};

// Inventory functions
export const getProductsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('name');

  if (error) throw error;
  return data;
};

export const updateProductStock = async (productId: string, newStock: number) => {
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId);

  if (error) throw error;
};
