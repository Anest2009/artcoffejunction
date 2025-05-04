export interface User {
  id: string;
  email: string;
  role: string;
  counter_type: string | null;
  name?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  counter_type: string;
  table_number?: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  total_amount: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
  notes?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  updateOrder: (orderId: string, status: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
}
