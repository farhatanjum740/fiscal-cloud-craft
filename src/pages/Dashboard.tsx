import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  FileText, Users, Package, TrendingUp, ChartBar,
  Calendar, ChevronDown, Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
  startOfWeek,
  endOfWeek,
  eachMonthOfInterval
} from "date-fns";

// Define financial year utility functions
const startOfFinancialYear = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Financial year starts on April 1st in India
  return new Date(month < 3 ? year - 1 : year, 3, 1);
};

const endOfFinancialYear = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Financial year ends on March 31st in India
  return new Date(month < 3 ? year : year + 1, 2, 31, 23, 59, 59, 999);
};

// Define the type for revenue data
interface RevenueDataType {
  invoices: { invoice_date: string; total_amount: number; status: string }[];
  creditNotes: { credit_note_date: string; total_amount: number }[];
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [timeRange, setTimeRange] = useState("thisYear");
  const [chartData, setChartData] = useState<{month: string, revenue: number}[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  });
  
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingInvoices: 0
  });

  // Update date range based on selected time range
  useEffect(() => {
    const today = new Date();
    let from, to;

    switch (timeRange) {
      case "7days":
        from = subDays(today, 7);
        to = today;
        break;
      case "30days":
        from = subDays(today, 30);
        to = today;
        break;
      case "thisWeek":
        from = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        to = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
        break;
      case "thisMonth":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case "lastMonth":
        from = startOfMonth(subMonths(today, 1));
        to = endOfMonth(subMonths(today, 1));
        break;
      case "thisYear":
        from = startOfYear(today);
        to = endOfYear(today);
        break;
      case "lastYear":
        from = startOfYear(subYears(today, 1));
        to = endOfYear(subYears(today, 1));
        break;
      case "thisFinancialYear":
        from = startOfFinancialYear(today);
        to = endOfFinancialYear(today);
        break;
      case "lastFinancialYear":
        const lastYear = subYears(today, 1);
        from = startOfFinancialYear(lastYear);
        to = endOfFinancialYear(lastYear);
        break;
      default:
        from = startOfYear(today);
        to = endOfYear(today);
    }

    setDateRange({ from, to });
  }, [timeRange]);

  // Fetch dashboard stats with error handling
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('Fetching dashboard stats for user:', user.id);
      
      try {
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
        
        console.log('Dashboard data fetched successfully');
        
        return {
          totalInvoices: invoicesResult.data?.length || 0,
          totalCustomers: customersResult.data?.length || 0,
          totalProducts: productsResult.data?.length || 0,
          totalRevenue: revenueResult.data?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0,
          pendingInvoices: pendingInvoicesResult.data?.length || 0
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 3,
    retryDelay: 1000
  });

  // Recent invoices query with error handling
  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['recent-invoices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching recent invoices for user:', user.id);
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(name)
        `)
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching recent invoices:', error);
        throw error;
      }
      
      console.log('Recent invoices fetched successfully');
      return data || [];
    },
    enabled: !!user,
    retry: 3
  });

  // Fetch revenue data for chart based on date range
  const { data: revenueData, isLoading: loadingRevenueData } = useQuery<RevenueDataType>({
    queryKey: ['revenue-chart', dateRange],
    queryFn: async () => {
      if (!user || !dateRange.from || !dateRange.to) return { invoices: [], creditNotes: [] };
      
      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('invoice_date, total_amount, status')
        .eq('user_id', user.id)
        .gte('invoice_date', formattedFrom)
        .lte('invoice_date', formattedTo)
        .eq('status', 'paid');
        
      if (invoicesError) throw invoicesError;
      
      // Fetch credit notes
      const { data: creditNotes, error: creditNotesError } = await supabase
        .from('credit_notes')
        .select('credit_note_date, total_amount')
        .eq('user_id', user.id)
        .gte('credit_note_date', formattedFrom)
        .lte('credit_note_date', formattedTo);
        
      if (creditNotesError) throw creditNotesError;
      
      return {
        invoices: invoices || [],
        creditNotes: creditNotes || []
      };
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to
  });

  // Process revenue data to create chart data
  useEffect(() => {
    if (!revenueData) return;
    
    // Ensure we're working with the object structure, not an array
    if (!('invoices' in revenueData) || !('creditNotes' in revenueData)) return;
    
    const { invoices, creditNotes } = revenueData;
    
    // Get all months in the selected range
    const months = eachMonthOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });
    
    // Initialize monthly data
    const monthlyData = months.map(date => ({
      month: format(date, 'MMM yyyy'),
      revenue: 0
    }));
    
    // Add invoice amounts
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.invoice_date);
      const monthKey = format(invoiceDate, 'MMM yyyy');
      const existingMonth = monthlyData.find(m => m.month === monthKey);
      
      if (existingMonth) {
        existingMonth.revenue += (invoice.total_amount || 0);
      }
    });
    
    // Subtract credit note amounts
    creditNotes.forEach(creditNote => {
      const creditNoteDate = new Date(creditNote.credit_note_date);
      const monthKey = format(creditNoteDate, 'MMM yyyy');
      const existingMonth = monthlyData.find(m => m.month === monthKey);
      
      if (existingMonth) {
        existingMonth.revenue -= (creditNote.total_amount || 0);
      }
    });
    
    setChartData(monthlyData);
  }, [revenueData, dateRange]);

  // Update stats when dashboardData changes
  useEffect(() => {
    if (dashboardData) {
      setStats(dashboardData);
    }
  }, [dashboardData]);

  // Get the appropriate display name for the welcome message
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there';
  
  // Find the highest value in chart data to normalize chart heights
  const maxChartValue = Math.max(...chartData.map(item => item.revenue), 1);

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Loading Dashboard...</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (dashboardError) {
    console.error('Dashboard error:', dashboardError);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>There was an error loading your dashboard data.</p>
              <p className="text-sm text-gray-500 mt-2">Please try refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {invoicesLoading ? (
                <div className="py-8 text-center">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading invoices...</p>
                </div>
              ) : !recentInvoices || recentInvoices.length === 0 ? (
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center">
                <ChartBar className="h-5 w-5 mr-2 text-primary" />
                Revenue Overview
              </CardTitle>
              <CardDescription>Monthly revenue (simplified view)</CardDescription>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="thisMonth">This month</SelectItem>
                <SelectItem value="lastMonth">Last month</SelectItem>
                <SelectItem value="thisYear">This year</SelectItem>
                <SelectItem value="lastYear">Last year</SelectItem>
                <SelectItem value="thisFinancialYear">This financial year</SelectItem>
                <SelectItem value="lastFinancialYear">Last financial year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-gray-500">
              Revenue chart temporarily disabled for performance optimization.
            </div>
            <div className="mt-4">
              <Link to="/app/reports">
                <Button variant="outline" className="w-full">
                  <ChartBar className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </Link>
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

export default Dashboard;
