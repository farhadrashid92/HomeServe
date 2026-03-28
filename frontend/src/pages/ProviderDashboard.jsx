import { useState, useEffect, useRef } from 'react';
import { User, ClipboardList, TrendingUp, Settings, Loader2, CheckCircle, Save, DollarSign, Briefcase, Star, Bell, X, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBookings, updateBookingStatus } from '../services/bookingService';
import { updateProfile } from '../services/authService';
import { getProviderReviews } from '../services/reviewService';
import { enablePushNotifications } from '../services/notificationService';
import StarRating from '../components/StarRating';

const ProviderDashboard = () => {
  const { currentUser, loginUser } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);

  const [popupNotification, setPopupNotification] = useState(null);
  const previousBookingsRef = useRef([]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    profileImage: currentUser?.profileImage || '',
    password: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Schedule Logic
  const [scheduleForm, setScheduleForm] = useState({
    "Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const ALL_SLOTS = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"];
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        profileImage: currentUser.profileImage || ''
      }));
      if (currentUser.availability) {
        setScheduleForm(currentUser.availability);
      }
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    try {
      const payload = { ...profileForm };
      if (!payload.password) delete payload.password;
      const updatedUser = await updateProfile(payload);
      loginUser(updatedUser);
      setProfileSuccess(true);
      setProfileForm(prev => ({ ...prev, password: '' }));
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleLoading(true);
    setScheduleSuccess(false);
    try {
      const updatedUser = await updateProfile({ availability: scheduleForm });
      loginUser(updatedUser);
      setScheduleSuccess(true);
      setTimeout(() => setScheduleSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update schedule');
    } finally {
      setScheduleLoading(false);
    }
  };

  const toggleSlot = (day, time) => {
    setScheduleForm(prev => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(time)) {
         return { ...prev, [day]: daySlots.filter(t => t !== time) };
      } else {
         const newSlots = [...daySlots, time].sort((a,b) => ALL_SLOTS.indexOf(a) - ALL_SLOTS.indexOf(b));
         return { ...prev, [day]: newSlots };
      }
    });
  };

  const toggleDay = (day) => {
    setScheduleForm(prev => {
      const daySlots = prev[day] || [];
      if (daySlots.length === ALL_SLOTS.length) {
         return { ...prev, [day]: [] };
      } else {
         return { ...prev, [day]: [...ALL_SLOTS] };
      }
    });
  };

  const fetchDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [bookingsData, reviewsData] = await Promise.all([
        getBookings(),
        getProviderReviews(currentUser._id)
      ]);
      
      if (isBackground && previousBookingsRef.current.length > 0) {
        const oldIds = previousBookingsRef.current.map(b => b._id);
        const newRequests = bookingsData.filter(b => b.status === 'pending' && !oldIds.includes(b._id));
        
        if (newRequests.length > 0) {
          setPopupNotification({
            title: 'New Request Received',
            message: `You have ${newRequests.length} new job request(s).`,
            tab: 'requests'
          });
          setTimeout(() => setPopupNotification(null), 8000);
        }
      }

      previousBookingsRef.current = bookingsData;
      setBookings(bookingsData);
      setReviews(reviewsData);
    } catch (err) {
      if (!isBackground) setError('Failed to fetch dashboard data.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      fetchDashboardData();
      const interval = setInterval(() => {
        fetchDashboardData(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setStatusLoading(bookingId);
      await updateBookingStatus(bookingId, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update booking status');
    } finally {
      setStatusLoading(null);
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const activeJobs = bookings.filter(b => ['accepted', 'in-progress'].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === 'completed');

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Pending Schedule';
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  };

  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.service?.price || 0), 0);
  const pendingEarnings = activeJobs.reduce((sum, job) => sum + (job.service?.price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <div className="flex flex-col items-center gap-4 mb-8 border-b border-slate-100 pb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-3xl">
                 {currentUser?.profileImage ? (
                   <img src={currentUser.profileImage} alt="Provider" className="w-full h-full object-cover" />
                 ) : (
                   currentUser?.name?.charAt(0).toUpperCase() || 'P'
                 )}
              </div>
              <div className="text-center">
                <h2 className="font-bold text-slate-900 text-lg">{currentUser?.name || 'Provider'}</h2>
                <div className="flex items-center justify-center text-amber-500 text-sm font-semibold mt-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <Star className="w-4 h-4 mr-1 fill-amber-500" /> 
                  {currentUser?.averageRating ? currentUser.averageRating.toFixed(1) : 'New'} 
                  <span className="text-slate-400 mx-2">•</span> 
                  <span className="text-slate-700">{completedJobs.length} jobs done</span>
                </div>
              </div>
            </div>
            
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'requests' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <ClipboardList className="w-5 h-5" /> Job Requests 
                {pendingRequests.length > 0 && (
                  <span className="ml-auto bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('active')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'active' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <CheckCircle className="w-5 h-5" /> Active Jobs
                {activeJobs.length > 0 && (
                  <span className="ml-auto bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">{activeJobs.length}</span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('earnings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'earnings' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <TrendingUp className="w-5 h-5" /> Earnings
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'reviews' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Star className="w-5 h-5" /> Reviews & Ratings
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'services' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Settings className="w-5 h-5" /> Manage Services
              </button>
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'schedule' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar className="w-5 h-5" /> Manage Schedule
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <User className="w-5 h-5" /> Profile Settings
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow">
          {loading ? (
             <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex justify-center items-center min-h-[400px]">
               <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
             </div>
          ) : error ? (
             <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex justify-center items-center min-h-[400px]">
               <div className="text-red-500 font-medium">{error}</div>
             </div>
          ) : activeTab === 'requests' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                   New Job Requests
                   <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{pendingRequests.length} Pending</span>
                </h2>
                {!pushEnabled && (
                  <button 
                    onClick={async () => {
                      try {
                        await enablePushNotifications();
                        setPushEnabled(true);
                        alert('Push notifications activated securely on this device!');
                      } catch (err) {
                        alert(err.message || 'Failed to activate device pushed notifications.');
                      }
                    }}
                    className="text-sm shadow-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" /> Enable Device Push
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {pendingRequests.length > 0 ? pendingRequests.map(request => (
                  <div key={request._id} className="border border-slate-100 rounded-2xl p-6 bg-slate-50 flex flex-col md:flex-row justify-between md:items-center gap-6 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">New</span>
                         <span className="font-bold text-indigo-600 border border-indigo-100 bg-indigo-50 px-2 py-0.5 rounded text-sm">Rs {request.service?.price}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{request.service?.title || 'Unknown Service'}</h3>
                      <p className="text-sm font-medium text-slate-700 mb-2">{request.user?.name || 'Customer'} • {request.address}</p>
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-white p-3 rounded-xl border border-slate-200 inline-flex">
                         <span>📅 {formatDate(request.date)}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                         <span>⏰ {request.time}</span>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-slate-500 mt-3 italic text-left bg-white p-3 rounded-lg border border-slate-100 pr-6 border-l-4 border-l-slate-300">"{request.notes}"</p>
                      )}
                    </div>
                    <div className="flex md:flex-col items-center gap-3 w-full md:w-32 shrink-0">
                      <button 
                        disabled={statusLoading === request._id}
                        onClick={() => handleUpdateStatus(request._id, 'accepted')}
                        className="w-full px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        {statusLoading === request._id ? '...' : 'Accept'}
                      </button>
                      <button 
                        disabled={statusLoading === request._id}
                        onClick={() => handleUpdateStatus(request._id, 'cancelled')}
                        className="w-full px-5 py-3 bg-white text-slate-600 border border-slate-200 font-bold rounded-xl text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                     <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500 font-medium">No new job requests at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'active' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex justify-between items-center">
                 Active & Upcoming Jobs
                 <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{activeJobs.length} Active</span>
              </h2>
              <div className="space-y-4">
                {activeJobs.length > 0 ? activeJobs.map(job => (
                  <div key={job._id} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{job.status}</span>
                         <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-sm">Rs {job.service?.price}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{job.service?.title || 'Unknown Service'}</h3>
                      <p className="text-sm font-medium text-slate-700 mb-2">{job.user?.name || 'Customer'} • {job.address}</p>
                      <p className="text-slate-500 text-sm">Scheduled for: <span className="font-semibold text-slate-700">{formatDate(job.date)} at {job.time}</span></p>
                    </div>
                    <div className="flex md:flex-col items-center gap-3 w-full md:w-40 shrink-0">
                      {job.status === 'accepted' && (
                        <button 
                          disabled={statusLoading === job._id}
                          onClick={() => handleUpdateStatus(job._id, 'in-progress')}
                          className="w-full px-5 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-200"
                        >
                          {statusLoading === job._id ? '...' : 'Start Job'}
                        </button>
                      )}
                      {job.status === 'in-progress' && (
                        <button 
                          disabled={statusLoading === job._id}
                          onClick={() => handleUpdateStatus(job._id, 'completed')}
                          className="w-full px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm shadow-emerald-200"
                        >
                          {statusLoading === job._id ? '...' : 'Mark Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                     <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500 font-medium">No active jobs right now.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'earnings' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Earnings Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden">
                  <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100 opacity-50" />
                  <p className="text-emerald-700 font-bold mb-1 relative z-10">Total Earned</p>
                  <h3 className="text-3xl font-black text-emerald-600 relative z-10">Rs {totalEarnings}</h3>
                  <p className="text-sm text-emerald-600 mt-2 font-medium relative z-10">From {completedJobs.length} completed jobs</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 relative overflow-hidden">
                  <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-100 opacity-50" />
                  <p className="text-amber-700 font-bold mb-1 relative z-10">Pending Payouts</p>
                  <h3 className="text-3xl font-black text-amber-600 relative z-10">Rs {pendingEarnings}</h3>
                  <p className="text-sm text-amber-600 mt-2 font-medium relative z-10">From {activeJobs.length} active jobs</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                  <CheckCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-100 opacity-50" />
                  <p className="text-indigo-700 font-bold mb-1 relative z-10">Job Success Rate</p>
                  <h3 className="text-3xl font-black text-indigo-600 relative z-10">
                    {bookings.length > 0 ? Math.round((completedJobs.length / (completedJobs.length + pendingRequests.length)) * 100) || 100 : 0}%
                  </h3>
                  <p className="text-sm text-indigo-600 mt-2 font-medium relative z-10">Top rated provider</p>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-4">Recent Payouts</h3>
              <div className="space-y-3">
                {completedJobs.slice(0, 5).map(job => (
                  <div key={job._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-800">{job.service?.title}</p>
                      <p className="text-sm text-slate-500">{formatDate(job.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">+ Rs {job.service?.price}</p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cleared</p>
                    </div>
                  </div>
                ))}
                {completedJobs.length === 0 && <p className="text-slate-500 italic text-center py-6">No completed jobs yet to track earnings.</p>}
              </div>
            </div>
          ) : activeTab === 'reviews' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex justify-between items-center">
                Reviews & Feedback
                <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{reviews.length} Total</span>
              </h2>
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review._id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{review.user?.name || 'Customer'}</p>
                            <p className="text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size="sm" readOnly={true} />
                      </div>
                      <p className="text-slate-700 mt-3 text-sm italic bg-slate-50 p-4 rounded-xl border border-slate-100">"{review.comment}"</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                     <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500 font-medium">You don't have any reviews yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'services' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Services</h2>
              <div className="border border-indigo-100 rounded-2xl p-6 bg-indigo-50/50 flex flex-col items-center justify-center text-center py-12">
                <Briefcase className="w-16 h-16 text-indigo-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">You are registered as a Service Professional</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6">Your profile is currently active in the directory. Customers can find you under your specialized categories and book your services directly.</p>
                <div className="flex gap-4">
                  <span className="bg-emerald-100 text-emerald-700 font-bold px-4 py-2 rounded-xl text-sm border border-emerald-200">Status: Active & Visible</span>
                  <button onClick={() => setActiveTab('profile')} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-slate-50">Edit Profile Details</button>
                </div>
              </div>
            </div>
          ) : activeTab === 'schedule' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 animate-[fade-in_0.2s_ease-out]">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Schedule</h2>
              <p className="text-slate-600 mb-8">Set your weekly availability. Customers will only be able to book you during the time slots you explicitly enable below.</p>
              
              {scheduleSuccess && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-medium flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Schedule updated successfully!
                </div>
              )}

              <div className="space-y-6">
                {DAYS.map(day => (
                  <div key={day} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-lg w-32">{day}</h3>
                      <button 
                         onClick={() => toggleDay(day)}
                         className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full transition-colors active:scale-95"
                      >
                         {(scheduleForm[day] || []).length > 0 ? 'Clear Day' : 'Enable Full Day'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {ALL_SLOTS.map(time => {
                        const isSelected = (scheduleForm[day] || []).includes(time);
                        return (
                          <button
                            key={time}
                            onClick={() => toggleSlot(day, time)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 active:scale-95 ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={handleScheduleSubmit}
                  disabled={scheduleLoading}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors disabled:opacity-70 active:scale-95"
                >
                  {scheduleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Schedule
                </button>
              </div>
            </div>
          ) : activeTab === 'profile' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Settings</h2>
              
              {profileSuccess && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-medium flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Profile updated successfully!
                </div>
              )}
              
              <form onSubmit={handleProfileSubmit} className="max-w-xl space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 shrink-0 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                      {(profileForm.profileImage || currentUser?.profileImage) ? (
                        <img src={profileForm.profileImage || currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileForm({...profileForm, profileImage: reader.result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Service Area Address</label>
                  <input 
                    type="text" 
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password (Leave blank to keep unchanged)</label>
                  <input 
                    type="password" 
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={profileLoading}
                  className="mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors disabled:opacity-70"
                >
                  {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </form>
            </div>
          ) : null}
        </div>
        
      </div>
      
      {/* Live Notification Popup */}
      {popupNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-[fade-in_0.3s_ease-out]">
          <div 
            onClick={() => {
              setActiveTab(popupNotification.tab);
              setPopupNotification(null);
            }}
            className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-4 max-w-sm flex items-start gap-4 cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-grow pr-4">
              <h4 className="font-bold text-slate-900">{popupNotification.title}</h4>
              <p className="text-sm text-slate-600 mt-1 leading-snug">{popupNotification.message}</p>
              <p className="text-xs text-indigo-600 font-semibold mt-2">Click to view requests</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setPopupNotification(null);
              }}
              className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
