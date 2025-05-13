
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useCreditNote } from "@/hooks/useCreditNote";
import CreditNoteViewComponent from "@/components/credit-notes/CreditNoteView";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreditNoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    creditNote,
    loading,
    loadingData,
    company,
    invoice,
    invoiceItems,
  } = useCreditNote(id);

  // Find the customer from the invoice
  const customer = invoice ? {
    name: invoice.customer_name || "",
    billing_address_line1: invoice.customer_billing_address_line1 || "",
    billing_address_line2: invoice.customer_billing_address_line2 || "",
    billing_city: invoice.customer_billing_city || "",
    billing_state: invoice.customer_billing_state || "",
    billing_pincode: invoice.customer_billing_pincode || "",
    gstin: invoice.customer_gstin || "",
    email: invoice.customer_email || "",
    phone: invoice.customer_phone || ""
  } : null;
  
  const handleDeleteCreditNote = async () => {
    if (!id) return;
    
    try {
      // First delete the credit note items
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
      
      toast({
        title: "Credit note deleted",
        description: "The credit note has been successfully deleted."
      });
      
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error deleting credit note:", error);
      toast({
        title: "Error",
        description: `Failed to delete credit note: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Credit Note Details</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/app/credit-notes/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the credit note
                  and all related data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCreditNote}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {loadingData ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md bg-gray-50">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading credit note...</p>
        </div>
      ) : (
        <CreditNoteViewComponent 
          creditNote={creditNote} 
          company={company}
          invoice={invoice}
          customer={customer}
        />
      )}
    </div>
  );
};

export default CreditNoteView;
