
import { useAuth } from "@/contexts/AuthContext";
import { useFetchCreditNoteData } from "./useFetchCreditNoteData";
import { useCreditNoteActions } from "./useCreditNoteActions";
import { useCreditNoteCalculations } from "./useCreditNoteCalculations";
import { useCreditNoteCustomer } from "./useCreditNoteCustomer";
import { UseCreditNoteReturn } from "./types";
import { useEffect } from "react";

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

  // Log fetched data for debugging
  console.log("useCreditNote - Credit Note Data:", creditNote);
  console.log("useCreditNote - Invoice Data:", invoice);
  console.log("useCreditNote - Company Data:", company);
  console.log("useCreditNote - Invoice Options:", invoiceOptions);

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
  } = useCreditNoteActions(creditNote, setCreditNote, invoice, invoiceItems || [], company, user?.id, id);

  const {
    subtotal,
    gstDetails,
    total
  } = useCreditNoteCalculations(creditNote, invoice, company);

  // Get customer data
  const customer = useCreditNoteCustomer(invoice);
  console.log("useCreditNote - Customer Data:", customer);

  // Create a wrapper for handleInvoiceChange to update the invoice state
  const handleInvoiceChange = async (value: string) => {
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
        
        // Fetch invoice items
        await fetchInvoiceItems(value);
      } else {
        console.log("No invoice data returned from baseHandleInvoiceChange");
      }
    } catch (error) {
      console.error("Error in handleInvoiceChange:", error);
    }
  };

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
    invoiceItems: invoiceItems || [],
    company,
    customer,
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    invoiceOptions: invoiceOptions || [],
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
