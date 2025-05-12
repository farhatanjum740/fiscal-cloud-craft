
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCreditNote } from "@/hooks/useCreditNote";
import CreditNoteViewComponent from "@/components/credit-notes/CreditNoteView";

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
  } = useCreditNote(id, undefined);

  // Find the customer from the invoice
  const customer = invoice ? {
    name: invoice.customer_name,
    billing_address_line1: invoice.customer_billing_address_line1,
    billing_address_line2: invoice.customer_billing_address_line2,
    billing_city: invoice.customer_billing_city,
    billing_state: invoice.customer_billing_state,
    billing_pincode: invoice.customer_billing_pincode,
    gstin: invoice.customer_gstin
  } : null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Credit Note Details</h1>
        </div>
        
        <Button variant="outline" onClick={() => navigate(`/app/credit-notes/edit/${id}`)}>
          Edit Credit Note
        </Button>
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
