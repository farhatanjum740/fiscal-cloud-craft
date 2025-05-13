
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const ReportsPlaceholder = () => (
  <div className="flex flex-col items-center justify-center p-10 bg-gray-50 border rounded-lg h-64">
    <h3 className="text-xl font-medium text-gray-700 mb-2">Reports Coming Soon</h3>
    <p className="text-gray-500 text-center max-w-md">
      We're working on comprehensive reporting tools for your business. 
      This section will be available in a future update.
    </p>
  </div>
);

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  
  // Sample data - to be replaced with actual data from the database
  const salesData = [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 19000 },
    { month: 'Mar', sales: 15000 },
    { month: 'Apr', sales: 25000 },
    { month: 'May', sales: 22000 },
    { month: 'Jun', sales: 30000 },
  ];
  
  const pieData = [
    { name: 'Product A', value: 35 },
    { name: 'Product B', value: 25 },
    { name: 'Product C', value: 20 },
    { name: 'Product D', value: 15 },
    { name: 'Others', value: 5 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      </div>
      
      <Tabs 
        defaultValue="sales" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="customers">Customer Reports</TabsTrigger>
          <TabsTrigger value="products">Product Analysis</TabsTrigger>
          <TabsTrigger value="taxes">Tax Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Overview</CardTitle>
              <CardDescription>
                Sales performance over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Product Category</CardTitle>
                <CardDescription>Distribution of sales across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                <CardDescription>Status of pending invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsPlaceholder />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reports</CardTitle>
              <CardDescription>Customer activity and spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsPlaceholder />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Analysis</CardTitle>
              <CardDescription>Performance metrics for products</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsPlaceholder />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>GST and tax liability summary</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsPlaceholder />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
