
import React from 'react';
import SEOHead from '@/components/seo/SEOHead';

const Privacy = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy - InvoiceHub"
        description="Learn how InvoiceHub protects your data and privacy when using our GST invoice management platform."
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">We collect information you provide directly to us, such as when you:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Create an account</li>
                <li>Use our services</li>
                <li>Contact us for support</li>
                <li>Subscribe to our newsletter</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">Types of Information:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Personal information (name, email address, phone number)</li>
                <li>Business information (company name, address, GST number)</li>
                <li>Financial information (invoice data, customer data, payment information)</li>
                <li>Usage information (how you use our service, features accessed)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, security alerts</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Communicate with you about products, services, offers, and events</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with third-party vendors who perform services on our behalf</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities</li>
                <li><strong>Business Transfers:</strong> We may share or transfer information in connection with any merger, sale of company assets, or acquisition</li>
                <li><strong>With Your Consent:</strong> We may share information for any other purpose with your consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to provide you with our services and as described in this Privacy Policy. 
                We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Access:</strong> You can request copies of your personal information</li>
                <li><strong>Rectification:</strong> You can request correction of inaccurate or incomplete information</li>
                <li><strong>Erasure:</strong> You can request deletion of your personal information</li>
                <li><strong>Portability:</strong> You can request transfer of your information to another service</li>
                <li><strong>Objection:</strong> You can object to our processing of your personal information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
                Cookies are files with small amount of data which may include an anonymous unique identifier. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">Our service may contain links to third-party websites or services that are not owned or controlled by InvoiceHub:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Payment processing (Razorpay)</li>
                <li>Analytics services</li>
                <li>Customer support tools</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our service does not address anyone under the age of 18. We do not knowingly collect personally identifiable 
                information from children under 18. If you are a parent or guardian and you are aware that your child has 
                provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
                Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="text-gray-700 mt-2">
                Email: privacy@invoicehub.com<br />
                Address: Bangalore, Karnataka, India
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
