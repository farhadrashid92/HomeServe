import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "How do I book a service?",
    answer: "You can book a service by browsing through our categories, selecting the specific service you need, choosing an available provider, picking an available time slot, and confirming your booking."
  },
  {
    question: "Are the service professionals verified?",
    answer: "Yes, absolutely. We conduct thorough reference checks, background verification, and skills assessment before onboarding any professional to our platform."
  },
  {
    question: "Do I have to pay upfront?",
    answer: "No, you don't. You only pay once the service has been successfully completed to your satisfaction. You can pay via cash or transfer directly."
  },
  {
    question: "What if I am not satisfied with the service?",
    answer: "Your satisfaction is our priority. If you're not happy with the work, you can raise a complaint within 24 hours via customer support, and we will arrange a free rework or a refund."
  },
  {
    question: "Is there any cancellation fee?",
    answer: "You can cancel any booking for free up to 2 hours before the scheduled time. Late cancellations may incur a minimal visiting fee."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-slate-500">Everything you need to know about the product and billing.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl border transition-all duration-300 ${openIndex === index ? 'border-primary-200 shadow-md ring-1 ring-primary-50' : 'border-slate-200 shadow-sm'}`}
            >
              <button
                className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className={`font-bold ${openIndex === index ? 'text-primary-600' : 'text-slate-800'}`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-primary-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FAQ;
