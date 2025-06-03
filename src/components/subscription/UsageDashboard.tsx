
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSubscriptionContext } from './SubscriptionProvider';

const UsageDashboard = () => {
  const { subscription, limits, usage, loading, refetch } = useSubscriptionContext();

  if (loading) {
    return <div>Loading usage data...</div>;
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

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usage Dashboard</h2>
        <div className="flex items-center gap-4">
          <Badge variant={plan === 'freemium' ? 'secondary' : 'default'}>
            {planName} Plan
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <CardDescription>
              {limits?.invoices === -1 ? 'Unlimited' : `${usage?.invoices_count || 0} / ${limits?.invoices || 0}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {limits?.invoices !== -1 && (
              <div className="space-y-2">
                <Progress 
                  value={getUsagePercentage(usage?.invoices_count || 0, limits?.invoices || 0)} 
                  className="h-2"
                />
                <p className={`text-xs ${getUsageColor(getUsagePercentage(usage?.invoices_count || 0, limits?.invoices || 0))}`}>
                  {getUsagePercentage(usage?.invoices_count || 0, limits?.invoices || 0).toFixed(1)}% used
                </p>
              </div>
            )}
            {limits?.invoices === -1 && (
              <p className="text-sm text-green-600 font-medium">Unlimited usage</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <CardDescription>
              {limits?.customers === -1 ? 'Unlimited' : `${usage?.customers_count || 0} / ${limits?.customers || 0}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {limits?.customers !== -1 && (
              <div className="space-y-2">
                <Progress 
                  value={getUsagePercentage(usage?.customers_count || 0, limits?.customers || 0)} 
                  className="h-2"
                />
                <p className={`text-xs ${getUsageColor(getUsagePercentage(usage?.customers_count || 0, limits?.customers || 0))}`}>
                  {getUsagePercentage(usage?.customers_count || 0, limits?.customers || 0).toFixed(1)}% used
                </p>
              </div>
            )}
            {limits?.customers === -1 && (
              <p className="text-sm text-green-600 font-medium">Unlimited usage</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credit Notes</CardTitle>
            <CardDescription>
              {limits?.credit_notes === -1 ? 'Unlimited' : `${usage?.credit_notes_count || 0} / ${limits?.credit_notes || 0}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {limits?.credit_notes !== -1 && (
              <div className="space-y-2">
                <Progress 
                  value={getUsagePercentage(usage?.credit_notes_count || 0, limits?.credit_notes || 0)} 
                  className="h-2"
                />
                <p className={`text-xs ${getUsageColor(getUsagePercentage(usage?.credit_notes_count || 0, limits?.credit_notes || 0))}`}>
                  {getUsagePercentage(usage?.credit_notes_count || 0, limits?.credit_notes || 0).toFixed(1)}% used
                </p>
              </div>
            )}
            {limits?.credit_notes === -1 && (
              <p className="text-sm text-green-600 font-medium">Unlimited usage</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>GST Reports:</strong> {limits?.reports ? 'Available' : 'Not Available'}
            </div>
            <div>
              <strong>Priority Support:</strong> {limits?.priority_support ? 'Available' : 'Standard Support'}
            </div>
            <div>
              <strong>Users:</strong> {limits?.users === -1 ? 'Unlimited' : limits?.users || 0}
            </div>
            <div>
              <strong>Current Period:</strong> {usage?.month_year || 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Usage limits reset monthly on the 1st of each month</p>
            <p>• Unlimited features don't have monthly restrictions</p>
            <p>• Usage data is updated in real-time when you create new records</p>
            <p>• Contact support if you notice any discrepancies in usage tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageDashboard;
