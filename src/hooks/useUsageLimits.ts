
import { useSubscriptionValidation } from './useSubscriptionValidation';

// Re-export the new validation hook with the old interface for backward compatibility
export const useUsageLimits = () => {
  const validation = useSubscriptionValidation();

  return {
    // Old interface methods
    checkCustomerLimit: () => validation.validateAndPerformAction('customer'),
    checkInvoiceLimit: () => validation.validateAndPerformAction('invoice'),
    checkCreditNoteLimit: () => validation.validateAndPerformAction('credit_note'),
    checkProductLimit: () => validation.validateAndPerformAction('product'),
    
    canCreateCustomer: () => validation.checkCanPerformAction('customer'),
    canCreateInvoice: () => validation.checkCanPerformAction('invoice'),
    canCreateCreditNote: () => validation.checkCanPerformAction('credit_note'),
    canCreateProduct: () => validation.checkCanPerformAction('product'),
    canAccessApi: () => validation.checkCanPerformAction('api_access' as any),
    
    incrementUsageAndRefresh: validation.validateAndPerformAction,
    
    // Additional properties for compatibility
    company: validation.subscription,
    isCompanyLoaded: !!validation.subscription,
    subscriptionError: null
  };
};
