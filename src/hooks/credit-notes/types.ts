
export interface CreditNoteItem {
  id: string;
  invoiceItemId: string;
  productId?: string;
  productName: string;
  hsnCode?: string;
  quantity: number;
  price: number;
  unit: string;
  gstRate: number;
}

export interface CreditNoteData {
  id?: string; // Made optional but should be set when editing
  invoiceId: string;
  creditNoteNumber: string;
  creditNoteDate: Date;
  financialYear: string;
  reason?: string;
  items: CreditNoteItem[];
  status: string;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total_amount?: number;
}

export interface InvoiceOption {
  value: string;
  label: string;
}

// Add the missing interface for CreditNoteGSTDetails
export interface CreditNoteGSTDetails {
  cgst: number;
  sgst: number;
  igst: number;
}

// Add the interface for UseCreditNoteReturn
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
  invoiceOptions: InvoiceOption[];
  subtotal: number;
  gstDetails: CreditNoteGSTDetails;
  total: number;
  isGeneratingNumber: boolean;
  handleInvoiceChange: (value: string) => Promise<void>;
  toggleItemSelection: (itemId: string) => void;
  addSelectedItems: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: any, value: any) => void;
  generateCreditNoteNumber: () => Promise<string | null>;
  saveCreditNote: (navigate: (path: string) => void) => void;
}
