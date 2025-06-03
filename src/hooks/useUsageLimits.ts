
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';
import { useCompanyWithFallback } from '@/hooks/useCompanyWithFallback';
import { toast } from '@/components/ui/use-toast';

export const useUsageLimits = () => {
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const { checkLimitAndAct, canPerformAction } = useSubscriptionContext();

  const checkCustomerLimit = async (): Promise<boolean> => {
    if (!user || !company) {
      toast({
        title: "Error",
        description: "User or company data not available. Please ensure your profile is set up.",
        variant: "destructive"
      });
      return false;
    }

    return await checkLimitAndAct('customer', company.id);
  };

  const checkInvoiceLimit = async (): Promise<boolean> => {
    if (!user || !company) {
      toast({
        title: "Error", 
        description: "User or company data not available. Please ensure your profile is set up.",
        variant: "destructive"
      });
      return false;
    }

    return await checkLimitAndAct('invoice', company.id);
  };

  const checkCreditNoteLimit = async (): Promise<boolean> => {
    if (!user || !company) {
      toast({
        title: "Error",
        description: "User or company data not available. Please ensure your profile is set up.", 
        variant: "destructive"
      });
      return false;
    }

    return await checkLimitAndAct('credit_note', company.id);
  };

  const canCreateCustomer = async (): Promise<boolean> => {
    if (!user || !company) return false;
    return await canPerformAction('customer', company.id);
  };

  const canCreateInvoice = async (): Promise<boolean> => {
    if (!user || !company) return false;
    return await canPerformAction('invoice', company.id);
  };

  const canCreateCreditNote = async (): Promise<boolean> => {
    if (!user || !company) return false;
    return await canPerformAction('credit_note', company.id);
  };

  // Helper function to increment usage and refresh subscription data
  const incrementUsageAndRefresh = async (actionType: 'invoice' | 'customer' | 'credit_note') => {
    if (!user || !company) return false;
    
    try {
      const success = await checkLimitAndAct(actionType, company.id);
      return success;
    } catch (error) {
      console.error(`Error incrementing ${actionType} usage:`, error);
      return false;
    }
  };

  return {
    checkCustomerLimit,
    checkInvoiceLimit,
    checkCreditNoteLimit,
    canCreateCustomer,
    canCreateInvoice,
    canCreateCreditNote,
    incrementUsageAndRefresh,
    company,
    isCompanyLoaded: !!company
  };
};
