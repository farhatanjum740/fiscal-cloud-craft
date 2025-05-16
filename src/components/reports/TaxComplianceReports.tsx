
import React, { useState, useEffect, useRef } from "react";
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

const TaxComplianceReports = () => {
  const { user } = useAuth();
  const { dateRange, refreshTrigger } = useReportContext();
  const [searchTerm, setSearchTerm] = useState("");
  const tableRef = useRef<HTMLTableElement>(null);

  // GST Summary Report data fetching
  const { data: gstSummaryData, isLoading: loadingGstSummary } = useQuery({
    queryKey: ['gst-summary-report', dateRange, refreshTrigger, user?.id],
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
          invoice_number,
          status,
          customers(name, gstin, billing_state),
          invoice_items(
            id,
            product_name,
            quantity,
            price,
            gst_rate
          )
        `)
        .eq('user_id', user.id)
        .gte('invoice_date', formattedFrom)
        .lte('invoice_date', formattedTo)
        .in('status', ['paid', 'pending']);
      
      if (invoicesError) throw invoicesError;
      
      // Process data to group by GST rate
      const gstRates = new Map();
      
      invoicesData?.forEach(invoice => {
        const customerState = invoice.customers?.billing_state || '';
        
        invoice.invoice_items?.forEach((item: any) => {
          const gstRate = item.gst_rate;
          const taxableValue = Number(item.quantity) * Number(item.price);
          const gstAmount = (taxableValue * Number(gstRate)) / 100;
          
          if (!gstRates.has(gstRate)) {
            gstRates.set(gstRate, {
              rate: gstRate,
              taxableValue: 0,
              cgst: 0,
              sgst: 0,
              igst: 0,
              total: 0
            });
          }
          
          const current = gstRates.get(gstRate);
          current.taxableValue += taxableValue;
          
          // Check for inter-state or intra-state GST
          // For inter-state, use IGST; for intra-state, split into CGST and SGST
          const companyState = "Your Company State"; // Ideally fetch from company profile
          
          if (customerState && customerState !== companyState) {
            // Inter-state: Apply IGST
            current.igst += gstAmount;
          } else {
            // Intra-state: Split into CGST and SGST
            current.cgst += gstAmount / 2;
            current.sgst += gstAmount / 2;
          }
          
          current.total += taxableValue + gstAmount;
        });
      });
      
      // Convert Map to array and sort by GST rate
      const result = Array.from(gstRates.values())
        .sort((a, b) => a.rate - b.rate);
      
      // Add totals row
      const totals = result.reduce((acc, curr) => {
        acc.taxableValue += curr.taxableValue;
        acc.cgst += curr.cgst;
        acc.sgst += curr.sgst;
        acc.igst += curr.igst;
        acc.total += curr.total;
        return acc;
      }, { rate: 'Total', taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
      
      result.push(totals);
      
      return result;
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to
  });

  // HSN Summary Report data fetching
  const { data: hsnSummaryData, isLoading: loadingHsnSummary } = useQuery({
    queryKey: ['hsn-summary-report', dateRange, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch all invoice items in date range with HSN data
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_date,
          invoice_number,
          status,
          invoice_items(
            id,
            product_name,
            quantity,
            price,
            hsn_code,
            gst_rate,
            unit
          )
        `)
        .eq('user_id', user.id)
        .gte('invoice_date', formattedFrom)
        .lte('invoice_date', formattedTo)
        .in('status', ['paid', 'pending']);
      
      if (invoicesError) throw invoicesError;
      
      // Process data to group by HSN code
      const hsnCodes = new Map();
      
      invoicesData?.forEach(invoice => {
        invoice.invoice_items?.forEach((item: any) => {
          const hsnCode = item.hsn_code || 'Not specified';
          const taxableValue = Number(item.quantity) * Number(item.price);
          const gstAmount = (taxableValue * Number(item.gst_rate)) / 100;
          
          if (!hsnCodes.has(hsnCode)) {
            hsnCodes.set(hsnCode, {
              hsnCode,
              description: item.product_name, // Using product name as description
              quantity: 0,
              unit: item.unit,
              taxableValue: 0,
              gstAmount: 0,
              total: 0
            });
          }
          
          const current = hsnCodes.get(hsnCode);
          current.quantity += Number(item.quantity);
          current.taxableValue += taxableValue;
          current.gstAmount += gstAmount;
          current.total += taxableValue + gstAmount;
        });
      });
      
      // Convert Map to array and sort alphabetically by HSN code
      const result = Array.from(hsnCodes.values())
        .sort((a, b) => a.hsnCode.localeCompare(b.hsnCode));
      
      // Add totals row
      const totals = result.reduce((acc, curr) => {
        acc.quantity += curr.quantity;
        acc.taxableValue += curr.taxableValue;
        acc.gstAmount += curr.gstAmount;
        acc.total += curr.total;
        return acc;
      }, { hsnCode: 'Total', description: '', quantity: 0, unit: '', taxableValue: 0, gstAmount: 0, total: 0 });
      
      result.push(totals);
      
      return result;
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to
  });

  // Filter HSN data based on search term
  const filteredHsnData = hsnSummaryData?.filter(item =>
    item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Define columns for export
  const gstSummaryColumns = [
    { header: 'GST Rate (%)', accessorKey: 'rate' },
    { header: 'Taxable Value', accessorKey: 'taxableValue' },
    { header: 'CGST', accessorKey: 'cgst' },
    { header: 'SGST', accessorKey: 'sgst' },
    { header: 'IGST', accessorKey: 'igst' },
    { header: 'Total', accessorKey: 'total' }
  ];

  const hsnSummaryColumns = [
    { header: 'HSN Code', accessorKey: 'hsnCode' },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Quantity', accessorKey: 'quantity' },
    { header: 'Unit', accessorKey: 'unit' },
    { header: 'Taxable Value', accessorKey: 'taxableValue' },
    { header: 'GST Amount', accessorKey: 'gstAmount' },
    { header: 'Total', accessorKey: 'total' }
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
      
      <Tabs defaultValue="gst-summary">
        <TabsList>
          <TabsTrigger value="gst-summary">GST Summary</TabsTrigger>
          <TabsTrigger value="hsn-summary">HSN/SAC Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gst-summary" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>GST Summary Report</CardTitle>
                <CardDescription>
                  GST breakdown by rate slabs for the selected period
                </CardDescription>
              </div>
              <ExportButtons
                data={gstSummaryData || []}
                columns={gstSummaryColumns}
                fileName="GST_Summary_Report"
                tableRef={tableRef}
              />
            </CardHeader>
            <CardContent>
              {loadingGstSummary ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : gstSummaryData && gstSummaryData.length > 0 ? (
                <Table ref={tableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GST Rate (%)</TableHead>
                      <TableHead className="text-right">Taxable Value</TableHead>
                      <TableHead className="text-right">CGST</TableHead>
                      <TableHead className="text-right">SGST</TableHead>
                      <TableHead className="text-right">IGST</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gstSummaryData.map((row, idx) => (
                      <TableRow key={idx} className={row.rate === 'Total' ? 'font-medium bg-muted/50' : ''}>
                        <TableCell>{row.rate === 'Total' ? 'Total' : `${row.rate}%`}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.taxableValue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.cgst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.sgst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.igst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hsn-summary" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>HSN/SAC Summary</CardTitle>
                <CardDescription>
                  Sales categorized by HSN/SAC codes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search HSN code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <ExportButtons
                  data={filteredHsnData}
                  columns={hsnSummaryColumns}
                  fileName="HSN_Summary_Report"
                  tableRef={tableRef}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingHsnSummary ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredHsnData && filteredHsnData.length > 0 ? (
                <Table ref={tableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>HSN Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Taxable Value</TableHead>
                      <TableHead className="text-right">GST Amount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHsnData.map((row, idx) => (
                      <TableRow key={idx} className={row.hsnCode === 'Total' ? 'font-medium bg-muted/50' : ''}>
                        <TableCell>{row.hsnCode}</TableCell>
                        <TableCell>{row.hsnCode === 'Total' ? '' : row.description}</TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                        <TableCell>{row.hsnCode === 'Total' ? '' : row.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.taxableValue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.gstAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No HSN data available for the selected period.
                </div>
              )}
              
              {/* Warning for missing HSN codes */}
              {hsnSummaryData?.some(item => item.hsnCode === 'Not specified') && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                  <p className="text-sm">
                    Warning: Some products are missing HSN/SAC codes. Please update your product details to ensure GST compliance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxComplianceReports;
