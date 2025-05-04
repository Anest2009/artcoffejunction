import { useState, useEffect } from 'react';
import { Counter, Order, Stats } from '../types';

// Mock data for counters
const mockCounters: Counter[] = [
  {
    id: 'counter1',
    name: 'Bar Counter',
    type: 'bar',
    avgPrepTime: 3,
    staffCount: 2,
  },
  {
    id: 'counter2',
    name: 'Pastry Counter',
    type: 'pastry',
    avgPrepTime: 2,
    staffCount: 1,
  },
  {
    id: 'counter3',
    name: 'Ground Coffee Counter',
    type: 'ground-coffee',
    avgPrepTime: 5,
    staffCount: 1,
  },
];

// Generate mock orders
const generateMockOrders = (count: number): Order[] => {
  const statuses = ['new', 'preparing', 'ready', 'completed'];
  const mockItems = [
    { name: 'Espresso', price: 3.50 },
    { name: 'Cappuccino', price: 4.50 },
    { name: 'Latte', price: 4.75 },
    { name: 'Croissant', price: 3.25 },
    { name: 'Chocolate Muffin', price: 3.75 },
    { name: 'Ground Coffee Pack 250g', price: 12.99 },
  ];
  
  const mockCustomers = [
    'Emma Thompson',
    'Michael Johnson',
    'Sophia Williams',
    'James Davis',
    'Olivia Brown',
    'Alexander Wilson',
    'Isabella Smith',
    'William Taylor',
    'Charlotte Jones',
    'Daniel Miller',
  ];
  
  const orders: Order[] = [];
  const now = new Date();
  
  for (let i = 1; i <= count; i++) {
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let total = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const item = mockItems[Math.floor(Math.random() * mockItems.length)];
      items.push({ ...item });
      total += item.price;
    }
    
    const counterId = mockCounters[Math.floor(Math.random() * mockCounters.length)].id;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const customerName = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
    
    // Generate a random time within the last 24 hours
    const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
    
    orders.push({
      id: `${1000 + i}`,
      customerName,
      counterId,
      items,
      total,
      status,
      createdAt,
      type: Math.random() > 0.3 ? 'dine-in' : 'takeaway',
    });
  }
  
  // Sort by time (newest first)
  return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Generate mock stats
const generateMockStats = (): Stats => {
  // Generate hourly data
  const generateHourlyData = () => {
    const hours = [];
    for (let i = 7; i <= 22; i++) {
      const hour = i <= 12 ? `${i}AM` : `${i - 12}PM`;
      hours.push({
        hour,
        sales: Math.floor(Math.random() * 500) + 100,
      });
    }
    return hours;
  };
  
  // Generate counter sales data
  const generateCounterSales = () => {
    return mockCounters.map(counter => ({
      counterId: counter.id,
      sales: Math.floor(Math.random() * 1000) + 500,
    }));
  };
  
  return {
    todayData: {
      totalSales: 1247.50,
      totalOrders: 42,
      totalCustomers: 38,
      avgPrepTime: 3,
      salesGrowth: 5.2,
      orderGrowth: 3.8,
      customerGrowth: 4.1,
      prepTimeChange: -2.3,
      hourlyData: generateHourlyData(),
      counterSales: generateCounterSales(),
    },
    weekData: {
      totalSales: 8327.75,
      totalOrders: 287,
      totalCustomers: 219,
      avgPrepTime: 2.8,
      salesGrowth: 8.7,
      orderGrowth: 7.2,
      customerGrowth: 6.5,
      prepTimeChange: -1.8,
      hourlyData: generateHourlyData(),
      counterSales: generateCounterSales(),
    },
    monthData: {
      totalSales: 31250.50,
      totalOrders: 1057,
      totalCustomers: 789,
      avgPrepTime: 2.5,
      salesGrowth: 12.3,
      orderGrowth: 10.5,
      customerGrowth: 9.8,
      prepTimeChange: -3.2,
      hourlyData: generateHourlyData(),
      counterSales: generateCounterSales(),
    },
  };
};

export const useMockData = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>(generateMockStats());
  
  useEffect(() => {
    // Generate initial data
    setOrders(generateMockOrders(20));
    
    // Simulate new orders coming in
    const interval = setInterval(() => {
      const shouldAddNewOrder = Math.random() > 0.7;
      
      if (shouldAddNewOrder) {
        const newOrder = generateMockOrders(1)[0];
        setOrders(prevOrders => [newOrder, ...prevOrders.slice(0, 19)]);
      } else {
        // Randomly update an existing order's status
        setOrders(prevOrders => {
          const orderToUpdate = prevOrders.findIndex(order => 
            order.status !== 'completed' && Math.random() > 0.5
          );
          
          if (orderToUpdate !== -1) {
            const updatedOrders = [...prevOrders];
            const currentStatus = updatedOrders[orderToUpdate].status;
            let newStatus;
            
            switch (currentStatus) {
              case 'new':
                newStatus = 'preparing';
                break;
              case 'preparing':
                newStatus = 'ready';
                break;
              case 'ready':
                newStatus = 'completed';
                break;
              default:
                newStatus = currentStatus;
            }
            
            updatedOrders[orderToUpdate] = {
              ...updatedOrders[orderToUpdate],
              status: newStatus,
            };
            
            return updatedOrders;
          }
          
          return prevOrders;
        });
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    counters: mockCounters,
    orders,
    stats,
  };
};