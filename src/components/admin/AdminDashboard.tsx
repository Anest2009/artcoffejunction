import React, { useState } from 'react';
import CounterSummary from './CounterSummary';
import OrdersList from './OrdersList';
import StatsOverview from './StatsOverview';
import { useMockData } from '../../hooks/useMockData';
import { LayoutGrid, BarChart3, List } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'stats'>('dashboard');
  const { counters, orders, stats } = useMockData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-stone-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-emerald-900">Nature's Brew Admin</h1>
          <nav className="flex bg-emerald-50 p-1 rounded-lg shadow-sm">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center px-4 py-2 rounded-md transition-all ${
                activeView === 'dashboard' 
                  ? 'bg-white text-emerald-800 shadow-sm' 
                  : 'text-emerald-600 hover:bg-white/50'
              }`}
            >
              <LayoutGrid size={18} className="mr-2" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveView('orders')}
              className={`flex items-center px-4 py-2 rounded-md transition-all ${
                activeView === 'orders' 
                  ? 'bg-white text-emerald-800 shadow-sm' 
                  : 'text-emerald-600 hover:bg-white/50'
              }`}
            >
              <List size={18} className="mr-2" />
              <span>Orders</span>
            </button>
            <button 
              onClick={() => setActiveView('stats')}
              className={`flex items-center px-4 py-2 rounded-md transition-all ${
                activeView === 'stats' 
                  ? 'bg-white text-emerald-800 shadow-sm' 
                  : 'text-emerald-600 hover:bg-white/50'
              }`}
            >
              <BarChart3 size={18} className="mr-2" />
              <span>Statistics</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {counters.map((counter) => (
                <CounterSummary 
                  key={counter.id} 
                  counter={counter} 
                  pendingOrders={orders.filter(
                    order => order.counterId === counter.id && order.status !== 'completed'
                  ).length} 
                />
              ))}
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-emerald-50">
              <h2 className="text-xl font-semibold text-emerald-900 mb-4">Recent Orders</h2>
              <OrdersList 
                orders={orders.slice(0, 5)} 
                counters={counters} 
                compact={true} 
              />
            </div>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-emerald-50">
            <h2 className="text-xl font-semibold text-emerald-900 mb-4">All Orders</h2>
            <OrdersList orders={orders} counters={counters} />
          </div>
        )}

        {activeView === 'stats' && (
          <StatsOverview stats={stats} counters={counters} />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;