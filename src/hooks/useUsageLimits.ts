
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';
import { useCompanyWithFallback } from '@/hooks/useCompanyWithFallback';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useUsageLimits = () => {
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const { checkLimitAndAct, canPerformAction, limits } = useSubscriptionContext();

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

  const checkProductLimit = async (): Promise<boolean> => {
    if (!user || !company) {
      toast({
        title: "Error",
        description: "User or company data not available. Please ensure your profile is set up.",
        variant: "destructive"
      });
      return false;
    }

    return await checkLimitAndAct('product', company.id);
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

  const canCreateProduct = async (): Promise<boolean> => {
    if (!user || !limits) return false;
    
    // If unlimited products, always allow
    if (limits.products === -1) return true;
    
    try {
      // Get actual count from database
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      console.log("Actual products count from DB in canCreateProduct:", count);
      console.log("Product limit:", limits.products);
      
      return (count || 0) < limits.products;
    } catch (error) {
      console.error('Error checking product count:', error);
      return false;
    }
  };

  const canAccessApi = async (): Promise<boolean> => {
    if (!user || !company) return false;
    return await canPerformAction('api_access', company.id);
  };

  // Helper function to increment usage and refresh subscription data
  const incrementUsageAndRefresh = async (actionType: 'invoice' | 'customer' | 'credit_note' | 'product') => {
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
    checkProductLimit,
    canCreateCustomer,
    canCreateInvoice,
    canCreateCreditNote,
    canCreateProduct,
    canAccessApi,
    incrementUsageAndRefresh,
    company,
    isCompanyLoaded: !!company
  };
};
