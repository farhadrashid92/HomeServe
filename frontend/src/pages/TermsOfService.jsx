import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>
            Welcome to HomeServe. By accessing or using our website and services, you agree to be bound by these Terms of Service.
            Please read them carefully before utilizing our platform.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By registering for an account, accessing, or utilizing any HomeServe services, you formally accept
            and agree to automatically be bound by these terms. If you do not agree, you must immediately cease
            use of our services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Service Provision</h2>
          <p>
            HomeServe operates as a digital marketplace connecting independent Service Professionals ("Providers") 
            with customers. We do not directly employ the professionals and act solely as a facilitator for bookings.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Providers are independent contractors ensuring their own adherence to local laws and safety standards.</li>
            <li>HomeServe is not liable for damages or incomplete work, though we do moderate the platform securely.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. User Responsibilities</h2>
          <p>
            Users agree to provide accurate, current, and complete information during the booking process.
            Users are strictly prohibited from utilizing the platform for any illegal activities, harassment, 
            or distribution of malicious code.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Payments and Cancellations</h2>
          <p>
            Payments are processed securely. Cancellations must be made at least 24 hours prior to the scheduled
            booking to avoid penalty fees. Repeated late cancellations may result in account suspension.
          </p>
          
          <p className="mt-8 text-sm text-slate-500 italic">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
