
import { useAuth } from "@/contexts/AuthContext";
import { useFetchCreditNoteData } from "./useFetchCreditNoteData";
import { useCreditNoteActions } from "./useCreditNoteActions";
import { useCreditNoteCalculations } from "./useCreditNoteCalculations";
import { useCreditNoteCustomer } from "./useCreditNoteCustomer";
import { UseCreditNoteReturn } from "./types";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

export const useCreditNote = (id?: string): UseCreditNoteReturn => {
  const { user } = useAuth();
  const isEditing = !!id;
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get data from separate hooks
  const {
    loadingData,
    company,
    invoice,
    invoiceItems,
    invoiceOptions,
    creditNote,
    setCreditNote,
    fetchInvoiceItems,
    setInvoice
  } = useFetchCreditNoteData(user?.id, id, isEditing);

  // Ensure invoiceOptions is always an array, even if the data is malformed
  const safeInvoiceOptions = Array.isArray(invoiceOptions) 
    ? invoiceOptions.filter(option => option && typeof option === 'object' && 'value' in option && 'label' in option)
    : [];

  const {
    loading,
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    isGeneratingNumber,
    toggleItemSelection,
    addSelectedItems,
    removeItem,
    updateItem,
    generateCreditNoteNumber,
    handleInvoiceChange: baseHandleInvoiceChange,
    saveCreditNote
  } = useCreditNoteActions(creditNote, setCreditNote, invoice, Array.isArray(invoiceItems) ? invoiceItems : [], company, user?.id, id);

  const {
    subtotal,
    gstDetails,
    total
  } = useCreditNoteCalculations(creditNote, invoice, company);

  // Get customer data
  const customer = useCreditNoteCustomer(invoice);

  // Create a wrapper for handleInvoiceChange to update the invoice state
  const handleInvoiceChange = async (value: string): Promise<void> => {
    try {
      if (!value) {
        console.log("Empty invoice ID in handleInvoiceChange");
        return;
      }
      
      console.log("handleInvoiceChange in useCreditNote with value:", value);
      
      // First, update the creditNote.invoiceId (this will trigger any UI updates)
      setCreditNote(prev => ({
        ...prev,
        invoiceId: value
      }));
      
      // Then fetch the invoice data
      const fetchedInvoice = await baseHandleInvoiceChange(value);
      
      if (fetchedInvoice) {
        // Make sure to update the invoice state
        setInvoice(fetchedInvoice);
        
        // Get the financial year from the invoice and update the credit note state
        if (fetchedInvoice.financial_year) {
          console.log("Setting financial year from invoice:", fetchedInvoice.financial_year);
          
          // Update the credit note with the invoice's financial year
          setCreditNote(prev => ({
            ...prev,
            financialYear: fetchedInvoice.financial_year
          }));
          
          // Fetch invoice items
          await fetchInvoiceItems(value);
          
          // NOTE: We no longer auto-generate credit note number here
          // The user will click the Generate button explicitly
        } else {
          console.error("No financial year in the fetched invoice");
        }
      } else {
        console.error("No invoice fetched in handleInvoiceChange");
      }
    } catch (error) {
      console.error("Error in handleInvoiceChange:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // This effect runs once when the page loads with required data
  // We no longer auto-generate credit note numbers on page load
  useEffect(() => {
    if (!isInitialized && !isEditing && !loadingData && company) {
      setIsInitialized(true);
      console.log("Credit note editor initialized with financial year:", creditNote.financialYear);
    }
  }, [isEditing, company, creditNote.financialYear, loadingData, isInitialized]);

  // If there's an initial invoiceId from a query parameter, load it
  useEffect(() => {
    if (creditNote.invoiceId && !isEditing && !invoice) {
      console.log("Initial invoice ID detected, loading:", creditNote.invoiceId);
      handleInvoiceChange(creditNote.invoiceId);
    }
  }, [creditNote.invoiceId, isEditing, invoice]);

  return {
    creditNote,
    setCreditNote,
    loading,
    loadingData,
    invoice,
    invoiceItems: Array.isArray(invoiceItems) ? invoiceItems : [],
    company,
    customer,
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    invoiceOptions: safeInvoiceOptions,
    subtotal,
    gstDetails,
    total,
    isGeneratingNumber,
    handleInvoiceChange,
    toggleItemSelection,
    addSelectedItems,
    removeItem,
    updateItem,
    generateCreditNoteNumber,
    saveCreditNote
  };
};
