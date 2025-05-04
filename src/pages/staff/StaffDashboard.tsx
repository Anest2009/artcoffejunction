import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { getProductById } from '../../lib/supabase';
import { LogOut as LogOutIcon, Clipboard as ClipboardIcon, User as UserIcon, RefreshCw as RefreshCwIcon, BarChart as BarChartIcon } from 'lucide-react';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import './StaffDashboard.css';

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { orders, loading, error, updateOrder, fetchOrders } = useOrders();
  const [filter, setFilter] = useState<string>('all'); // Changed default to 'all' to show all orders
  const [activeTab, setActiveTab] = useState<string>('orders');
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  
  // Fetch product names when orders change
  useEffect(() => {
    const fetchProductNames = async () => {
      const productIds = new Set<string>();
      
      // Collect all unique product IDs from orders
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (item.product_id) {
            productIds.add(item.product_id.toString());
          }
        });
      });
      
      // Fetch product details for each unique ID
      const newProductNames: Record<string, string> = {};
      for (const productId of productIds) {
        try {
          const product = await getProductById(productId);
          if (product && product.name) {
            newProductNames[productId] = product.name;
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }
      
      setProductNames(newProductNames);
    };
    
    if (orders.length > 0) {
      fetchProductNames();
    }
  }, [orders]);
  
  // Add debugging to see what orders and items we're getting
  useEffect(() => {
    if (orders.length > 0) {
      console.log('Current user counter type:', user?.counter_type);
      console.log('All orders:', orders);
      
      // Log a sample order with its items
      if (orders[0] && orders[0].items) {
        console.log('Sample order items:', orders[0].items);
        
        // Log details about each item in the first order
        orders[0].items.forEach((item: any, index: number) => {
          console.log(`Item ${index}:`, {
            product_id: item.product_id,
            category: item.category,
            category_id: item.category_id,
            product_name: item.product?.name || 'Unknown'
          });
        });
      }
    }
  }, [orders, user?.counter_type]);
  
  // Filter orders based on status and counter type
  const filteredOrders = orders.filter(order => {
    // First check if the order belongs to this counter type
    // For admin users, show all orders
    if (user?.role !== 'admin' && user?.counter_type !== 'admin') {
      // For non-admin users, only show orders for their counter type
      const hasItemsForThisCounter = order.items?.some((item: any) => {
        // Get the product from the join query
        const product = item.product;
        
        // If we don't have product data, fall back to the ID
        if (!product) {
          console.log(`No product data for item ${item.id}, falling back to ID check`);
          return false;
        }
        
        // Get the product counter type and name
        const productCounterType = product.counter_type?.toLowerCase() || '';
        const productName = product.name?.toLowerCase() || '';
        
        // Log for debugging
        console.log(`Checking product: ${product.id}, Name: ${productName}, Counter Type: ${productCounterType}`);
        
        // Direct match based on counter_type
        if (user?.counter_type === 'coffee' && productCounterType === 'coffee') {
          console.log(`MATCH: Coffee product ${product.id}`);
          return true;
        }
        
        if ((user?.counter_type === 'food' || user?.counter_type === 'pastry') && 
            (productCounterType === 'food' || productCounterType === 'pastry')) {
          console.log(`MATCH: Food product ${product.id}`);
          return true;
        }
        
        if (user?.counter_type === 'bar' && productCounterType === 'bar') {
          console.log(`MATCH: Bar product ${product.id}`);
          return true;
        }
        
        // Fallback to name-based checks for pastry items
        if ((user?.counter_type === 'food' || user?.counter_type === 'pastry') && 
            (productName.includes('pain') || 
             productName.includes('chocolate') || 
             productName.includes('pastry') || 
             productName.includes('bread'))) {
          console.log(`MATCH: Food product ${product.id} (by name)`);
          return true;
        }
        
        // Make sure pastry items don't show in bar counter
        if (user?.counter_type === 'bar' && 
            (productName.includes('pain') || 
             productName.includes('chocolate') || 
             productName.includes('pastry') || 
             productName.includes('bread'))) {
          console.log(`EXCLUDING pastry item from bar counter: ${productName}`);
          return false;
        }
        
        return false;
      });
      
      if (!hasItemsForThisCounter) {
        return false;
      }
    }
    
    // Then filter by status
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Format timestamp to readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status actions based on current status
  const getStatusActions = (status: string) => {
    switch (status) {
      case 'pending':
        return [
          { label: 'Start Preparing', value: 'in-progress', className: 'btn-primary' }
        ];
      case 'in-progress':
        return [
          { label: 'Mark Complete', value: 'completed', className: 'btn-success' },
          { label: 'Cancel', value: 'cancelled', className: 'btn-danger' }
        ];
      default:
        return [];
    }
  };

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // First update the order status in the database
      await updateOrder(orderId, newStatus);
      
      // Always switch to the new status tab to see the updated order
      // This ensures the user can see the order in its new status
      setFilter(newStatus);
      
      // Show a success message (you could add a toast notification here)
      console.log(`Order #${orderId.substring(0, 8)} successfully updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  // Refresh orders manually
  const handleRefresh = () => {
    fetchOrders();
  };
  
  // Get counter info based on user's counter type
  const counterInfo = {
    name: user?.counter_type === 'coffee' ? 'Coffee' : 
          user?.counter_type === 'food' ? 'Food' : 
          user?.counter_type === 'bar' ? 'Bar' : 
          user?.counter_type === 'admin' ? 'Admin' : 'Staff',
    icon: <ClipboardIcon size={18} />
  };

  return (
    <div className="dashboard-wrapper">
      {/* Top Navigation */}
      <header className="top-nav">
        <div className="brand">
          <div className="logo-wrapper">
            {counterInfo.icon}
          </div>
          <h1>Art Coffee</h1>
        </div>
        
        <div className="user-menu">
          <div className="user-info">
            <span className="user-name">{user?.name || 'Staff Member'}</span>
            <span className="user-role">
              {counterInfo.name} {user?.role === 'admin' ? '• Admin' : ''}
            </span>
          </div>
          <button 
            onClick={() => logout()}
            className="btn-secondary logout-btn"
            aria-label="Sign out"
          >
            <LogOutIcon size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Tab Navigation */}
        <nav className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardIcon size={18} />
            <span>Orders</span>
          </button>
          
          {/* Analytics Tab - Available for all users */}
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChartIcon size={18} />
            <span>Analytics</span>
          </button>
          
          {user?.role === 'admin' && (
            <a 
              href="/admin/users" 
              className="tab-button"
            >
              <UserIcon size={18} />
              <span>User Management</span>
            </a>
          )}
        </nav>
        
        {/* Content Panel - Shows either Orders or Analytics based on active tab */}
        {activeTab === 'orders' ? (
          <div className="panel card-neumorphic">
            <div className="panel-header">
              <h2>{counterInfo.name} Counter Dashboard</h2>
            
            <div className="panel-actions">
              <div className="filter-wrapper">
                <label htmlFor="statusFilter">Filter:</label>
                <select 
                  id="statusFilter"
                  className="select-neumorphic"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Orders ({orders.length})</option>
                  <option value="pending">Pending ({orders.filter(o => o.status === 'pending').length})</option>
                  <option value="in-progress">In Progress ({orders.filter(o => o.status === 'in-progress').length})</option>
                  <option value="completed">Completed ({orders.filter(o => o.status === 'completed').length})</option>
                  <option value="cancelled">Cancelled ({orders.filter(o => o.status === 'cancelled').length})</option>
                </select>
              </div>
              
              <button 
                className="btn-primary refresh-btn"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCwIcon size={16} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Orders Content */}
          <div className="panel-content">
            {error && (
              <div className="error-alert">
                <span>Error loading orders: {error}</span>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="orders-grid">
                {filteredOrders.map(order => (
                  <div key={order.id} className="order-card glass-panel">
                    <div className="order-header">
                      <div>
                        <h3 className="order-id">Order #{order.id.substring(0, 8)}</h3>
                        <span className="order-time">{formatTime(order.created_at)}</span>
                      </div>
                      <div className={`status-badge status-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="order-items">
                      <h4>Items</h4>
                      <ul>
                        {order.items.map((item: any) => {
                          // Use type 'any' to avoid TypeScript errors with different order item structures
                          // Calculate the price to display, checking multiple possible fields
                          let priceToShow = 0;
                          if (typeof item.price === 'number') priceToShow = item.price;
                          else if (typeof item.unit_price === 'number') priceToShow = item.unit_price;
                          else if (typeof item.total_price === 'number') priceToShow = item.total_price;
                          
                          // Get a product name to display
                          let productName = `Product #${item.product_id}`;
                          
                          // Use the product name from our cache if available
                          if (productNames[item.product_id]) {
                            productName = productNames[item.product_id];
                          } else if (item.product && item.product.name) {
                            productName = item.product.name;
                          }
                          
                          // Parse customizations from notes if they exist
                          let customizations = null;
                          if (item.notes && item.notes.startsWith('{')) {
                            try {
                              customizations = JSON.parse(item.notes);
                              // Make sure price is calculated correctly including customizations
                              if (customizations && Object.keys(customizations).length > 0) {
                                // Add any price adjustments from customizations if they exist
                                const customizationAdjustments = item.customization_adjustments || 0;
                                priceToShow += customizationAdjustments;
                              }
                            } catch (e) {
                              // If it's not valid JSON, just use as regular notes
                              console.log('Error parsing customizations:', e);
                            }
                          }
                          
                          return (
                            <li key={item.id} className="order-item">
                              <div className="item-main">
                                <span className="item-quantity">{item.quantity}×</span>
                                <span className="item-name">{productName}</span>
                                <span className="item-price">${priceToShow.toFixed(2)}</span>
                              </div>
                              
                              {/* Display customizations with name attribute */}
                              {(() => {
                                // Check if this is a drink product that might have customizations
                                const isDrinkProduct = productName.toLowerCase().includes('coffee') || 
                                  productName.toLowerCase().includes('tea') || 
                                  productName.toLowerCase().includes('latte') || 
                                  productName.toLowerCase().includes('espresso');
                                
                                if (isDrinkProduct && customizations) {
                                  return (
                                    <div className="item-customizations">
                                      <h4 className="customization-title">Customizations:</h4>
                                      <ul className="customization-list">
                                        {/* Milk customization */}
                                        <li className="customization-item">
                                          <span className="customization-type">Milk:</span> 
                                          <span className="customization-value">{customizations.milk || 'Regular'}</span>
                                        </li>
                                        
                                        {/* Sugar customization */}
                                        <li className="customization-item">
                                          <span className="customization-type">Sugar:</span> 
                                          <span className="customization-value">{customizations.sugar || '0'} level</span>
                                        </li>
                                        
                                        {/* Ice customization */}
                                        <li className="customization-item">
                                          <span className="customization-type">Ice:</span> 
                                          <span className="customization-value">{customizations.ice || 'None'}</span>
                                        </li>
                                        
                                        {/* Flavor customization - only if it exists */}
                                        {customizations.flavor && (
                                          <li className="customization-item">
                                            <span className="customization-type">Flavor:</span> 
                                            <span className="customization-value">
                                              {Array.isArray(customizations.flavor) 
                                                ? customizations.flavor.join(', ') 
                                                : customizations.flavor}
                                            </span>
                                          </li>
                                        )}
                                        
                                        {/* Temperature customization - only if it exists */}
                                        {customizations.temperature && (
                                          <li className="customization-item">
                                            <span className="customization-type">Temp:</span> 
                                            <span className="customization-value">{customizations.temperature}</span>
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  );
                                }
                                
                                // Show notes if they exist and aren't JSON
                                if (item.notes && !item.notes.startsWith('{')) {
                                  return <p className="item-notes">{item.notes}</p>;
                                }
                                
                                return null;
                              })()}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <div className="order-actions">
                        {getStatusActions(order.status).map(action => (
                          <button
                            key={action.value}
                            className={`btn-${action.value === 'in-progress' ? 'primary' : 
                                        action.value === 'completed' ? 'success' : 'danger'}`}
                            onClick={() => handleStatusUpdate(order.id, action.value)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <ClipboardIcon size={48} color="#A3B18A" />
                </div>
                <h3>No Orders Found</h3>
                <p>There are no {filter === 'all' ? '' : filter} orders for the {counterInfo.name} counter.</p>
              </div>
            )}
          </div>
        </div>
        ) : activeTab === 'analytics' ? (
          <div className="panel card-neumorphic">
            <div className="panel-header">
              <h2>Sales Analytics</h2>
            </div>
            <div className="panel-content">
              <AnalyticsDashboard />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default StaffDashboard;
