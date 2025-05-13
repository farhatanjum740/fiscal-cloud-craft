
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useCreditNote } from "@/hooks/useCreditNote";
import CreditNoteViewComponent from "@/components/credit-notes/CreditNoteView";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const CreditNoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [customerData, setCustomerData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    creditNote,
    loading,
    loadingData,
    company,
    invoice,
    invoiceItems,
  } = useCreditNote(id);

  // Auto download if query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldDownload = params.get('download') === 'true';
    
    if (shouldDownload && !loadingData && document.querySelector('button[title="Download Credit Note"]')) {
      // Click the download button once data is loaded
      const downloadBtn = document.querySelector('button[title="Download Credit Note"]') as HTMLButtonElement;
      if (downloadBtn) downloadBtn.click();
      
      // Clean up the URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, loadingData, navigate, location.pathname]);

  // Fetch customer data when invoice changes
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (invoice?.customer_id) {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', invoice.customer_id)
            .single();
          
          if (error) throw error;
          setCustomerData(data);
        } catch (error) {
          console.error("Error fetching customer data:", error);
        }
      }
    };
    
    fetchCustomerData();
  }, [invoice]);
  
  // Find the customer from the invoice or from fetched data
  const customer = customerData || (invoice ? {
    name: invoice.customer_name || "",
    billing_address_line1: invoice.customer_billing_address_line1 || "",
    billing_address_line2: invoice.customer_billing_address_line2 || "",
    billing_city: invoice.customer_billing_city || "",
    billing_state: invoice.customer_billing_state || "",
    billing_pincode: invoice.customer_billing_pincode || "",
    shipping_address_line1: invoice.customer_shipping_address_line1 || "",
    shipping_address_line2: invoice.customer_shipping_address_line2 || "",
    shipping_city: invoice.customer_shipping_city || "",
    shipping_state: invoice.customer_shipping_state || "",
    shipping_pincode: invoice.customer_shipping_pincode || "",
    gstin: invoice.customer_gstin || "",
    email: invoice.customer_email || "",
    phone: invoice.customer_phone || ""
  } : null);
  
  const handleDeleteCreditNote = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      console.log("Starting to delete credit note with ID:", id);
      
      // First delete the credit note items
      const { error: itemsError } = await supabase
        .from('credit_note_items')
        .delete()
        .eq('credit_note_id', id);
        
      if (itemsError) {
        console.error("Error deleting credit note items:", itemsError);
        throw itemsError;
      }
      
      console.log("Successfully deleted credit note items, now deleting credit note");
      
      // Then delete the credit note
      const { error } = await supabase
        .from('credit_notes')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting credit note:", error);
        throw error;
      }
      
      console.log("Successfully deleted credit note");
      
      toast({
        title: "Credit note deleted",
        description: "The credit note has been successfully deleted."
      });
      
      // Navigate immediately to ensure we leave the page after deleting
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error deleting credit note:", error);
      toast({
        title: "Error",
        description: `Failed to delete credit note: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
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
                <AlertDialogAction 
                  onClick={handleDeleteCreditNote}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
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
