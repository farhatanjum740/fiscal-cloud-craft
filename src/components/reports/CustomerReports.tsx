
import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import DateRangeFilter from "./DateRangeFilter";
import ExportButtons from "./ExportButtons";
import { useReportContext } from "@/contexts/ReportContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CustomerReports = () => {
  const { user } = useAuth();
  const { dateRange, refreshTrigger } = useReportContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Outstanding Payments (Aging Report)
  const { data: outstandingPaymentsData, isLoading: loadingOutstandingPayments } = useQuery({
    queryKey: ['outstanding-payments', dateRange, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const today = new Date();
      
      // Fetch all unpaid invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          invoice_date,
          due_date,
          total_amount,
          status,
          customers(id, name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: false });
      
      if (invoicesError) throw invoicesError;
      
      // Add aging information
      const outstandingInvoices = invoicesData?.map(invoice => {
        const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
        const daysOverdue = dueDate ? differenceInDays(today, dueDate) : 0;
        
        let agingBucket = '';
        if (daysOverdue <= 0) agingBucket = 'Not yet due';
        else if (daysOverdue <= 30) agingBucket = '0-30 days';
        else if (daysOverdue <= 60) agingBucket = '31-60 days';
        else agingBucket = '60+ days';
        
        return {
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          invoiceDate: invoice.invoice_date,
          dueDate: invoice.due_date,
          amount: Number(invoice.total_amount) || 0,
          status: invoice.status,
          customerId: invoice.customers?.id,
          customerName: invoice.customers?.name || 'Unknown Customer',
          daysOverdue: Math.max(0, daysOverdue),
          agingBucket
        };
      }) || [];
      
      return outstandingInvoices;
    },
    enabled: !!user
  });

  // Calculate totals for each aging bucket
  const agingTotals = outstandingPaymentsData?.reduce((acc, invoice) => {
    if (!acc[invoice.agingBucket]) {
      acc[invoice.agingBucket] = 0;
    }
    acc[invoice.agingBucket] += invoice.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  // Filter outstanding payments based on search term
  const filteredOutstandingPayments = outstandingPaymentsData?.filter(item =>
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Customer Ledger
  const { data: allCustomers } = useQuery({
    queryKey: ['customer-list', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const { data: customerLedgerData, isLoading: loadingCustomerLedger } = useQuery({
    queryKey: ['customer-ledger', selectedCustomerId, dateRange, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user || !selectedCustomerId) return [];

      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch all transactions for the selected customer
      const [invoicesResult, creditNotesResult] = await Promise.all([
        supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            invoice_date,
            due_date,
            total_amount,
            status
          `)
          .eq('user_id', user.id)
          .eq('customer_id', selectedCustomerId)
          .gte('invoice_date', formattedFrom)
          .lte('invoice_date', formattedTo),
          
        supabase
          .from('credit_notes')
          .select(`
            id, 
            credit_note_number, 
            credit_note_date, 
            total_amount, 
            invoice_id,
            reason,
            status
          `)
          .eq('user_id', user.id)
          .eq('invoice_id', await getCustomerInvoiceIds(selectedCustomerId))
          .gte('credit_note_date', formattedFrom)
          .lte('credit_note_date', formattedTo)
      ]);
      
      const invoices = invoicesResult.data || [];
      const creditNotes = creditNotesResult.data || [];
      
      if (invoicesResult.error) throw invoicesResult.error;
      if (creditNotesResult.error) throw creditNotesResult.error;
      
      // Combine invoices and credit notes into a single ledger
      const ledgerEntries = [
        ...invoices.map((invoice) => ({
          date: invoice.invoice_date,
          type: 'Invoice',
          documentNumber: invoice.invoice_number,
          amount: Number(invoice.total_amount),
          status: invoice.status,
          id: invoice.id,
          dueDate: invoice.due_date,
          reason: null
        })),
        ...creditNotes.map((note) => ({
          date: note.credit_note_date,
          type: 'Credit Note',
          documentNumber: note.credit_note_number,
          amount: -Number(note.total_amount), // Negative amount for credit notes
          status: note.status,
          id: note.id,
          dueDate: null,
          reason: note.reason
        }))
      ];
      
      // Sort by date
      ledgerEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate running balance
      let runningBalance = 0;
      const ledgerWithBalance = ledgerEntries.map(entry => {
        runningBalance += entry.amount;
        return {
          ...entry,
          runningBalance
        };
      });
      
      return ledgerWithBalance;
    },
    enabled: !!user && !!selectedCustomerId
  });

  // Helper function to get all invoice IDs for a customer
  async function getCustomerInvoiceIds(customerId: string): Promise<string[]> {
    if (!user) return [];
    
    const { data } = await supabase
      .from('invoices')
      .select('id')
      .eq('user_id', user.id)
      .eq('customer_id', customerId);
      
    return (data || []).map(i => i.id);
  }

  // Define columns for export
  const outstandingPaymentsColumns = [
    { header: 'Customer', accessorKey: 'customerName' },
    { header: 'Invoice Number', accessorKey: 'invoiceNumber' },
    { header: 'Invoice Date', accessorKey: 'invoiceDate' },
    { header: 'Due Date', accessorKey: 'dueDate' },
    { header: 'Amount', accessorKey: 'amount' },
    { header: 'Days Overdue', accessorKey: 'daysOverdue' },
    { header: 'Aging Bucket', accessorKey: 'agingBucket' }
  ];

  const customerLedgerColumns = [
    { header: 'Date', accessorKey: 'date' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Document Number', accessorKey: 'documentNumber' },
    { header: 'Amount', accessorKey: 'amount' },
    { header: 'Running Balance', accessorKey: 'runningBalance' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Reason', accessorKey: 'reason' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  return (
    <div>
      <DateRangeFilter />
      
      <Tabs defaultValue="outstanding">
        <TabsList>
          <TabsTrigger value="outstanding">Outstanding Payments</TabsTrigger>
          <TabsTrigger value="ledger">Customer Ledger</TabsTrigger>
        </TabsList>
        
        <TabsContent value="outstanding" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Outstanding Payments (Aging Report)</CardTitle>
                <CardDescription>
                  Unpaid invoices grouped by aging period
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers or invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <ExportButtons
                  data={filteredOutstandingPayments}
                  columns={outstandingPaymentsColumns}
                  fileName="Outstanding_Payments_Report"
                  tableRef={tableRef}
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Aging buckets summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(agingTotals).map(([bucket, total]) => (
                  <Card key={bucket} className={
                    bucket === '60+ days' ? 'border-red-500' : 
                    bucket === '31-60 days' ? 'border-amber-500' : 
                    bucket === '0-30 days' ? 'border-yellow-500' : 'border-green-500'
                  }>
                    <CardContent className="p-4 flex flex-col">
                      <p className="text-sm text-muted-foreground">{bucket}</p>
                      <p className="text-xl font-bold mt-1">{formatCurrency(total)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {loadingOutstandingPayments ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredOutstandingPayments && filteredOutstandingPayments.length > 0 ? (
                <Table ref={tableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Invoice Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Days Overdue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOutstandingPayments.map((invoice, idx) => (
                      <TableRow key={idx} className={
                        invoice.daysOverdue > 60 ? 'bg-red-50' : 
                        invoice.daysOverdue > 30 ? 'bg-amber-50' : 
                        invoice.daysOverdue > 0 ? 'bg-yellow-50' : ''
                      }>
                        <TableCell>
                          <a 
                            href={`/app/customers?highlight=${invoice.customerId}`} 
                            className="hover:underline text-primary"
                          >
                            {invoice.customerName}
                          </a>
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`/app/invoices/view/${invoice.id}`} 
                            className="hover:underline"
                          >
                            {invoice.invoiceNumber}
                          </a>
                        </TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell className="text-right">
                          {invoice.daysOverdue === 0 ? 'Not overdue' : `${invoice.daysOverdue} days`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={invoice.agingBucket === 'Not yet due' ? 'outline' : 'default'}>
                            {invoice.agingBucket}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No outstanding payments found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ledger" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Customer Ledger</CardTitle>
                <CardDescription>
                  Full transaction history for the selected customer
                </CardDescription>
              </div>
              {selectedCustomerId && (
                <ExportButtons
                  data={customerLedgerData || []}
                  columns={customerLedgerColumns}
                  fileName={`Customer_Ledger_${selectedCustomerId}`}
                  tableRef={tableRef}
                />
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Select
                  value={selectedCustomerId || ''}
                  onValueChange={(value) => setSelectedCustomerId(value)}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCustomers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {!selectedCustomerId ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a customer to view their ledger.
                </div>
              ) : loadingCustomerLedger ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : customerLedgerData && customerLedgerData.length > 0 ? (
                <Table ref={tableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Document Number</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Running Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerLedgerData.map((entry, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>{entry.type}</TableCell>
                        <TableCell>
                          <a
                            href={`/app/${entry.type === 'Invoice' ? 'invoices' : 'credit-notes'}/view/${entry.id}`}
                            className="hover:underline"
                          >
                            {entry.documentNumber}
                          </a>
                        </TableCell>
                        <TableCell className={`text-right ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                          {formatCurrency(entry.amount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(entry.runningBalance)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            entry.status === 'paid' ? 'success' : 
                            entry.status === 'pending' ? 'default' : 
                            entry.status === 'draft' ? 'outline' : 'secondary'
                          }>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.reason || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found for this customer in the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerReports;
