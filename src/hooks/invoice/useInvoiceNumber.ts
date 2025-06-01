
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
      
      // Instead of incrementing, just fetch the next available number without updating the counter
      // The counter will only be updated when an invoice is actually saved
      const { data: settingsData, error: settingsError } = await supabase
        .from('company_settings')
        .select('invoice_counter, current_financial_year')
        .eq('company_id', company.id)
        .single();
        
      if (settingsError) {
        throw settingsError;
      }
      
      // Calculate the next invoice number but don't save it yet
      let nextCounter = 1; // Default to 1 if no settings exist
      
      if (settingsData) {
        if (settingsData.current_financial_year === invoice.financialYear) {
          nextCounter = settingsData.invoice_counter;
        }
        // If financial year has changed, start from 1
      }
      
      // Format the invoice number: YYYY-YYYY/001
      const invoiceNumber = `${invoice.financialYear}/${nextCounter.toString().padStart(3, '0')}`;
      
      console.log("Generated invoice number (preview):", invoiceNumber);
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
  }, [company, invoice.financialYear, setInvoice, setIsGeneratingInvoiceNumber, setGeneratedInvoiceNumber]);

  return { generateInvoiceNumber };
};
