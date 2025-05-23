
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

const LandingPage = () => {
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

      <div className="min-h-screen flex flex-col">
        <header className="bg-primary text-white py-4">
          <div className="container mx-auto flex justify-between items-center px-4">
            <h1 className="text-2xl font-bold">InvoiceNinja</h1>
            <div className="flex items-center gap-4">
              <Link to="/signin">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-primary/80">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-white text-primary hover:bg-slate-100">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="bg-gradient-to-b from-primary to-primary/90 text-white py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Free GST-Compliant Invoicing Made Simple</h1>
                <p className="text-xl mb-8">Create professional invoices, manage customers and track your business finances - all in one place. 100% compliant with Indian GST regulations.</p>
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-100">
                    Get Started For Free
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
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

          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">Why Choose InvoiceNinja for GST Invoicing?</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <BenefitCard 
                  title="100% GST Compliant" 
                  description="All invoices follow the latest GST guidelines with proper CGST, SGST, and IGST calculations." 
                />
                <BenefitCard 
                  title="Free Forever Plan" 
                  description="Start with our free plan that includes all essential features for small businesses." 
                />
                <BenefitCard 
                  title="No Technical Skills Required" 
                  description="User-friendly interface designed for business owners, not accountants." 
                />
                <BenefitCard 
                  title="Secure Cloud Storage" 
                  description="All your data is securely stored and backed up automatically." 
                />
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto divide-y">
                <FAQItem 
                  question="Is this software really free?" 
                  answer="Yes, our basic plan is completely free for small businesses. We also offer premium plans with additional features for growing businesses." 
                />
                <FAQItem 
                  question="Is the software compliant with GST regulations?" 
                  answer="Yes, InvoiceNinja is fully compliant with Indian GST regulations. We regularly update our software to ensure compliance with the latest tax rules." 
                />
                <FAQItem 
                  question="Can I generate GST reports for filing returns?" 
                  answer="Yes, you can generate GSTR-1, GSTR-3B, and other reports directly from the dashboard to simplify your tax filing process." 
                />
                <FAQItem 
                  question="How secure is my business data?" 
                  answer="We use bank-level encryption to protect your data. Your information is stored securely in the cloud with regular backups." 
                />
                <FAQItem 
                  question="Can I customize invoice templates?" 
                  answer="Yes, you can customize your invoice templates with your company logo, colors, and additional fields to match your brand." 
                />
              </div>
            </div>
          </section>

          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-3xl font-bold mb-8">Ready to streamline your invoicing?</h3>
              <Link to="/signup">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                  Create Your Free Account
                </Button>
              </Link>
            </div>
          </section>
        </main>

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
                    <li><Link to="/" className="text-gray-400 hover:text-white">GST Guide</Link></li>
                    <li><Link to="/" className="text-gray-400 hover:text-white">Blog</Link></li>
                  </ul>
                </div>
              </nav>
              <div className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} InvoiceNinja. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
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

export default LandingPage;
