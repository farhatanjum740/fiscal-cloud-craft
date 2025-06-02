
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseInvoiceNumberParams {
  company: any;
  invoice: any;
  setInvoice: (setter: (prev: any) => any) => void;
  setIsGeneratingInvoiceNumber: (value: boolean) => void;
  setGeneratedInvoiceNumber: (value: string | null) => void;
}

export const useInvoiceNumber = ({
  company,
  invoice,
  setInvoice,
  setIsGeneratingInvoiceNumber,
  setGeneratedInvoiceNumber,
}: UseInvoiceNumberParams) => {
  // Generate invoice number automatically when the page loads
  const generateInvoiceNumber = useCallback(async () => {
    console.log("generateInvoiceNumber called, company:", company?.id);
    if (!company || !company.id) {
      console.log("No company data, cannot generate invoice number");
      return;
    }
    
    if (!invoice.financialYear) {
      console.log("No financial year set, cannot generate invoice number");
      return;
    }
    
    // Don't generate if invoice number already exists
    if (invoice.invoiceNumber) {
      console.log("Invoice number already exists:", invoice.invoiceNumber);
      return;
    }
    
    try {
      setIsGeneratingInvoiceNumber(true);
      
      console.log("Generating invoice number for financial year:", invoice.financialYear);
      console.log("Company ID:", company.id);
      
      // Call the database function to get the next invoice number
      // This function will only increment the counter when actually called for saving
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
      
      const invoiceNumber = invoiceNumberData;
      console.log("Generated invoice number:", invoiceNumber);
      
      setInvoice(prev => ({
        ...prev,
        invoiceNumber
      }));
      
      // Store the generated number for future use within this session
      setGeneratedInvoiceNumber(invoiceNumber);
      
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
  }, [company, invoice.financialYear, invoice.invoiceNumber, setInvoice, setIsGeneratingInvoiceNumber, setGeneratedInvoiceNumber]);

  return { generateInvoiceNumber };
};
