
export interface SubscriptionLimits {
  invoices: number; // -1 for unlimited
  customers: number; // -1 for unlimited
  credit_notes: number; // -1 for unlimited
  users: number; // -1 for unlimited
  reports: boolean;
  priority_support: boolean;
}

export interface UserUsage {
  invoices_count: number;
  customers_count: number;
  credit_notes_count: number;
  month_year: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  company_id: string;
  role: 'owner' | 'admin' | 'staff' | 'viewer';
  invited_by?: string;
  invited_at?: string;
  accepted_at?: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  company_id: string;
  role: 'admin' | 'staff' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
}

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionPlan = 'freemium' | 'starter' | 'professional';
