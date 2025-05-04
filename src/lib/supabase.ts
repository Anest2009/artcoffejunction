import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Create a new user with role and counter type
export const createUser = async (
  email: string,
  password: string,
  name: string,
  role: string = 'staff',
  counterType: string | null = null
) => {
  try {
    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const userId = authData.user.id;

    // Step 2: Add user details to the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          name,
          role,
          counter_type: counterType,
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      // If profile creation fails, we should try to clean up the auth user
      console.error('Error creating user profile, attempting to clean up auth user:', profileError);
      await supabase.auth.admin.deleteUser(userId);
      throw profileError;
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }
};

// Create an initial admin user directly (bypassing auth flow)
export const createInitialAdminUser = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    // First check if any users exist
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (checkError) throw checkError;
    
    // If users already exist, don't create an admin
    if (existingUsers && existingUsers.length > 0) {
      return { 
        success: false, 
        error: new Error('Users already exist. Initial admin can only be created in an empty database.') 
      };
    }
    
    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Admin user creation failed');

    const userId = authData.user.id;

    // Step 2: Add user details to the users table with admin role
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          name,
          role: 'admin',  // Always create as admin
          counter_type: null,  // Admins don't need counter type
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      throw profileError;
    }

    // Step 3: Sign in with the newly created admin account
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Created admin but could not sign in:', signInError);
      throw signInError;
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Error creating initial admin user:', error);
    return { success: false, error };
  }
};

// Map counter types to product categories
const counterTypeToCategory: Record<string, string> = {
  'coffee': 'coffee',
  'pastry': 'pastry',
  'bar': 'bar'
};

// Get orders for a specific counter type (all statuses)
export const getOrders = async (counterType: string) => {
  try {
    console.log(`Fetching orders for counter type: ${counterType}`);
    
    // Use a join query to get product details with each order item
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }

    console.log(`Found ${orders?.length || 0} orders with product details`);
    
    // Return all orders with their items and product details
    return orders?.map(order => ({
      ...order,
      items: order.items || []
    })) || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Analytics functions

// Get revenue data for different time periods
export const getRevenueData = async (period: 'day' | 'week' | 'month') => {
  try {
    let timeFilter;
    const now = new Date();
    
    // Calculate the start date based on the selected period
    if (period === 'day') {
      // Last 24 hours
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      timeFilter = yesterday.toISOString();
    } else if (period === 'week') {
      // Last 7 days
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      timeFilter = lastWeek.toISOString();
    } else if (period === 'month') {
      // Last 30 days
      const lastMonth = new Date(now);
      lastMonth.setDate(lastMonth.getDate() - 30);
      timeFilter = lastMonth.toISOString();
    }
    
    // Fetch completed orders within the time period
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', timeFilter)
      .eq('status', 'completed');
      
    if (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
    
    // Calculate total revenue
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    
    // For day and week, we'll also return hourly/daily breakdown for charts
    let revenueBreakdown: Array<{name: string, value: number, date?: string}> = [];
    
    if (period === 'day') {
      // Group by hour for 24-hour view
      const hourlyData: Record<number, number> = {};
      
      // Initialize all hours with 0
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = 0;
      }
      
      // Sum revenue by hour
      orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const hour = orderDate.getHours();
        hourlyData[hour] += (order.total_amount || 0);
      });
      
      // Convert to array format for charts
      revenueBreakdown = Object.entries(hourlyData).map(([hour, amount]) => ({
        name: `${hour}:00`,
        value: amount
      }));
    } else if (period === 'week') {
      // Group by day for 7-day view
      const dailyData: Record<string, number> = {};
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize all days with 0
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        dailyData[dayKey] = 0;
      }
      
      // Sum revenue by day
      orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const dayKey = orderDate.toISOString().split('T')[0];
        if (dailyData[dayKey] !== undefined) {
          dailyData[dayKey] += (order.total_amount || 0);
        }
      });
      
      // Convert to array format for charts
      revenueBreakdown = Object.entries(dailyData).map(([date, amount]) => {
        const dayOfWeek = new Date(date).getDay();
        return {
          name: dayNames[dayOfWeek],
          value: amount,
          date: date
        };
      });
    } else if (period === 'month') {
      // Group by week for 30-day view
      const weeklyData: Record<number, number> = {0: 0, 1: 0, 2: 0, 3: 0};
      
      orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Assign to the appropriate week (0-3)
        const weekIndex = Math.min(Math.floor(diffDays / 7), 3);
        weeklyData[weekIndex] += (order.total_amount || 0);
      });
      
      // Convert to array format for charts
      revenueBreakdown = Object.entries(weeklyData).map(([week, amount]) => ({
        name: `Week ${Number(week) + 1}`,
        value: amount
      })).reverse(); // Most recent week last
    }
    
    return {
      totalRevenue,
      revenueBreakdown,
      orderCount: orders?.length || 0
    };
  } catch (error) {
    console.error('Error in getRevenueData:', error);
    throw error;
  }
};

// Get order status breakdown
export const getOrderStatusBreakdown = async (period: 'day' | 'week' | 'month') => {
  try {
    let timeFilter;
    const now = new Date();
    
    // Calculate the start date based on the selected period
    if (period === 'day') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      timeFilter = yesterday.toISOString();
    } else if (period === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      timeFilter = lastWeek.toISOString();
    } else if (period === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setDate(lastMonth.getDate() - 30);
      timeFilter = lastMonth.toISOString();
    }
    
    // Fetch all orders within the time period
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', timeFilter);
      
    if (error) {
      console.error('Error fetching order status data:', error);
      throw error;
    }
    
    // Count orders by status
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    };
    
    orders?.forEach(order => {
      if (statusCounts[order.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
    });
    
    // Convert to array format for charts
    const statusBreakdown = [
      { name: 'Pending', value: statusCounts.pending, color: '#FCD34D' },
      { name: 'In Progress', value: statusCounts['in-progress'], color: '#60A5FA' },
      { name: 'Completed', value: statusCounts.completed, color: '#34D399' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: '#F87171' }
    ];
    
    return {
      statusBreakdown,
      totalOrders: orders?.length || 0
    };
  } catch (error) {
    console.error('Error in getOrderStatusBreakdown:', error);
    throw error;
  }
};

// Get popular products
export const getPopularProducts = async (period: 'day' | 'week' | 'month', limit: number = 5) => {
  try {
    let timeFilter;
    const now = new Date();
    
    // Calculate the start date based on the selected period
    if (period === 'day') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      timeFilter = yesterday.toISOString();
    } else if (period === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      timeFilter = lastWeek.toISOString();
    } else if (period === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setDate(lastMonth.getDate() - 30);
      timeFilter = lastMonth.toISOString();
    }
    
    // Fetch completed orders within the time period
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        items:order_items(product_id, quantity)
      `)
      .gte('created_at', timeFilter)
      .eq('status', 'completed');
      
    if (ordersError) {
      console.error('Error fetching popular products data:', ordersError);
      throw ordersError;
    }
    
    // Count product quantities
    const productCounts: Record<string, number> = {};
    
    orders?.forEach(order => {
      order.items?.forEach((item: any) => {
        const productId = item.product_id?.toString();
        if (productId) {
          productCounts[productId] = (productCounts[productId] || 0) + (item.quantity || 1);
        }
      });
    });
    
    // Sort products by popularity
    const sortedProducts = Object.entries(productCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit);
    
    // Fetch product details for the popular products
    const productIds = sortedProducts.map(([id]) => id);
    
    if (productIds.length === 0) {
      return { popularProducts: [] };
    }
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, category_id')
      .in('id', productIds);
      
    if (productsError) {
      console.error('Error fetching product details:', productsError);
      throw productsError;
    }
    
    // Combine product details with quantity data
    const popularProducts = products?.map(product => {
      const quantity = productCounts[product.id.toString()] || 0;
      return {
        id: product.id,
        name: product.name,
        quantity,
        revenue: quantity * (product.price || 0),
        categoryId: product.category_id
      };
    }).sort((a, b) => b.quantity - a.quantity) || [];
    
    return { popularProducts };
  } catch (error) {
    console.error('Error in getPopularProducts:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    
    // First, verify the order exists
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();
      
    if (checkError) {
      console.error('Error checking existing order:', checkError);
      throw checkError;
    }
    
    if (!existingOrder) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    console.log(`Current order status: ${existingOrder.status}, updating to: ${status}`);
    
    // Update the order status
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString() // Update the timestamp
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status in database:', error);
      throw error;
    }
    
    console.log(`Successfully updated order ${orderId} status to ${status}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Subscribe to new orders - now we need to listen to order_items table for category-specific items
export const subscribeToNewOrders = (counterType: string, callback: () => void) => {
  // Get the category name for this counter type
  const categoryName = counterTypeToCategory[counterType];
  if (!categoryName) {
    console.error(`Invalid counter type for subscription: ${counterType}`);
    // Return a dummy subscription object that does nothing
    return {
      unsubscribe: () => {}
    };
  }

  // Subscribe to new order items with the matching category
  return supabase
    .channel('new-order-items')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'order_items',
      // We'll filter by category in the application code instead of here
      // because we need to first get the category ID
    }, callback)
    .subscribe();
};

// Subscribe to order status changes
export const subscribeToOrderStatusChanges = (_counterType: string, callback: () => void) => {
  // For status changes, we still listen to the orders table
  // but we'll need to check if the order has items for this counter's category in the callback
  // The counterType parameter is prefixed with underscore to indicate it's not used directly here
  return supabase
    .channel('order-status-changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      // No filter here - we'll filter in the application code
    }, callback)
    .subscribe();
};

// Fetch product details by ID
export const getProductById = async (productId: string) => {
  try {
    // First try the products table
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      // If not found in products table, try to get a generic product name based on ID
      // This is a fallback for when we don't have proper product data
      if (productId.toLowerCase().includes('coffee')) {
        return { name: 'Coffee', price: 0 };
      } else if (productId.toLowerCase().includes('pastry')) {
        return { name: 'Pastry', price: 0 };
      } else if (productId.toLowerCase().includes('drink')) {
        return { name: 'Drink', price: 0 };
      }
      return { name: `Product #${productId.substring(0, 8)}`, price: 0 };
    }
    
    return product;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return { name: `Product #${productId.substring(0, 8)}`, price: 0 };
  }
};
