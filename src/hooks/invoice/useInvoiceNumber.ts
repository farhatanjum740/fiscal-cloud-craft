
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
      
      // Get current settings or create new ones
      const { data: settingsData, error: settingsError } = await supabase
        .from('company_settings')
        .select('invoice_counter, current_financial_year')
        .eq('company_id', company.id)
        .maybeSingle();
        
      if (settingsError) {
        console.error("Error fetching settings:", settingsError);
        throw settingsError;
      }
      
      let nextCounter = 1; // Default to 1 for new companies
      
      if (settingsData) {
        console.log("Found existing settings:", settingsData);
        if (settingsData.current_financial_year === invoice.financialYear) {
          // Same financial year, use next counter
          nextCounter = (settingsData.invoice_counter || 0) + 1;
        } else {
          // Different financial year, start from 1
          nextCounter = 1;
        }
      } else {
        console.log("No existing settings found, will create new record");
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
