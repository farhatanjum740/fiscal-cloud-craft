
import React from 'react';
import SEOHead from '@/components/seo/SEOHead';
import PricingSection from '@/components/subscription/PricingSection';
import { SubscriptionProvider } from '@/components/subscription/SubscriptionProvider';

const Pricing = () => {
  return (
    <>
      <SEOHead
        title="Pricing - InvoiceHub | GST Invoice Management Plans"
        description="Choose the perfect InvoiceHub plan for your business. Affordable pricing with powerful GST invoice management features. Start free today!"
        keywords="invoicehub pricing, gst billing software cost, invoice management plans, subscription pricing india"
      />
      
      <SubscriptionProvider>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 py-16">
            <PricingSection />
            
            {/* FAQ Section */}
            <div className="mt-24 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Can I change my plan anytime?</h3>
                  <p className="text-gray-600">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Is there a free trial?</h3>
                  <p className="text-gray-600">
                    Yes, our freemium plan allows you to use InvoiceHub with basic features at no cost. You can upgrade when you need more features.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600">
                    We accept all major credit cards, debit cards, UPI, and net banking through our secure payment partner Razorpay.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Is my data secure?</h3>
                  <p className="text-gray-600">
                    Absolutely. We use enterprise-grade security measures including encryption, secure servers, and regular security audits to protect your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SubscriptionProvider>
    </>
  );
};

export default Pricing;
