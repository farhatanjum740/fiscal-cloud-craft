
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { useSubscriptionContext } from './SubscriptionProvider';
import PaymentButton from './PaymentButton';

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { subscription } = useSubscriptionContext();

  const plans = [
    {
      name: 'Freemium',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { name: '50 Invoices per month', included: true },
        { name: '5 Customers', included: true },
        { name: '10 Credit Notes per month', included: true },
        { name: '1 User', included: true },
        { name: 'Basic Templates', included: true },
        { name: 'GST Reports', included: false },
        { name: 'Priority Support', included: false },
      ],
      planType: 'freemium' as const,
      popular: false,
    },
    {
      name: 'Starter',
      description: 'Great for small businesses',
      monthlyPrice: 149,
      yearlyPrice: Math.round(149 * 12 * 0.9), // 10% discount
      features: [
        { name: 'Unlimited Invoices', included: true },
        { name: '50 Customers', included: true },
        { name: 'Unlimited Credit Notes', included: true },
        { name: '3 Users', included: true },
        { name: 'All Templates', included: true },
        { name: 'GST Reports', included: false },
        { name: 'Priority Support', included: true },
      ],
      planType: 'starter' as const,
      popular: true,
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      monthlyPrice: 299,
      yearlyPrice: Math.round(299 * 12 * 0.9), // 10% discount
      features: [
        { name: 'Unlimited Invoices', included: true },
        { name: 'Unlimited Customers', included: true },
        { name: 'Unlimited Credit Notes', included: true },
        { name: 'Unlimited Users', included: true },
        { name: 'All Templates', included: true },
        { name: 'GST Reports', included: true },
        { name: 'Priority Support', included: true },
      ],
      planType: 'professional' as const,
      popular: false,
    },
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 'Free';
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const period = isYearly ? 'year' : 'month';
    return `₹${price}/${period}`;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.yearlyPrice;
    return savings;
  };

  const getCurrentPlan = () => {
    return subscription?.plan || 'freemium';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground mb-6">
          Select the perfect plan for your business needs
        </p>
        
        <div className="flex items-center justify-center space-x-4 mb-8">
          <Label htmlFor="billing-toggle">Monthly</Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle">Yearly</Label>
          {isYearly && (
            <Badge variant="secondary" className="ml-2">
              Save 10%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = getCurrentPlan() === plan.planType;
          const savings = getSavings(plan);
          
          return (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                  variant="default"
                >
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">{getPrice(plan)}</div>
                  {isYearly && savings && (
                    <div className="text-sm text-green-600 mt-1">
                      Save ₹{savings} per year
                    </div>
                  )}
                  {plan.monthlyPrice > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      + applicable GST
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : plan.planType === 'freemium' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free Forever
                    </Button>
                  ) : (
                    <PaymentButton
                      plan={plan.planType}
                      billingCycle={isYearly ? 'yearly' : 'monthly'}
                      amount={isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include secure data storage, regular backups, and 99.9% uptime guarantee.</p>
        <p className="mt-2">GST will be added to the final amount as per Indian tax regulations.</p>
      </div>
    </div>
  );
};

export default PricingSection;
