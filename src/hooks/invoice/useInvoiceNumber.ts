
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useInvoiceNumber = (
  company: any,
  invoice: any,
  setInvoice: (setter: (prev: any) => any) => void,
  isGeneratingInvoiceNumber: boolean,
  setIsGeneratingInvoiceNumber: (value: boolean) => void,
  generatedInvoiceNumber: string | null,
  setGeneratedInvoiceNumber: (value: string | null) => void
) => {
  // Generate invoice number
  const generateInvoiceNumber = useCallback(async () => {
    console.log("generateInvoiceNumber called, company:", company?.id);
    if (!company) {
      console.log("No company data, cannot generate invoice number");
      toast({
        title: "Error",
        description: "Company profile is required to generate invoice number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingInvoiceNumber(true);
      console.log("Generating invoice number for financial year:", invoice.financialYear);
      
      // Only call the database function if we haven't already generated a number
      if (!generatedInvoiceNumber) {
        // Try to call the RPC function
        try {
          // Use get_next_invoice_number with a flag to preview only
          const { data, error } = await supabase
            .rpc('get_next_invoice_number', {
              p_company_id: company.id,
              p_financial_year: invoice.financialYear,
              p_preview_only: true
            });
          
          if (error) {
            console.error("Error from RPC function:", error);
            throw error;
          }
          
          console.log("Invoice number previewed:", data);
          setInvoice(prev => ({
            ...prev,
            invoiceNumber: data
          }));
          
          // Store the previewed number
          setGeneratedInvoiceNumber(data);
        } catch (rpcError) {
          console.log("RPC error, falling back to manual preview:", rpcError);
          
          // Fallback to manual preview method
          const previewNumber = await getInvoiceNumberPreview(company.id, invoice.financialYear);
          
          if (previewNumber) {
            console.log("Manually previewed invoice number:", previewNumber);
            setInvoice(prev => ({
              ...prev,
              invoiceNumber: previewNumber
            }));
            
            // Store the previewed number
            setGeneratedInvoiceNumber(previewNumber);
          } else {
            throw new Error("Failed to generate invoice number preview");
          }
        }
      } else {
        // Reuse the already generated invoice number
        console.log("Reusing previously generated invoice number:", generatedInvoiceNumber);
        setInvoice(prev => ({
          ...prev,
          invoiceNumber: generatedInvoiceNumber
        }));
      }
    } catch (error: any) {
      console.error("Error generating invoice number:", error);
      toast({
        title: "Error",
        description: `Failed to generate invoice number: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInvoiceNumber(false);
    }
  }, [company, invoice.financialYear, generatedInvoiceNumber, setInvoice, setIsGeneratingInvoiceNumber, setGeneratedInvoiceNumber]);

  // Function to preview the next invoice number without incrementing the counter
  const getInvoiceNumberPreview = async (companyId: string, financialYear: string) => {
    try {
      // Get current company settings for this financial year
      const { data, error } = await supabase
        .from('company_settings')
        .select('invoice_counter, invoice_prefix')
        .eq('company_id', companyId)
        .eq('current_financial_year', financialYear)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const counter = data.invoice_counter || 1;
        const prefix = data.invoice_prefix || '';
        
        // Format with leading zeros (e.g., 001, 010, 100)
        const formattedCounter = String(counter).padStart(3, '0');
        return `${prefix}${formattedCounter}`;
      } else {
        // If no settings exist, return default
        return '001';
      }
    } catch (error) {
      console.error("Error previewing invoice number:", error);
      return null;
    }
  };

  return { generateInvoiceNumber };
};
