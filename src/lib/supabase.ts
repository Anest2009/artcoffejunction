import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in a .env file in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your_supabase_url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data;
};

// Products
export const getProductsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      customization_options(*)
    `)
    .eq('category_id', categoryId)
    .eq('is_available', true);
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data;
};

export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      customization_options(*)
    `)
    .eq('is_available', true);
  
  if (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
  
  return data;
};

export const getProductById = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      customization_options(*)
    `)
    .eq('id', productId)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
  
  return data;
};

// Orders
export const placeOrder = async (
  tableId: string, 
  items: any[], 
  totalAmount: number, 
  paymentMethod: string = 'counter',
  notes: string = ''
) => {
  console.log('Starting order placement with:', {
    tableId,
    itemCount: items.length,
    totalAmount,
    paymentMethod
  });
  
  try {
    // First, get a valid table ID from Supabase
    let validTableId;
    try {
      // Try to find a valid table in Supabase
      const { data: tables, error: tablesError } = await supabase
        .from('cafe_tables')
        .select('id')
        .limit(1);
      
      if (tablesError || !tables || tables.length === 0) {
        // If no tables found, create a UUID for a dummy table
        validTableId = crypto.randomUUID();
        console.log('No tables found, using generated UUID:', validTableId);
      } else {
        // Use the first table found
        validTableId = tables[0].id;
        console.log('Using existing table ID from database:', validTableId);
      }
    } catch (e) {
      // Fallback to a random UUID if anything fails
      validTableId = crypto.randomUUID();
      console.log('Error finding tables, using generated UUID:', validTableId);
    }
    
    // 1. Create the order in Supabase
    console.log('Creating order in Supabase with table ID:', validTableId);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: validTableId, // Use the valid UUID
        status: 'pending',
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'unpaid',
        notes: notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }
    
    console.log('Order created successfully in Supabase:', order);
    
    // 2. Add order items
    const orderItems = items.map(item => {
      // Log the item for debugging
      console.log('Processing order item:', item);
      
      // Omit category_id if it's a UUID string (not an integer)
      // This prevents the type conversion error
      return {
        order_id: order.id,
        product_id: item.product.id,
        // Remove category_id from order_items to avoid type conversion error
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        notes: item.notes || ''
      };
    });
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error adding order items:', itemsError);
      throw itemsError;
    }
    
    // 3. Add customizations if present
    const customizations = [];
    for (const item of items) {
      if (item.customizations) {
        console.log('Processing customizations for item:', item.product.name);
        console.log('Customizations:', item.customizations);
        
        // Get the order item ID
        const { data: orderItem } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', order.id)
          .eq('product_id', item.product.id)
          .single();
        
        if (orderItem) {
          // Handle array-style customizations (from previous implementation)
          if (Array.isArray(item.customizations)) {
            for (const customization of item.customizations) {
              if (customization && customization.id) {
                customizations.push({
                  order_item_id: orderItem.id,
                  customization_option_id: customization.id,
                  price_adjustment: customization.price_adjustment || 0
                });
              }
            }
          } 
          // Handle object-style customizations (milk, sugar, etc.)
          else if (typeof item.customizations === 'object') {
            // Store as JSON in the notes field of the order item
            const { error: updateError } = await supabase
              .from('order_items')
              .update({ notes: JSON.stringify(item.customizations) })
              .eq('id', orderItem.id);
            
            if (updateError) {
              console.error('Error updating order item with customizations:', updateError);
            }
          }
        }
      }
    }
    
    if (customizations.length > 0) {
      const { error: customizationsError } = await supabase
        .from('order_item_customizations')
        .insert(customizations);
      
      if (customizationsError) {
        console.error('Error adding customizations:', customizationsError);
        throw customizationsError;
      }
    }
    
    console.log('Order placed successfully:', order);
    return order;
  } catch (error) {
    console.error('Error in Supabase order placement:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        table:cafe_tables(*),
        items:order_items(
          *,
          product:products(*),
          customizations:order_item_customizations(
            *,
            customization_option:customization_options(*)
          )
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Tables
export const getTables = async () => {
  const { data, error } = await supabase
    .from('cafe_tables')
    .select('*')
    .eq('is_available', true);
  
  if (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
  
  return data;
};



// Get the current status of an order
export const getOrderStatus = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching order status:', error);
      throw error;
    }
    
    return data?.status;
  } catch (error) {
    console.error('Error fetching order status:', error);
    throw error;
  }
};

// Real-time subscriptions
export const subscribeToOrderStatus = (orderId: string, callback: (payload: any) => void) => {
  console.log(`Subscribing to status changes for order: ${orderId}`);
  return supabase
    .channel(`order:${orderId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`,
    }, (payload) => {
      console.log('Order status changed:', payload);
      // Call the callback with the full payload
      callback(payload);
      
      // Show a notification if the browser supports it
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const statusMap: Record<string, string> = {
          'pending': 'Your order has been received',
          'in-progress': 'Your order is being prepared',
          'completed': 'Your order is ready for pickup',
          'cancelled': 'Your order has been cancelled'
        };
        
        const newStatus = payload.new?.status;
        if (newStatus && statusMap[newStatus]) {
          // Request notification permission
          if (Notification.permission === 'granted') {
            new Notification('Order Update', {
              body: statusMap[newStatus],
              icon: '/favicon.ico' // Use your app's favicon or a custom icon
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Order Update', {
                  body: statusMap[newStatus],
                  icon: '/favicon.ico'
                });
              }
            });
          }
        }
      }
    })
    .subscribe();
};
