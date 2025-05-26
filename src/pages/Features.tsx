
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  FileText, 
  Users, 
  Calculator, 
  BarChart3, 
  Mail, 
  Shield,
  Download,
  CreditCard,
  IndianRupee,
  Building
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: "GST-Compliant Invoicing",
      description: "Create professional invoices that fully comply with Indian GST regulations. Automatic tax calculations, HSN codes, and GSTIN validation included."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Customer Management",
      description: "Maintain detailed client records with multiple addresses, contact information, and complete transaction history for better relationship management."
    },
    {
      icon: <Calculator className="h-8 w-8 text-blue-600" />,
      title: "Automatic Tax Calculations",
      description: "Built-in GST calculator handles CGST, SGST, IGST, and CESS calculations automatically. No more manual tax computation errors."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Financial Reports",
      description: "Generate comprehensive reports for sales analysis, tax liability tracking, and business performance monitoring with detailed insights."
    },
    {
      icon: <Mail className="h-8 w-8 text-blue-600" />,
      title: "Email Integration",
      description: "Send invoices directly to clients via email with professional templates. Track delivery status and payment reminders automatically."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security. Regular backups ensure your business information is always safe."
    },
    {
      icon: <Download className="h-8 w-8 text-blue-600" />,
      title: "PDF Export",
      description: "Generate professional PDF invoices with your company branding. Download, print, or share invoices in multiple formats."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-blue-600" />,
      title: "Credit Note Management",
      description: "Handle returns and adjustments with proper credit note generation. Maintain complete audit trails for all transactions."
    },
    {
      icon: <IndianRupee className="h-8 w-8 text-blue-600" />,
      title: "Multi-Currency Support",
      description: "Support for Indian Rupees and international currencies. Automatic currency conversion and exchange rate management."
    },
    {
      icon: <Building className="h-8 w-8 text-blue-600" />,
      title: "Multi-Company Support",
      description: "Manage multiple businesses from a single account. Separate financial records and reports for each company entity."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Features - Complete GST Invoice Management Software | InvoiceNinja</title>
        <meta name="description" content="Discover all features of InvoiceNinja: GST-compliant invoicing, customer management, automatic tax calculations, financial reports, and more for Indian businesses." />
        <meta name="keywords" content="GST invoice software features, invoice management tools, tax calculation software, customer management system, financial reporting tools India" />
        <link rel="canonical" href="https://invoiceninja.com/features" />
      </Helmet>

      {/* Header */}
      <section className="bg-[#121f3d] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="text-2xl font-bold">InvoiceNinja</Link>
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
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need for Professional Invoicing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive GST-compliant invoicing software designed specifically for Indian businesses. 
            From small startups to growing enterprises.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-[#121f3d] text-white hover:bg-[#1a3b7a]">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Businesses</h2>
            <p className="text-xl text-gray-600">
              All the tools you need to manage your invoicing and grow your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GST Compliance Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">100% GST Compliant</h2>
            <p className="text-xl text-gray-600">
              Built specifically for Indian tax regulations and compliance requirements
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">GST Features Include:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• GSTIN validation and verification</li>
                <li>• HSN/SAC code management</li>
                <li>• CGST, SGST, IGST calculations</li>
                <li>• CESS and TCS handling</li>
                <li>• Reverse charge mechanism</li>
                <li>• Export invoice formats</li>
                <li>• E-invoice compliance ready</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Compliance Reports:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• GSTR-1 preparation support</li>
                <li>• GSTR-3B reconciliation</li>
                <li>• Tax liability reports</li>
                <li>• Input tax credit tracking</li>
                <li>• Sales and purchase registers</li>
                <li>• Monthly/quarterly summaries</li>
                <li>• Audit trail maintenance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#121f3d] text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to experience the difference?</h2>
          <p className="text-xl mb-8">Join thousands of businesses already using InvoiceNinja</p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[#121f3d] hover:bg-slate-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default Features;
