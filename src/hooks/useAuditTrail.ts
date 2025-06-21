
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLogEntry {
  id?: string;
  table_name: string;
  record_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export const useAuditTrail = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (
    tableName: string,
    recordId: string,
    action: AuditLogEntry['action'],
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      // In a real application, you'd store this in an audit_logs table
      // For now, we'll log to console and could extend to store in Supabase
      const auditEntry: AuditLogEntry = {
        table_name: tableName,
        record_id: recordId,
        action,
        old_values: oldValues,
        new_values: newValues,
        user_id: user.id,
        timestamp: new Date().toISOString(),
        ip_address: 'client-side', // Would need server-side implementation for real IP
        user_agent: navigator.userAgent
      };

      console.log('Audit Trail Entry:', auditEntry);

      // Store significant changes in a simple log format
      if (action === 'DELETE' || action === 'CANCEL') {
        const { error } = await supabase
          .from('user_usage')
          .insert({
            user_id: user.id,
            company_id: newValues?.company_id || oldValues?.company_id,
            month_year: new Date().toISOString().slice(0, 7),
            invoices_count: 0,
            customers_count: 0,
            credit_notes_count: 0,
            products_count: 0
          });

        if (error) {
          console.error('Error logging audit trail:', error);
        }
      }
    } catch (error) {
      console.error('Error in audit trail logging:', error);
    }
  }, [user]);

  const logInvoiceAction = useCallback(async (
    invoiceId: string,
    action: AuditLogEntry['action'],
    oldData?: any,
    newData?: any
  ) => {
    await logAction('invoices', invoiceId, action, oldData, newData);
  }, [logAction]);

  const logCustomerAction = useCallback(async (
    customerId: string,
    action: AuditLogEntry['action'],
    oldData?: any,
    newData?: any
  ) => {
    await logAction('customers', customerId, action, oldData, newData);
  }, [logAction]);

  const logCreditNoteAction = useCallback(async (
    creditNoteId: string,
    action: AuditLogEntry['action'],
    oldData?: any,
    newData?: any
  ) => {
    await logAction('credit_notes', creditNoteId, action, oldData, newData);
  }, [logAction]);

  const logProductAction = useCallback(async (
    productId: string,
    action: AuditLogEntry['action'],
    oldData?: any,
    newData?: any
  ) => {
    await logAction('products', productId, action, oldData, newData);
  }, [logAction]);

  return {
    logAction,
    logInvoiceAction,
    logCustomerAction,
    logCreditNoteAction,
    logProductAction
  };
};
