
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
      if (!value) return;
      
      console.log("handleInvoiceChange in useCreditNote with value:", value);
      
      // First, update the creditNote.invoiceId (this will trigger any UI updates)
      setCreditNote(prev => ({
        ...prev,
        invoiceId: value
      }));
      
      // Then fetch the invoice data
      const fetchedInvoice = await baseHandleInvoiceChange(value);
      
      if (fetchedInvoice) {
        // Make sure to update the invoice state (this is crucial)
        setInvoice(fetchedInvoice);
        
        // Update the financial year in the credit note state to match the invoice
        if (fetchedInvoice.financial_year) {
          setCreditNote(prev => ({
            ...prev,
            financialYear: fetchedInvoice.financial_year
          }));
        }
        
        // Log the financial year that was set
        console.log("Financial year after invoice fetch:", fetchedInvoice.financial_year);
        console.log("Current creditNote state:", creditNote);
        
        // Fetch invoice items
        await fetchInvoiceItems(value);
      }
    } catch (error) {
      console.error("Error in handleInvoiceChange:", error);
    }
  };

  // This effect runs once when the page loads with required data
  useEffect(() => {
    if (!isInitialized && !isEditing && !loadingData && company && creditNote.financialYear) {
      setIsInitialized(true);
      
      if (!creditNote.creditNoteNumber) {
        console.log("Auto-generating credit note number on page load with financial year:", creditNote.financialYear);
        (async () => {
          try {
            await generateCreditNoteNumber();
          } catch (error) {
            console.error("Error auto-generating credit note number:", error);
          }
        })();
      }
    }
  }, [isEditing, company, creditNote.financialYear, creditNote.creditNoteNumber, loadingData, isInitialized]);

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
