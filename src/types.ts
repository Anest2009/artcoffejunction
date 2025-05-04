export interface User {
  id: string;
  email: string;
  role?: string;
  counter_type?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  counter_type: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoles {
  id: string;
  user_id: string;
  role: string;
  counter_type?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  customizations?: string[];
}
