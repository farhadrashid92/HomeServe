import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, Star, Sparkles, Loader2, Bot } from 'lucide-react';
import { getServices } from '../services/serviceService';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    getServices()
      .then(data => setServices(data.slice(0, 6))) // show up to 6 on homepage
      .catch(() => {}); // silent fail — page still renders
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const handleAiBooking = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');

    try {
      const response = await api.post('/ai/booking-extract', { prompt: aiPrompt });
      const parsedData = response.data;
      
      // Store AI preferences in sessionStorage crossing route boundaries seamlessly
      if (parsedData.date || parsedData.time || parsedData.notes || parsedData.city || parsedData.street) {
         sessionStorage.setItem('aiPrefill', JSON.stringify({
           date: parsedData.date,
           time: parsedData.time,
           notes: parsedData.notes,
           city: parsedData.city,
           street: parsedData.street,
           category: parsedData.category,
           autoSkip: true // Direct sequence bypass forcing the user to the final Confirmation Frame
         }));
      }

      // Preach the category navigation by matching strict Object IDs dropping them into checkout
      if (parsedData.category && parsedData.category !== 'Unknown') {
          try {
             const backendRes = await api.get(`/services?category=${encodeURIComponent(parsedData.category)}`);
             const mappedServices = backendRes.data;
             if (mappedServices.length > 0) {
                 navigate(`/book/${mappedServices[0]._id}`);
                 return;
             }
          } catch(e) {}
          navigate(`/services?category=${encodeURIComponent(parsedData.category)}`);
      } else {
          navigate('/services');
      }
    } catch (err) {
      setAiError(err.response?.data?.message || err.message || "Our AI engines are temporarily overwhelmed. Please try standard search.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Section */}
      <div className="relative pt-24 pb-36 overflow-hidden border-b group">
        <div
          className="absolute inset-0 z-0 transition-transform duration-[3000ms] ease-out group-hover:scale-105"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/dp7t6poes/image/upload/f_auto,q_auto/wmremove-transformed_vpzywy')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Professional Home Services <br className="hidden sm:block"/> <span className="text-primary-400">At Your Doorstep</span>
            </h1>
            <p className="mt-6 text-xl text-slate-300 max-w-2xl">
              Book reliable cleaners, electricians, plumbers and more across Pakistan in just a few clicks.
            </p>

            {/* Search Bar Toggles */}
            <div className="mt-10 max-w-xl">
              <div className="flex bg-slate-900/40 backdrop-blur border border-white/10 rounded-t-2xl overflow-hidden w-fit relative z-20">
                 <button onClick={() => setAiMode(false)} className={`px-5 py-2.5 text-sm font-bold transition-colors ${!aiMode ? 'bg-primary-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>Standard Search</button>
                 <button onClick={() => setAiMode(true)} className={`px-5 py-2.5 text-sm font-bold transition-colors flex items-center ${aiMode ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                    <Sparkles className="w-4 h-4 mr-2" /> AI Booking
                 </button>
              </div>

              {!aiMode ? (
                  <form onSubmit={handleSearch} className="flex shadow-2xl rounded-b-2xl rounded-tr-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/30 group/search relative z-10">
                    <div className="flex-grow flex items-center pl-6">
                      <Search className="h-5 w-5 text-slate-300 group-focus-within/search:text-slate-500" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-4 bg-transparent text-white placeholder-slate-300 focus:outline-none group-focus-within/search:text-slate-800 group-focus-within/search:placeholder-slate-400 text-lg transition-colors"
                        placeholder="What service do you need?"
                      />
                    </div>
                    <button type="submit" className="bg-primary-600 text-white px-8 py-4 font-semibold hover:bg-primary-500 transition-colors shadow-lg">
                      Search
                    </button>
                  </form>
              ) : (
                  <form onSubmit={handleAiBooking} className="flex flex-col shadow-2xl rounded-b-2xl rounded-tr-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-purple-500/30 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-500/30 group/search relative z-10">
                    <div className="flex-grow flex items-start pl-6 pt-4">
                      <Bot className="h-6 w-6 text-purple-300 mt-1 group-focus-within/search:text-purple-500 flex-shrink-0" />
                      <textarea
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        className="w-full px-4 pt-1 pb-4 bg-transparent text-white placeholder-slate-300 focus:outline-none group-focus-within/search:text-slate-800 group-focus-within/search:placeholder-slate-400 text-lg transition-colors min-h-[90px] resize-none"
                        placeholder="e.g. 'I need a plumber to fix my sink tomorrow at 2 PM'"
                      />
                    </div>
                    {aiError && <div className="px-6 pb-3 text-red-400 text-sm font-medium">{aiError}</div>}
                    <button type="submit" disabled={aiLoading} className="bg-purple-600 disabled:opacity-70 text-white px-8 py-4 font-semibold hover:bg-purple-500 transition-colors shadow-lg flex items-center justify-center">
                      {aiLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing intent...</> : 'Let AI Handle It'}
                    </button>
                  </form>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                <span>Popular:</span>
                <span onClick={() => navigate('/services?category=Maintenance')} className="cursor-pointer hover:text-primary-400 font-medium transition-colors border-b border-transparent hover:border-primary-400">AC Repair</span>
                <span onClick={() => navigate('/services?category=Cleaning')} className="cursor-pointer hover:text-primary-400 font-medium transition-colors border-b border-transparent hover:border-primary-400">House Cleaning</span>
                <span onClick={() => navigate('/services?category=Plumbing')} className="cursor-pointer hover:text-primary-400 font-medium transition-colors border-b border-transparent hover:border-primary-400">Plumbing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Professionals</h3>
              <p className="text-slate-500">All our service providers go through strict background checks.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">On-time Service</h3>
              <p className="text-slate-500">We respect your time. Our professionals arrive at your scheduled hour.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quality Guarantee</h3>
              <p className="text-slate-500">Not satisfied? We will redo the work or refund your money.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Services Section — live from API */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Popular Services</h2>
              <p className="mt-2 text-slate-500">Top rated home services based on recent bookings.</p>
            </div>
            <Link to="/services" className="text-primary-600 font-medium hover:text-primary-700 hidden sm:block">
              View all services &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.length > 0 ? services.map((service) => (
              <div key={service._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={service.image || `https://source.unsplash.com/800x600/?${service.category}`}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm text-slate-700">
                    {service.category}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{service.title}</h3>
                  </div>
                  <div className="flex items-center text-sm text-amber-500 mb-3">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 font-medium text-slate-700">{service.rating?.toFixed(1) || '4.5'}</span>
                    <span className="mx-1 text-slate-400">•</span>
                    <span className="text-slate-500">{service.reviewsCount || 0} reviews</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                    By {service.provider?.name || 'Verified Professional'}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-slate-900 font-bold">
                      Rs {service.price}<span className="text-sm text-slate-500 font-normal"> / start</span>
                    </div>
                    <Link
                      to={`/services/${service._id}`}
                      className="bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              // Skeleton placeholders while loading
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded mt-4" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link to="/services" className="inline-block bg-white text-slate-900 font-medium border border-slate-200 px-6 py-3 rounded-xl shadow-sm">
              View all services
            </Link>
          </div>
        </div>
      </div>

      {/* Why Choose Us — Unique Selling Points */}
      <div className="py-20 bg-white border-t border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left — floating USP cards grid */}
            <div className="w-full lg:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🏠', label: 'Doorstep Services',      offset: 'mt-0'   },
                  { icon: '✅', label: 'Verified Experts',        offset: 'mt-8'   },
                  { icon: '💰', label: 'Fair Service Charges',    offset: 'mt-0'   },
                  { icon: '🎯', label: 'Guaranteed Results',      offset: 'mt-8'   },
                  { icon: '🧑‍💼', label: 'Adherence to SOPs',    offset: 'mt-0'   },
                  { icon: '⏱️', label: '60 Mins Arrival Time',   offset: 'mt-8'   },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`${item.offset} bg-white border border-slate-100 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col items-center text-center gap-3`}
                  >
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl border border-primary-100 shadow-sm">
                      {item.icon}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Decorative accent blob */}
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-50 rounded-full blur-3xl opacity-60 -z-10" />
            </div>

            {/* Right — headline + description */}
            <div className="w-full lg:w-1/2">
              <span className="inline-block text-xs font-bold tracking-widest text-primary-600 uppercase bg-primary-50 border border-primary-100 px-4 py-1.5 rounded-full mb-4">
                Why Choose HomeServe
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
                Our Unique Selling Points<br />
                Make Us the <span className="text-primary-600">Most Reliable</span> Choice
              </h2>
              <p className="text-slate-500 text-base leading-relaxed mb-8">
                We understand your concerns about letting a stranger into your home. We know you can't trust just anyone with your family's safety and possessions. That is why HomeServe only works with background-verified professionals who follow strict safety protocols — so you can relax while we take care of your home.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: '2,000+', label: 'Happy Customers' },
                  { stat: '100+',   label: 'Verified Experts' },
                  { stat: '98%',    label: 'Satisfaction Rate' },
                  { stat: '< 60m',  label: 'Average Arrival' },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-2xl font-extrabold text-primary-600">{s.stat}</p>
                    <p className="text-sm text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">What Our Customers Say</h2>
            <p className="mt-3 text-slate-500">Real reviews from real customers across Pakistan</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                rating: 4,
                review: '"Excellent AC service! The technician was professional and fixed the issue in under an hour. Highly recommend."',
                name: 'Ahmed Khan',
                city: 'Lahore',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
                service: 'AC Service',
              },
              {
                rating: 5,
                review: '"Used home cleaning service for Eid preparation. The team was thorough and left the house spotless. Will book again!"',
                name: 'Fatima Ali',
                city: 'Karachi',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80',
                service: 'Home Cleaning',
              },
              {
                rating: 4,
                review: '"Quick response for emergency plumbing. The plumber arrived within 30 minutes and resolved the leak efficiently."',
                name: 'Hassan Raza',
                city: 'Islamabad',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80',
                service: 'Plumber',
              },
              {
                rating: 5,
                review: '"Got pest control done at our house. Professional team and the mobile app works perfectly. Great value for money."',
                name: 'Ayesha Malik',
                city: 'Rawalpindi',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80',
                service: 'Pest Control',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                    />
                  ))}
                </div>

                {/* Review */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                  {t.review}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.city}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {t.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
