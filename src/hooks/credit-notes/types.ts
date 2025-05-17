import React from "react";

export interface CreditNoteData {
  id?: string;
  invoiceId: string;
  creditNoteNumber: string;
  creditNoteDate: Date;
  financialYear: string;
  reason: string;
  status: string;
  items: CreditNoteItem[];
}

export interface CreditNoteItem {
  id: string;
  invoiceItemId: string;
  productId: string;
  productName: string;
  hsnCode: string;
  quantity: number;
  price: number;
  unit: string;
  gstRate: number;
  maxQuantity?: number;
}

export interface UseCreditNoteReturn {
  creditNote: CreditNoteData;
  setCreditNote: (value: React.SetStateAction<CreditNoteData>) => void;
  loading: boolean;
  loadingData: boolean;
  invoice: any;
  invoiceItems: any[];
  company: any;
  customer: any;
  selectedItems: {[key: string]: boolean};
  showQuantityError: boolean;
  setShowQuantityError: (value: boolean) => void;
  errorMessage: string;
  invoiceOptions: { value: string; label: string }[];
  subtotal: number;
  gstDetails: {
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
  };
  total: number;
  isGeneratingNumber: boolean;
  handleInvoiceChange: (value: string) => Promise<void>;
  toggleItemSelection: (itemId: string) => void;
  addSelectedItems: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: any, value: any) => void;
  generateCreditNoteNumber: () => Promise<string | null>;  // Update the return type here
  saveCreditNote: (navigate: (path: string) => void) => void;
}
