import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import CreditNoteCancelDialog from "@/components/credit-notes/CreditNoteCancelDialog";
import CancelledIndicator from "@/components/ui/CancelledIndicator";
import { Badge } from "@/components/ui/badge";
import { useCompanyWithFallback } from "@/hooks/useCompanyWithFallback";
import CreditNoteView from "@/components/credit-notes/view/CreditNoteView";
import CreditNoteLoading from "./CreditNoteLoading";
import { InvoiceTemplate } from "@/types/invoice-templates";
import CreditNoteTemplateRenderer from "@/components/credit-notes/templates/CreditNoteTemplateRenderer";
import { useTemplatesByPlan } from '@/hooks/useTemplatesByPlan';

const CreditNoteViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const [creditNote, setCreditNote] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate>('standard');
  const [loading, setLoading] = useState(true);

  // Fetch company's current default template
  useEffect(() => {
    const fetchCompanyTemplate = async () => {
      if (!company?.id) return;

      try {
        console.log("Fetching company template for credit note:", company.id);
        
        const { data: settings, error } = await supabase
          .from('company_settings')
          .select('default_template')
          .eq('company_id', company.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching company template:', error);
          return;
        }

        if (settings?.default_template) {
          const template = settings.default_template as InvoiceTemplate;
          console.log("Using company default template for credit note:", template);
          setCurrentTemplate(template);
        } else {
          console.log("No company template found, using standard for credit note");
          setCurrentTemplate('standard');
        }
      } catch (error) {
        console.error('Error fetching company template:', error);
      }
    };

    fetchCompanyTemplate();
  }, [company?.id]);

  useEffect(() => {
    const fetchCreditNoteData = async () => {
      if (!id || !user) return;

      try {
        console.log("Fetching credit note with ID:", id);
        
        // Fetch credit note
        const { data: creditNoteData, error: creditNoteError } = await supabase
          .from("credit_notes")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (creditNoteError) throw creditNoteError;

        console.log("Fetched credit note data:", creditNoteData);
        setCreditNote(creditNoteData);

        // Fetch related invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", creditNoteData.invoice_id)
          .single();

        if (invoiceError) throw invoiceError;
        setInvoice(invoiceData);

        // Fetch customer
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", invoiceData.customer_id)
          .single();

        if (customerError) throw customerError;
        setCustomer(customerData);

        // Fetch credit note items
        const { data: itemsData, error: itemsError } = await supabase
          .from("credit_note_items")
          .select("*")
          .eq("credit_note_id", id);

        if (itemsError) throw itemsError;
        
        // Add items to credit note object
        setCreditNote(prev => ({
          ...prev,
          items: itemsData || []
        }));

      } catch (error: any) {
        console.error("Error fetching credit note:", error);
        toast({
          title: "Error",
          description: "Failed to load credit note",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreditNoteData();
  }, [id, user]);

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

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const { getAvailableTemplates } = useTemplatesByPlan();

  if (loading) {
    return <CreditNoteLoading />;
  }

  if (!creditNote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app/credit-notes")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Credit Note Details</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Credit note not found</p>
        </div>
      </div>
    );
  }

  console.log("Rendering credit note with current company template:", currentTemplate);

  // Only use allowed templates per plan, fallback to 'standard' if needed
  const allowedTemplates = getAvailableTemplates();
  const renderTemplate = allowedTemplates.includes(currentTemplate)
    ? currentTemplate
    : 'standard';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/credit-notes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Credit Note Details</h1>
          <Badge variant={getStatusVariant(creditNote.status)}>
            {getStatusLabel(creditNote.status)}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {creditNote.status !== "cancelled" && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/app/credit-notes/edit/${id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          <CreditNoteCancelDialog 
            id={id} 
            status={creditNote.status}
            navigate={navigate} 
          />
        </div>
      </div>

      <CancelledIndicator 
        status={creditNote.status}
        reason={creditNote.cancellation_reason}
        cancelledAt={creditNote.cancelled_at}
      />

      <CreditNoteTemplateRenderer
        template={renderTemplate}
        creditNote={creditNote}
        company={company}
        invoice={invoice}
        customer={customer}
      />
    </div>
  );
};

export default CreditNoteViewPage;
