
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseSaveInvoiceParams {
  user: any;
  company: any;
  invoice: any;
  subtotal: number;
  gstDetails: { cgst: number; sgst: number; igst: number };
  total: number;
  setLoading: (loading: boolean) => void;
  navigate: (path: string) => void;
  id?: string;
}

export const useSaveInvoice = ({
  user,
  company,
  invoice,
  subtotal,
  gstDetails,
  total,
  setLoading,
  navigate,
  id,
}: UseSaveInvoiceParams) => {
  const saveInvoice = useCallback(async () => {
    console.log("Saving invoice with calculated amounts:", { subtotal, gstDetails, total });
    
    if (!user || !company) {
      toast({
        title: "Error",
        description: "User and company information are required",
        variant: "destructive",
      });
      return;
    }

    if (!invoice.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    if (!invoice.invoiceNumber) {
      toast({
        title: "Error",
        description: "Invoice number is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let finalInvoiceNumber = invoice.invoiceNumber;
      
      // Only generate and increment counter for new invoices
      if (!id) {
        // Call the database function to get the next invoice number and increment counter
        const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
          .rpc('get_next_invoice_number', {
            p_company_id: company.id,
            p_financial_year: invoice.financialYear,
            p_prefix: ''
          });
          
        if (invoiceNumberError) {
          console.error("Error calling get_next_invoice_number:", invoiceNumberError);
          throw invoiceNumberError;
        }
        
        finalInvoiceNumber = invoiceNumberData;
        console.log("Final invoice number from database:", finalInvoiceNumber);
      }

      const invoiceData = {
        user_id: user.id,
        company_id: company.id,
        customer_id: invoice.customerId,
        invoice_number: finalInvoiceNumber,
        invoice_date: invoice.invoiceDate.toISOString().split('T')[0],
        due_date: invoice.dueDate ? invoice.dueDate.toISOString().split('T')[0] : null,
        financial_year: invoice.financialYear,
        template: invoice.template || 'standard',
        status: invoice.status || 'paid',
        terms_and_conditions: invoice.termsAndConditions,
        notes: invoice.notes,
        subtotal: subtotal,
        cgst: gstDetails.cgst,
        sgst: gstDetails.sgst,
        igst: gstDetails.igst,
        total_amount: total,
      };

      console.log("Saving invoice data:", invoiceData);

      let savedInvoice;
      if (id) {
        // Update existing invoice
        const { data, error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        savedInvoice = data;
      } else {
        // Create new invoice
        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();
        
        if (error) throw error;
        savedInvoice = data;
      }

      // Save invoice items
      if (id) {
        // Delete existing items first
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);
      }

      // Insert new items
      const itemsToInsert = invoice.items.map((item: any) => ({
        invoice_id: savedInvoice.id,
        product_id: item.productId || null,
        product_name: item.productName,
        description: item.description,
        hsn_code: item.hsnCode,
        quantity: item.quantity,
        price: item.price,
        gst_rate: item.gstRate,
        unit: item.unit,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: `Invoice ${id ? 'updated' : 'created'} successfully`,
      });

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
  }, [user, company, invoice, subtotal, gstDetails, total, setLoading, navigate, id]);

  return { saveInvoice };
};
