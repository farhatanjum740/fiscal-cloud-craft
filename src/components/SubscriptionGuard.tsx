import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LockIcon, AlertTriangleIcon } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiresPremium?: boolean;
  fallback?: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  requiresPremium = false,
  fallback
}) => {
  const { isPremium, isFreemium, loading } = useSubscriptionContext();
  const location = useLocation();

  // If loading, show nothing yet
  if (loading) {
    return null;
  }

  // Check if the user has the required subscription
  const hasAccess = requiresPremium ? isPremium : true;

  // If the user has access, show the children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If a fallback is provided, show that instead
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise, show the upgrade prompt
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <LockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-center">Premium Feature</CardTitle>
          <CardDescription className="text-center">
            This feature requires a premium subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Upgrade to our Premium plan to access advanced reporting, unlimited customers, and more.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/pricing'}
          >
            View Premium Plans
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/app/dashboard'}
          >
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionGuard;
