
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Reports Coming Soon</CardTitle>
          <CardDescription>
            This section is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Report functionality will be available in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
