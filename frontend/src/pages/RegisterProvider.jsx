import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { register, googleLogin } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import { CheckCircle } from 'lucide-react';

const RegisterProvider = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    category: 'Cleaning',
    password: '',
    profileImage: '',
    role: 'provider',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('You must agree to the Terms of Service and Provider Agreement to register.');
      return;
    }

    setLoading(true);

    try {
      if (googleToken) {
          const data = await googleLogin({
            credential: googleToken,
            role: 'provider',
            phone: formData.phone,
            address: formData.city,
            category: formData.category,
            price: 1500, // Explicit defaults applied mathematically for tracking
          });
          loginUser(data);
          navigate('/provider-dashboard');
      } else {
          const payload = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            address: formData.city,
            profileImage: formData.profileImage,
            role: 'provider',
            category: formData.category,
          };

          const data = await register(payload);
          loginUser(data);
          navigate('/provider-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePreFill = (credentialResponse) => {
    setGoogleToken(credentialResponse.credential);
    // Suppress password/basic constraints since Google verifies Identity natively 
    setFormData(prev => ({ ...prev, password: 'MANAGED_BY_GOOGLE_OAUTH', email: 'managed_by_google@oauth.com', firstName: 'Google', lastName: 'Profile' }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-[-64px]">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl mt-16">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">Become a Service Provider</h2>
        <p className="mt-3 text-center text-sm text-slate-600">
          Earn money on your own schedule. Join thousands of pros nationwide.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-6 shadow-sm border border-slate-200 rounded-3xl sm:px-12">
          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">{error}</div>}
          
          {!googleToken && (
            <div className="mb-8 flex flex-col items-center">
               <GoogleLogin
                  onSuccess={handleGooglePreFill}
                  onError={() => setError('Google Sign-In widget failed to load.')}
               />
               <p className="text-xs text-slate-500 mt-3 font-medium">Auto-fills your Name and Email securely</p>
            </div>
          )}

          {googleToken && (
             <div className="mb-8 bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-200 flex items-center shadow-sm">
                <CheckCircle className="w-6 h-6 mr-3 text-emerald-600 shrink-0" /> 
                <p className="font-semibold text-sm">Google Account securely linked! Please finish answering the remaining Professional Service questions below.</p>
             </div>
          )}

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 rounded-full font-bold uppercase tracking-wider text-xs">Provider Details</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            {!googleToken && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 text-left mb-2">First Name</label>
                  <input required id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 text-left mb-2">Last Name</label>
                  <input required id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 text-left mb-2">Primary Service Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors">
                <option value="Cleaning">🧹 Cleaning</option>
                <option value="Maintenance">❄️ AC Repair / Maintenance</option>
                <option value="Plumbing">🔧 Plumbing</option>
                <option value="Electrical">⚡ Electrical</option>
                <option value="Pest Control">🐛 Pest Control</option>
                <option value="Painting">🎨 Painting</option>
                <option value="Carpenter">🪚 Carpentry</option>
                <option value="CCTV Installation">📹 CCTV Installation</option>
                <option value="Gardening">🌱 Gardening</option>
                <option value="Home Shifting">📦 Home Shifting</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 text-left mb-2">Phone Number</label>
                <input required id="phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="03XX-XXXXXXX" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-slate-700 text-left mb-2">City</label>
                <input required id="city" name="city" value={formData.city} onChange={handleChange} type="text" placeholder="Lahore" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 text-left mb-2">Profile Picture (Optional)</label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 shrink-0 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs font-bold px-2 text-center w-full h-full flex items-center justify-center">PHOTO</span>
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
                        setFormData({...formData, profileImage: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
              </div>
            </div>

            {!googleToken && (
               <>
                 <div>
                   <label htmlFor="email" className="block text-sm font-semibold text-slate-700 text-left mb-2">Email address</label>
                   <input required id="email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="you@example.com" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" />
                 </div>

                 <div>
                   <label htmlFor="password" className="block text-sm font-semibold text-slate-700 text-left mb-2">Password</label>
                   <input required id="password" name="password" value={formData.password} onChange={handleChange} type="password" placeholder="••••••••" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" />
                 </div>
               </>
            )}

            <div className="flex items-center">
              <input id="terms" required type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer" />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                I agree to the <a href="#" className="text-primary-600 hover:text-primary-500 font-semibold">Terms of Service</a> & <a href="#" className="text-primary-600 hover:text-primary-500 font-semibold">Provider Agreement</a>
              </label>
            </div>

            <div>
              <button disabled={loading} type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterProvider;
