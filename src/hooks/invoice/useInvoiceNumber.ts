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
      
      // Instead of calling the database function directly which increments the counter,
      // we'll simulate what the next number would be and store it locally
      if (!generatedInvoiceNumber) {
        // Only call the database function if we haven't already generated a number
        const { data, error } = await supabase
          .rpc('get_next_invoice_number', {
            p_company_id: company.id,
            p_financial_year: invoice.financialYear,
            p_prefix: ""
          });
        
        if (error) {
          console.error("Error from get_next_invoice_number RPC:", error);
          throw error;
        }
        
        console.log("Invoice number generated:", data);
        setInvoice(prev => ({
          ...prev,
          invoiceNumber: data
        }));
        
        // Store the generated number so we don't keep incrementing
        setGeneratedInvoiceNumber(data);
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

  return { generateInvoiceNumber };
};
