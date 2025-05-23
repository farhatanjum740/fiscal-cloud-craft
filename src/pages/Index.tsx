
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

const Index = () => {
  // Track page views for analytics
  useEffect(() => {
    console.log("Home page viewed - analytics event would fire here");
  }, []);

  return (
    <>
      <Helmet>
        <title>Free GST-Compliant Invoice Software for Indian Businesses | InvoiceNinja</title>
        <meta name="description" content="Create professional GST-compliant invoices for free. Manage customers, track finances, and generate tax reports with our simple invoicing software designed for Indian businesses." />
        <meta name="keywords" content="GST invoice software, free invoicing app, GST billing software, Indian GST invoices, tax compliant invoicing, small business invoice software" />
        <meta property="og:title" content="Free GST-Compliant Invoice Software | InvoiceNinja" />
        <meta property="og:description" content="Create professional GST-compliant invoices free. Easy-to-use software for Indian businesses to manage customers and generate tax reports." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://invoiceninja.com/" />
        <meta property="og:image" content="https://invoiceninja.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free GST-Compliant Invoice Software" />
        <meta name="twitter:description" content="Create professional GST-compliant invoices for Indian businesses." />
        <meta name="twitter:image" content="https://invoiceninja.com/twitter-image.jpg" />
        <link rel="canonical" href="https://invoiceninja.com/" />
      </Helmet>

      {/* Hero Section - Reduced top padding */}
      <section className="bg-[#121f3d] text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">InvoiceNinja</h2>
            <div className="flex items-center gap-4">
              <Link to="/signin">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-[#1a3b7a]">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-white text-[#121f3d] hover:bg-slate-100">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">GST-Compliant Invoicing Made Simple</h1>
            <p className="text-xl mb-8">Create professional invoices, manage customers and track your business finances - all in one place.</p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-[#121f3d] hover:bg-slate-100">
                Get Started For Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              title="GST-Compliant Invoicing" 
              description="Create professional invoices that fully comply with Indian GST regulations with automatic tax calculations." 
            />
            <FeatureCard 
              title="Customer Management" 
              description="Maintain detailed client records with multiple addresses and transaction history." 
            />
            <FeatureCard 
              title="Product Catalog" 
              description="Manage your products with HSN codes and GST rates for faster invoice creation." 
            />
            <FeatureCard 
              title="Financial Analytics" 
              description="Track revenue, outstanding payments and tax liabilities with powerful reporting." 
            />
            <FeatureCard 
              title="Document Generation" 
              description="Generate professional PDF invoices and email them directly to your clients." 
            />
            <FeatureCard 
              title="Multi-user Access" 
              description="Role-based permissions for team members with different levels of access." 
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Testimonials</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">John Doe</h3>
              <p className="text-gray-600 mb-4">"InvoiceNinja has been a game-changer for my business. The software is user-friendly and the support team is always helpful."</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Jane Smith</h3>
              <p className="text-gray-600 mb-4">"I've been using InvoiceNinja for a year now and it's been a great investment. The software has helped me streamline my business operations and save time."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Resources</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">GST Guidelines</h3>
              <p className="text-gray-600 mb-4">Understand the latest GST regulations and compliance requirements for your business.</p>
              <Link to="/gst-invoicing" className="text-primary hover:underline font-medium">Learn More →</Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Invoice Templates</h3>
              <p className="text-gray-600 mb-4">Download free GST-compliant invoice templates for your business needs.</p>
              <a href="#" className="text-primary hover:underline font-medium">Download Now →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Knowledge Blog</h3>
              <p className="text-gray-600 mb-4">Expert articles and guides on GST compliance, invoicing best practices, and more.</p>
              <Link to="/blog" className="text-primary hover:underline font-medium">Read Articles →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#121f3d] text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Ready to streamline your invoicing?</h2>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[#121f3d] hover:bg-slate-100">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">InvoiceNinja</h2>
              <p className="text-sm text-gray-400">GST Invoicing Solution for Indian Businesses</p>
            </div>
            <nav className="grid grid-cols-2 gap-8 text-sm mb-4 md:mb-0">
              <div>
                <h3 className="font-semibold mb-2">Product</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white">Features</Link></li>
                  <li><Link to="/" className="text-gray-400 hover:text-white">Pricing</Link></li>
                  <li><Link to="/" className="text-gray-400 hover:text-white">Testimonials</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Resources</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white">Help Center</Link></li>
                  <li><Link to="/gst-invoicing" className="text-gray-400 hover:text-white">GST Guide</Link></li>
                  <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                </ul>
              </div>
            </nav>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} InvoiceNinja. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

const FeatureCard = ({
  title,
  description
}: {
  title: string;
  description: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <h3 className="text-xl font-semibold mb-3 text-invoice-primary">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const BenefitCard = ({
  title,
  description
}: {
  title: string;
  description: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold mb-2 text-invoice-primary">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FAQItem = ({
  question,
  answer
}: {
  question: string;
  answer: string;
}) => (
  <div className="py-4">
    <h3 className="text-lg font-semibold mb-2">{question}</h3>
    <p className="text-gray-600">{answer}</p>
  </div>
);

export default Index;
