
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
