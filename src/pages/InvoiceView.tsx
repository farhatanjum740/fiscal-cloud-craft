
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Download, Copy, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import InvoiceCancelDialog from "@/components/invoices/InvoiceCancelDialog";
import CancelledIndicator from "@/components/ui/CancelledIndicator";
import { Badge } from "@/components/ui/badge";
import { useCompanyWithFallback } from "@/hooks/useCompanyWithFallback";
import { TemplateRenderer } from "@/components/invoices/templates/TemplateRenderer";
import { InvoiceTemplate } from "@/types/invoice-templates";

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const [invoice, setInvoice] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id || !user) return;

      try {
        console.log("Fetching invoice with ID:", id);
        
        // Fetch invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (invoiceError) throw invoiceError;

        console.log("Fetched invoice data:", invoiceData);
        console.log("Invoice template from database:", invoiceData.template);
        
        setInvoice(invoiceData);

        // Fetch customer
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", invoiceData.customer_id)
          .single();

        if (customerError) throw customerError;
        setCustomer(customerData);

        // Fetch invoice items
        const { data: itemsData, error: itemsError } = await supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", id);

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      } catch (error: any) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, user]);

  // Auto download if query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldDownload = params.get('download') === 'true';
    
    if (shouldDownload && !loading && document.querySelector('button[title="Download Invoice"]')) {
      const downloadBtn = document.querySelector('button[title="Download Invoice"]') as HTMLButtonElement;
      if (downloadBtn) downloadBtn.click();
      
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, loading, navigate, location.pathname]);

  const handleCreateCreditNote = () => {
    navigate(`/app/credit-notes/new?invoiceId=${id}`);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app/invoices")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Invoice Details</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app/invoices")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Invoice Details</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Invoice not found</p>
        </div>
      </div>
    );
  }

  // Create invoice object with items for the template renderer
  const invoiceWithItems = {
    ...invoice,
    items: items
  };

  // Get the template from the invoice - ensure it's a valid template, with proper fallback
  const validTemplates: InvoiceTemplate[] = ['standard', 'tally', 'busy', 'zoho', 'classic'];
  const template = validTemplates.includes(invoice.template as InvoiceTemplate) 
    ? (invoice.template as InvoiceTemplate) 
    : 'standard';

  console.log("Final template being used:", template);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Invoice Details</h1>
          <Badge variant={getStatusVariant(invoice.status)}>
            {getStatusLabel(invoice.status)}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {invoice.status !== "cancelled" && (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/app/invoices/edit/${id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCreateCreditNote}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Credit Note
              </Button>
            </>
          )}
          
          <InvoiceCancelDialog 
            id={id} 
            status={invoice.status}
            navigate={navigate} 
          />
        </div>
      </div>

      <CancelledIndicator 
        status={invoice.status}
        reason={invoice.cancellation_reason}
        cancelledAt={invoice.cancelled_at}
      />

      <TemplateRenderer 
        template={template}
        invoice={invoiceWithItems}
        customer={customer}
        company={company}
      />
    </div>
  );
};

export default InvoiceView;
