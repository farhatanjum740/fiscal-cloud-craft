
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { mapFrontendToInvoiceItem } from "@/types/supabase-types";
import { format } from "date-fns";

export const useSaveInvoice = (
  user: any,
  invoice: any,
  company: any,
  subtotal: number,
  gstDetails: { cgst: number; sgst: number; igst: number },
  total: number,
  isEditing: boolean,
  id: string | undefined,
  loading: boolean,
  setLoading: (value: boolean) => void,
  generateInvoiceNumber: () => Promise<void>,
  setGeneratedInvoiceNumber: (value: string | null) => void
) => {
  // Save invoice
  const saveInvoice = useCallback(async (navigate: (path: string) => void) => {
    console.log("saveInvoice called");
    if (!user) {
      console.log("No user found, cannot save invoice");
      toast({
        title: "Error",
        description: "You must be logged in to save an invoice.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.customerId) {
      console.log("No customer ID provided");
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }
    
    if (invoice.items.length === 0) {
      console.log("No invoice items provided");
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    if (!company) {
      console.log("No company data found");
      toast({
        title: "Error",
        description: "Please set up your company profile before creating invoices.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.invoiceNumber) {
      console.log("No invoice number, generating one");
      // Auto-generate invoice number if not set
      await generateInvoiceNumber();
      if (!invoice.invoiceNumber) {
        toast({
          title: "Error",
          description: "Failed to generate invoice number. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!invoice.financialYear) {
      console.log("No financial year provided");
      toast({
        title: "Error",
        description: "Please select a financial year.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Processing invoice save...");
      // Format date for SQL
      const invoiceDateFormatted = format(invoice.invoiceDate, 'yyyy-MM-dd');
      const dueDateFormatted = invoice.dueDate ? format(invoice.dueDate, 'yyyy-MM-dd') : null;
      
      // Prepare invoice data
      const invoiceData = {
        user_id: user.id,
        customer_id: invoice.customerId,
        company_id: company.id,
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoiceDateFormatted,
        due_date: dueDateFormatted,
        subtotal: subtotal,
        cgst: gstDetails.cgst,
        sgst: gstDetails.sgst,
        igst: gstDetails.igst,
        total_amount: total,
        status: invoice.status,
        terms_and_conditions: invoice.termsAndConditions,
        notes: invoice.notes,
        financial_year: invoice.financialYear,
      };
      
      console.log("Prepared invoice data:", invoiceData);
      
      let invoiceId: string;
      
      if (isEditing && id) {
        console.log("Update mode - editing existing invoice with ID:", id);
        // Update existing invoice but don't change the invoice number
        const { data: existingInvoice, error: fetchError } = await supabase
          .from('invoices')
          .select('invoice_number')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          console.error("Error fetching existing invoice:", fetchError);
          throw fetchError;
        }
        
        console.log("Existing invoice:", existingInvoice);
        
        // Preserve the original invoice number
        const updateData = {
          ...invoiceData,
          invoice_number: existingInvoice.invoice_number
        };
        
        console.log("Update data:", updateData);
        
        const { error: updateError } = await supabase
          .from('invoices')
          .update(updateData)
          .eq('id', id);
          
        if (updateError) {
          console.error("Error updating invoice:", updateError);
          throw updateError;
        }
        invoiceId = id;
        
        // Delete existing invoice items
        console.log("Deleting existing invoice items for invoice ID:", id);
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);
          
        if (deleteError) {
          console.error("Error deleting invoice items:", deleteError);
          throw deleteError;
        }
      } else {
        console.log("Insert mode - creating new invoice");
        // Insert new invoice
        const { data: insertData, error: insertError } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select('id')
          .single();
          
        if (insertError) {
          console.error("Error inserting invoice:", insertError);
          throw insertError;
        }
        if (!insertData) {
          const error = new Error("Failed to create invoice - no data returned");
          console.error(error);
          throw error;
        }
        
        console.log("New invoice created with ID:", insertData.id);
        invoiceId = insertData.id;
      }
      
      // Insert invoice items
      const invoiceItemsData = invoice.items.map((item: any) => 
        mapFrontendToInvoiceItem(item, invoiceId)
      );
      
      console.log("Inserting invoice items:", invoiceItemsData);
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);
        
      if (itemsError) {
        console.error("Error inserting invoice items:", itemsError);
        throw itemsError;
      }
      
      // Clear the generated invoice number after successful save
      setGeneratedInvoiceNumber(null);
      
      console.log("Invoice save completed successfully");
      toast({
        title: "Invoice Saved",
        description: "Your invoice has been saved successfully!",
      });
      
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error in saveInvoice:", error);
      toast({
        title: "Error",
        description: `Failed to save invoice: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, invoice, company, subtotal, gstDetails, total, isEditing, id, loading, setLoading, generateInvoiceNumber, setGeneratedInvoiceNumber]);

  return { saveInvoice };
};
