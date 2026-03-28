import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, CreditCard, ChevronLeft, Loader2, Calendar } from 'lucide-react';
import { getServiceById } from '../services/serviceService';
import { createBooking, getAvailableSlots } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const BookingFlow = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(searchParams.get('providerId') || null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState({ street: '', city: 'Lahore', details: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
  const [availableTimes, setAvailableTimes] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [aiAssisted, setAiAssisted] = useState(false);

  useEffect(() => {
    // Intercept Google Gemini AI extractions safely mapped into the browser session
    const aiPrefillStr = sessionStorage.getItem('aiPrefill');
    if (aiPrefillStr) {
       try {
          const aiData = JSON.parse(aiPrefillStr);
          
          if (aiData.date) {
             const d = new Date(aiData.date);
             const userTimezoneOffset = d.getTimezoneOffset() * 60000;
             const adjustedDate = new Date(d.getTime() + userTimezoneOffset);
             const label = adjustedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
             setSelectedDate({ label, value: aiData.date });
          }
          if (aiData.time) {
             let raw = aiData.time.toUpperCase().trim();
             let exact = raw;
             if (raw.includes('2') && raw.includes('PM')) exact = '02:00 PM';
             else if (raw.includes('4') && raw.includes('PM')) exact = '04:00 PM';
             else if (raw.includes('6') && raw.includes('PM')) exact = '06:00 PM';
             else if (raw.includes('9') && raw.includes('AM')) exact = '09:00 AM';
             else if (raw.includes('11') && raw.includes('AM')) exact = '11:00 AM';
             else if (raw.includes('14:00')) exact = '02:00 PM';
             else if (raw.includes('16:00')) exact = '04:00 PM';
             else if (raw.includes('18:00')) exact = '06:00 PM';
             // Defaulting loosely
             setSelectedTime(exact);
          }
          if (aiData.notes) {
             setAddress(prev => ({ ...prev, details: aiData.notes }));
          }
          if (aiData.city) {
             setAddress(prev => ({ ...prev, city: aiData.city }));
          }

          // Full automation injection pushing the user straight into confirm frames
          if (aiData.autoSkip) {
             setSelectedProvider('any'); // default algorithm handler 
             if (aiData.street) {
                setAddress(prev => ({ ...prev, street: aiData.street }));
             } else if (currentUser && currentUser.address) {
                setAddress(prev => ({ ...prev, street: currentUser.address }));
             } else {
                setAddress(prev => ({ ...prev, street: "AI Auto-Mapped Location" }));
             }
             setStep(4);
          }
          
          setAiAssisted(true);
          sessionStorage.removeItem('aiPrefill');
       } catch (err) {
         console.error("AI Context Parsing securely bypassed.", err);
       }
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(id);
        setService(data);
        
        // If a specific provider wasn't passed via query string, pick first available
        if (!searchParams.get('providerId')) {
           setSelectedProvider(prev => {
              if (prev) return prev; // Do not aggressively overwrite if AI or User already picked something!
              
              if (data.providers && data.providers.length > 0) {
                return data.providers[0]._id;
              } else if (data.provider?._id) {
                return data.provider._id;
              }
              return null;
           });
        }
      } catch (err) {
        setError('Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id, searchParams]);

  // Fetch Available Slots whenever Date or Provider changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedProvider && selectedProvider !== 'any' && selectedDate) {
        setSlotsLoading(true);
        try {
          const data = await getAvailableSlots(selectedProvider, selectedDate.value);
          const slots = data.availableSlots || [];
          setAvailableTimes(slots);
          
          // Intelligently preserve active slot if logically valid using fuzzy mapping (02:00 vs 2:00 PM)
          setSelectedTime(prev => {
             if (!prev) return '';
             const match = slots.find(s => s.replace(/^0/, '') === prev.replace(/^0/, ''));
             return match ? match : prev; // Preserve LLM output context natively
          });
        } catch (err) {
          console.error("Failed to fetch slots", err);
          setAvailableTimes([]);
          setSelectedTime('');
        } finally {
          setSlotsLoading(false);
        }
      } else if (selectedProvider === 'any') {
         // Generic backup for 'Any' provider selection without knowing exact target matching
         const backupSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
         setAvailableTimes(backupSlots);
         setSelectedTime(prev => {
             if (!prev) return '';
             const match = backupSlots.find(s => s.replace(/^0/, '') === prev.replace(/^0/, ''));
             return match ? match : prev; // Do not aggressively erase LLM derivations 
         });
      }
      // Removed the hard 'else' reset which previously destroyed synchronous AI pre-fills on initial render.
    };
    fetchSlots();
  }, [selectedDate, selectedProvider]);
  
  // Handlers
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  const handleConfirm = async () => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      // Backend now allows explicit provider selection
      const payload = {
        service: service._id,
        provider: selectedProvider === 'any' ? undefined : selectedProvider,
        date: selectedDate?.value,
        time: selectedTime,
        address: `${address.street}, ${address.city}`,
        notes: address.details,
      };
      await createBooking(payload);
      navigate('/dashboard');
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      setStep(4);
    } finally {
      setBookingLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
      
      {[1, 2, 3, 4].map(num => (
        <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= num ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
          {step > num ? <CheckCircle className="h-5 w-5" /> : num}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center mb-4">{error || 'Service not found'}</div>
        <Link to="/services" className="text-primary-600 font-medium hover:underline">Back to services</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          {step > 1 ? (
            <button onClick={handleBack} className="flex items-center text-slate-500 hover:text-primary-600 transition-colors font-medium text-sm">
              <ChevronLeft className="h-5 w-5 mr-1" /> Back
            </button>
          ) : (
            <Link to={`/services/${id}`} className="flex items-center text-slate-500 hover:text-primary-600 transition-colors font-medium text-sm">
              <ChevronLeft className="h-5 w-5 mr-1" /> Cancel Booking
            </Link>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Book Service</h1>
            {aiAssisted && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 uppercase tracking-widest hidden sm:inline-block">AI Assisted</span>}
          </div>
          <div className="w-20"></div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Booking Form */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              {renderStepIndicator()}
              
              {/* Step 1: Provider Selection */}
              {step === 1 && (
                <div className="animate-fade-in text-left">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Select a Professional</h2>
                  <div className="space-y-4">
                    <div 
                      onClick={() => setSelectedProvider('any')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedProvider === 'any' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-200'}`}
                    >
                      <div>
                        <h3 className="font-bold text-slate-900">Any Available Professional</h3>
                        <p className="text-sm text-slate-500">We will assign the best matching professional.</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedProvider === 'any' ? 'border-primary-600 bg-primary-600' : 'border-slate-300'}`}>
                        {selectedProvider === 'any' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </div>
                    
                    {/* Map over assigned providers */}
                    {service.providers && service.providers.length > 0 ? (
                      service.providers.map(prov => (
                        <div 
                          key={prov._id}
                          onClick={() => setSelectedProvider(prov._id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedProvider === prov._id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-200'}`}
                        >
                          <div className="flex items-center gap-4">
                            <img src={prov.profileImage || `https://ui-avatars.com/api/?name=${prov.name}&background=10b981&color=fff`} className="w-12 h-12 rounded-full object-cover" alt="" />
                            <div>
                              <h3 className="font-bold text-slate-900">{prov.name}</h3>
                              <p className="text-sm text-slate-500">Service Professional</p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedProvider === prov._id ? 'border-primary-600 bg-primary-600' : 'border-slate-300'}`}>
                            {selectedProvider === prov._id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                        </div>
                      ))
                    ) : service.provider ? (
                      <div 
                        onClick={() => setSelectedProvider(service.provider._id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedProvider === service.provider._id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-200'}`}
                      >
                        <div className="flex items-center gap-4">
                          <img src={service.provider.profileImage || `https://ui-avatars.com/api/?name=${service.provider.name}&background=10b981&color=fff`} className="w-12 h-12 rounded-full object-cover" alt="" />
                          <div>
                            <h3 className="font-bold text-slate-900">{service.provider.name}</h3>
                            <p className="text-sm text-slate-500">Service Assigned Professional</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedProvider === service.provider._id ? 'border-primary-600 bg-primary-600' : 'border-slate-300'}`}>
                          {selectedProvider === service.provider._id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <button 
                    disabled={!selectedProvider}
                    onClick={handleNext} 
                    className="w-full mt-8 bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="animate-fade-in text-left">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">When do you need the service?</h2>
                  
                  <h3 className="font-semibold text-slate-700 mb-3">Select Date from Calendar</h3>
                  <div className="mb-6 relative w-full sm:w-2/3">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="date"
                      min={todayStr}
                      value={selectedDate?.value || ''}
                      onChange={(e) => {
                         if (e.target.value) {
                           // Construct dates safely preserving TZ
                           const d = new Date(e.target.value);
                           const userTimezoneOffset = d.getTimezoneOffset() * 60000;
                           const adjustedDate = new Date(d.getTime() + userTimezoneOffset);
                           
                           const label = adjustedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                           setSelectedDate({ label, value: e.target.value });
                         } else {
                           setSelectedDate(null);
                         }
                      }}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 bg-white text-slate-700 font-bold cursor-pointer transition-all shadow-sm hover:border-slate-300"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>

                  <h3 className="font-semibold text-slate-700 mb-3 mt-6">Select Time</h3>
                  {slotsLoading ? (
                    <div className="flex justify-center items-center py-8">
                       <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                      {availableTimes.length > 0 ? availableTimes.map(time => (
                        <button 
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-4 rounded-xl border-2 font-medium transition-colors ${selectedTime === time ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                          {time}
                        </button>
                      )) : (
                        <div className="col-span-2 md:col-span-3 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                          <p className="text-slate-500 font-medium">No schedule slots currently available for this day.</p>
                          <p className="text-xs text-slate-400 mt-1">Please explicitly select a different date or another Professional.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleNext} 
                    className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 3: Address */}
              {step === 3 && (
                <div className="animate-fade-in text-left">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Where do you need the service?</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                      >
                        <option>Lahore</option>
                        <option>Karachi</option>
                        <option>Islamabad</option>
                        <option>Multan</option>
                        <option>Faisalabad</option>
                        <option>Sialkot</option>
                        <option>Gujranwala</option>
                        <option>Bahawalpur</option>
                        <option>Sargodha</option>
                        <option>Rawalpindi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
                      <input 
                        type="text" 
                        placeholder="House 123, Street 4, Phase 5" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Instructions (Optional)</label>
                      <textarea 
                        rows="3" 
                        placeholder="e.g. Call when near the gate" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                        value={address.details}
                        onChange={(e) => setAddress({...address, details: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                  <button 
                    disabled={!address.street}
                    onClick={handleNext} 
                    className="w-full mt-8 bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all"
                  >
                    Continue to Review
                  </button>
                </div>
              )}

              {/* Step 4: Confirm */}
              {step === 4 && (
                <div className="animate-fade-in text-left">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Review & Confirm</h2>
                  
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                    <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Booking Summary</h3>
                    
                    {bookingError && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{bookingError}</div>}
                    
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">{selectedDate?.label} at {selectedTime}</p>
                          <p className="text-slate-500">Estimated duration: 2-3 hours</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">{address.street}, {address.city}</p>
                          <p className="text-slate-500">{address.details || 'No additional details'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CreditCard className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">Cash on Completion</p>
                          <p className="text-slate-500">Pay after the work is done</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={bookingLoading}
                    onClick={handleConfirm} 
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? 'Processing Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Receipt */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <div className="flex gap-4 items-center mb-6 pb-6 border-b border-slate-100">
                <img src={service.image || `https://source.unsplash.com/800x600/?${service.category}`} className="w-16 h-16 rounded-xl object-cover" alt="" />
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{service.title}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 mt-1 inline-block rounded-full">{service.category}</span>
                </div>
              </div>
              
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Payment Details</h4>
              <div className="space-y-3 text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Base Service Fee</span>
                  <span className="font-medium text-slate-900">Rs {service.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visiting Charge</span>
                  <span className="font-medium text-slate-900">Rs 300</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100 font-bold text-lg text-primary-600">
                  <span>Total Due</span>
                  <span>Rs {service.price + 300}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
