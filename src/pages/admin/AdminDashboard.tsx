import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRevenueData, getPopularProducts } from '../../lib/supabase';
import { 
  LogOut as LogOutIcon, 
  Users as UsersIcon, 
  Package as PackageIcon, 
  BarChart as BarChartIcon, 
  Coffee as CoffeeIcon, 
  PieChart as PieChartIcon,
  DollarSign as DollarSignIcon
} from 'lucide-react';
import ProductManagement from './ProductManagement';
import StaffManagement from './StaffManagement';
import './AdminDashboardNew.css';

// Simple Revenue Chart component
const RevenueChart = ({ data }: { data: any[] }) => {
  // Find the max value to calculate bar heights
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  return (
    <div className="chart-container">
      {data.map((item, index) => (
        <div key={index} className="chart-bar-wrapper">
          <div 
            className="chart-bar" 
            style={{ 
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: '#4B2E2B'
            }}
          >
            <span className="chart-value">${item.value.toFixed(2)}</span>
          </div>
          <span className="chart-label">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

// Counter Sales component
const CounterSales = ({ revenueData }: { revenueData: {coffee: number, food: number, bar: number} }) => {
  // Calculate percentages for each counter
  const total = revenueData.coffee + revenueData.food + revenueData.bar || 1;
  const coffeePercentage = (revenueData.coffee / total) * 100;
  const foodPercentage = (revenueData.food / total) * 100;
  const barPercentage = (revenueData.bar / total) * 100;
  
  return (
    <div className="counter-sales">
      <div className="counter-bars">
        <div className="counter-bar-wrapper">
          <div className="counter-label">
            <CoffeeIcon size={16} />
            <span>Coffee</span>
          </div>
          <div className="counter-bar-container">
            <div 
              className="counter-bar" 
              style={{ 
                width: `${coffeePercentage}%`,
                backgroundColor: '#8B4513'
              }}
            ></div>
            <span className="counter-value">${revenueData.coffee.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="counter-bar-wrapper">
          <div className="counter-label">
            <PieChartIcon size={16} />
            <span>Food</span>
          </div>
          <div className="counter-bar-container">
            <div 
              className="counter-bar" 
              style={{ 
                width: `${foodPercentage}%`,
                backgroundColor: '#D4AF37'
              }}
            ></div>
            <span className="counter-value">${revenueData.food.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="counter-bar-wrapper">
          <div className="counter-label">
            <CoffeeIcon size={16} />
            <span>Bar</span>
          </div>
          <div className="counter-bar-container">
            <div 
              className="counter-bar" 
              style={{ 
                width: `${barPercentage}%`,
                backgroundColor: '#4B2E2B'
              }}
            ></div>
            <span className="counter-value">${revenueData.bar.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="counter-total">
        <span className="total-label">Total Revenue:</span>
        <span className="total-value">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

// Popular products component
const PopularProducts = ({ products }: { products: any[] }) => {
  return (
    <ul className="product-list">
      {products.slice(0, 5).map((product, index) => (
        <li key={index} className="product-item">
          <div className="product-rank">{index + 1}</div>
          <div className="product-info">
            <div className="product-name">{product.name}</div>
            <div className="product-counter">{product.counter_type}</div>
          </div>
          <div className="product-sales">
            <div className="product-count">{product.count} sold</div>
            <div className="product-revenue">${product.revenue?.toFixed(2) || '0.00'}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

const AdminDashboardNew: React.FC = () => {
  const { user, logout } = useAuth();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'staff'>('analytics');
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedCounter, setSelectedCounter] = useState<'all' | 'coffee' | 'food' | 'bar'>('all');
  
  // Analytics data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [counterSales, setCounterSales] = useState<{coffee: number, food: number, bar: number}>({
    coffee: 0,
    food: 0,
    bar: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      try {
        // Fetch revenue data
        const revenue = await getRevenueData(timePeriod);
        setRevenueData(revenue.revenueBreakdown || []);
        
        // Calculate counter-specific revenue
        const counterRevenue = {
          coffee: 0,
          food: 0,
          bar: 0
        };
        
        // This would need to be implemented in the backend
        // For now, we'll just simulate it with random data
        const total = revenue.totalRevenue || 0;
        counterRevenue.coffee = total * 0.4; // 40% of total
        counterRevenue.food = total * 0.35; // 35% of total
        counterRevenue.bar = total * 0.25; // 25% of total
        
        setCounterSales(counterRevenue);
        
        // Fetch popular products
        const productsData = await getPopularProducts(timePeriod);
        // Convert to the expected format for the component
        const formattedProducts = productsData.popularProducts?.map(product => ({
          id: product.id,
          name: product.name,
          counter_type: product.categoryId === 'coffee' ? 'coffee' : 
                       product.categoryId === 'food' || product.categoryId === 'pastry' ? 'food' : 'bar',
          count: product.quantity,
          revenue: product.revenue
        })) || [];
        
        // Filter by counter type if needed
        const filteredProducts = selectedCounter === 'all' 
          ? formattedProducts 
          : formattedProducts.filter(p => p.counter_type === selectedCounter);
        
        setPopularProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timePeriod, selectedCounter]);
  
  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="logo-container">
          <div className="logo">
            <CoffeeIcon size={24} />
          </div>
          <h1>Art Coffee</h1>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChartIcon size={20} />
            <span>Analytics</span>
          </button>
          
          <button 
            className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <PackageIcon size={20} />
            <span>Products</span>
          </button>
          
          <button 
            className={`sidebar-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <UsersIcon size={20} />
            <span>Staff Management</span>
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="page-title">
            <h2>
              {activeTab === 'analytics' ? 'Sales Analytics' : 
               activeTab === 'products' ? 'Product Management' : 
               'Staff Management'}
            </h2>
          </div>
          
          <div className="user-controls">
            <div className="user-info">
              <div className="user-name">{user?.name || 'Admin'}</div>
              <div className="user-role">Administrator</div>
            </div>
            
            <button onClick={logout} className="logout-btn">
              <LogOutIcon size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        
        <div className="admin-main">
          {activeTab === 'analytics' && (
            <div className="analytics-container">
              <div className="analytics-filters">
                <div className="filter-group">
                  <label htmlFor="time-period">Time Period:</label>
                  <select
                    id="time-period"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as 'day' | 'week' | 'month')}
                    className="filter-select"
                  >
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="counter-type">Counter:</label>
                  <select
                    id="counter-type"
                    value={selectedCounter}
                    onChange={(e) => setSelectedCounter(e.target.value as 'all' | 'coffee' | 'food' | 'bar')}
                    className="filter-select"
                  >
                    <option value="all">All Counters</option>
                    <option value="coffee">Coffee Counter</option>
                    <option value="food">Food Counter</option>
                    <option value="bar">Bar Counter</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading analytics data...</p>
                </div>
              ) : (
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="card-header">
                      <h4>Revenue Over Time</h4>
                      <DollarSignIcon size={20} />
                    </div>
                    <RevenueChart data={revenueData} />
                  </div>
                  
                  <div className="analytics-card">
                    <div className="card-header">
                      <h4>Counter Sales</h4>
                      <CoffeeIcon size={20} />
                    </div>
                    <CounterSales revenueData={counterSales} />
                  </div>
                  
                  <div className="analytics-card">
                    <div className="card-header">
                      <h4>Popular Products</h4>
                      <PackageIcon size={20} />
                    </div>
                    <PopularProducts products={popularProducts} />
                  </div>
                  
                  <div className="analytics-card">
                    <div className="card-header">
                      <h4>Revenue Summary</h4>
                      <DollarSignIcon size={20} />
                    </div>
                    <div className="revenue-summary">
                      <div className="summary-row">
                        <div className="summary-label">Total Revenue</div>
                        <div className="summary-value">${(counterSales.coffee + counterSales.food + counterSales.bar).toFixed(2)}</div>
                      </div>
                      <div className="summary-row">
                        <div className="summary-label">Coffee Sales</div>
                        <div className="summary-value">${counterSales.coffee.toFixed(2)}</div>
                      </div>
                      <div className="summary-row">
                        <div className="summary-label">Food Sales</div>
                        <div className="summary-value">${counterSales.food.toFixed(2)}</div>
                      </div>
                      <div className="summary-row">
                        <div className="summary-label">Bar Sales</div>
                        <div className="summary-value">${counterSales.bar.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'products' && (
            <div className="products-container">
              <ProductManagement />
            </div>
          )}
          
          {activeTab === 'staff' && (
            <div className="staff-container">
              <StaffManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
