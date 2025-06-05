
export interface SubscriptionLimits {
  invoices: number; // -1 for unlimited
  customers: number; // -1 for unlimited
  credit_notes: number; // -1 for unlimited
  products: number; // -1 for unlimited
  users: number; // -1 for unlimited
  reports: boolean;
  priority_support: boolean;
  api_access: boolean;
}

export interface UserUsage {
  invoices_count: number;
  customers_count: number;
  credit_notes_count: number;
  products_count: number;
  month_year: string;
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

export interface ApiKey {
  id: string;
  user_id: string;
  company_id: string;
  key_name: string;
  api_key: string;
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
  rate_limit: number;
  scopes: string[];
}

export interface ApiUsageLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms?: number;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionPlan = 'freemium' | 'starter' | 'professional';
