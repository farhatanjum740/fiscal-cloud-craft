
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import PaymentButton from './PaymentButton';
import { useSubscriptionContext } from './SubscriptionProvider';

const PricingSection = () => {
  const { subscription } = useSubscriptionContext();
  const currentPlan = subscription?.plan || 'freemium';

  const plans = [
    {
      name: 'Freemium',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        '50 invoices per month',
        '5 customers',
        '10 credit notes per month',
        '1 user',
        'Basic support',
        'Standard templates'
      ],
      limitations: [
        'No GST reports',
        'Limited customer records',
        'Basic features only'
      ],
      current: currentPlan === 'freemium',
      mostPopular: false
    },
    {
      name: 'Starter',
      description: 'Great for small businesses',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: [
        'Unlimited invoices',
        '50 customers',
        'Unlimited credit notes',
        '3 users',
        'Priority support',
        'Professional templates',
        'Advanced reporting'
      ],
      limitations: [
        'No GST reports',
        'Limited team members'
      ],
      current: currentPlan === 'starter',
      mostPopular: true
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      features: [
        'Everything in Starter',
        'Unlimited customers',
        'Unlimited users',
        'GST reports',
        'Priority support',
        'Custom templates',
        'Advanced analytics',
        'API access'
      ],
      limitations: [],
      current: currentPlan === 'professional',
      mostPopular: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your business needs. All plans include our core invoicing features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.mostPopular ? 'border-primary' : ''}`}>
            {plan.mostPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  ₹{plan.monthlyPrice}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                {plan.yearlyPrice > 0 && (
                  <div className="text-sm text-muted-foreground">
                    ₹{plan.yearlyPrice}/year (Save ₹{(plan.monthlyPrice * 12) - plan.yearlyPrice})
                  </div>
                )}
              </div>
              {plan.current && (
                <Badge variant="secondary" className="mt-2">
                  Current Plan
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">FEATURES</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">LIMITATIONS</h4>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center">
                      <span className="h-4 w-4 text-red-500 mr-2 flex-shrink-0">×</span>
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4">
                {plan.name === 'Freemium' ? (
                  <Button variant="outline" className="w-full" disabled={plan.current}>
                    {plan.current ? 'Current Plan' : 'Free Forever'}
                  </Button>
                ) : plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <PaymentButton
                      plan={plan.name.toLowerCase() as 'starter' | 'professional'}
                      billingCycle="monthly"
                      amount={plan.monthlyPrice}
                      onSuccess={() => window.location.reload()}
                    />
                    {plan.yearlyPrice > 0 && (
                      <PaymentButton
                        plan={plan.name.toLowerCase() as 'starter' | 'professional'}
                        billingCycle="yearly"
                        amount={plan.yearlyPrice}
                        onSuccess={() => window.location.reload()}
                      />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include 24/7 support and regular updates. No setup fees.</p>
        <p>Prices are in Indian Rupees (INR). All payments are processed securely.</p>
      </div>
    </div>
  );
};

export default PricingSection;
