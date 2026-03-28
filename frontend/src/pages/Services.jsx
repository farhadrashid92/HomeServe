import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Search, Loader2 } from 'lucide-react';
import { getServices } from '../services/serviceService';

const Services = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // When URL params change (e.g. user clicks a footer/homepage link), update filters
  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    if (cat) setSelectedCategory(cat);
    if (search) setSearchTerm(search);
  }, [searchParams]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = ['All', 'Cleaning', 'Maintenance', 'Plumbing', 'Electrical', 'Pest Control', 'Painting', 'Carpenter', 'CCTV Installation', 'Gardening', 'Home Shifting'];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex justify-center items-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex justify-center items-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center">
          <p className="font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Our Services</h1>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Browse our wide range of professional home services and book the best providers in your area.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar scroll-smooth whitespace-nowrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full font-medium text-sm transition-colors ${
                  selectedCategory === category 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map(service => (
              <div key={service._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group flex flex-col">
                <div className="h-56 overflow-hidden relative bg-slate-100">
                  <img src={service.image || `https://source.unsplash.com/800x600/?${service.category}`} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-slate-700">
                    {service.category}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  {/* Provider Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {service.providers && service.providers.length > 0 ? (
                      <>
                        <div className="flex -space-x-3">
                           {service.providers.slice(0, 3).map((p, i) => (
                              <img key={i} src={p.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'Pro')}&background=10b981&color=fff`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Provider" />
                           ))}
                           {service.providers.length > 3 && (
                              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                                +{service.providers.length - 3}
                              </div>
                           )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{service.providers.length} Professional{service.providers.length > 1 ? 's' : ''}</h4>
                          <span className="text-slate-500 text-xs text-medium">Available for booking</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <img 
                          src={service.provider?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || 'Pro')}&background=10b981&color=fff`} 
                          alt={service.provider?.name || 'Provider'} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{service.provider?.name || 'Independent Professional'}</h4>
                          <div className="flex items-center text-amber-500 text-xs mt-0.5">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="ml-1 font-semibold text-slate-700">{service.rating?.toFixed(1) || '4.5'}</span>
                            <span className="mx-1 text-slate-300">•</span>
                            <span className="text-slate-500">{service.reviewsCount || 0} reviews</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">{service.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-500 block mb-0.5">Starting from</span>
                      <span className="text-lg font-bold text-primary-600">Rs {service.price}</span>
                    </div>
                    <Link to={`/services/${service._id}`} className="bg-slate-900 text-white hover:bg-primary-600 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
              className="mt-6 text-primary-600 font-medium hover:text-primary-700 transition-colors bg-primary-50 px-6 py-2 rounded-full"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
