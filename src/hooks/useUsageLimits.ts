
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';
import { useCompanyWithFallback } from '@/hooks/useCompanyWithFallback';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useUsageLimits = () => {
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const { checkLimitAndAct, canPerformAction, limits, subscription, error } = useSubscriptionContext();

  const checkCustomerLimit = async (): Promise<boolean> => {
    if (!user || !company) {
      toast({
        title: "Error",
        description: "User or company data not available. Please ensure your profile is set up.",
        variant: "destructive"
      });
      return false;
    }

    try {
      return await checkLimitAndAct('customer', company.id);
    } catch (error) {
      console.error('Error checking customer limit:', error);
      toast({
        title: "Error",
        description: "Failed to check customer limit. Please try again.",
        variant: "destructive"
      });
      return false;
    }
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

    try {
      console.log('Checking invoice limit for user:', user.id, 'company:', company.id);
      console.log('Current subscription plan:', subscription?.plan);
      console.log('Current limits:', limits);
      
      const result = await checkLimitAndAct('invoice', company.id);
      console.log('Invoice limit check result:', result);
      return result;
    } catch (error) {
      console.error('Error checking invoice limit:', error);
      toast({
        title: "Error",
        description: "Failed to check invoice limit. Please try again.",
        variant: "destructive"
      });
      return false;
    }
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

    try {
      return await checkLimitAndAct('credit_note', company.id);
    } catch (error) {
      console.error('Error checking credit note limit:', error);
      toast({
        title: "Error",
        description: "Failed to check credit note limit. Please try again.",
        variant: "destructive"
      });
      return false;
    }
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

    try {
      return await checkLimitAndAct('product', company.id);
    } catch (error) {
      console.error('Error checking product limit:', error);
      toast({
        title: "Error",
        description: "Failed to check product limit. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const canCreateCustomer = async (): Promise<boolean> => {
    if (!user || !company) return false;
    
    try {
      return await canPerformAction('customer', company.id);
    } catch (error) {
      console.error('Error checking customer permission:', error);
      return subscription?.plan === 'professional'; // Fallback for professional users
    }
  };

  const canCreateInvoice = async (): Promise<boolean> => {
    if (!user || !company) return false;
    
    try {
      return await canPerformAction('invoice', company.id);
    } catch (error) {
      console.error('Error checking invoice permission:', error);
      return subscription?.plan === 'professional'; // Fallback for professional users
    }
  };

  const canCreateCreditNote = async (): Promise<boolean> => {
    if (!user || !company) return false;
    
    try {
      return await canPerformAction('credit_note', company.id);
    } catch (error) {
      console.error('Error checking credit note permission:', error);
      return subscription?.plan === 'professional'; // Fallback for professional users
    }
  };

  const canCreateProduct = async (): Promise<boolean> => {
    if (!user || !limits) return false;
    
    // If unlimited products, always allow
    if (limits.products === -1) return true;
    
    try {
      // Get actual count from database
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error checking product count:', error);
        return subscription?.plan === 'professional'; // Fallback for professional users
      }
      
      console.log("Actual products count from DB in canCreateProduct:", count);
      console.log("Product limit:", limits.products);
      
      return (count || 0) < limits.products;
    } catch (error) {
      console.error('Error checking product count:', error);
      return subscription?.plan === 'professional'; // Fallback for professional users
    }
  };

  const canAccessApi = async (): Promise<boolean> => {
    if (!user || !company) return false;
    
    try {
      return await canPerformAction('api_access', company.id);
    } catch (error) {
      console.error('Error checking API access permission:', error);
      return subscription?.plan === 'professional'; // Fallback for professional users
    }
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
    isCompanyLoaded: !!company,
    subscriptionError: error
  };
};
