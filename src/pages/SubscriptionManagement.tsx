
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { SubscriptionProvider } from '@/components/subscription/SubscriptionProvider';
import UsageDashboard from '@/components/subscription/UsageDashboard';
import TeamManagement from '@/components/team/TeamManagement';
import GSTReportGenerator from '@/components/gst/GSTReportGenerator';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';

const SubscriptionContent = () => {
  const { user } = useAuth();
  const { company } = useCompany(user?.id);
  const { limits } = useSubscriptionContext();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          {limits?.reports && (
            <TabsTrigger value="reports">GST Reports</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="usage">
          <UsageDashboard />
        </TabsContent>

        <TabsContent value="team">
          {company && <TeamManagement companyId={company.id} />}
        </TabsContent>

        {limits?.reports && (
          <TabsContent value="reports">
            <GSTReportGenerator />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

const SubscriptionManagement = () => {
  return (
    <SubscriptionProvider>
      <SubscriptionContent />
    </SubscriptionProvider>
  );
};

export default SubscriptionManagement;
