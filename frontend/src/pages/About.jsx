const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">About HomeServe</h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-lg">
            <p className="leading-relaxed">
              HomeServe is Pakistan's leading platform for connecting individuals looking for everyday home services with top-quality, pre-screened independent service professionals.
            </p>
            <p className="leading-relaxed">
              From house deep cleaning to emergency plumbing, HomeServe instantly matches thousands of customers every week with top-rated professionals in cities all around Pakistan. 
            </p>
            
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Our Mission</h2>
            <p className="leading-relaxed">
              We aim to empower independent service professionals to grow their businesses while providing homeowners with a reliable, seamless, and trustworthy way to maintain their homes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-primary-600 mb-4">For Customers</h3>
                <ul className="space-y-3">
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Vetted Professionals</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Transparent Pricing</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Hassle-free Booking</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Satisfaction Guarantee</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-600 mb-4">For Professionals</h3>
                <ul className="space-y-3">
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Flexible Schedule</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Reliable Income</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Instant Payouts</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Dedicated Support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default About;
