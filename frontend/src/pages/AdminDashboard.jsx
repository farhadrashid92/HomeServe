import { useState, useEffect } from 'react';
import { Users, Wrench, FileText, BarChart3, Trash2, Edit, Plus, X, Tag } from 'lucide-react';
import { getAdminAnalytics, getAdminUsers, deleteUser, getAdminServices, deleteService, getAdminBookings } from '../services/adminService';
import { createService, updateService } from '../services/serviceService';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalProviders: 0, totalBookings: 0, completedBookings: 0 });
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ title: '', category: '', price: '', description: '', image: '' });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') setAnalytics(await getAdminAnalytics());
      if (activeTab === 'users') setUsers(await getAdminUsers());
      if (activeTab === 'services') {
         setServices(await getAdminServices());
         setCategories(await getCategories());
      }
      if (activeTab === 'bookings') setBookings(await getAdminBookings());
      if (activeTab === 'categories') setCategories(await getCategories());
    } catch (err) {
      console.error(err);
      alert('Failed to load data. Are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  // --- User Handlers ---
  const handleDeleteUser = async (id) => {
    if(!window.confirm('Are you sure you want to completely delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // --- Service Handlers ---
  const handleDeleteService = async (id) => {
    if(!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(id);
      setServices(services.filter(s => s._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceForm({ title: '', category: categories.length > 0 ? categories[0].name : '', price: '', description: '', image: '' });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service) => {
    setEditingService(service);
    setServiceForm({ 
       title: service.title, 
       category: service.category, 
       price: service.price, 
       description: service.description, 
       image: service.image || '' 
    });
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
         const updated = await updateService(editingService._id, serviceForm);
         setServices(services.map(s => s._id === updated._id ? updated : s));
      } else {
         const created = await createService(serviceForm);
         setServices([created, ...services]);
      }
      setIsServiceModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  // --- Category Handlers ---
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '' });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory._id, categoryForm);
        setCategories(categories.map(c => c._id === updated._id ? updated : c));
      } else {
        const created = await createCategory(categoryForm);
        setCategories([...categories, created]);
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm('Delete this category? Services using it will keep their current assignment.')) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c._id !== id));
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
            <h2 className="font-extrabold text-xl mb-8 tracking-tight text-white/90">Admin Panel</h2>
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
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'categories' ? 'bg-primary-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Tag className="w-5 h-5" /> Categories
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
              {/* ===== ANALYTICS ===== */}
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
              
              {/* ===== USERS TABLE ===== */}
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

              {/* ===== CATEGORIES TABLE ===== */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">Manage Categories</h2>
                    <button onClick={openAddCategoryModal} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
                      <Plus className="w-4 h-4" /> Add Category
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {categories.length > 0 ? categories.map(cat => (
                          <tr key={cat._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                              <span className="inline-flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary-500" />
                                {cat.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">{cat.description || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                               <button onClick={() => openEditCategoryModal(cat)} className="text-blue-500 hover:text-blue-700 p-2"><Edit className="w-5 h-5"/></button>
                               <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5"/></button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-10 text-center text-slate-400">No categories yet. Click "Add Category" to create one.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== SERVICES TABLE ===== */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button onClick={openAddServiceModal} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
                      <Plus className="w-4 h-4" /> Add New Service
                    </button>
                  </div>
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
                            <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                               <button onClick={() => openEditServiceModal(s)} className="text-blue-500 hover:text-blue-700 p-2"><Edit className="w-5 h-5"/></button>
                               <button onClick={() => handleDeleteService(s._id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5"/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== BOOKINGS TABLE ===== */}
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

      {/* ===== SERVICE ADD/EDIT MODAL ===== */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="serviceForm" onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Title</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Deep Home Cleaning" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white" value={serviceForm.category} onChange={e => setServiceForm({...serviceForm, category: e.target.value})}>
                      <option value="" disabled>Select category</option>
                      {categories.map(cat => (
                         <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Price (PKR)</label>
                     <input required type="number" min="0" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="1500" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea required rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Detailed description of exactly what is included..." value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input type="url" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="https://example.com/image.jpg" value={serviceForm.image} onChange={e => setServiceForm({...serviceForm, image: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
               <button onClick={() => setIsServiceModalOpen(false)} className="px-5 py-2 text-slate-500 hover:text-slate-700 font-medium rounded-xl">Cancel</button>
               <button type="submit" form="serviceForm" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                  {editingService ? 'Save Changes' : 'Create Service'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CATEGORY ADD/EDIT MODAL ===== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form id="categoryForm" onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Solar Installation" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-slate-400">(optional)</span></label>
                  <textarea rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Brief description of this service category..." value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
               <button onClick={() => setIsCategoryModalOpen(false)} className="px-5 py-2 text-slate-500 hover:text-slate-700 font-medium rounded-xl">Cancel</button>
               <button type="submit" form="categoryForm" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
