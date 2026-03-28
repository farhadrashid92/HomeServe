import { useState } from 'react';
import { Users, Wrench, FileText, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-slate-900 rounded-3xl shadow-sm p-6 sticky top-24 text-white">
            <h2 className="font-extrabold text-xl mb-8 tracking-tight text-white/90">Admin Console</h2>
            
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-primary-600 text-white font-semibold shadow-lg shadow-primary-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <BarChart3 className="w-5 h-5" /> Analytics
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-primary-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Users className="w-5 h-5" /> Manage Users
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'services' ? 'bg-primary-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Wrench className="w-5 h-5" /> Services Catalog
              </button>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'bookings' ? 'bg-primary-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <FileText className="w-5 h-5" /> All Bookings
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Platform Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</h3>
                  <div className="text-4xl font-extrabold text-slate-900">1,248</div>
                  <p className="text-emerald-500 text-sm mt-2 font-medium">+12% this month</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Providers</h3>
                  <div className="text-4xl font-extrabold text-slate-900">342</div>
                  <p className="text-emerald-500 text-sm mt-2 font-medium">+5% this month</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Bookings Completed</h3>
                  <div className="text-4xl font-extrabold text-slate-900">12,503</div>
                  <p className="text-emerald-500 text-sm mt-2 font-medium">+18% this month</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab !== 'overview' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex items-center justify-center min-h-[400px] text-slate-400">
              <span className="text-lg font-medium">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view coming soon</span>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;
