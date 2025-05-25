
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download, Eye, Edit, Ban } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select as CancelSelect,
  SelectContent as CancelSelectContent,
  SelectItem as CancelSelectItem,
  SelectTrigger as CancelSelectTrigger,
  SelectValue as CancelSelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

// Status badge component
const StatusBadge = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "issued":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return <span className={`px-2 py-1 rounded text-xs font-medium ${getVariant()}`}>{status}</span>;
};

const cancellationReasons = [
  { value: "duplicate", label: "Duplicate Document" },
  { value: "error", label: "Document Error" },
  { value: "customer_request", label: "Customer Request" },
  { value: "business_closure", label: "Business Closure" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "other", label: "Other" }
];

const Invoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<{id: string, type: 'invoice' | 'creditNote'} | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  
  // Fetch invoices and credit notes
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select(`
          *,
          customers:customer_id (name)
        `)
        .order("invoice_date", { ascending: false });
      
      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);
      
      // Fetch credit notes
      const { data: creditNotesData, error: creditNotesError } = await supabase
        .from("credit_notes")
        .select(`
          *,
          invoices:invoice_id (invoice_number)
        `)
        .order("credit_note_date", { ascending: false });
      
      if (creditNotesError) throw creditNotesError;
      setCreditNotes(creditNotesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices and credit notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter((invoice) => {
    // Search filter
    const searchMatch =
      searchTerm === "" ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice?.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = statusFilter === "all" || invoice.status === statusFilter;
    
    return searchMatch && statusMatch;
  });
  
  // Filter credit notes based on search and status
  const filteredCreditNotes = creditNotes.filter((creditNote) => {
    // Search filter
    const searchMatch =
      searchTerm === "" ||
      creditNote.credit_note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creditNote?.invoices?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = statusFilter === "all" || creditNote.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Handle cancel confirmation
  const handleCancelConfirm = async () => {
    if (!itemToCancel || !cancellationReason) {
      toast({
        title: "Cancellation Reason Required",
        description: "Please select a reason for cancellation",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCancelling(true);
      
      if (itemToCancel.type === 'invoice') {
        // Check if there are non-cancelled credit notes associated with this invoice
        const { data: relatedCreditNotes } = await supabase
          .from("credit_notes")
          .select("id, status")
          .eq("invoice_id", itemToCancel.id)
          .neq("status", "cancelled");
          
        if (relatedCreditNotes && relatedCreditNotes.length > 0) {
          toast({
            title: "Cannot Cancel Invoice",
            description: "This invoice has active credit notes. Cancel the credit notes first.",
            variant: "destructive",
          });
          setCancelDialogOpen(false);
          return;
        }
        
        // Cancel the invoice
        const { error } = await supabase
          .from("invoices")
          .update({
            status: "cancelled",
            cancellation_reason: cancellationReason,
            cancelled_at: new Date().toISOString(),
            cancelled_by: user?.id
          })
          .eq("id", itemToCancel.id);
          
        if (error) throw error;
          
      } else {
        // Cancel the credit note
        const { error } = await supabase
          .from("credit_notes")
          .update({
            status: "cancelled",
            cancellation_reason: cancellationReason,
            cancelled_at: new Date().toISOString(),
            cancelled_by: user?.id
          })
          .eq("id", itemToCancel.id);
          
        if (error) throw error;
      }
      
      toast({
        title: "Cancelled Successfully",
        description: `${itemToCancel.type === 'invoice' ? 'Invoice' : 'Credit Note'} has been cancelled.`,
      });
      
      // Refresh the data
      fetchData();
      
    } catch (error) {
      console.error("Error cancelling:", error);
      toast({
        title: "Error",
        description: `Failed to cancel ${itemToCancel.type}.`,
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setItemToCancel(null);
      setCancellationReason("");
    }
  };
  
  // Handle cancel dialog open
  const handleCancelClick = (id: string, type: 'invoice' | 'creditNote', status: string) => {
    if (status === 'cancelled') return;
    setItemToCancel({ id, type });
    setCancelDialogOpen(true);
  };
  
  // Handle direct download from list
  const handleDownloadItem = async (id: string, type: 'invoice' | 'creditNote') => {
    try {
      toast({
        title: "Preparing Download",
        description: "We're generating your document...",
      });
      
      // Navigate to the view page, but with a query param to trigger download
      if (type === 'invoice') {
        navigate(`/app/invoices/view/${id}?download=true`);
      } else {
        navigate(`/app/credit-notes/view/${id}?download=true`);
      }
    } catch (error) {
      console.error("Error downloading:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate the document.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices & Credit Notes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/credit-notes/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Credit Note
          </Button>
          <Button onClick={() => navigate("/app/invoices/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="credit-notes">Credit Notes</TabsTrigger>
        </TabsList>
        
        <div className="flex justify-between mb-4 gap-4">
          <Input
            placeholder="Search invoices or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="invoices" className="border rounded-md p-0">
          <Card className="shadow-none border-0">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                Manage your invoices and their status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "No matching invoices found."
                    : "No invoices created yet. Create your first invoice!"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{invoice.customers?.name}</TableCell>
                        <TableCell>₹{invoice.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/app/invoices/view/${invoice.id}`)}
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </Button>
                          {invoice.status !== "cancelled" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => navigate(`/app/invoices/edit/${invoice.id}`)}
                              title="Edit Invoice"
                            >
                              <Edit size={16} />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownloadItem(invoice.id, 'invoice')}
                            title="Download Invoice"
                          >
                            <Download size={16} />
                          </Button>
                          {invoice.status !== "cancelled" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleCancelClick(invoice.id, 'invoice', invoice.status)}
                              title="Cancel Invoice"
                            >
                              <Ban size={16} />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="credit-notes" className="border rounded-md p-0">
          <Card className="shadow-none border-0">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle>All Credit Notes</CardTitle>
              <CardDescription>
                Manage your credit notes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredCreditNotes.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "No matching credit notes found."
                    : "No credit notes created yet."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credit Note #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreditNotes.map((creditNote) => (
                      <TableRow key={creditNote.id}>
                        <TableCell className="font-medium">
                          {creditNote.credit_note_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(creditNote.credit_note_date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{creditNote.invoices?.invoice_number || "N/A"}</TableCell>
                        <TableCell>₹{creditNote.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <StatusBadge status={creditNote.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/app/credit-notes/view/${creditNote.id}`)}
                            title="View Credit Note"
                          >
                            <Eye size={16} />
                          </Button>
                          {creditNote.status !== "cancelled" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => navigate(`/app/credit-notes/edit/${creditNote.id}`)}
                              title="Edit Credit Note"
                            >
                              <Edit size={16} />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownloadItem(creditNote.id, 'creditNote')}
                            title="Download Credit Note"
                          >
                            <Download size={16} />
                          </Button>
                          {creditNote.status !== "cancelled" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleCancelClick(creditNote.id, 'creditNote', creditNote.status)}
                              title="Cancel Credit Note"
                            >
                              <Ban size={16} />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToCancel?.type === 'invoice' ? 'Cancel Invoice?' : 'Cancel Credit Note?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the {itemToCancel?.type === 'invoice' ? 'invoice' : 'credit note'} as cancelled. It will remain in your records for audit purposes but cannot be used for transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Reason for Cancellation *
            </label>
            <CancelSelect value={cancellationReason} onValueChange={setCancellationReason}>
              <CancelSelectTrigger>
                <CancelSelectValue placeholder="Select a reason" />
              </CancelSelectTrigger>
              <CancelSelectContent>
                {cancellationReasons.map((reason) => (
                  <CancelSelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </CancelSelectItem>
                ))}
              </CancelSelectContent>
            </CancelSelect>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelConfirm}
              disabled={isCancelling || !cancellationReason}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCancelling ? "Cancelling..." : `Cancel ${itemToCancel?.type === 'invoice' ? 'Invoice' : 'Credit Note'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Invoices;
