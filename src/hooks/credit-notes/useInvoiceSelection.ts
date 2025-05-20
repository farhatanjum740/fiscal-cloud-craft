
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreditNoteData } from "./types";

export const useInvoiceSelection = (
  setCreditNote: (value: React.SetStateAction<CreditNoteData>) => void
) => {
  // Handle invoice selection with improved error handling
  const handleInvoiceChange = async (value: string) => {
    console.log("Invoice changed to:", value);
    
    try {
      if (!value) {
        console.log("Empty invoice value provided");
        return null;
      }
      
      // Fetch invoice data
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', value)
        .maybeSingle();
          
      if (error) {
        console.error("Error fetching invoice data:", error);
        throw error;
      }
      
      console.log("Selected invoice data:", data);
      
      if (data) {
        // Clear any existing credit note number since we're changing the invoice
        // This ensures a new number will be generated for the correct financial year
        setCreditNote(prev => ({
          ...prev,
          creditNoteNumber: ""
        }));
        
        // Return the invoice data - we'll update the state in the parent hook
        return data;
      } else {
        console.log("Invoice not found");
        toast({
          title: "Invoice Not Found",
          description: "The selected invoice could not be found.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
      toast({
        title: "Error",
        description: `Failed to load invoice data: ${error.message}`,
        variant: "destructive",
      });
    }
    
    return null;
  };
  
  return {
    handleInvoiceChange
  };
};
