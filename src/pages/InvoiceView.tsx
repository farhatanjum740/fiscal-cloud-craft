
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useInvoice } from "@/hooks/useInvoice";
import InvoiceViewComponent from "@/components/invoices/InvoiceView";

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    invoice, 
    loading, 
    loadingData, 
    company,
    customers,
  } = useInvoice(id || '');

  // Find the customer for this invoice
  const customer = customers.find(cust => cust.id === invoice.customerId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Invoice Details</h1>
        </div>
        
        <Button variant="outline" onClick={() => navigate(`/app/invoices/edit/${id}`)}>
          Edit Invoice
        </Button>
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
