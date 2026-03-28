import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, CheckCircle, Shield, ArrowLeft, Loader2, MessageSquare, ChevronRight } from 'lucide-react';
import { getServiceById } from '../services/serviceService';
import { getServiceReviews } from '../services/reviewService';
import StarRating from '../components/StarRating';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const [data, reviewsData] = await Promise.all([
          getServiceById(id),
          getServiceReviews(id)
        ]);
        setService(data);
        setReviews(reviewsData);
      } catch (err) {
        setError('Failed to load service details. The service might not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchServiceDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex justify-center items-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex flex-col justify-center items-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center mb-4">
          <p className="font-semibold text-lg">{error || 'Service not found'}</p>
        </div>
        <button onClick={() => navigate('/services')} className="text-primary-600 font-medium hover:underline">
          Go back to services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-primary-600 transition-colors mb-6 font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content - Details */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 mb-8">
              <div className="h-80 w-full relative bg-slate-100">
                <img src={service.image || `https://source.unsplash.com/800x600/?${service.category}`} alt={service.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white text-shadow">
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                    {service.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold">{service.title}</h1>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-6 mb-8 border-b border-slate-100 pb-6">
                  <div className="flex items-center text-amber-500">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="ml-1.5 font-bold text-slate-700 text-lg">{service.averageRating ? service.averageRating.toFixed(1) : 'New'}</span>
                    <span className="ml-1 text-slate-500 text-sm">({service.reviewsCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Clock className="h-5 w-5 mr-1.5" />
                    <span className="text-sm font-medium">Est. 2-3 hours</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Shield className="h-5 w-5 mr-1.5 text-emerald-500" />
                    <span className="text-sm font-medium">No Hidden Charges</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-4">About this service</h2>
                <p className="text-slate-600 leading-relaxed mb-8 text-base">{service.description}</p>
                
                <h2 className="text-xl font-bold text-slate-900 mb-4">What's included</h2>
                <ul className="space-y-3 mb-8">
                  {['Thorough inspection of the problem', 'Professional grade tools and equipment', 'Cleanup after the service is completed', '30-day service warranty'].map((item, idx) => (
                    <li key={idx} className="flex items-start bg-slate-50 p-3 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-3 shrink-0" />
                      <span className="text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Service Providers */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Professionals</h2>
            <div className="space-y-4">
              {/* Render an array of providers if available */}
              {service.providers && service.providers.length > 0 ? (
                service.providers.map(prov => (
                  <div key={prov._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <img
                        src={prov.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(prov.name)}&background=10b981&color=fff`}
                        alt={prov.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{prov.name}</h3>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                          <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                          <span className="font-semibold text-slate-700 mr-2">{prov.averageRating ? prov.averageRating.toFixed(1) : 'New'}</span>
                          <span>• {prov.reviewsCount || 0} Reviews</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/inbox?userId=${prov._id}&name=${encodeURIComponent(prov.name)}`}
                        className="text-slate-500 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 p-2 rounded-lg transition-colors border border-slate-200"
                        title="Message Professional"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/book/${service._id}?providerId=${prov._id}`}
                        className="text-primary-600 font-bold hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition-colors border border-primary-100 hidden sm:block"
                      >
                        Select
                      </Link>
                    </div>
                  </div>
                ))
              ) : service.provider ? (
                /* Fallback for legacy database records that only have a single 'provider' */
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <img
                      src={service.provider.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name)}&background=10b981&color=fff`}
                      alt={service.provider.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{service.provider.name}</h3>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                        <span className="font-semibold text-slate-700 mr-2">{service.provider.averageRating ? service.provider.averageRating.toFixed(1) : 'New'}</span>
                        <span>• {service.provider.reviewsCount || 0} Reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/inbox?userId=${service.provider._id}&name=${encodeURIComponent(service.provider.name)}`}
                      className="text-slate-500 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 p-2 rounded-lg transition-colors border border-slate-200"
                      title="Message Professional"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/book/${service._id}?providerId=${service.provider._id}`}
                      className="text-primary-600 font-bold hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition-colors border border-primary-100 hidden sm:block"
                    >
                      Select
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">No specific professionals available for booking yet. Check back soon.</div>
              )}
            </div>

            {/* Customer Reviews Section */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">Customer Reviews</h2>
            <div className="space-y-6 mb-12">
              {reviews.length > 0 ? reviews.map(review => (
                <div key={review._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                        {review.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{review.user?.name || 'Customer'}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          {review.provider?.name && ` • Reviewed ${review.provider.name}`}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="sm" readOnly={true} />
                  </div>
                  <p className="text-slate-700 italic border-l-4 border-primary-200 pl-4 py-1 text-sm bg-slate-50 rounded-r-xl pr-4">
                    "{review.comment}"
                  </p>
                </div>
              )) : (
                <div className="bg-slate-50 rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
                  <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-500">No reviews yet for this service.</p>
                </div>
              )}
            </div>
            
          </div>
          
          {/* Right Content - Pricing & Booking Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Price Estimate</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-slate-900">Rs {service.price}</span>
                <span className="text-slate-500 ml-2 font-medium">/ roughly</span>
              </div>
              
              <div className="space-y-4 mb-8 bg-slate-50 p-5 rounded-2xl">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Base Service Fee</span>
                  <span className="font-medium text-slate-900">Rs {service.price}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Visiting Charges <span className="text-xs ml-1 text-slate-400">(refundable)</span></span>
                  <span className="font-medium text-slate-900">Rs 200</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-lg text-primary-600">
                  <span>Estimated Total</span>
                  <span>Rs {service.price + 200}</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link 
                    to={`/book/${service._id}`}
                    className="flex-1 bg-primary-600 text-white font-bold py-4 rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors shadow-md shadow-primary-200"
                  >
                    Select & Book <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>

                  {/* Safely extract the target Provider dynamically guarding against array mappings */}
                  {(service.providers?.[0] || service.provider) && (
                    <Link 
                      to={`/inbox?userId=${(service.providers?.[0] || service.provider)._id}&name=${encodeURIComponent((service.providers?.[0] || service.provider).name)}`}
                      className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2 text-slate-400" /> Send Message
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-center mt-6 text-xs text-slate-500 bg-emerald-50 p-3 rounded-lg text-emerald-700 border border-emerald-100">
                <Shield className="h-4 w-4 mr-2 shrink-0" />
                Final price depends on the scope of work. Chat with the provider to get a quotation
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
