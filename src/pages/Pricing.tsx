
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = (plan: 'freemium' | 'premium', billingCycle: 'monthly' | 'yearly') => {
    if (!user) {
      navigate('/signup', { state: { redirectTo: '/pricing', selectedPlan: plan, billingCycle } });
      return;
    }
    
    if (plan === 'freemium') {
      navigate('/app/dashboard');
    } else {
      // For premium, redirect to payment page
      navigate('/payment', { state: { plan, billingCycle } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose the right plan for your business
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Simple, transparent pricing that grows with your business
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Freemium Plan */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-gray-200">
            <div className="px-6 py-8 sm:p-10">
              <h3 className="text-2xl font-semibold text-gray-900">Freemium</h3>
              <p className="mt-4 text-gray-500">Perfect for small businesses just getting started</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">₹0</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <Button 
                className="mt-8 w-full" 
                onClick={() => handleSubscribe('freemium', 'monthly')}
              >
                Get Started for Free
              </Button>
            </div>
            <div className="px-6 pt-6 pb-8 bg-gray-50 sm:px-10">
              <ul className="space-y-4">
                <Feature>Create unlimited invoices</Feature>
                <Feature>Up to 4 customers</Feature>
                <Feature>Basic invoice templates</Feature>
                <Feature>Email invoice delivery</Feature>
                <NonFeature>Report generation</NonFeature>
                <NonFeature>Priority support</NonFeature>
                <NonFeature>Custom branding</NonFeature>
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 overflow-hidden">
            <div className="px-6 py-8 sm:p-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Premium</h3>
                <span className="inline-flex px-4 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Most Popular
                </span>
              </div>
              <p className="mt-4 text-gray-500">Everything you need for a growing business</p>
              
              {/* Tabbed pricing */}
              <div className="mt-8 space-y-4">
                <div>
                  <p>
                    <span className="text-4xl font-extrabold text-gray-900">₹139</span>
                    <span className="text-base font-medium text-gray-500">/month + GST</span>
                  </p>
                  <Button 
                    className="mt-4 w-full" 
                    variant="default" 
                    onClick={() => handleSubscribe('premium', 'monthly')}
                  >
                    Subscribe Monthly
                  </Button>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p>
                    <span className="text-4xl font-extrabold text-gray-900">₹1,500</span>
                    <span className="text-base font-medium text-gray-500">/year + GST</span>
                  </p>
                  <p className="text-sm text-green-600 font-medium mt-1">Save 10% with annual billing</p>
                  <Button 
                    className="mt-4 w-full bg-blue-700 hover:bg-blue-800" 
                    onClick={() => handleSubscribe('premium', 'yearly')}
                  >
                    Subscribe Annually
                  </Button>
                </div>
              </div>
            </div>
            <div className="px-6 pt-6 pb-8 bg-gray-50 sm:px-10">
              <ul className="space-y-4">
                <Feature>Create unlimited invoices</Feature>
                <Feature>Unlimited customers</Feature>
                <Feature>Advanced invoice templates</Feature>
                <Feature>Email invoice delivery</Feature>
                <Feature>Comprehensive reports</Feature>
                <Feature>Priority support</Feature>
                <Feature>Custom branding options</Feature>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start">
    <div className="flex-shrink-0">
      <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
    </div>
    <p className="ml-3 text-sm text-gray-700">{children}</p>
  </li>
);

const NonFeature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start opacity-50">
    <p className="ml-8 text-sm text-gray-500">✕ {children}</p>
  </li>
);

export default PricingPage;
