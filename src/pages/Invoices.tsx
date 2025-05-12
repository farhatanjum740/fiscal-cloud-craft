
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
import { Plus, Download, FileText, Eye, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return <span className={`px-2 py-1 rounded text-xs font-medium ${getVariant()}`}>{status}</span>;
};

const Invoices = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch invoices and credit notes
  useEffect(() => {
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
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/app/invoices/view/${invoice.id}`)}
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/app/invoices/edit/${invoice.id}`)}
                            title="Edit Invoice"
                          >
                            <Edit size={16} />
                          </Button>
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
                        <TableCell>{creditNote.invoices?.invoice_number}</TableCell>
                        <TableCell>₹{creditNote.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <StatusBadge status={creditNote.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/app/credit-notes/view/${creditNote.id}`)}
                            title="View Credit Note"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/app/credit-notes/edit/${creditNote.id}`)}
                            title="Edit Credit Note"
                          >
                            <Edit size={16} />
                          </Button>
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
    </div>
  );
};

export default Invoices;
