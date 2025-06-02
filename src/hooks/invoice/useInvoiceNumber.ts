
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
  // Preview the next invoice number without incrementing the counter
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
      
      console.log("Previewing next invoice number for financial year:", invoice.financialYear);
      console.log("Company ID:", company.id);
      
      // Get current counter without incrementing
      const { data: settingsData, error: settingsError } = await supabase
        .from('company_settings')
        .select('invoice_counter, current_financial_year')
        .eq('company_id', company.id)
        .maybeSingle();
        
      if (settingsError) {
        console.error("Error fetching company settings:", settingsError);
        throw settingsError;
      }
      
      let nextCounter = 1;
      
      if (settingsData) {
        // If financial year changed, start from 1, otherwise use next counter
        if (settingsData.current_financial_year === invoice.financialYear) {
          nextCounter = (settingsData.invoice_counter || 0) + 1;
        } else {
          nextCounter = 1;
        }
      }
      
      // Format the preview invoice number
      const previewInvoiceNumber = `${invoice.financialYear}/${String(nextCounter).padStart(4, '0')}`;
      console.log("Preview invoice number:", previewInvoiceNumber);
      
      setInvoice(prev => ({
        ...prev,
        invoiceNumber: previewInvoiceNumber
      }));
      
      // Store the generated number for future use within this session
      setGeneratedInvoiceNumber(previewInvoiceNumber);
      
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
