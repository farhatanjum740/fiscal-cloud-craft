
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { getNextCreditNoteNumber } from "@/integrations/supabase/client";
import { CreditNoteData } from "./types";

export const useNumberGeneration = (
  creditNote: CreditNoteData,
  setCreditNote: (value: React.SetStateAction<CreditNoteData>) => void,
  company: any
) => {
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [previewedCreditNoteNumber, setPreviewedCreditNoteNumber] = useState<string | null>(null);

  // Generate credit note number function using the database function in preview mode
  const generateCreditNoteNumber = async (): Promise<string | null> => {
    console.log("Generating credit note number with company:", company);
    console.log("Financial year for credit note number generation:", creditNote.financialYear);
    
    // If we already have a credit note number, don't generate a new one
    if (creditNote.creditNoteNumber) {
      console.log("Credit note number already exists:", creditNote.creditNoteNumber);
      toast({
        title: "Info",
        description: "Credit note number already generated",
      });
      return creditNote.creditNoteNumber;
    }
    
    if (!company) {
      console.error("No company data available for credit note number generation");
      toast({
        title: "Error",
        description: "Company profile is required to generate credit note number",
        variant: "destructive",
      });
      return null;
    }
    
    // Financial year is required
    if (!creditNote.financialYear) {
      console.error("No financial year available for credit note number generation");
      toast({
        title: "Error",
        description: "Financial year is required to generate credit note number",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsGeneratingNumber(true);
      
      console.log("Using financial year for number generation:", creditNote.financialYear);
      
      // Use preview mode to avoid incrementing the counter
      const creditNoteNumber = await getNextCreditNoteNumber(
        company.id,
        creditNote.financialYear,
        'CN',
        true // preview mode - no increment
      );
      
      console.log("Generated preview credit note number:", creditNoteNumber);
      
      // Store the previewed number for later use
      setPreviewedCreditNoteNumber(creditNoteNumber);
      
      // Update the credit note state with the generated number
      setCreditNote(prev => ({
        ...prev,
        creditNoteNumber
      }));
      
      // Show success message
      toast({
        title: "Success",
        description: "Credit note number generated successfully",
      });

      return creditNoteNumber;
    } catch (error: any) {
      console.error("Error generating credit note number:", error);
      toast({
        title: "Error",
        description: `Failed to generate credit note number: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingNumber(false);
    }
  };
  
  return {
    isGeneratingNumber,
    previewedCreditNoteNumber,
    generateCreditNoteNumber
  };
};
