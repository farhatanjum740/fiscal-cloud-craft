
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
  // Generate invoice number automatically when the page loads
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
      
      // Call the database function that will properly increment the counter
      const { data, error } = await supabase.rpc(
        'get_next_invoice_number',
        {
          p_company_id: company.id,
          p_financial_year: invoice.financialYear,
          p_prefix: '',
        }
      );
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Using the new format: YYYY-YYYY/001
        const invoiceNumber = `${invoice.financialYear}/${data.split('/').pop()}`;
        
        console.log("Generated invoice number:", invoiceNumber);
        setInvoice(prev => ({
          ...prev,
          invoiceNumber
        }));
        
        // Store the generated number
        setGeneratedInvoiceNumber(invoiceNumber);
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
  }, [company, invoice.financialYear, setInvoice, setIsGeneratingInvoiceNumber, setGeneratedInvoiceNumber]);

  return { generateInvoiceNumber };
};
