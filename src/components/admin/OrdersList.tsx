import React, { useState } from 'react';
import { Clock, CheckCircle2, Filter, Search } from 'lucide-react';
import { Order, Counter } from '../../types';
import { formatCurrency, formatTime } from '../../utils/formatters';

interface OrdersListProps {
  orders: Order[];
  counters: Counter[];
  compact?: boolean;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, counters, compact = false }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filter orders based on status and search query
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.id.toString().includes(searchQuery) || 
                          order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get counter name by ID
  const getCounterName = (counterId: string) => {
    const counter = counters.find(c => c.id === counterId);
    return counter ? counter.name : 'Unknown';
  };

  // Get status badge classes
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-amber-100 text-amber-800';
      case 'ready':
        return 'bg-emerald-100 text-emerald-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle order status change
  const handleStatusChange = (orderId: string, newStatus: string) => {
    console.log(`Order ${orderId} status changed to ${newStatus}`);
    // In a real application, this would update the order status in the database
  };

  if (compact) {
    return (
      <div className="overflow-hidden rounded-lg border border-emerald-100">
        <table className="min-w-full divide-y divide-emerald-100">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Counter</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-emerald-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-emerald-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-emerald-900">#{order.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-800">{getCounterName(order.counterId)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusClasses(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-800">{formatTime(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex items-center bg-white rounded-lg shadow-sm p-2 w-full md:w-64">
          <Search size={18} className="text-emerald-500 mr-2" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full bg-transparent outline-none text-emerald-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center bg-white rounded-lg shadow-sm p-2">
          <Filter size={18} className="text-emerald-500 mr-2" />
          <select 
            className="bg-transparent outline-none text-emerald-900 pr-8"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-emerald-100">
        <table className="min-w-full divide-y divide-emerald-100">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Counter</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-emerald-800 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-emerald-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-emerald-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-emerald-900">#{order.id}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-emerald-800">{order.customerName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-emerald-800">{getCounterName(order.counterId)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-emerald-800">{order.items.length}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-emerald-800">{formatCurrency(order.total)}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusClasses(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-emerald-800">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1 text-emerald-500" />
                    {formatTime(order.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {order.status !== 'completed' ? (
                    <select
                      className="text-xs bg-white border border-emerald-200 rounded-md py-1 px-2 text-emerald-800"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <div className="flex items-center justify-end text-emerald-600">
                      <CheckCircle2 size={16} className="mr-1" />
                      <span className="text-xs">Completed</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersList;