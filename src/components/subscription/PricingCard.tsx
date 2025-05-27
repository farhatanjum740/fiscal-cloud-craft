
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import PaymentButton from './PaymentButton';
import { useSubscriptionContext } from './SubscriptionProvider';

interface PricingCardProps {
  plan: 'freemium' | 'starter' | 'professional';
  title: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isPopular?: boolean;
  billingCycle: 'monthly' | 'yearly';
  onPlanChange?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  title,
  description,
  monthlyPrice,
  yearlyPrice,
  features,
  isPopular,
  billingCycle,
  onPlanChange
}) => {
  const { subscription, refetch } = useSubscriptionContext();
  const currentPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
  const isCurrentPlan = subscription?.plan === plan && subscription?.active;
  const isFree = plan === 'freemium';

  const handleSuccess = () => {
    refetch();
    onPlanChange?.();
  };

  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Most Popular
        </Badge>
      )}
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4 bg-green-500">
          Current Plan
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          {isFree ? (
            <span className="text-3xl font-bold">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold">₹{currentPrice}</span>
              <span className="text-gray-600">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
              {billingCycle === 'yearly' && (
                <Badge variant="secondary" className="ml-2">
                  Save {Math.round(((monthlyPrice * 12) - yearlyPrice) / (monthlyPrice * 12) * 100)}%
                </Badge>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {isFree ? (
          <div className="w-full text-center text-gray-600">
            {isCurrentPlan ? 'Current Plan' : 'Always Free'}
          </div>
        ) : isCurrentPlan ? (
          <div className="w-full text-center text-green-600 font-medium">
            Active Subscription
          </div>
        ) : (
          <PaymentButton
            plan={plan as 'starter' | 'professional'}
            billingCycle={billingCycle}
            amount={currentPrice}
            onSuccess={handleSuccess}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
