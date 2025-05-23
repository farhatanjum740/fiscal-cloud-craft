import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const LandingPage = () => {
  return <div className="min-h-screen flex flex-col">
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">GST-Compliant Invoicing Made Simple</h2>
              <p className="text-xl mb-8">Create professional invoices, manage customers and track your business finances - all in one place.</p>
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
            <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
            <div className="grid md:grid-cols-3 gap-10">
              <FeatureCard title="GST-Compliant Invoicing" description="Create professional invoices that fully comply with Indian GST regulations with automatic tax calculations." />
              <FeatureCard title="Customer Management" description="Maintain detailed client records with multiple addresses and transaction history." />
              <FeatureCard title="Product Catalog" description="Manage your products with HSN codes and GST rates for faster invoice creation." />
              <FeatureCard title="Financial Analytics" description="Track revenue, outstanding payments and tax liabilities with powerful reporting." />
              <FeatureCard title="Document Generation" description="Generate professional PDF invoices and email them directly to your clients." />
              <FeatureCard title="Multi-user Access" description="Role-based permissions for team members with different levels of access." />
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
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} InvoiceHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
const FeatureCard = ({
  title,
  description
}: {
  title: string;
  description: string;
}) => <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <h4 className="text-xl font-semibold mb-3 text-invoice-primary">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>;
export default LandingPage;