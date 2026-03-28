import { useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Contact Us</h1>
          <p className="mt-4 text-lg text-slate-500">Have questions? We'd love to hear from you. Fill out the form below and we will get back to you within 24 hours.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10">
          {isSuccess ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-200">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Received!</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto">Thank you for reaching out. Our support team will review your inquiry and get back to you at the email provided.</p>
              <button 
                onClick={() => window.location.href = '/contact'} 
                className="bg-primary-50 text-primary-700 font-bold py-3 px-8 rounded-xl hover:bg-primary-100 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form action="https://formsubmit.co/homeservewebapp@gmail.com" method="POST" className="space-y-6">
              {/* FormSubmit Config Parameters */}
              <input type="hidden" name="_next" value={window.location.origin + '/contact?success=true'} />
              <input type="hidden" name="_subject" value="New HomeServe Contact Inquiry" />
              <input type="hidden" name="_template" value="table" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                  <input type="text" name="First Name" required className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" placeholder="Ali" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                  <input type="text" name="Last Name" required className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" placeholder="Khan" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input type="email" name="Email Address" required className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" placeholder="ali@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                  <input type="tel" name="Mobile Number" required className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors" placeholder="03XX-XXXXXXX" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                <textarea name="Message Details" required rows="5" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors resize-y" placeholder="How can we help you?"></textarea>
              </div>
              
              <button type="submit" className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
