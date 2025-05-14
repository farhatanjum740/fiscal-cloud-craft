
import { CreditNoteItem } from "@/types";

export interface CreditNoteData {
  invoiceId: string;
  creditNoteNumber: string;
  creditNoteDate: Date;
  financialYear: string;
  reason: string;
  items: CreditNoteItem[];
  status: string;
}

export interface CreditNoteGSTDetails {
  cgst: number;
  sgst: number;
  igst: number;
}

export interface InvoiceOption {
  value: string;
  label: string;
}

export interface UseCreditNoteReturn {
  creditNote: CreditNoteData;
  setCreditNote: (value: React.SetStateAction<CreditNoteData>) => void;
  loading: boolean;
  loadingData: boolean;
  invoice: any;
  invoiceItems: any[];
  company: any;
  selectedItems: {[key: string]: boolean};
  showQuantityError: boolean;
  setShowQuantityError: (value: boolean) => void;
  errorMessage: string;
  invoiceOptions: InvoiceOption[];
  subtotal: number;
  gstDetails: CreditNoteGSTDetails;
  total: number;
  isGeneratingNumber: boolean;
  handleInvoiceChange: (value: string) => Promise<void>;
  toggleItemSelection: (itemId: string) => void;
  addSelectedItems: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof CreditNoteItem, value: any) => void;
  generateCreditNoteNumber: () => Promise<void>;
  saveCreditNote: (navigate: (path: string) => void) => Promise<void>;
}
