
import React from 'react';
import SEOHead from '@/components/seo/SEOHead';

const Terms = () => {
  return (
    <>
      <SEOHead
        title="Terms & Conditions - InvoiceHub"
        description="Read InvoiceHub's terms and conditions for using our GST invoice management platform."
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using InvoiceHub ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily use InvoiceHub for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained in the Service</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Account Terms</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You are responsible for safeguarding the password and all activities under your account</li>
                <li>You must notify us immediately of any unauthorized uses of your account</li>
                <li>We cannot be liable for any loss or damage from your failure to comply with this security obligation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                For paid services:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Payment must be made in advance for the chosen billing cycle</li>
                <li>All payments are processed securely through Razorpay</li>
                <li>Refunds are subject to our refund policy</li>
                <li>We reserve the right to change our pricing with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our service:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Content</h2>
              <p className="text-gray-700">
                Our Service allows you to post, link, store, share and otherwise make available certain information, 
                text, graphics, videos, or other material. You are responsible for Content that you post to the Service, 
                including its legality, reliability, and appropriateness.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
                or liability, under our sole discretion, for any reason whatsoever and without limitation, including but 
                not limited to a breach of the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700">
                In no event shall InvoiceHub, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use 
                of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be interpreted and governed by the laws of India, without regard to its conflict 
                of law provisions. Our failure to enforce any right or provision of these Terms will not be considered 
                a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
                is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <p className="text-gray-700 mt-2">
                Email: legal@invoicehub.com<br />
                Address: Bangalore, Karnataka, India
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
