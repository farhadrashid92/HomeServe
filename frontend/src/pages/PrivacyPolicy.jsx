import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>
            At HomeServe, we take your privacy seriously. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website and use our services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We may collect personal identification information from Users in a variety of ways, including,
            but not limited to, when Users visit our site, register on the site, place an order,
            subscribe to the newsletter, and in connection with other activities, services, features or resources.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name and Contact Data (Email, Phone Number, Address)</li>
            <li>Credentials (Passwords)</li>
            <li>Payment Data (Processed securely by third parties)</li>
            <li>Service history and reviews</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Information</h2>
          <p>
            HomeServe collects and uses Users personal information for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To improve customer service</li>
            <li>To personalize user experience</li>
            <li>To process transactions and bookings</li>
            <li>To run a promotion, contest, survey or other Site feature</li>
            <li>To send periodic emails and booking notifications</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Data Security</h2>
          <p>
            We adopt appropriate data collection, storage and processing practices and security measures
            to protect against unauthorized access, alteration, disclosure or destruction of your
            personal information, username, password, transaction information and data stored on our Site.
          </p>
          
          <p className="mt-8 text-sm text-slate-500 italic">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
