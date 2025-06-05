
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyWithFallback } from '@/hooks/useCompanyWithFallback';
import UsageDashboard from '@/components/subscription/UsageDashboard';
import TeamManagement from '@/components/team/TeamManagement';
import GSTReportGenerator from '@/components/gst/GSTReportGenerator';
import PricingSection from '@/components/subscription/PricingSection';
import ApiManagement from '@/components/api/ApiManagement';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const { limits } = useSubscriptionContext();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          {limits?.reports && (
            <TabsTrigger value="reports">GST Reports</TabsTrigger>
          )}
          {limits?.api_access && (
            <TabsTrigger value="api">API Access</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="usage">
          <UsageDashboard />
        </TabsContent>

        <TabsContent value="plans">
          <PricingSection />
        </TabsContent>

        <TabsContent value="team">
          {company && <TeamManagement companyId={company.id} />}
        </TabsContent>

        {limits?.reports && (
          <TabsContent value="reports">
            <GSTReportGenerator />
          </TabsContent>
        )}

        {limits?.api_access && (
          <TabsContent value="api">
            <ApiManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SubscriptionManagement;
