// Counter types
export interface Counter {
  id: string;
  name: string;
  type: 'bar' | 'pastry' | 'ground-coffee';
  avgPrepTime: number;
  staffCount: number;
}

// Order types
export interface OrderItem {
  name: string;
  price: number;
  customizations?: string[];
}

export interface Order {
  id: string;
  customerName: string;
  counterId: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  type: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  deliveryAddress?: string;
}

// Stats types
export interface HourlyData {
  hour: string;
  sales: number;
}

export interface CounterSales {
  counterId: string;
  sales: number;
}

export interface StatsData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  avgPrepTime: number;
  salesGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  prepTimeChange: number;
  hourlyData: HourlyData[];
  counterSales: CounterSales[];
}

export interface Stats {
  todayData: StatsData;
  weekData: StatsData;
  monthData: StatsData;
}