import { useState, useEffect } from 'react';
import { Users, Wrench, FileText, BarChart3, Trash2 } from 'lucide-react';
import { getAdminAnalytics, getAdminUsers, deleteUser, getAdminServices, deleteService, getAdminBookings } from '../services/adminService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalProviders: 0, totalBookings: 0, completedBookings: 0 });
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') setAnalytics(await getAdminAnalytics());
      if (activeTab === 'users') setUsers(await getAdminUsers());
      if (activeTab === 'services') setServices(await getAdminServices());
      if (activeTab === 'bookings') setBookings(await getAdminBookings());
    } catch (err) {
      console.error(err);
      alert('Failed to load data. Are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm('Are you sure you want to completely delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDeleteService = async (id) => {
    if(!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(id);
      setServices(services.filter(s => s._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

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
          
          {loading ? (
             <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
             </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Platform Analytics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</h3>
                      <div className="text-4xl font-extrabold text-slate-900">{analytics.totalUsers}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Providers</h3>
                      <div className="text-4xl font-extrabold text-slate-900">{analytics.totalProviders}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Bookings</h3>
                      <div className="text-4xl font-extrabold text-slate-900">{analytics.totalBookings}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 whitespace-nowrap">
                      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Completed</h3>
                      <div className="text-4xl font-extrabold text-slate-900">{analytics.completedBookings}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{u.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'provider' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Service Title</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {services.map(s => (
                        <tr key={s._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{s.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 capitalize">{s.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 pr-2">PKR {s.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                             <button onClick={() => handleDeleteService(s._id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Service</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Provider</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {bookings.map(b => (
                        <tr key={b._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap truncate max-w-[200px]">{b.service?.title || 'Unknown'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">{b.user?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">{b.provider?.name || 'Unassigned'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${
                               b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                               b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                               'bg-red-100 text-red-700'
                             }`}>
                               {b.status.toUpperCase()}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
