
// This file extends Supabase types with our own application-specific types
import type { Database } from '@/integrations/supabase/types';

// Type helpers for Supabase tables
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// User-related types
export type Profile = Tables<'profiles'>;
export type Company = Tables<'companies'>;
export type CompanySettings = Tables<'company_settings'>;
export type Customer = Tables<'customers'>;
export type Product = Tables<'products'>;
export type Invoice = Tables<'invoices'>;
export type InvoiceItem = Tables<'invoice_items'>;
export type CreditNote = Tables<'credit_notes'>;
export type CreditNoteItem = Tables<'credit_note_items'>;
export type Subscription = Tables<'subscriptions'>;
export type UserUsage = Tables<'user_usage'>;
export type TeamInvitation = Tables<'team_invitations'>;

// Insert types
export type InsertProfile = InsertTables<'profiles'>;
export type InsertCompany = InsertTables<'companies'>;
export type InsertCompanySettings = InsertTables<'company_settings'>;
export type InsertCustomer = InsertTables<'customers'>;
export type InsertProduct = InsertTables<'products'>;
export type InsertInvoice = InsertTables<'invoices'>;
export type InsertInvoiceItem = InsertTables<'invoice_items'>;
export type InsertCreditNote = InsertTables<'credit_notes'>;
export type InsertCreditNoteItem = InsertTables<'credit_note_items'>;
export type InsertSubscription = InsertTables<'subscriptions'>;
export type InsertUserUsage = InsertTables<'user_usage'>;
export type InsertTeamInvitation = InsertTables<'team_invitations'>;

// Update types
export type UpdateProfile = UpdateTables<'profiles'>;
export type UpdateCompany = UpdateTables<'companies'>;
export type UpdateCompanySettings = UpdateTables<'company_settings'>;
export type UpdateCustomer = UpdateTables<'customers'>;
export type UpdateProduct = UpdateTables<'products'>;
export type UpdateInvoice = UpdateTables<'invoices'>;
export type UpdateInvoiceItem = UpdateTables<'invoice_items'>;
export type UpdateCreditNote = UpdateTables<'credit_notes'>;
export type UpdateCreditNoteItem = UpdateTables<'credit_note_items'>;
export type UpdateSubscription = UpdateTables<'subscriptions'>;
export type UpdateUserUsage = UpdateTables<'user_usage'>;
export type UpdateTeamInvitation = UpdateTables<'team_invitations'>;

// Specific type helpers for frontend
export interface FrontendInvoiceItem {
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

export const mapInvoiceItemToFrontend = (item: InvoiceItem): FrontendInvoiceItem => ({
  id: item.id,
  productId: item.product_id || "",
  productName: item.product_name,
  description: item.description || "",
  hsnCode: item.hsn_code || "",
  quantity: Number(item.quantity),
  price: Number(item.price),
  unit: item.unit,
  gstRate: Number(item.gst_rate),
  discountRate: item.discount_rate ? Number(item.discount_rate) : undefined
});

export const mapFrontendToInvoiceItem = (item: FrontendInvoiceItem, invoiceId: string): Omit<InsertInvoiceItem, 'id'> => ({
  invoice_id: invoiceId,
  product_id: item.productId || null,
  product_name: item.productName,
  description: item.description,
  hsn_code: item.hsnCode,
  quantity: item.quantity,
  price: item.price,
  unit: item.unit,
  gst_rate: item.gstRate,
  discount_rate: item.discountRate
});
