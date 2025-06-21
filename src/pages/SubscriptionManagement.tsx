
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyWithFallback } from '@/hooks/useCompanyWithFallback';
import MobileUsageDashboard from '@/components/subscription/MobileUsageDashboard';
import TeamManagement from '@/components/team/TeamManagement';
import GSTReportGenerator from '@/components/gst/GSTReportGenerator';
import PricingSection from '@/components/subscription/PricingSection';
import ApiManagement from '@/components/api/ApiManagement';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';
import { ScrollArea } from '@/components/ui/scroll-area';

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const { limits } = useSubscriptionContext();

  return (
    <div className="container mx-auto p-3 space-y-6 max-w-7xl sm:p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subscription Management</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your subscription, usage limits, and account features
        </p>
      </div>
      
      <Tabs defaultValue="usage" className="space-y-4 w-full">
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-1 gap-1">
            <TabsTrigger value="usage" className="text-xs sm:text-sm px-2 py-2">
              Usage & Limits
            </TabsTrigger>
            <TabsTrigger value="plans" className="text-xs sm:text-sm px-2 py-2">
              Plans & Pricing
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm px-2 py-2">
              Team Management
            </TabsTrigger>
            {limits?.reports && (
              <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 py-2">
                GST Reports
              </TabsTrigger>
            )}
            {limits?.api_access && (
              <TabsTrigger value="api" className="text-xs sm:text-sm px-2 py-2">
                API Access
              </TabsTrigger>
            )}
          </TabsList>
        </ScrollArea>

        <div className="space-y-6">
          <TabsContent value="usage" className="space-y-4 mt-4">
            <MobileUsageDashboard />
          </TabsContent>

          <TabsContent value="plans" className="space-y-4 mt-4">
            <PricingSection />
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            {company ? (
              <TeamManagement companyId={company.id} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Please set up your company profile first.</p>
              </div>
            )}
          </TabsContent>

          {limits?.reports && (
            <TabsContent value="reports" className="space-y-4 mt-4">
              <GSTReportGenerator />
            </TabsContent>
          )}

          {limits?.api_access && (
            <TabsContent value="api" className="space-y-4 mt-4">
              <ApiManagement />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default SubscriptionManagement;
