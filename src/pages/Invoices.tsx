
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  FileText,
  Plus,
  Search,
  Download,
  Edit,
  Eye,
  Trash2,
  FileBox
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Invoices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [financialYearFilter, setFinancialYearFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");
  
  // Get list of financial years from database
  const { data: financialYears, isLoading: isLoadingFinancialYears } = useQuery({
    queryKey: ['financialYears'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('financial_year')
        .eq('user_id', user.id)
        .order('financial_year', { ascending: false });
        
      if (error) throw error;
      
      // Get unique financial years
      const uniqueFinancialYears = [...new Set((data || []).map(item => item.financial_year))];
      return uniqueFinancialYears;
    },
    enabled: !!user,
  });
  
  // Fetch invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', financialYearFilter],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          customers(name)
        `)
        .eq('user_id', user.id);
        
      // Apply financial year filter if not "all"
      if (financialYearFilter !== "all") {
        query = query.eq('financial_year', financialYearFilter);
      }
        
      query = query.order('invoice_date', { ascending: false });
        
      const { data, error } = await query;
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  
  // Fetch credit notes
  const { data: creditNotes, isLoading: isLoadingCreditNotes } = useQuery({
    queryKey: ['creditNotes', financialYearFilter],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('credit_notes')
        .select(`
          *,
          invoices(invoice_number)
        `)
        .eq('user_id', user.id);
        
      // Apply financial year filter if not "all"
      if (financialYearFilter !== "all") {
        query = query.eq('financial_year', financialYearFilter);
      }
        
      query = query.order('credit_note_date', { ascending: false });
        
      const { data, error } = await query;
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && activeTab === "credit-notes",
  });
  
  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // First delete invoice items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);
        
      if (itemsError) throw itemsError;
      
      // Then delete the invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice Deleted",
        description: "The invoice has been deleted successfully.",
      });
      setIsDeleting(false);
    },
    onError: (error) => {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete the invoice.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });
  
  // Delete credit note mutation
  const deleteCreditNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // First delete credit note items
      const { error: itemsError } = await supabase
        .from('credit_note_items')
        .delete()
        .eq('credit_note_id', id);
        
      if (itemsError) throw itemsError;
      
      // Then delete the credit note
      const { error } = await supabase
        .from('credit_notes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      toast({
        title: "Credit Note Deleted",
        description: "The credit note has been deleted successfully.",
      });
      setIsDeleting(false);
    },
    onError: (error) => {
      console.error('Error deleting credit note:', error);
      toast({
        title: "Error",
        description: "Failed to delete the credit note.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });
  
  // Handle invoice deletion
  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice? This will also delete all items in this invoice.")) {
      setIsDeleting(true);
      deleteInvoiceMutation.mutate(id);
    }
  };
  
  // Handle credit note deletion
  const handleDeleteCreditNote = (id: string) => {
    if (window.confirm("Are you sure you want to delete this credit note? This will also delete all items in this credit note.")) {
      setIsDeleting(true);
      deleteCreditNoteMutation.mutate(id);
    }
  };
  
  // Filter invoices based on search and status filter
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customers?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Filter credit notes based on search and status filter
  const filteredCreditNotes = creditNotes?.filter(creditNote => {
    const matchesSearch = 
      creditNote.credit_note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creditNote.invoices?.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || creditNote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  if (!user) {
    return <div className="flex justify-center items-center h-64">Please log in to view invoices</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices & Credit Notes</h1>
        <div className="flex gap-2">
          {activeTab === "invoices" ? (
            <Link to="/app/invoices/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Invoice
              </Button>
            </Link>
          ) : (
            <Link to="/app/credit-notes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Credit Note
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {activeTab === "invoices" ? (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Manage Invoices & Credit Notes
              </>
            ) : (
              <>
                <FileBox className="h-5 w-5 mr-2" />
                Manage Credit Notes
              </>
            )}
          </CardTitle>
          <CardDescription>
            Create, view and manage your invoices and credit notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="credit-notes">Credit Notes</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={activeTab === "invoices" ? "Search invoices..." : "Search credit notes..."}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  {activeTab === "credit-notes" && (
                    <SelectItem value="issued">Issued</SelectItem>
                  )}
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={financialYearFilter} onValueChange={setFinancialYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All financial years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All financial years</SelectItem>
                  {financialYears?.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {activeTab === "invoices" ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Financial Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.customers?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                        <TableCell>{invoice.financial_year}</TableCell>
                        <TableCell>₹{invoice.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Link to={`/app/invoices/view/${invoice.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/app/invoices/edit/${invoice.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/app/credit-notes/new?invoiceId=${invoice.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Create Credit Note">
                              <FileBox className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit Note Number</TableHead>
                    <TableHead>Against Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Financial Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCreditNotes ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCreditNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
                        No credit notes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCreditNotes.map((creditNote) => (
                      <TableRow key={creditNote.id}>
                        <TableCell>{creditNote.credit_note_number}</TableCell>
                        <TableCell>{creditNote.invoices?.invoice_number || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(creditNote.credit_note_date)}</TableCell>
                        <TableCell>{creditNote.financial_year}</TableCell>
                        <TableCell>₹{creditNote.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <StatusBadge status={creditNote.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Link to={`/app/credit-notes/view/${creditNote.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {creditNote.status === 'draft' && (
                            <Link to={`/app/credit-notes/edit/${creditNote.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                          {creditNote.status === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteCreditNote(creditNote.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component to display status badge
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'paid':
      case 'issued':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default Invoices;
