
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCheck, ChevronRight, LayoutDashboard, Receipt, UserPlus, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center text-blue-600 font-bold text-xl">
                InvoiceApp
              </div>
            </div>
            <div className="flex items-center">
              <Link to="/signin">
                <Button variant="ghost" className="mr-2">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Simplified Invoicing for</span>{' '}
                  <span className="block text-blue-600 xl:inline">Indian Businesses</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Create professional GST-compliant invoices, manage customers, and generate insightful reports to help your business grow.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/signup">
                      <Button size="lg" className="w-full">
                        Start for Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/pricing">
                      <Button variant="outline" size="lg">
                        View Pricing
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="Office workspace"
          />
        </div>
      </div>

      {/* Features */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your business
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides all the essential tools for creating invoices, managing customers, and tracking business performance.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">GST-Compliant Invoicing</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Create professional, GST-compliant invoices in seconds. Add your products, services, and customer details with ease.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Customer Management</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Keep track of all your customers, their contact information, and transaction history in one place.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Intuitive Dashboard</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Get a complete overview of your business with our user-friendly dashboard. Monitor sales, outstanding invoices, and more.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Advanced Reports</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Generate detailed reports on sales, taxes, and customer activity to help you make informed business decisions.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing CTA */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Choose a plan that works for you
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start with our free plan or upgrade to Premium for unlimited features
            </p>
            <div className="mt-8">
              <Link to="/pricing">
                <Button size="lg">
                  View Pricing Options
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by businesses across India
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">
                "This invoicing system has simplified our billing process immensely. The GST calculations are accurate and save us hours of manual work."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <span className="text-blue-700 font-bold">RK</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Rahul Kumar</h4>
                  <p className="text-sm text-gray-500">Small Business Owner, Delhi</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">
                "The reporting features have given us valuable insights into our business performance. Highly recommended for growing businesses."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <span className="text-blue-700 font-bold">AP</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Anjali Patel</h4>
                  <p className="text-sm text-gray-500">Startup Founder, Bangalore</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">
                "Customer management has never been easier. We can keep track of all our clients and their history in one place."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <span className="text-blue-700 font-bold">VS</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Vijay Singh</h4>
                  <p className="text-sm text-gray-500">Service Provider, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <h2 className="text-white text-2xl font-bold">InvoiceApp</h2>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-400">
                &copy; 2025 InvoiceApp. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
