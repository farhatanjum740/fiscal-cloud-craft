
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  address: Address;
  registeredAddress?: Address;
  gstin: string;
  pan: string;
  logo?: string;
  bankDetails: BankDetails;
}

export interface CompanySettings {
  id: string;
  companyId: string;
  userId: string;
  currentFinancialYear: string;
  invoicePrefix: string;
  invoiceCounter: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  billingAddress: Address;
  shippingAddress?: Address;
  gstin?: string;
  category?: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  description?: string;
  hsnCode: string;
  price: number;
  unit: string;
  gstRate: number;
  category?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  hsnCode: string;
  quantity: number;
  price: number;
  unit: string;
  gstRate: number;
  discountRate?: number;
}

export interface Invoice {
  id: string;
  userId: string;
  companyId: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  items: InvoiceItem[];
  termsAndConditions?: string;
  notes?: string;
  subtotal: number;
  taxAmount: {
    cgst?: number;
    sgst?: number;
    igst?: number;
  };
  totalAmount: number;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  template?: 'standard' | 'modern' | 'minimal';
  financialYear: string;
  invoicePrefix?: string;
}

export interface CreditNote {
  id: string;
  userId: string;
  companyId: string;
  invoiceId: string;
  creditNoteNumber: string;
  creditNoteDate: Date;
  financialYear: string;
  reason?: string;
  items: CreditNoteItem[];
  subtotal: number;
  taxAmount: {
    cgst?: number;
    sgst?: number;
    igst?: number;
  };
  totalAmount: number;
  status: 'draft' | 'issued' | 'cancelled';
}

export interface CreditNoteItem {
  id: string;
  invoiceItemId: string;
  productId?: string;
  productName: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  price: number;
  unit: string;
  gstRate: number;
}
