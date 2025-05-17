import { useAuth } from "@/contexts/AuthContext";
import { useFetchCreditNoteData } from "./useFetchCreditNoteData";
import { useCreditNoteActions } from "./useCreditNoteActions";
import { useCreditNoteCalculations } from "./useCreditNoteCalculations";
import { useCreditNoteCustomer } from "./useCreditNoteCustomer";
import { UseCreditNoteReturn } from "./types";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const useCreditNote = (id?: string): UseCreditNoteReturn => {
  const { user } = useAuth();
  const isEditing = !!id;
  
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

  // DEBUG: Add more specific and detailed logging about each piece of data
  console.log("useCreditNote.tsx - loadingData:", loadingData);
  console.log("useCreditNote.tsx - user ID:", user?.id);
  console.log("useCreditNote.tsx - company:", company ? "loaded" : "null");
  console.log("useCreditNote.tsx - invoiceOptions type:", typeof invoiceOptions);
  console.log("useCreditNote.tsx - invoiceOptions isArray:", Array.isArray(invoiceOptions));
  console.log("useCreditNote.tsx - invoiceOptions raw:", invoiceOptions);

  // Ensure invoiceOptions is always an array, even if the data is malformed
  const safeInvoiceOptions = Array.isArray(invoiceOptions) 
    ? invoiceOptions.filter(option => option && typeof option === 'object' && 'value' in option && 'label' in option)
    : [];

  // Log fetched data for debugging
  console.log("useCreditNote - Credit Note Data:", creditNote);
  console.log("useCreditNote - Invoice Data:", invoice);
  console.log("useCreditNote - Company Data:", company);
  console.log("useCreditNote - Invoice Options (raw):", invoiceOptions);
  console.log("useCreditNote - Invoice Options (safe):", safeInvoiceOptions);

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
  console.log("useCreditNote - Customer Data:", customer);

  // Create a wrapper for handleInvoiceChange to update the invoice state
  const handleInvoiceChange = async (value: string): Promise<void> => {
    console.log("handleInvoiceChange called with value:", value);
    try {
      if (!value) {
        console.log("Empty invoice ID provided");
        return;
      }
      
      // First, update the creditNote.invoiceId (this will trigger any UI updates)
      setCreditNote(prev => ({
        ...prev,
        invoiceId: value
      }));
      
      // Then fetch the invoice data
      const fetchedInvoice = await baseHandleInvoiceChange(value);
      console.log("Fetched invoice:", fetchedInvoice);
      
      if (fetchedInvoice) {
        // Make sure to update the invoice state (this is crucial)
        setInvoice(fetchedInvoice);
        
        // Update financial year from fetched invoice
        setCreditNote(prev => ({
          ...prev, 
          financialYear: fetchedInvoice.financial_year || ""
        }));
        
        // Fetch invoice items
        await fetchInvoiceItems(value);
        
        // Generate credit note number automatically when invoice is selected
        if (!creditNote.creditNoteNumber && fetchedInvoice.financial_year) {
          console.log("Auto-generating credit note number after invoice selection");
          try {
            await generateCreditNoteNumber();
          } catch (error) {
            console.error("Error auto-generating credit note number:", error);
            toast({
              title: "Note",
              description: "Invoice selected, but couldn't generate credit note number automatically. Please try again.",
              variant: "default",
            });
          }
        }
      } else {
        console.log("No invoice data returned from baseHandleInvoiceChange");
      }
    } catch (error) {
      console.error("Error in handleInvoiceChange:", error);
    }
  };

  // Auto-generate credit note number when page loads if we're not editing and have the required data
  const autoGenerateCreditNoteNumber = async () => {
    // Only auto-generate if we're creating a new credit note (not editing), have a company, and no existing credit note number
    if (!isEditing && company && !creditNote.creditNoteNumber && creditNote.financialYear) {
      console.log("Auto-generating credit note number on page load");
      try {
        const generatedNumber = await generateCreditNoteNumber();
        console.log("Generated credit note number:", generatedNumber);
        return generatedNumber;
      } catch (error) {
        console.error("Error auto-generating credit note number on page load:", error);
        return null;
      }
    }
    return null;
  };
  
  // Run auto-generation once page has loaded and we have the required data
  useEffect(() => {
    if (!loadingData) {
      autoGenerateCreditNoteNumber();
    }
  }, [isEditing, company, creditNote.creditNoteNumber, creditNote.financialYear, loadingData, generateCreditNoteNumber]);

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
    invoiceOptions: safeInvoiceOptions,  // Always return a safe array
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
