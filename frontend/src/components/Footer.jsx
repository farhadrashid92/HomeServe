import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block flex-shrink-0">
              <img src="/logo.png" alt="HomeServe" className="h-10 md:h-14 object-contain drop-shadow-sm brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Your trusted partner for home services across Pakistan. Reliable, fast, and professional platform aiming to deliver excellence to your doorstep.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Services</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/services?category=Cleaning" className="hover:text-primary-400 transition-colors">Cleaning</Link></li>
              <li><Link to="/services?category=Maintenance" className="hover:text-primary-400 transition-colors">AC Repair</Link></li>
              <li><Link to="/services?category=Plumbing" className="hover:text-primary-400 transition-colors">Plumbing</Link></li>
              <li><Link to="/services?category=Electrical" className="hover:text-primary-400 transition-colors">Electrical</Link></li>
              <li><Link to="/services?category=Pest+Control" className="hover:text-primary-400 transition-colors">Pest Control</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <span className="block text-slate-500 text-xs mb-1">Email Support</span>
                <a href="mailto:homeservewebapp@gmail.com" className="hover:text-primary-400 transition-colors font-medium">homeservewebapp@gmail.com</a>
              </li>
              <li className="pt-3 border-t border-slate-800">
                <Link to="/register-provider" className="hover:text-primary-400 transition-colors text-primary-500 font-semibold">Join as Professional &rarr;</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} HomeServe. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="hover:text-slate-300">Facebook</a>
            <a href="#" className="hover:text-slate-300">Twitter</a>
            <a href="#" className="hover:text-slate-300">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
