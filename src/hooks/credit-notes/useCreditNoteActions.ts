
import { useState } from "react";
import { useItemManagement } from "./useItemManagement";
import { useNumberGeneration } from "./useNumberGeneration";
import { useInvoiceSelection } from "./useInvoiceSelection";
import { useSaveCreditNote } from "./useSaveCreditNote";
import { CreditNoteData } from "./types";

export const useCreditNoteActions = (
  creditNote: CreditNoteData,
  setCreditNote: (value: React.SetStateAction<CreditNoteData>) => void,
  invoice: any,
  invoiceItems: any[],
  company: any,
  userId: string | undefined,
  id?: string
) => {
  const [hasAttemptedNumberGeneration, setHasAttemptedNumberGeneration] = useState(false);
  
  // Item management hooks
  const {
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    toggleItemSelection,
    addSelectedItems,
    removeItem,
    updateItem
  } = useItemManagement(creditNote, setCreditNote, invoiceItems);

  // Number generation hooks
  const {
    isGeneratingNumber,
    previewedCreditNoteNumber,
    generateCreditNoteNumber
  } = useNumberGeneration(creditNote, setCreditNote, company);

  // Invoice selection hook
  const {
    handleInvoiceChange
  } = useInvoiceSelection(setCreditNote);

  // Save credit note hook
  const {
    loading,
    saveCreditNote: baseSaveCreditNote
  } = useSaveCreditNote(creditNote, company, invoice, userId, id);

  // Wrapper for saveCreditNote to pass previewedCreditNoteNumber
  const saveCreditNote = (navigate: (path: string) => void) => {
    baseSaveCreditNote(navigate, previewedCreditNoteNumber);
  };

  return {
    loading,
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    isGeneratingNumber,
    hasAttemptedNumberGeneration,
    setHasAttemptedNumberGeneration,
    toggleItemSelection,
    addSelectedItems,
    removeItem,
    updateItem,
    generateCreditNoteNumber,
    handleInvoiceChange,
    saveCreditNote
  };
};
