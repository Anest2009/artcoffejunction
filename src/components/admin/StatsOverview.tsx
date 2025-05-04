import React, { useState } from 'react';
import { CalendarDays, TrendingUp, PieChart, DollarSign, Users, Clock } from 'lucide-react';
import { Stats, Counter } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface StatsOverviewProps {
  stats: Stats;
  counters: Counter[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, counters }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  // Get data based on selected time range
  const getTimeRangeData = () => {
    switch (timeRange) {
      case 'week':
        return stats.weekData;
      case 'month':
        return stats.monthData;
      default:
        return stats.todayData;
    }
  };

  const currentData = getTimeRangeData();

  // Calculate counter percentages for the pie chart visualization
  const calculatePercentages = () => {
    const total = counters.reduce((sum, counter) => {
      const counterData = currentData.counterSales.find(c => c.counterId === counter.id);
      return sum + (counterData?.sales || 0);
    }, 0);
    
    return counters.map(counter => {
      const counterData = currentData.counterSales.find(c => c.counterId === counter.id);
      const sales = counterData?.sales || 0;
      const percentage = total > 0 ? (sales / total) * 100 : 0;
      return {
        ...counter,
        sales,
        percentage
      };
    });
  };

  const counterPercentages = calculatePercentages();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-emerald-900">Performance Overview</h2>
        <div className="bg-white rounded-lg shadow-sm p-1 flex">
          <button 
            onClick={() => setTimeRange('today')} 
            className={`px-4 py-1.5 rounded-md text-sm ${
              timeRange === 'today' 
                ? 'bg-emerald-100 text-emerald-800 font-medium' 
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-4 py-1.5 rounded-md text-sm ${
              timeRange === 'week' 
                ? 'bg-emerald-100 text-emerald-800 font-medium' 
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            This Week
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-4 py-1.5 rounded-md text-sm ${
              timeRange === 'month' 
                ? 'bg-emerald-100 text-emerald-800 font-medium' 
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-lg border border-emerald-50">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-emerald-100 mr-3">
              <DollarSign size={20} className="text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-emerald-600">Total Sales</h3>
              <p className="text-2xl font-semibold text-emerald-900">{formatCurrency(currentData.totalSales)}</p>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <TrendingUp size={14} className={currentData.salesGrowth >= 0 ? "text-emerald-600" : "text-red-600"} />
            <span className={`ml-1 ${currentData.salesGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {Math.abs(currentData.salesGrowth)}% 
            </span>
            <span className="ml-1 text-emerald-500">from previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg border border-emerald-50">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <Users size={20} className="text-blue-700" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600">Total Customers</h3>
              <p className="text-2xl font-semibold text-emerald-900">{currentData.totalCustomers}</p>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <TrendingUp size={14} className={currentData.customerGrowth >= 0 ? "text-emerald-600" : "text-red-600"} />
            <span className={`ml-1 ${currentData.customerGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {Math.abs(currentData.customerGrowth)}% 
            </span>
            <span className="ml-1 text-emerald-500">from previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg border border-emerald-50">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-amber-100 mr-3">
              <CalendarDays size={20} className="text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-600">Orders</h3>
              <p className="text-2xl font-semibold text-emerald-900">{currentData.totalOrders}</p>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <TrendingUp size={14} className={currentData.orderGrowth >= 0 ? "text-emerald-600" : "text-red-600"} />
            <span className={`ml-1 ${currentData.orderGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {Math.abs(currentData.orderGrowth)}% 
            </span>
            <span className="ml-1 text-emerald-500">from previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg border border-emerald-50">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-rose-100 mr-3">
              <Clock size={20} className="text-rose-700" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-rose-600">Avg. Preparation Time</h3>
              <p className="text-2xl font-semibold text-emerald-900">{currentData.avgPrepTime} min</p>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <TrendingUp size={14} className={currentData.prepTimeChange <= 0 ? "text-emerald-600" : "text-red-600"} />
            <span className={`ml-1 ${currentData.prepTimeChange <= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {Math.abs(currentData.prepTimeChange)}% 
            </span>
            <span className="ml-1 text-emerald-500">from previous period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-lg border border-emerald-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-emerald-900">Sales Trend</h3>
            <div className="flex items-center text-sm text-emerald-700">
              <PieChart size={16} className="mr-1" />
              <span>By Hours</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end">
            {currentData.hourlyData.map((hour, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full max-w-[30px] bg-emerald-200 rounded-t-sm transition-all hover:bg-emerald-300"
                  style={{ height: `${(hour.sales / Math.max(...currentData.hourlyData.map(h => h.sales))) * 100}%` }}
                ></div>
                <span className="text-xs text-emerald-800 mt-2">{hour.hour}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-emerald-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-emerald-900">Counter Distribution</h3>
            <div className="flex items-center text-sm text-emerald-700">
              <PieChart size={16} className="mr-1" />
              <span>By Sales</span>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40 rounded-full">
              {counterPercentages.map((counter, index) => {
                // Calculate the coordinates for each counter label
                const angle = (index / counterPercentages.length) * 2 * Math.PI;
                const x = 100 + Math.cos(angle) * 100;
                const y = 100 + Math.sin(angle) * 100;
                
                // Determine the color based on counter type
                let color;
                switch (counter.type) {
                  case 'bar':
                    color = 'bg-amber-500';
                    break;
                  case 'pastry':
                    color = 'bg-rose-500';
                    break;
                  case 'ground-coffee':
                    color = 'bg-stone-500';
                    break;
                  default:
                    color = 'bg-emerald-500';
                }
                
                // Calculate the size of each segment
                const previousPercentages = counterPercentages
                  .slice(0, index)
                  .reduce((sum, c) => sum + c.percentage, 0);
                
                return (
                  <div 
                    key={counter.id}
                    className={`absolute top-0 left-0 w-40 h-40 rounded-full ${color}`}
                    style={{
                      clipPath: `conic-gradient(
                        from ${previousPercentages * 3.6}deg, 
                        transparent ${previousPercentages * 3.6}deg, 
                        currentColor ${previousPercentages * 3.6}deg ${(previousPercentages + counter.percentage) * 3.6}deg, 
                        transparent ${(previousPercentages + counter.percentage) * 3.6}deg
                      )`
                    }}
                  ></div>
                );
              })}
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-emerald-900">{formatCurrency(currentData.totalSales)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {counterPercentages.map((counter) => {
              // Determine the color based on counter type
              let colorDot;
              switch (counter.type) {
                case 'bar':
                  colorDot = 'bg-amber-500';
                  break;
                case 'pastry':
                  colorDot = 'bg-rose-500';
                  break;
                case 'ground-coffee':
                  colorDot = 'bg-stone-500';
                  break;
                default:
                  colorDot = 'bg-emerald-500';
              }
              
              return (
                <div key={counter.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${colorDot} rounded-full mr-2`}></div>
                    <span className="text-sm text-emerald-900">{counter.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-emerald-900 mr-2">{formatCurrency(counter.sales)}</span>
                    <span className="text-xs text-emerald-600">({counter.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;