
import { useAuth } from "@/contexts/AuthContext";
import { useFetchCreditNoteData } from "./useFetchCreditNoteData";
import { useCreditNoteActions } from "./useCreditNoteActions";
import { useCreditNoteCalculations } from "./useCreditNoteCalculations";
import { useCreditNoteCustomer } from "./useCreditNoteCustomer";
import { UseCreditNoteReturn } from "./types";

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
    fetchInvoiceItems
  } = useFetchCreditNoteData(user?.id, id, isEditing);

  // Log fetched data for debugging
  console.log("useCreditNote - Credit Note Data:", creditNote);
  console.log("useCreditNote - Invoice Data:", invoice);
  console.log("useCreditNote - Company Data:", company);

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
  } = useCreditNoteActions(creditNote, setCreditNote, invoice, invoiceItems, company, user?.id, id);

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
    const fetchedInvoice = await baseHandleInvoiceChange(value);
    if (fetchedInvoice) {
      await fetchInvoiceItems(value);
    }
  };

  return {
    creditNote,
    setCreditNote,
    loading,
    loadingData,
    invoice,
    invoiceItems,
    company,
    customer,
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    invoiceOptions,
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
