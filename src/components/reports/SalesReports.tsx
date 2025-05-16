
import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import DateRangeFilter from "./DateRangeFilter";
import ExportButtons from "./ExportButtons";
import { useReportContext } from "@/contexts/ReportContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SalesReports = () => {
  const { user } = useAuth();
  const { dateRange, refreshTrigger } = useReportContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [trendPeriod, setTrendPeriod] = useState("monthly");
  const tableRef = useRef<HTMLTableElement>(null);

  // Sales by Customer
  const { data: customerSalesData, isLoading: loadingCustomerSales } = useQuery({
    queryKey: ['sales-by-customer', dateRange, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch all invoices in date range grouped by customer
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_date,
          invoice_number,
          subtotal,
          cgst,
          sgst,
          igst,
          total_amount,
          status,
          customers(id, name, gstin)
        `)
        .eq('user_id', user.id)
        .gte('invoice_date', formattedFrom)
        .lte('invoice_date', formattedTo)
        .in('status', ['paid', 'pending']);
      
      if (invoicesError) throw invoicesError;
      
      // Process data to group by customer
      const customerSales = new Map();
      
      invoicesData?.forEach(invoice => {
        const customerId = invoice.customers?.id;
        const customerName = invoice.customers?.name || 'Unknown Customer';
        
        if (!customerId) return;
        
        if (!customerSales.has(customerId)) {
          customerSales.set(customerId, {
            customerId,
            customerName,
            gstin: invoice.customers?.gstin || 'Not specified',
            invoiceCount: 0,
            totalAmount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalGst: 0
          });
        }
        
        const current = customerSales.get(customerId);
        current.invoiceCount += 1;
        current.totalAmount += Number(invoice.total_amount) || 0;
        current.cgst += Number(invoice.cgst) || 0;
        current.sgst += Number(invoice.sgst) || 0;
        current.igst += Number(invoice.igst) || 0;
        current.totalGst += (Number(invoice.cgst) || 0) + (Number(invoice.sgst) || 0) + (Number(invoice.igst) || 0);
      });
      
      // Convert Map to array and sort by total amount descending
      return Array.from(customerSales.values())
        .sort((a, b) => b.totalAmount - a.totalAmount);
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to
  });

  // Sales by Product
  const { data: productSalesData, isLoading: loadingProductSales } = useQuery({
    queryKey: ['sales-by-product', dateRange, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch all invoice items in date range
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_date,
          status,
          invoice_items(
            id,
            product_id,
            product_name,
            quantity,
            price,
            hsn_code,
            gst_rate
          )
        `)
        .eq('user_id', user.id)
        .gte('invoice_date', formattedFrom)
        .lte('invoice_date', formattedTo)
        .in('status', ['paid', 'pending']);
      
      if (invoicesError) throw invoicesError;
      
      // Process data to group by product
      const productSales = new Map();
      
      invoicesData?.forEach(invoice => {
        if (invoice.status !== 'paid' && invoice.status !== 'pending') return;
        
        invoice.invoice_items?.forEach((item: any) => {
          const productId = item.product_id || item.product_name;
          const productName = item.product_name;
          const taxableValue = Number(item.quantity) * Number(item.price);
          const gstAmount = (taxableValue * Number(item.gst_rate)) / 100;
          
          if (!productSales.has(productId)) {
            productSales.set(productId, {
              productId,
              productName,
              hsnCode: item.hsn_code || 'Not specified',
              quantitySold: 0,
              preTaxRevenue: 0,
              postTaxRevenue: 0,
              gstCollected: 0
            });
          }
          
          const current = productSales.get(productId);
          current.quantitySold += Number(item.quantity);
          current.preTaxRevenue += taxableValue;
          current.gstCollected += gstAmount;
          current.postTaxRevenue += taxableValue + gstAmount;
        });
      });
      
      // Convert Map to array and sort by quantity sold descending
      return Array.from(productSales.values())
        .sort((a, b) => b.quantitySold - a.quantitySold);
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to
  });

  // Sales Trends
  const { data: salesTrendsData, isLoading: loadingSalesTrends } = useQuery({
    queryKey: ['sales-trends', dateRange, trendPeriod, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch all invoices in date range
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_date,
          subtotal,
          cgst,
          sgst,
          igst,
          total_amount,
          status
        `)
        .eq('user_id', user.id)
        .gte('invoice_date', formattedFrom)
        .lte('invoice_date', formattedTo)
        .in('status', ['paid', 'pending'])
        .order('invoice_date', { ascending: true });
      
      if (invoicesError) throw invoicesError;
      
      // Group data by period (month, quarter, year)
      const trendsMap = new Map();
      
      invoicesData?.forEach(invoice => {
        const date = new Date(invoice.invoice_date);
        let periodKey;
        
        switch (trendPeriod) {
          case 'monthly':
            periodKey = format(date, 'MMM yyyy');
            break;
          case 'quarterly':
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            periodKey = `Q${quarter} ${date.getFullYear()}`;
            break;
          case 'yearly':
            periodKey = format(date, 'yyyy');
            break;
          default:
            periodKey = format(date, 'MMM yyyy');
        }
        
        if (!trendsMap.has(periodKey)) {
          trendsMap.set(periodKey, {
            period: periodKey,
            sales: 0,
            gst: 0
          });
        }
        
        const current = trendsMap.get(periodKey);
        current.sales += Number(invoice.total_amount) || 0;
        current.gst += (Number(invoice.cgst) || 0) + (Number(invoice.sgst) || 0) + (Number(invoice.igst) || 0);
      });
      
      // Convert Map to array and sort by period
      return Array.from(trendsMap.values())
        .sort((a, b) => a.period.localeCompare(b.period));
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to
  });

  // Filter data based on search terms
  const filteredCustomerData = customerSalesData?.filter(item =>
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredProductData = productSalesData?.filter(item =>
    item.productName.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    item.hsnCode.toLowerCase().includes(productSearchTerm.toLowerCase())
  ) || [];

  // Define columns for export
  const customerSalesColumns = [
    { header: 'Customer Name', accessorKey: 'customerName' },
    { header: 'GSTIN', accessorKey: 'gstin' },
    { header: 'Invoice Count', accessorKey: 'invoiceCount' },
    { header: 'Total Amount', accessorKey: 'totalAmount' },
    { header: 'CGST', accessorKey: 'cgst' },
    { header: 'SGST', accessorKey: 'sgst' },
    { header: 'IGST', accessorKey: 'igst' },
    { header: 'Total GST', accessorKey: 'totalGst' }
  ];

  const productSalesColumns = [
    { header: 'Product Name', accessorKey: 'productName' },
    { header: 'HSN Code', accessorKey: 'hsnCode' },
    { header: 'Quantity Sold', accessorKey: 'quantitySold' },
    { header: 'Pre-Tax Revenue', accessorKey: 'preTaxRevenue' },
    { header: 'GST Collected', accessorKey: 'gstCollected' },
    { header: 'Post-Tax Revenue', accessorKey: 'postTaxRevenue' }
  ];

  const salesTrendsColumns = [
    { header: 'Period', accessorKey: 'period' },
    { header: 'Sales Amount', accessorKey: 'sales' },
    { header: 'GST Amount', accessorKey: 'gst' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div>
      <DateRangeFilter />
      
      <Tabs defaultValue="customer">
        <TabsList>
          <TabsTrigger value="customer">Sales by Customer</TabsTrigger>
          <TabsTrigger value="product">Sales by Product</TabsTrigger>
          <TabsTrigger value="trends">Sales Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customer" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sales by Customer</CardTitle>
                <CardDescription>
                  Sales data aggregated by customer for the selected period
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <ExportButtons
                  data={filteredCustomerData}
                  columns={customerSalesColumns}
                  fileName="Sales_By_Customer_Report"
                  tableRef={tableRef}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingCustomerSales ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredCustomerData && filteredCustomerData.length > 0 ? (
                <Table ref={tableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead className="text-center">Invoices</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">CGST</TableHead>
                      <TableHead className="text-right">SGST</TableHead>
                      <TableHead className="text-right">IGST</TableHead>
                      <TableHead className="text-right">Total GST</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomerData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          <a 
                            href={`/app/customers?highlight=${row.customerId}`} 
                            className="hover:underline text-primary"
                          >
                            {row.customerName}
                          </a>
                        </TableCell>
                        <TableCell>{row.gstin}</TableCell>
                        <TableCell className="text-center">{row.invoiceCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.totalAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.cgst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.sgst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.igst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.totalGst)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No customer sales data available for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="product" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sales by Product</CardTitle>
                <CardDescription>
                  Sales data aggregated by product for the selected period
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <ExportButtons
                  data={filteredProductData}
                  columns={productSalesColumns}
                  fileName="Sales_By_Product_Report"
                  tableRef={tableRef}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingProductSales ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredProductData && filteredProductData.length > 0 ? (
                <Table ref={tableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>HSN Code</TableHead>
                      <TableHead className="text-right">Quantity Sold</TableHead>
                      <TableHead className="text-right">Pre-Tax Revenue</TableHead>
                      <TableHead className="text-right">GST Collected</TableHead>
                      <TableHead className="text-right">Post-Tax Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductData.map((row, idx) => (
                      <TableRow key={idx} className={row.hsnCode === 'Not specified' ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">
                          {row.productName}
                        </TableCell>
                        <TableCell>{row.hsnCode}</TableCell>
                        <TableCell className="text-right">{row.quantitySold}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.preTaxRevenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.gstCollected)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.postTaxRevenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No product sales data available for the selected period.
                </div>
              )}
              
              {/* Warning for missing HSN codes */}
              {productSalesData?.some(item => item.hsnCode === 'Not specified') && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                  <p className="text-sm">
                    Warning: Products highlighted in red are missing HSN/SAC codes. Please update your product details to ensure GST compliance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sales Trends</CardTitle>
                <CardDescription>
                  Sales and GST trends for the selected period
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={trendPeriod} onValueChange={setTrendPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <ExportButtons
                  data={salesTrendsData || []}
                  columns={salesTrendsColumns}
                  fileName="Sales_Trends_Report"
                  tableRef={tableRef}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingSalesTrends ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : salesTrendsData && salesTrendsData.length > 0 ? (
                <div className="flex flex-col gap-6">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesTrendsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis 
                          yAxisId="left" 
                          orientation="left" 
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} 
                        />
                        <Tooltip 
                          formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} 
                          labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesTrendsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis 
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} 
                        />
                        <Tooltip 
                          formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} 
                          labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="sales" name="Total Sales" stroke="#0ea5e9" />
                        <Line type="monotone" dataKey="gst" name="GST Collected" stroke="#10b981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <Table ref={tableRef} className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Sales Amount</TableHead>
                        <TableHead className="text-right">GST Amount</TableHead>
                        <TableHead className="text-right">GST %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesTrendsData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.period}</TableCell>
                          <TableCell className="text-right">{formatCurrency(row.sales)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(row.gst)}</TableCell>
                          <TableCell className="text-right">
                            {row.sales === 0 ? '0%' : `${((row.gst / row.sales) * 100).toFixed(2)}%`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sales trend data available for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesReports;
