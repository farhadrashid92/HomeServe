import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { Suspense } from 'react';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import InstallPrompt from './components/InstallPrompt';

const Home = React.lazy(() => import('./pages/Home'));
const Services = React.lazy(() => import('./pages/Services'));
const ServiceDetails = React.lazy(() => import('./pages/ServiceDetails'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const RegisterProvider = React.lazy(() => import('./pages/RegisterProvider'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const BookingFlow = React.lazy(() => import('./pages/BookingFlow'));
const Inbox = React.lazy(() => import('./pages/Inbox'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));
const ProviderDashboard = React.lazy(() => import('./pages/ProviderDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <InstallPrompt />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="services/:id" element={<ServiceDetails />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="register-provider" element={<RegisterProvider />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms-of-service" element={<TermsOfService />} />
              
              {/* Protected Customer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
                <Route path="book/:id" element={<BookingFlow />} />
                <Route path="dashboard" element={<UserDashboard />} />
              </Route>

              {/* Global Protected Routes (Any Authenticated Role) */}
              <Route element={<ProtectedRoute />}>
                <Route path="inbox" element={<Inbox />} />
              </Route>

              {/* Protected Provider Routes */}
              <Route element={<ProtectedRoute allowedRoles={['provider', 'admin']} />}>
                <Route path="provider-dashboard" element={<ProviderDashboard />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
