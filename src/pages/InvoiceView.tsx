
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Download } from "lucide-react";
import { useInvoice } from "@/hooks/useInvoice";
import InvoiceViewComponent from "@/components/invoices/InvoiceView";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    invoice, 
    loading, 
    loadingData, 
    company,
    customers,
  } = useInvoice(id || '');

  // Auto download if query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldDownload = params.get('download') === 'true';
    
    if (shouldDownload && !loadingData && document.querySelector('button[title="Download Invoice"]')) {
      // Click the download button once data is loaded
      const downloadBtn = document.querySelector('button[title="Download Invoice"]') as HTMLButtonElement;
      if (downloadBtn) downloadBtn.click();
      
      // Clean up the URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, loadingData, navigate, location.pathname]);

  // Find the customer for this invoice
  const customer = customers.find(cust => cust.id === invoice.customerId);
  
  const handleDeleteInvoice = async () => {
    if (!id) return;
    
    try {
      // Check if there are credit notes associated with this invoice
      const { data: relatedCreditNotes } = await supabase
        .from('credit_notes')
        .select('id')
        .eq('invoice_id', id);
        
      if (relatedCreditNotes && relatedCreditNotes.length > 0) {
        toast({
          title: "Cannot Delete Invoice",
          description: "This invoice has credit notes attached. Delete the credit notes first.",
          variant: "destructive",
        });
        return;
      }
      
      // First delete related invoice items
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
      
      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted."
      });
      
      navigate("/app/invoices");
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete invoice: ${error.message}`,
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
          <h1 className="text-3xl font-bold">Invoice Details</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/app/invoices/edit/${id}`)}>
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
                  This action cannot be undone. This will permanently delete the invoice
                  and all related data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteInvoice}>
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
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      ) : (
        <InvoiceViewComponent 
          invoice={invoice} 
          company={company} 
          customer={customer}
        />
      )}
    </div>
  );
};

export default InvoiceView;
