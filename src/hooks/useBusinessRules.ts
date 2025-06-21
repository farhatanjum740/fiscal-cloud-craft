
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessRule {
  name: string;
  validate: (data: any) => Promise<{ valid: boolean; message?: string }>;
  enforce: boolean;
}

export const useBusinessRules = () => {
  
  const validateInvoiceBusinessRules = useCallback(async (invoiceData: any) => {
    const rules: BusinessRule[] = [
      {
        name: 'invoice_date_not_future',
        validate: async (data) => {
          const invoiceDate = new Date(data.invoice_date);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          
          if (invoiceDate > today) {
            return {
              valid: false,
              message: 'Invoice date cannot be in the future'
            };
          }
          return { valid: true };
        },
        enforce: true
      },
      {
        name: 'due_date_after_invoice_date',
        validate: async (data) => {
          if (data.due_date) {
            const invoiceDate = new Date(data.invoice_date);
            const dueDate = new Date(data.due_date);
            
            if (dueDate < invoiceDate) {
              return {
                valid: false,
                message: 'Due date cannot be earlier than invoice date'
              };
            }
          }
          return { valid: true };
        },
        enforce: true
      },
      {
        name: 'minimum_invoice_amount',
        validate: async (data) => {
          const totalAmount = Number(data.total_amount || 0);
          
          if (totalAmount <= 0) {
            return {
              valid: false,
              message: 'Invoice total amount must be greater than zero'
            };
          }
          return { valid: true };
        },
        enforce: true
      },
      {
        name: 'gst_calculation_accuracy',
        validate: async (data) => {
          const subtotal = Number(data.subtotal || 0);
          const cgst = Number(data.cgst || 0);
          const sgst = Number(data.sgst || 0);
          const igst = Number(data.igst || 0);
          const total = Number(data.total_amount || 0);
          
          const calculatedTotal = subtotal + cgst + sgst + igst;
          const difference = Math.abs(total - calculatedTotal);
          
          if (difference > 0.01) {
            return {
              valid: false,
              message: 'GST calculation appears incorrect. Please verify tax amounts.'
            };
          }
          return { valid: true };
        },
        enforce: true
      },
      {
        name: 'customer_gstin_validation',
        validate: async (data) => {
          if (data.customer_gstin) {
            const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstinPattern.test(data.customer_gstin)) {
              return {
                valid: false,
                message: 'Customer GSTIN format is invalid'
              };
            }
          }
          return { valid: true };
        },
        enforce: false
      }
    ];

    const results = await Promise.all(
      rules.map(async (rule) => ({
        rule,
        result: await rule.validate(invoiceData)
      }))
    );

    const violations = results.filter(({ result }) => !result.valid);
    const enforceableViolations = violations.filter(({ rule }) => rule.enforce);
    const warningViolations = violations.filter(({ rule }) => !rule.enforce);

    // Show warnings for non-enforceable violations
    warningViolations.forEach(({ result }) => {
      toast({
        title: "Business Rule Warning",
        description: result.message,
        variant: "default"
      });
    });

    // Return enforceable violations
    return {
      valid: enforceableViolations.length === 0,
      violations: enforceableViolations.map(({ result }) => result.message).filter(Boolean)
    };
  }, []);

  const validateCreditNoteBusinessRules = useCallback(async (creditNoteData: any) => {
    const rules: BusinessRule[] = [
      {
        name: 'credit_note_date_not_before_invoice',
        validate: async (data) => {
          if (data.invoice_date) {
            const creditNoteDate = new Date(data.credit_note_date);
            const invoiceDate = new Date(data.invoice_date);
            
            if (creditNoteDate < invoiceDate) {
              return {
                valid: false,
                message: 'Credit note date cannot be earlier than the original invoice date'
              };
            }
          }
          return { valid: true };
        },
        enforce: true
      },
      {
        name: 'credit_note_amount_validation',
        validate: async (data) => {
          const creditAmount = Number(data.total_amount || 0);
          const originalAmount = Number(data.original_invoice_amount || 0);
          
          if (creditAmount > originalAmount) {
            return {
              valid: false,
              message: 'Credit note amount cannot exceed the original invoice amount'
            };
          }
          return { valid: true };
        },
        enforce: true
      }
    ];

    const results = await Promise.all(
      rules.map(async (rule) => ({
        rule,
        result: await rule.validate(creditNoteData)
      }))
    );

    const violations = results.filter(({ result }) => !result.valid);
    const enforceableViolations = violations.filter(({ rule }) => rule.enforce);

    return {
      valid: enforceableViolations.length === 0,
      violations: enforceableViolations.map(({ result }) => result.message).filter(Boolean)
    };
  }, []);

  const validateCustomerBusinessRules = useCallback(async (customerData: any) => {
    const rules: BusinessRule[] = [
      {
        name: 'unique_customer_email',
        validate: async (data) => {
          if (data.email) {
            const { data: existingCustomers, error } = await supabase
              .from('customers')
              .select('id')
              .eq('email', data.email)
              .neq('id', data.id || '');

            if (error) {
              console.error('Error checking customer email uniqueness:', error);
              return { valid: true }; // Allow on error
            }

            if (existingCustomers && existingCustomers.length > 0) {
              return {
                valid: false,
                message: 'A customer with this email already exists'
              };
            }
          }
          return { valid: true };
        },
        enforce: true
      },
      {
        name: 'customer_gstin_format',
        validate: async (data) => {
          if (data.gstin) {
            const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstinPattern.test(data.gstin)) {
              return {
                valid: false,
                message: 'Invalid GSTIN format'
              };
            }
          }
          return { valid: true };
        },
        enforce: false
      }
    ];

    const results = await Promise.all(
      rules.map(async (rule) => ({
        rule,
        result: await rule.validate(customerData)
      }))
    );

    const violations = results.filter(({ result }) => !result.valid);
    const enforceableViolations = violations.filter(({ rule }) => rule.enforce);
    const warningViolations = violations.filter(({ rule }) => !rule.enforce);

    // Show warnings
    warningViolations.forEach(({ result }) => {
      toast({
        title: "Validation Warning",
        description: result.message,
        variant: "default"
      });
    });

    return {
      valid: enforceableViolations.length === 0,
      violations: enforceableViolations.map(({ result }) => result.message).filter(Boolean)
    };
  }, []);

  return {
    validateInvoiceBusinessRules,
    validateCreditNoteBusinessRules,
    validateCustomerBusinessRules
  };
};
