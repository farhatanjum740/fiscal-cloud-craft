
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUsageLimits } from "@/hooks/useUsageLimits";

export const useSaveInvoice = (
  user: any,
  invoice: any,
  company: any,
  subtotal: number,
  gstDetails: any,
  total: number,
  isEditing: boolean,
  id: string | undefined,
  loading: boolean,
  setLoading: (value: boolean) => void,
  generateInvoiceNumber: () => Promise<void>,
  setGeneratedInvoiceNumber: (value: string | null) => void
) => {
  const navigate = useNavigate();
  const { checkInvoiceLimit } = useUsageLimits();
  
  const saveInvoice = useCallback(async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User data not available. Please log in.",
        variant: "destructive",
      });
      return;
    }

    if (!invoice.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }

    if (!invoice.invoiceDate) {
      toast({
        title: "Error",
        description: "Please select an invoice date.",
        variant: "destructive",
      });
      return;
    }

    if (!invoice.items || invoice.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check usage limits for new invoices only
      if (!isEditing) {
        const canCreate = await checkInvoiceLimit();
        if (!canCreate) {
          setLoading(false);
          return; // Toast is shown by checkInvoiceLimit
        }
      }

      // Only increment the invoice counter when actually saving
      if (!isEditing) {
        // Get the invoice number components
        const parts = invoice.invoiceNumber.split('/');
        const financialYear = parts[0];
        const counter = parseInt(parts[1], 10);
        
        // Update the counter in the database
        const { error: updateError } = await supabase
          .from('company_settings')
          .upsert({
            company_id: company.id,
            user_id: user.id,
            current_financial_year: financialYear,
            invoice_counter: counter + 1, // Increment for the next invoice
          }, {
            onConflict: 'company_id',
          });
          
        if (updateError) throw updateError;
      }

      // Prepare invoice data for saving - matching the database schema exactly
      const invoiceData = {
        user_id: user.id,
        company_id: company.id,
        customer_id: invoice.customerId,
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate,
        status: invoice.status || "draft",
        subtotal: subtotal, // Changed from subtotal_amount to subtotal
        cgst: gstDetails.cgst,
        sgst: gstDetails.sgst,
        igst: gstDetails.igst,
        total_amount: total,
        notes: invoice.notes,
        terms_and_conditions: invoice.termsAndConditions,
        financial_year: invoice.financialYear
      };

      let invoiceResult;
      if (isEditing) {
        // Update existing invoice
        invoiceResult = await supabase
          .from("invoices")
          .update(invoiceData)
          .eq("id", id)
          .select()
          .single();
      } else {
        // Create new invoice
        invoiceResult = await supabase
          .from("invoices")
          .insert(invoiceData)
          .select()
          .single();
      }

      if (invoiceResult.error) throw invoiceResult.error;

      const invoiceId = invoiceResult.data.id;

      // Save invoice items
      if (isEditing) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", id);

        if (deleteError) throw deleteError;
      }

      // Insert current items
      const itemsToInsert = invoice.items.map((item: any) => ({
        invoice_id: invoiceId,
        product_id: item.productId,
        product_name: item.productName,
        description: item.description,
        hsn_code: item.hsnCode,
        gst_rate: item.gstRate,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: `Invoice ${isEditing ? "updated" : "created"} successfully!`,
      });

      // Clear generated invoice number after successful save to ensure a new one is generated for the next new invoice
      setGeneratedInvoiceNumber(null);
      
      // Add navigation to invoices list after successful save
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: `Failed to save invoice: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    user,
    invoice,
    company,
    subtotal,
    gstDetails,
    total,
    isEditing,
    id,
    loading,
    setLoading,
    setGeneratedInvoiceNumber,
    navigate,
    checkInvoiceLimit, // Add checkInvoiceLimit to dependencies
  ]);

  return { saveInvoice };
};
