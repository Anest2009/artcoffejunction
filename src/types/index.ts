// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  counter_type: string | null;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
}

// Product category types
export interface ProductCategory {
  id: number;
  name: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category_id: number;
  category?: ProductCategory;
}

// Order item types
export interface OrderItem {
  id: number;
  order_id: string;
  product_id: number;
  quantity: number;
  price?: number; // Make price optional since it might not exist
  unit_price?: number; // Add unit_price which is used in project3
  total_price?: number; // Add total_price which is used in project3
  notes?: string;
  category_id?: number | string; // Can be either number or string
  category?: string; // Add string category field
  product?: {
    id: number;
    name?: string;
    price?: number;
    category_id?: number | string;
    description?: string;
  };
  status?: string; // Add status field
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  table_number?: number;
  customer_name?: string;
  total_amount: number;
  items: OrderItem[];
}

// Orders context types
export interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  updateOrder: (orderId: string, status: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

// Counter types
export type CounterType = 'coffee' | 'pastry' | 'bar' | null;
