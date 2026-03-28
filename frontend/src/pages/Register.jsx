import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { register, googleLogin } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!termsAccepted) {
      setError('You must agree to the Terms of Service to register.');
      return;
    }

    setLoading(true);

    try {
      const data = await register(formData);
      loginUser(data); // Log them in immediately
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const data = await googleLogin({
         credential: credentialResponse.credential,
         role: 'customer'
      });
      loginUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Registration encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-[-64px]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-16">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">Create a customer account</h2>
        <p className="mt-3 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
            Log in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-sm border border-slate-200 rounded-3xl sm:px-12">
          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">{error}</div>}
          
          <div className="mb-6 flex justify-center">
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Identity widget failed to load.')}
                useOneTap
             />
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 rounded-full font-medium">Or register with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 text-left mb-2">Full Name</label>
              <input required id="name" name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Ali Khan" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 text-left mb-2">Email address</label>
              <input required id="email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="you@example.com" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 text-left mb-2">Phone Number</label>
              <input required id="phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="03XX-XXXXXXX" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 text-left mb-2">Password</label>
              <input required id="password" name="password" value={formData.password} onChange={handleChange} type="password" placeholder="••••••••" className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors" />
            </div>

            <div className="flex items-center">
              <input id="terms" name="terms" required type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer" />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                I agree to the <a href="#" className="text-primary-600 hover:text-primary-500 font-semibold">Terms of Service</a>
              </label>
            </div>

            <div>
              <button disabled={loading} type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 rounded-full">Providers</span>
            </div>
            <Link to="/register-provider" className="mt-6 w-full flex justify-center py-3.5 px-4 border-2 border-slate-100 rounded-xl shadow-sm text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none transition-colors">
              Join as Service Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
