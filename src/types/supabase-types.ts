
// This file extends Supabase types with our own application-specific types
import type { Database } from '@/integrations/supabase/types';

// Type helpers for Supabase tables
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// User-related types
export type Profile = Tables<'profiles'>;
export type Company = Tables<'companies'>;
export type Customer = Tables<'customers'>;
export type Product = Tables<'products'>;
export type Invoice = Tables<'invoices'>;
export type InvoiceItem = Tables<'invoice_items'>;

// Insert types
export type InsertProfile = InsertTables<'profiles'>;
export type InsertCompany = InsertTables<'companies'>;
export type InsertCustomer = InsertTables<'customers'>;
export type InsertProduct = InsertTables<'products'>;
export type InsertInvoice = InsertTables<'invoices'>;
export type InsertInvoiceItem = InsertTables<'invoice_items'>;

// Update types
export type UpdateProfile = UpdateTables<'profiles'>;
export type UpdateCompany = UpdateTables<'companies'>;
export type UpdateCustomer = UpdateTables<'customers'>;
export type UpdateProduct = UpdateTables<'products'>;
export type UpdateInvoice = UpdateTables<'invoices'>;
export type UpdateInvoiceItem = UpdateTables<'invoice_items'>;
