
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useSubscriptionContext } from './SubscriptionProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MobileUsageDashboard = () => {
  const { subscription, limits, usage, loading, error, refetch } = useSubscriptionContext();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-32 space-y-2">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading usage data...</p>
      </div>
    );
  }

  const plan = subscription?.plan || 'freemium';
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (percentage >= 75) return <Clock className="h-4 w-4 text-orange-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const usageItems = [
    {
      name: 'Invoices',
      current: usage?.invoices_count || 0,
      limit: limits?.invoices || 0,
      key: 'invoices'
    },
    {
      name: 'Customers', 
      current: usage?.customers_count || 0,
      limit: limits?.customers || 0,
      key: 'customers'
    },
    {
      name: 'Credit Notes',
      current: usage?.credit_notes_count || 0,
      limit: limits?.credit_notes || 0,
      key: 'credit_notes'
    },
    {
      name: 'Products',
      current: usage?.products_count || 0,
      limit: limits?.products || 0,
      key: 'products'
    }
  ];

  const handleRefresh = async () => {
    console.log('Refreshing subscription data...');
    await refetch();
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h2 className="text-xl font-bold sm:text-2xl">Usage Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track your subscription usage</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Badge variant={plan === 'freemium' ? 'secondary' : 'default'} className="w-fit">
            {planName} Plan
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="w-fit"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading subscription data: {error}. Some features may not work correctly.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {usageItems.map((item) => {
          const percentage = getUsagePercentage(item.current, item.limit);
          const isUnlimited = item.limit === -1;
          
          return (
            <Card key={item.key} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                  {!isUnlimited && getUsageIcon(percentage)}
                </div>
                <CardDescription className="text-xs">
                  {isUnlimited ? 'Unlimited' : `${item.current} / ${item.limit}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {!isUnlimited ? (
                  <div className="space-y-2">
                    <Progress value={percentage} className="h-2" />
                    <p className={`text-xs font-medium ${getUsageColor(percentage)}`}>
                      {percentage.toFixed(1)}% used
                    </p>
                    {percentage >= 90 && (
                      <p className="text-xs text-red-600">
                        Limit almost reached!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-xs font-medium text-green-600">Unlimited usage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center justify-between">
              <span>GST Reports:</span>
              <Badge variant={limits?.reports ? 'default' : 'secondary'} className="text-xs">
                {limits?.reports ? 'Available' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Priority Support:</span>
              <Badge variant={limits?.priority_support ? 'default' : 'secondary'} className="text-xs">
                {limits?.priority_support ? 'Available' : 'Standard'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Access:</span>
              <Badge variant={limits?.api_access ? 'default' : 'secondary'} className="text-xs">
                {limits?.api_access ? 'Available' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Users:</span>
              <Badge variant="outline" className="text-xs">
                {limits?.users === -1 ? 'Unlimited' : limits?.users || 0}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <span>Usage limits reset monthly on the 1st of each month</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <span>Unlimited features don't have monthly restrictions</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <span>Usage data updates in real-time when you create records</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <span>Professional plan users have unlimited access to all features</span>
            </div>
            {error && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-red-600">
                  There's an issue with subscription data loading. Some limits may not work correctly.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileUsageDashboard;
