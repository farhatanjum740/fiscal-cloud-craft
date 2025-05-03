
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Users, Package, TrendingUp, ChartBar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingInvoices: 0
  });

  // Fetch dashboard stats
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (!user) return null;
      
      const [invoicesResult, customersResult, productsResult, revenueResult] = await Promise.all([
        supabase.from('invoices').select('id').eq('user_id', user.id),
        supabase.from('customers').select('id').eq('user_id', user.id),
        supabase.from('products').select('id').eq('user_id', user.id),
        supabase.from('invoices').select('total_amount').eq('user_id', user.id).eq('status', 'paid')
      ]);
      
      const pendingInvoicesResult = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      return {
        totalInvoices: invoicesResult.data?.length || 0,
        totalCustomers: customersResult.data?.length || 0,
        totalProducts: productsResult.data?.length || 0,
        totalRevenue: revenueResult.data?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0,
        pendingInvoices: pendingInvoicesResult.data?.length || 0
      };
    },
    enabled: !!user
  });

  // Recent invoices query
  const { data: recentInvoices } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(name)
        `)
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Update stats when dashboardData changes
  useEffect(() => {
    if (dashboardData) {
      setStats(dashboardData);
    }
  }, [dashboardData]);

  // Get the appropriate display name for the welcome message
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
        <Link to="/app/invoices/new">
          <Button>Create New Invoice</Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Invoices" 
          value={stats.totalInvoices} 
          link="/app/invoices"
          linkText="View all invoices"
          icon={<FileText className="h-6 w-6 text-primary" />}
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          link="/app/customers"
          linkText="Manage customers"
          icon={<Users className="h-6 w-6 text-primary" />}
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          link="/app/products"
          linkText="View all products"
          icon={<Package className="h-6 w-6 text-primary" />}
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          link="/app/invoices"
          linkText="View details"
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Recent Invoices
            </CardTitle>
            <CardDescription>Your most recent invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!recentInvoices || recentInvoices.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No invoices yet. Create your first invoice.
                </div>
              ) : (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-500">{invoice.customers?.name || 'Unknown Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{invoice.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {invoice.due_date ? `Due ${formatDate(invoice.due_date)}` : 'No due date'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link to="/app/invoices">
                <Button variant="outline" className="w-full">View All Invoices</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartBar className="h-5 w-5 mr-2 text-primary" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue for current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {generateMockChartData().map((value, i) => (
                <div key={i} className="relative h-full flex-1 flex flex-col justify-end">
                  <div 
                    className="bg-primary rounded-t w-full" 
                    style={{ height: `${value}%` }}
                  ></div>
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i].substring(0, 1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button variant="outline" className="w-full">Generate Reports</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  link, 
  linkText 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  link: string;
  linkText: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-500">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-4">{value}</div>
      <Link to={link} className="text-sm text-primary hover:underline">
        {linkText}
      </Link>
    </CardContent>
  </Card>
);

// Helper function to generate mock chart data
const generateMockChartData = () => {
  const currentMonth = new Date().getMonth();
  return Array(12).fill(0).map((_, i) => 
    i <= currentMonth ? Math.floor(Math.random() * 80) + 10 : 0
  );
};

export default Dashboard;
