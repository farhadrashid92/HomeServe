import { Link, useNavigate } from 'react-router-dom';
import { Home, LogIn } from 'lucide-react';
import { useState } from 'react';
import { login, googleLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const data = await login(formData);
      loginUser(data); // update global state
      
      // Redirect based on role
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'provider') navigate('/provider-dashboard');
      else navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to login. Please check credentials.');
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
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'provider') navigate('/provider-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In actively failed or encountered a validation issue.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-[-64px]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-16">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
              <span className="px-3 bg-white text-slate-500 rounded-full font-medium">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 text-left mb-2">Email address</label>
              <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 text-left mb-2">Password</label>
              <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer">Remember me</label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">Forgot password?</a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 relative">
            <div className="absolute inset-0 flex items-center pointer-events-none">
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
export default Login;
