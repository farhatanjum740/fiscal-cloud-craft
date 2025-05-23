
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const GstInvoicing = () => {
  return (
    <>
      <Helmet>
        <title>GST Invoicing for Indian Businesses | InvoiceNinja</title>
        <meta name="description" content="Learn about GST invoicing requirements and how InvoiceNinja helps Indian businesses create compliant invoices with automatic tax calculations." />
        <meta name="keywords" content="GST invoicing, GSTR filing, CGST SGST calculation, Indian tax invoices, HSN codes" />
        <link rel="canonical" href="https://invoiceninja.com/gst-invoicing" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <header className="bg-primary text-white py-4">
          <div className="container mx-auto flex justify-between items-center px-4">
            <Link to="/">
              <h1 className="text-2xl font-bold">InvoiceNinja</h1>
            </Link>
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

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-6">GST Invoicing for Indian Businesses</h1>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mt-8 mb-4">What is GST Invoicing?</h2>
              <p className="mb-4">
                GST (Goods and Services Tax) invoicing is a mandatory requirement for businesses in India. 
                A GST invoice is a commercial document that records a transaction between a buyer and a seller, 
                including details of the goods or services provided, their value, and the tax charged.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">GST Invoice Requirements</h2>
              <p className="mb-4">
                Under GST law, a valid tax invoice must include:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>Name, address, and GSTIN of the supplier</li>
                <li>Invoice number and date</li>
                <li>Name, address, and GSTIN of the recipient</li>
                <li>Description of goods or services</li>
                <li>HSN code for goods or SAC for services</li>
                <li>Quantity and unit</li>
                <li>Total value of supply</li>
                <li>Taxable value</li>
                <li>Rate and amount of tax (CGST, SGST/UTGST, IGST)</li>
                <li>Place of supply</li>
                <li>Signature of the supplier or authorized representative</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Types of GST Invoices</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Regular Tax Invoice</h3>
                  <p>Used for B2B transactions or registered persons.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Bill of Supply</h3>
                  <p>Used when supplying exempted goods or by composition dealers.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Revised Invoice</h3>
                  <p>Issued to revise details of previously issued invoices.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Credit/Debit Notes</h3>
                  <p>Used to adjust the value of supply or tax amount.</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">How InvoiceNinja Simplifies GST Invoicing</h2>
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Automatic Tax Calculation</h3>
                <p>
                  InvoiceNinja automatically calculates CGST, SGST, and IGST based on the customer's location and the applicable tax rates.
                  You don't need to manually compute tax amounts or worry about compliance issues.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">HSN Code Management</h3>
                <p>
                  Our product catalog allows you to store HSN codes for each product, ensuring that your invoices include these mandatory details.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">GST Reporting</h3>
                <p>
                  Generate GSTR-1, GSTR-3B, and other reports directly from your data to simplify tax filing.
                  No more manual compilation of data from different invoices.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Professional Templates</h3>
                <p>
                  Choose from a variety of GST-compliant invoice templates that include all the required fields and information.
                </p>
              </div>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Common GST Invoicing Challenges</h2>
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Interstate vs. Intrastate Transactions</h3>
                <p>
                  For interstate transactions, IGST applies, while for intrastate transactions, both CGST and SGST apply.
                  InvoiceNinja automatically detects the transaction type based on the supplier's and customer's states and applies the correct taxes.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Reverse Charge Mechanism</h3>
                <p>
                  In certain cases, the recipient is liable to pay GST instead of the supplier (reverse charge).
                  Our software correctly handles these special cases with proper notation on invoices.
                </p>
              </div>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Get Started with GST-Compliant Invoicing Today</h2>
              <p className="mb-6">
                Sign up for InvoiceNinja's free plan and start creating professional, GST-compliant invoices in minutes.
                No credit card required, no hidden charges.
              </p>
              
              <div className="mt-8 mb-12 text-center">
                <Link to="/signup">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-gray-900 text-white py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">InvoiceNinja</h2>
                <p className="text-sm text-gray-400">GST Invoicing Solution for Indian Businesses</p>
              </div>
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

export default GstInvoicing;
