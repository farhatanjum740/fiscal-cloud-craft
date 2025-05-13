import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfYear,
  endOfYear,
  subMonths,
  subYears
} from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

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

const Reports = () => {
  const [activeTab, setActiveTab] = useState("invoices");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [creditNoteData, setCreditNoteData] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [reportType, setReportType] = useState("monthly");

  const form = useForm({
    defaultValues: {
      dateRange: {
        from: subMonths(new Date(), 1),
        to: new Date(),
      },
    },
  });

  const updateDateRange = (preset: string) => {
    const today = new Date();
    let from, to;

    switch (preset) {
      case "today":
        from = new Date();
        to = new Date();
        break;
      case "yesterday":
        from = new Date();
        from.setDate(from.getDate() - 1);
        to = new Date(from);
        break;
      case "7days":
        from = new Date();
        from.setDate(from.getDate() - 7);
        to = new Date();
        break;
      case "30days":
        from = new Date();
        from.setDate(from.getDate() - 30);
        to = new Date();
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
        from = subMonths(today, 1);
        to = today;
    }

    setDateRange({ from, to });
    setReportType(preset);
  };

  const fetchReportData = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Date range required",
        description: "Please select a valid date range for the report",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');

      // Fetch invoices for the date range
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers:customer_id (name)
        `)
        .gte('invoice_date', formattedFrom)
        .lte('invoice_date', formattedTo)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoiceData(invoices || []);

      // Fetch credit notes for the date range
      const { data: creditNotes, error: creditNotesError } = await supabase
        .from('credit_notes')
        .select(`
          *,
          invoices:invoice_id (invoice_number)
        `)
        .gte('credit_note_date', formattedFrom)
        .lte('credit_note_date', formattedTo)
        .order('credit_note_date', { ascending: false });

      if (creditNotesError) throw creditNotesError;
      setCreditNoteData(creditNotes || []);

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) throw customersError;
      setCustomerData(customers || []);

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;
      setProductData(products || []);

    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Convert data to CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      // Add rows
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          // Handle values that need to be quoted
          return typeof val === 'string' 
            ? `"${val.replace(/"/g, '""')}"` 
            : val ?? '';
        });
        csvRows.push(values.join(','));
      }
      
      // Combine into CSV content
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `${filename} has been exported successfully`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export failed",
        description: "Failed to export data to CSV",
        variant: "destructive",
      });
    }
  };

  // Calculate summary statistics
  const invoiceTotal = invoiceData.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const creditNoteTotal = creditNoteData.reduce((sum, cn) => sum + (cn.total_amount || 0), 0);
  const netRevenue = invoiceTotal - creditNoteTotal;
  const paidInvoicesTotal = invoiceData
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const pendingInvoicesTotal = invoiceData
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>Select date range and report type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-2">
              <FormLabel>Date Range</FormLabel>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd MMM yyyy")} -{" "}
                            {format(dateRange.to, "dd MMM yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range as { from: Date; to: Date });
                        if (range?.from && range?.to) {
                          setReportType("custom");
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  type="button"
                  onClick={() => fetchReportData()}
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Quick Filters</FormLabel>
              <Select value={reportType} onValueChange={updateDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{invoiceTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{invoiceData.length} invoices</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credit Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{creditNoteTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{creditNoteData.length} credit notes</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{netRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">After deducting credit notes</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingInvoicesTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">From pending invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="credit-notes">Credit Notes</TabsTrigger>
          <TabsTrigger value="customers">Customer Reports</TabsTrigger>
          <TabsTrigger value="products">Product Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="border rounded-md p-0">
          <Card className="shadow-none border-0">
            <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoice Report</CardTitle>
                <CardDescription>
                  {format(dateRange.from, "dd MMM yyyy")} - {format(dateRange.to, "dd MMM yyyy")}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleExportCSV(invoiceData, 'invoice-report')}
                disabled={invoiceData.length === 0}
                className="ml-auto"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : invoiceData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No invoice data available for the selected period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceData.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{format(new Date(invoice.invoice_date), "dd MMM yyyy")}</TableCell>
                          <TableCell>{invoice.customers?.name || 'N/A'}</TableCell>
                          <TableCell>{invoice.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium 
                              ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                              {invoice.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit-notes" className="border rounded-md p-0">
          <Card className="shadow-none border-0">
            <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Credit Note Report</CardTitle>
                <CardDescription>
                  {format(dateRange.from, "dd MMM yyyy")} - {format(dateRange.to, "dd MMM yyyy")}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleExportCSV(creditNoteData, 'credit-note-report')}
                disabled={creditNoteData.length === 0}
                className="ml-auto"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : creditNoteData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No credit note data available for the selected period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Credit Note #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference Invoice</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditNoteData.map((creditNote) => (
                        <TableRow key={creditNote.id}>
                          <TableCell className="font-medium">{creditNote.credit_note_number}</TableCell>
                          <TableCell>{format(new Date(creditNote.credit_note_date), "dd MMM yyyy")}</TableCell>
                          <TableCell>{creditNote.invoices?.invoice_number || 'N/A'}</TableCell>
                          <TableCell>{creditNote.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium 
                              ${creditNote.status === 'issued' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                              {creditNote.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="border rounded-md p-0">
          <Card className="shadow-none border-0">
            <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Report</CardTitle>
                <CardDescription>Customer transaction summary</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleExportCSV(customerData, 'customer-report')}
                disabled={customerData.length === 0}
                className="ml-auto"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : customerData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No customer data available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>GSTIN</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerData.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.billing_city || 'N/A'}</TableCell>
                          <TableCell>{customer.billing_state || 'N/A'}</TableCell>
                          <TableCell>{customer.gstin || 'N/A'}</TableCell>
                          <TableCell>{customer.category || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="border rounded-md p-0">
          <Card className="shadow-none border-0">
            <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Report</CardTitle>
                <CardDescription>Product details and inventory</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleExportCSV(productData, 'product-report')}
                disabled={productData.length === 0}
                className="ml-auto"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : productData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No product data available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Price (₹)</TableHead>
                        <TableHead>GST Rate</TableHead>
                        <TableHead>HSN Code</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productData.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.description || 'N/A'}</TableCell>
                          <TableCell>{product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.gst_rate}%</TableCell>
                          <TableCell>{product.hsn_code || 'N/A'}</TableCell>
                          <TableCell>{product.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
