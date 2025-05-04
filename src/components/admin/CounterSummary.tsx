import React from 'react';
import { Coffee, Cake, Package, ExternalLink, Clock } from 'lucide-react';
import { Counter } from '../../types';

interface CounterSummaryProps {
  counter: Counter;
  pendingOrders: number;
}

const CounterSummary: React.FC<CounterSummaryProps> = ({ counter, pendingOrders }) => {
  // Define icon based on counter type
  const getIcon = () => {
    switch (counter.type) {
      case 'bar':
        return <Coffee size={24} className="text-amber-600" />;
      case 'pastry':
        return <Cake size={24} className="text-rose-600" />;
      case 'ground-coffee':
        return <Package size={24} className="text-brown-600" />;
      default:
        return <Coffee size={24} className="text-emerald-600" />;
    }
  };
  
  // Get background gradient based on counter type
  const getGradient = () => {
    switch (counter.type) {
      case 'bar':
        return 'from-amber-50 to-amber-100/40';
      case 'pastry':
        return 'from-rose-50 to-rose-100/40';
      case 'ground-coffee':
        return 'from-stone-50 to-stone-100/40';
      default:
        return 'from-emerald-50 to-emerald-100/40';
    }
  };

  return (
    <div className={`rounded-xl p-6 shadow-lg bg-gradient-to-br ${getGradient()} border border-emerald-50 transition-all hover:shadow-xl`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="p-3 bg-white rounded-lg shadow-sm mr-3">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-emerald-900">{counter.name}</h3>
        </div>
        <button className="p-2 hover:bg-white/60 rounded-lg transition-all">
          <ExternalLink size={18} className="text-emerald-700" />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-emerald-800">Pending Orders</span>
          <span className="text-sm font-medium text-emerald-900">{pendingOrders}</span>
        </div>
        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (pendingOrders / 10) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center text-emerald-800">
          <Clock size={16} className="mr-1" />
          <span className="text-sm">Avg. Prep Time: {counter.avgPrepTime} min</span>
        </div>
        <div className="text-sm font-medium text-emerald-900">
          {counter.staffCount} staff active
        </div>
      </div>
    </div>
  );
};

export default CounterSummary;