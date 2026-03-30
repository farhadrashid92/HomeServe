import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, Bell, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/messageService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();

  const handleScroll = () => {
    if (window.scrollY > 0) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Globally track unread messaging counts avoiding massive prop-drilling
  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      const fetchCount = async () => {
         try {
            const count = await getUnreadCount();
            setUnreadMsg(count);
         } catch (e) {}
      };
      fetchCount();
      interval = setInterval(fetchCount, 10000); // 10s general navbar ping
    }
    return () => { if(interval) clearInterval(interval); };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-white shadow-sm border-b fixed w-full top-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 py-1">
              <img src="/logo.png" alt="HomeServe" className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" />
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="text-slate-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
            <Link to="/services" className="text-slate-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Services</Link>
            <Link to="/about" className="text-slate-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-slate-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</Link>
            
            {/* Desktop Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Live Unread Indicator */}
                <Link to="/inbox" className="relative text-slate-500 hover:text-primary-600 transition-colors">
                  <MessageSquare className="h-6 w-6" />
                  {unreadMsg > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm animate-pulse">
                      {unreadMsg > 9 ? '9+' : unreadMsg}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 focus:outline-none">
                    <img src={currentUser.profileImage || "https://ui-avatars.com/api/?name="+currentUser.name+"&background=10b981&color=fff"} className="w-8 h-8 rounded-full" alt="Profile" />
                    <span className="text-slate-700 font-medium">{currentUser.name}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                      <Link
                        to={
                          currentUser.role === 'admin' ? '/admin' :
                          currentUser.role === 'provider' ? '/provider-dashboard' :
                          '/dashboard'
                        }
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Log in</Link>
                <Link to="/register" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 hover:shadow-md transition-all">Sign up</Link>
              </>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-white shadow-lg border-b absolute w-full left-0 max-h-[90vh] overflow-y-auto">
          <div className="pt-2 pb-4 space-y-1 px-4">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50">Home</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50">Services</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50">About</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50">Contact</Link>
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 pb-3 border-t border-slate-100">
              {isAuthenticated ? (
                <div className="space-y-1 px-2">
                  <Link
                    to="/inbox"
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="flex items-center"><MessageSquare className="h-5 w-5 mr-3 text-slate-400" /> Messages</span>
                    {unreadMsg > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadMsg}</span>}
                  </Link>
                  <Link 
                    to={
                      currentUser.role === 'admin' ? '/admin' : 
                      currentUser.role === 'provider' ? '/provider-dashboard' : 
                      '/dashboard'
                    }
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-4 mt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center text-slate-700 border border-slate-300 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors">Log in</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="w-full text-center bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
