
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

// Using the database schema format to match what Supabase returns
export interface Product {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  hsn_code: string;
  price: number;
  unit: string;
  gst_rate: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

// Using the FrontendInvoiceItem type from supabase-types.ts
import type { FrontendInvoiceItem } from './supabase-types';
export type { FrontendInvoiceItem as InvoiceItem } from './supabase-types';

export interface Invoice {
  id: string;
  userId: string;
  companyId: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  items: FrontendInvoiceItem[];
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

// Export SubscriptionLimits from the subscription types
export type { SubscriptionLimits } from './subscription';
