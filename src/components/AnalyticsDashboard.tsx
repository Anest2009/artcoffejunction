import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getRevenueData, getOrderStatusBreakdown, getPopularProducts } from '../lib/supabase';
import { ArrowUp, ArrowDown, DollarSign, ShoppingBag, Clock, Award } from 'lucide-react';
import './AnalyticsDashboard.css';

type TimePeriod = 'day' | 'week' | 'month';

const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('day');
  const [revenueData, setRevenueData] = useState<any>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [revenueResult, statusResult, productsResult] = await Promise.all([
          getRevenueData(period),
          getOrderStatusBreakdown(period),
          getPopularProducts(period, 5)
        ]);
        
        setRevenueData(revenueResult);
        setStatusData(statusResult);
        setPopularProducts(productsResult.popularProducts);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [period]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Get period label
  const getPeriodLabel = () => {
    switch(period) {
      case 'day': return 'Last 24 Hours';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      default: return 'Last 24 Hours';
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button 
          className="btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Sales Analytics</h2>
        <div className="period-selector">
          <button 
            className={`period-button ${period === 'day' ? 'active' : ''}`}
            onClick={() => setPeriod('day')}
          >
            24h
          </button>
          <button 
            className={`period-button ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            7d
          </button>
          <button 
            className={`period-button ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            30d
          </button>
        </div>
      </div>
      
      <div className="analytics-period-label">
        <Clock size={16} />
        <span>{getPeriodLabel()}</span>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="stat-value">{formatCurrency(revenueData?.totalRevenue || 0)}</div>
            {/* Add trend indicator here if you have previous period data */}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="stat-value">{statusData?.totalOrders || 0}</div>
            {/* Add trend indicator here if you have previous period data */}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h3>Completion Rate</h3>
            <div className="stat-value">
              {statusData?.totalOrders ? 
                Math.round((statusData.statusBreakdown.find((s: any) => s.name === 'Completed')?.value || 0) / statusData.totalOrders * 100) + '%' 
                : '0%'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-container">
          <h3>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={revenueData?.revenueBreakdown || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="value" fill="#4ade80" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Order Status Breakdown */}
        <div className="chart-container">
          <h3>Order Status</h3>
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData?.statusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData?.statusBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Orders']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Popular Products */}
      <div className="popular-products">
        <h3>Top Selling Products</h3>
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {popularProducts.length > 0 ? (
                popularProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name">
                        <span className="rank">{index + 1}</span>
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(product.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="no-data">No sales data available for this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
