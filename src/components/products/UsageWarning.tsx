
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { SubscriptionLimits } from '@/types';

interface UsageWarningProps {
  limits: SubscriptionLimits | null;
  shouldShow: boolean;
}

const UsageWarning: React.FC<UsageWarningProps> = ({ limits, shouldShow }) => {
  if (!shouldShow) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <p className="text-sm text-orange-800">
          You've reached your product limit ({limits?.products} products). 
          Upgrade your plan to add more products.
        </p>
      </CardContent>
    </Card>
  );
};

export default UsageWarning;
