
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PricingCard from './PricingCard';

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      plan: 'freemium' as const,
      title: 'Freemium',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        '50 invoices per month',
        '5 customers',
        '10 credit notes',
        '1 user',
        'Basic support'
      ]
    },
    {
      plan: 'starter' as const,
      title: 'Starter',
      description: 'Great for small businesses',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: [
        'Unlimited invoices',
        '50 customers',
        'Unlimited credit notes',
        '3 users',
        'Priority support',
        'Email notifications'
      ],
      isPopular: true
    },
    {
      plan: 'professional' as const,
      title: 'Professional',
      description: 'For growing businesses',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      features: [
        'Everything in Starter',
        'Unlimited customers',
        'Unlimited users',
        'GST reports',
        'Advanced analytics',
        'Priority support',
        'Custom branding'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 mb-8">Select the perfect plan for your business needs</p>
        
        <Tabs value={billingCycle} onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((planData) => (
          <PricingCard
            key={planData.plan}
            {...planData}
            billingCycle={billingCycle}
          />
        ))}
      </div>
    </div>
  );
};

export default PricingSection;
