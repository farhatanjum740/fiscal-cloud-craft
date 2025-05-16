
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define typings for creditNotes data
interface CreditNote {
  id: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  amount: number;
  reason: string;
  status: string;
  invoiceId: string;
  invoiceNumber: string;
}

interface CreditNoteSummaryItem {
  reason: string;
  count: number;
  totalAmount: number;
}

interface CreditNoteData {
  creditNotes: CreditNote[];
  summary: CreditNoteSummaryItem[];
}

const InvoiceReports = () => {
  const { user } = useAuth();
  const { dateRange, refreshTrigger } = useReportContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const tableRef = useRef<HTMLTableElement>(null);

  // Invoice Listing
  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoice-listing', dateRange, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch all invoices in date range
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
        .gte('invoice_date', formattedFrom)
        .lte('invoice_date', formattedTo);
      
      if (invoicesError) throw invoicesError;
      
      // Transform data for display
      return invoicesData?.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        amount: Number(invoice.total_amount) || 0,
        status: invoice.status,
        customerId: invoice.customers?.id,
        customerName: invoice.customers?.name || 'Unknown Customer',
      })) || [];
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to
  });

  // Credit Note Summary
  const { data: creditNotesData, isLoading: loadingCreditNotes } = useQuery<CreditNoteData>({
    queryKey: ['credit-note-summary', dateRange, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return { creditNotes: [], summary: [] };

      const formattedFrom = format(dateRange.from, 'yyyy-MM-dd');
      const formattedTo = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch all credit notes in date range
      const { data: creditNotesData, error: creditNotesError } = await supabase
        .from('credit_notes')
        .select(`
          id,
          credit_note_number,
          credit_note_date,
          total_amount,
          reason,
          status,
          invoice_id,
          invoices(invoice_number)
        `)
        .eq('user_id', user.id)
        .gte('credit_note_date', formattedFrom)
        .lte('credit_note_date', formattedTo);
      
      if (creditNotesError) throw creditNotesError;
      
      // Transform data for display
      const creditNotes = creditNotesData?.map(note => ({
        id: note.id,
        creditNoteNumber: note.credit_note_number,
        creditNoteDate: note.credit_note_date,
        amount: Number(note.total_amount) || 0,
        reason: note.reason || 'Not specified',
        status: note.status,
        invoiceId: note.invoice_id,
        invoiceNumber: note.invoices?.invoice_number || 'Unknown'
      })) || [];
      
      // Group by reason for summary
      const reasonSummary = creditNotes.reduce((acc, note) => {
        const reason = note.reason || 'Not specified';
        if (!acc[reason]) {
          acc[reason] = {
            reason,
            count: 0,
            totalAmount: 0
          };
        }
        acc[reason].count++;
        acc[reason].totalAmount += note.amount;
        return acc;
      }, {} as Record<string, { reason: string; count: number; totalAmount: number }>);
      
      return {
        creditNotes,
        summary: Object.values(reasonSummary)
      };
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to
  });

  // Filter and sort invoices
  const filteredInvoices = invoicesData
    ?.filter(item => {
      // Apply text search filter
      const matchesSearch = 
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const matchesStatus = 
        statusFilter === 'all' || 
        item.status === statusFilter || 
        (statusFilter === 'overdue' && item.status === 'pending' && item.dueDate && new Date(item.dueDate) < new Date());
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      const factor = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'date':
          return factor * (new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());
        case 'number':
          return factor * a.invoiceNumber.localeCompare(b.invoiceNumber);
        case 'customer':
          return factor * a.customerName.localeCompare(b.customerName);
        case 'amount':
          return factor * (a.amount - b.amount);
        default:
          return 0;
      }
    }) || [];

  // Define columns for export
  const invoiceColumns = [
    { header: 'Invoice Number', accessorKey: 'invoiceNumber' },
    { header: 'Date', accessorKey: 'invoiceDate' },
    { header: 'Due Date', accessorKey: 'dueDate' },
    { header: 'Customer', accessorKey: 'customerName' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Amount', accessorKey: 'amount' }
  ];

  const creditNoteColumns = [
    { header: 'Credit Note Number', accessorKey: 'creditNoteNumber' },
    { header: 'Date', accessorKey: 'creditNoteDate' },
    { header: 'Original Invoice', accessorKey: 'invoiceNumber' },
    { header: 'Reason', accessorKey: 'reason' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Amount', accessorKey: 'amount' }
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

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div>
      <DateRangeFilter />
      
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoice Listing</TabsTrigger>
          <TabsTrigger value="creditnotes">Credit Note Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-2 gap-4">
              <div>
                <CardTitle>Invoice Listing</CardTitle>
                <CardDescription>
                  All invoices for the selected period
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <ExportButtons
                  data={filteredInvoices}
                  columns={invoiceColumns}
                  fileName="Invoice_Listing_Report"
                  tableRef={tableRef}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredInvoices.length > 0 ? (
                <Table ref={tableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:text-primary"
                        onClick={() => toggleSort('number')}
                      >
                        Invoice #
                        <SortIndicator field="number" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:text-primary"
                        onClick={() => toggleSort('date')}
                      >
                        Date
                        <SortIndicator field="date" />
                      </TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:text-primary"
                        onClick={() => toggleSort('customer')}
                      >
                        Customer
                        <SortIndicator field="customer" />
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:text-primary text-right"
                        onClick={() => toggleSort('amount')}
                      >
                        Amount
                        <SortIndicator field="amount" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice, idx) => {
                      const isOverdue = invoice.status === 'pending' && 
                                        invoice.dueDate && 
                                        new Date(invoice.dueDate) < new Date();
                      
                      return (
                        <TableRow key={idx} className={isOverdue ? 'bg-red-50' : ''}>
                          <TableCell>
                            <a 
                              href={`/app/invoices/view/${invoice.id}`} 
                              className="hover:underline text-primary"
                            >
                              {invoice.invoiceNumber}
                            </a>
                          </TableCell>
                          <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell>
                            <a 
                              href={`/app/customers?highlight=${invoice.customerId}`} 
                              className="hover:underline"
                            >
                              {invoice.customerName}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              invoice.status === 'paid' ? 'secondary' : 
                              isOverdue ? 'destructive' :
                              invoice.status === 'pending' ? 'default' : 
                              invoice.status === 'draft' ? 'outline' : 
                              'secondary'
                            }>
                              {isOverdue ? 'Overdue' : invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No invoices found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="creditnotes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Credit Note Summary</CardTitle>
                <CardDescription>
                  All credit notes for the selected period
                </CardDescription>
              </div>
              {creditNotesData && (
                <ExportButtons
                  data={creditNotesData.creditNotes || []}
                  columns={creditNoteColumns}
                  fileName="Credit_Note_Report"
                  tableRef={tableRef}
                />
              )}
            </CardHeader>
            <CardContent>
              {loadingCreditNotes ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : creditNotesData && creditNotesData.summary.length > 0 ? (
                <div className="space-y-6">
                  {/* Credit Note Summary by Reason */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Credit Notes by Reason</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Number of Credit Notes</TableHead>
                          <TableHead className="text-right">Total Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {creditNotesData.summary.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.reason}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium">Total</TableCell>
                          <TableCell className="text-right">
                            {creditNotesData.summary.reduce((sum, item) => sum + item.count, 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              creditNotesData.summary.reduce((sum, item) => sum + item.totalAmount, 0)
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Credit Note Detail List */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Credit Note Details</h3>
                    <Table ref={tableRef}>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Credit Note #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Original Invoice</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {creditNotesData.creditNotes.map((note, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <a 
                                href={`/app/credit-notes/view/${note.id}`} 
                                className="hover:underline text-primary"
                              >
                                {note.creditNoteNumber}
                              </a>
                            </TableCell>
                            <TableCell>{formatDate(note.creditNoteDate)}</TableCell>
                            <TableCell>
                              <a 
                                href={`/app/invoices/view/${note.invoiceId}`} 
                                className="hover:underline"
                              >
                                {note.invoiceNumber}
                              </a>
                            </TableCell>
                            <TableCell>{note.reason}</TableCell>
                            <TableCell>
                              <Badge variant={
                                note.status === 'issued' ? 'secondary' : 
                                note.status === 'draft' ? 'outline' : 
                                note.status === 'cancelled' ? 'secondary' : 'default'
                              }>
                                {note.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(note.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No credit notes found for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceReports;
