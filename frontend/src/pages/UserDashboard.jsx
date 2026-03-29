import { useState, useEffect, useRef } from 'react';
import { User, Calendar, History, Bell, Loader2, Save, Star, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../services/bookingService';
import { updateProfile } from '../services/authService';
import { getMyReviews } from '../services/reviewService';
import { enablePushNotifications } from '../services/notificationService';
import ReviewModal from '../components/ReviewModal';
import StarRating from '../components/StarRating';

const UserDashboard = () => {
  const { currentUser, loginUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
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

  // Auto update profile form if currentUser changes (e.g. initial load)
  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        profileImage: currentUser.profileImage || ''
      }));
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Image is too large. Please select an image under 5MB.");
      const reader = new FileReader();
      reader.onloadend = () => {
         setProfileForm(prev => ({...prev, profileImage: reader.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    setError(null);
    try {
      const payload = { ...profileForm };
      if (!payload.password) delete payload.password;
      const updatedUser = await updateProfile(payload);
      loginUser(updatedUser); // Update context
      setProfileSuccess(true);
      setProfileForm(prev => ({ ...prev, password: '' })); // clear password
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [bookingsData, reviewsData] = await Promise.all([
        getBookings(),
        getMyReviews()
      ]);
      
      if (isBackground && previousBookingsRef.current.length > 0) {
         bookingsData.forEach(newBooking => {
           const oldBooking = previousBookingsRef.current.find(b => b._id === newBooking._id);
           if (oldBooking && oldBooking.status !== newBooking.status) {
             setPopupNotification({
               title: 'Status Updated',
               message: `Your booking for ${newBooking.service?.title} is now ${newBooking.status}`,
               tab: 'notifications'
             });
             setTimeout(() => setPopupNotification(null), 8000);
           }
         });
      }

      previousBookingsRef.current = bookingsData;
      setBookings(bookingsData);
      setMyReviews(reviewsData);
    } catch (err) {
      if (!isBackground) setError('Failed to fetch dashboard data.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // MongoDB stores status in lowercase — match exactly
  const activeBookings = bookings.filter(b => ['pending', 'accepted', 'in-progress'].includes(b.status));
  const historyBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Pending Schedule';
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl shadow-inner">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-center">
                <h2 className="font-bold text-slate-900 text-lg">{currentUser?.name || 'User'}</h2>
                <p className="text-sm text-slate-500 capitalize">{currentUser?.role || 'Customer'}</p>
                <p className="text-xs text-slate-400 mt-1">{currentUser?.email}</p>
              </div>
            </div>

            <nav className="space-y-2 w-full flex flex-col items-stretch">
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'bookings' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar className="w-5 h-5" /> Active Bookings
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'history' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <History className="w-5 h-5" /> History
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Bell className="w-5 h-5" /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'reviews' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Star className="w-5 h-5" /> My Reviews
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
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
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex justify-center items-center min-h-[400px]">
              <div className="text-red-500 font-medium">{error}</div>
            </div>
          ) : activeTab === 'bookings' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex justify-between items-center">
                Active Bookings
                <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{activeBookings.length} Total</span>
              </h2>
              
              <div className="space-y-4">
                {activeBookings.length > 0 ? activeBookings.map(booking => (
                  <div key={booking._id} className="border border-slate-100 rounded-2xl p-6 bg-slate-50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 text-center rounded-full inline-block mb-3 border border-amber-200 shadow-sm">{booking.status}</span>
                        <h3 className="text-lg font-bold text-slate-900">{booking.service?.title || 'Unknown Service'}</h3>
                        <p className="text-slate-600 text-sm mt-1">{formatDate(booking.date)} at {booking.time}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary-600">Rs {booking.service?.price || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200 mt-2">
                      <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden shrink-0 border border-slate-300">
                         {booking.provider?.profileImage ? (
                            <img src={booking.provider.profileImage} alt={booking.provider.name} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-600 text-sm font-bold">
                              {booking.provider?.name?.charAt(0) || 'P'}
                            </div>
                         )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{booking.provider?.name || 'Pending Assignment'}</h4>
                        <p className="text-xs text-slate-500">Service Professional</p>
                      </div>
                      
                      <button className="ml-auto text-sm text-slate-500 hover:text-red-600 font-medium transition-colors bg-white hover:bg-red-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-red-200">Cancel</button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                     <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500">You don't have any active bookings.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex justify-between items-center">
                Booking History
                <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{historyBookings.length} Total</span>
              </h2>
              
              <div className="space-y-4">
                {historyBookings.length > 0 ? historyBookings.map(booking => (
                  <div key={booking._id} className="border border-slate-100 rounded-2xl p-6 bg-slate-50 opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {booking.status === 'completed' ? (
                           <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block border border-emerald-200">Completed</span>
                        ) : (
                           <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block border border-red-200">Cancelled</span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900">{booking.service?.title || 'Unknown Service'}</h3>
                        <p className="text-slate-500 text-sm mt-1">{formatDate(booking.date)} at {booking.time}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-600">Rs {booking.service?.price || 'N/A'}</span>
                      </div>
                    </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-2">
                       <span className="text-sm text-slate-500 font-medium">Professional: {booking.provider?.name || 'N/A'}</span>
                       {booking.status === 'completed' && !myReviews.find(r => r.booking === booking._id) && (
                          <button 
                            onClick={() => setSelectedBookingForReview(booking)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-bold transition-colors"
                          >
                            Leave a Review
                          </button>
                        )}
                        {myReviews.find(r => r.booking === booking._id) && (
                          <span className="text-sm text-amber-500 font-bold flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-500" /> Reviewed
                          </span>
                        )}
                     </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                     <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500">No booking history found.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
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
                    className="text-sm shadow-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" /> Enable Device Push
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {bookings.length > 0 ? bookings.slice(0, 10).map((booking, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium text-sm">
                        Your booking for <span className="font-bold">{booking.service?.title}</span> is currently <span className="uppercase text-xs font-bold text-primary-600 ml-1 px-2 py-0.5 bg-primary-50 rounded border border-primary-200">{booking.status}</span>.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Scheduled for {formatDate(booking.date)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                     <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500">No recent notifications.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'reviews' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex justify-between items-center">
                My Reviews
                <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{myReviews.length} Total</span>
              </h2>
              <div className="space-y-4">
                {myReviews.length > 0 ? myReviews.map((review) => (
                  <div key={review._id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{review.service?.title}</h3>
                        <p className="text-sm text-slate-500">Provider: {review.provider?.name}</p>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" readOnly={true} />
                    <p className="text-slate-700 mt-4 text-sm bg-slate-50 p-4 rounded-xl italic border border-slate-100">"{review.comment}"</p>
                  </div>
                )) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                     <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500 font-medium">You haven't reviewed any services yet.</p>
                  </div>
                )}
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
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    {profileForm.profileImage ? (
                       <img src={profileForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-2xl font-bold text-slate-400 capitalize">{currentUser?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Photo</label>
                    <p className="text-xs text-slate-500 mb-3">JPG, PNG or GIF. Max size 5MB.</p>
                    <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm inline-block">
                      Choose Profile Picture
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Address</label>
                  <input 
                    type="text" 
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                    placeholder="E.g. House 1, Street 2, City"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password (Leave blank to keep unchanged)</label>
                  <input 
                    type="password" 
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={profileLoading}
                  className="mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-70"
                >
                  {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </form>
            </div>
          ) : null}
        </div>
        
      </div>

      <ReviewModal 
        isOpen={!!selectedBookingForReview}
        onClose={() => setSelectedBookingForReview(null)}
        booking={selectedBookingForReview}
        onReviewSubmitted={() => {
          fetchDashboardData();
        }}
      />
      
      {/* Live Notification Popup */}
      {popupNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-[fade-in_0.3s_ease-out]">
          <div 
            onClick={() => {
              setActiveTab(popupNotification.tab);
              setPopupNotification(null);
            }}
            className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-4 max-w-sm flex items-start gap-4 cursor-pointer hover:border-primary-300 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-1">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-grow pr-4">
              <h4 className="font-bold text-slate-900">{popupNotification.title}</h4>
              <p className="text-sm text-slate-600 mt-1 leading-snug">{popupNotification.message}</p>
              <p className="text-xs text-primary-600 font-semibold mt-2">Click to view details</p>
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

export default UserDashboard;
