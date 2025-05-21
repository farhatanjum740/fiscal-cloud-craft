
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxComplianceReports from "@/components/reports/TaxComplianceReports";
import SalesReports from "@/components/reports/SalesReports";
import CustomerReports from "@/components/reports/CustomerReports";
import InvoiceReports from "@/components/reports/InvoiceReports";
import { ReportProvider } from "@/contexts/ReportContext";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <ReportProvider>
            <Tabs defaultValue="tax" className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="tax">Tax Compliance</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="invoices">Invoices & Credit Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tax" className="mt-4">
                <TaxComplianceReports />
              </TabsContent>
              
              <TabsContent value="sales" className="mt-4">
                <SalesReports />
              </TabsContent>
              
              <TabsContent value="customers" className="mt-4">
                <CustomerReports />
              </TabsContent>
              
              <TabsContent value="invoices" className="mt-4">
                <InvoiceReports />
              </TabsContent>
            </Tabs>
          </ReportProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
