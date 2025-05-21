
import React from 'react';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import InvoiceReports from '@/components/reports/InvoiceReports';
import SalesReports from '@/components/reports/SalesReports';
import CustomerReports from '@/components/reports/CustomerReports';
import TaxComplianceReports from '@/components/reports/TaxComplianceReports';

const Reports = () => {
  return (
    <SubscriptionGuard requiresPremium>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-gray-500">
            Analyze your business data with comprehensive reports
          </p>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="tax">Tax Compliance</TabsTrigger>
          </TabsList>
          
          <Card className="p-6">
            <TabsContent value="invoices">
              <InvoiceReports />
            </TabsContent>
            
            <TabsContent value="sales">
              <SalesReports />
            </TabsContent>
            
            <TabsContent value="customers">
              <CustomerReports />
            </TabsContent>
            
            <TabsContent value="tax">
              <TaxComplianceReports />
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </SubscriptionGuard>
  );
};

export default Reports;
