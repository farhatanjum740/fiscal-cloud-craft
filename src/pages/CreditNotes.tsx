
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Calendar, DollarSign, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CreditNotes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCreditNotes();
  }, [user]);

  const fetchCreditNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("credit_notes")
        .select(`
          *,
          invoices!inner(
            invoice_number,
            customers!inner(
              name
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCreditNotes(data || []);
    } catch (error: any) {
      console.error("Error fetching credit notes:", error);
      toast({
        title: "Error",
        description: "Failed to load credit notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "issued":
        return "default";
      case "draft":
        return "secondary";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const filteredCreditNotes = creditNotes.filter((creditNote) =>
    creditNote.creditNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creditNote.invoices?.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creditNote.invoices?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Credit Notes</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Credit Notes</h1>
        <Button onClick={() => navigate("/app/credit-notes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Credit Note
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search credit notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredCreditNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No credit notes found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? "No credit notes match your search criteria." : "You haven't created any credit notes yet."}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate("/app/credit-notes/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Credit Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Credit Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credit Note #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreditNotes.map((creditNote) => (
                  <TableRow key={creditNote.id}>
                    <TableCell className="font-medium">
                      {creditNote.creditNoteNumber || "Draft"}
                    </TableCell>
                    <TableCell>{creditNote.invoices?.customers?.name}</TableCell>
                    <TableCell>{creditNote.invoices?.invoice_number}</TableCell>
                    <TableCell>
                      {creditNote.creditNoteDate
                        ? new Date(creditNote.creditNoteDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>₹{creditNote.total_amount?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(creditNote.status)}>
                        {creditNote.status?.charAt(0).toUpperCase() + creditNote.status?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/app/credit-notes/view/${creditNote.id}`)}
                        >
                          View
                        </Button>
                        {creditNote.status !== "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/app/credit-notes/edit/${creditNote.id}`)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreditNotes;
