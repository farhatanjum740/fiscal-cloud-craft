
import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useCreditNote } from "@/hooks/credit-notes";
import CreditNoteViewComponent from "@/components/credit-notes/view";
import CreditNoteDeleteDialog from "./CreditNoteDeleteDialog";
import CreditNoteLoading from "./CreditNoteLoading";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreditNoteViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    creditNote,
    loading,
    loadingData,
    company,
    invoice,
    customer
  } = useCreditNote(id);
  
  // Enhanced logging for debugging 
  useEffect(() => {
    console.log("CreditNoteViewPage - Raw data:", {
      creditNote,
      loading,
      loadingData,
      company,
      invoice,
      customer,
      id
    });
    
    if (creditNote) {
      console.log("CreditNoteViewPage - Credit Note Details:", {
        creditNoteNumber: creditNote.creditNoteNumber,
        date: creditNote.creditNoteDate,
        subtotal: creditNote.subtotal,
        cgst: creditNote.cgst,
        sgst: creditNote.sgst,
        igst: creditNote.igst,
        total: creditNote.total_amount
      });
    }
    
    if (invoice) {
      console.log("CreditNoteViewPage - Invoice Details:", {
        invoiceNumber: invoice.invoice_number,
        date: invoice.invoice_date,
        customerId: invoice.customer_id
      });
    }
    
    if (customer) {
      console.log("CreditNoteViewPage - Customer Details:", {
        name: customer.name,
        billingState: customer.billing_state,
        shippingState: customer.shipping_state
      });
    }
  }, [creditNote, loading, loadingData, company, invoice, customer, id]);
  
  // Error handling
  useEffect(() => {
    if (!loadingData && !creditNote && id) {
      toast({
        title: "Error",
        description: "Credit note not found or couldn't be loaded",
        variant: "destructive"
      });
      navigate("/app/invoices", { replace: true });
    }
  }, [creditNote, loadingData, id, navigate]);
  
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
  
  // Fixed the delete functionality by using CreditNoteDeleteDialog instead of inline deletion
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Credit Note Details</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/app/credit-notes/edit/${id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <CreditNoteDeleteDialog id={id} navigate={navigate} />
        </div>
      </div>

      {loadingData ? (
        <CreditNoteLoading />
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

export default CreditNoteViewPage;
