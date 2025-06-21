
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyWithFallback } from '@/hooks/useCompanyWithFallback';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionValidation = () => {
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const { limits, subscription, usage, refetch } = useSubscriptionContext();
  const [isValidating, setIsValidating] = useState(false);

  const validateAndPerformAction = useCallback(async (
    actionType: 'invoice' | 'customer' | 'credit_note' | 'product',
    showSuccessToast = false
  ): Promise<boolean> => {
    if (!user || !company) {
      toast({
        title: "Authentication Error",
        description: "Please ensure you're logged in and have a company profile.",
        variant: "destructive"
      });
      return false;
    }

    setIsValidating(true);

    try {
      // For professional users, always allow actions
      if (subscription?.plan === 'professional') {
        if (showSuccessToast) {
          toast({
            title: "Action Allowed",
            description: "Professional plan users have unlimited access.",
          });
        }
        return true;
      }

      // Check current usage against limits with proper type conversion
      const currentUsage = Number(usage?.[`${actionType}s_count` as keyof typeof usage] || 0);
      const limit = Number(limits?.[`${actionType}s` as keyof typeof limits] || 0);

      console.log(`Validating ${actionType}: current usage = ${currentUsage}, limit = ${limit}`);

      // If unlimited (-1), allow action
      if (limit === -1) {
        if (showSuccessToast) {
          toast({
            title: "Action Allowed",
            description: `Unlimited ${actionType}s available.`,
          });
        }
        return true;
      }

      // Check if limit would be exceeded
      if (currentUsage >= limit) {
        const planName = subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Current';
        
        toast({
          title: "Limit Reached",
          description: `You've reached your ${actionType} limit (${limit}) for the ${planName} plan. Please upgrade to continue.`,
          variant: "destructive"
        });
        return false;
      }

      // Increment usage in database
      const { error } = await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_company_id: company.id,
        p_action_type: actionType
      });

      if (error) {
        console.error('Error incrementing usage:', error);
        throw error;
      }

      // Refresh subscription data
      await refetch();

      if (showSuccessToast) {
        const remaining = Math.max(0, limit - currentUsage - 1);
        toast({
          title: "Action Allowed",
          description: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} created successfully. ${remaining} remaining.`,
        });
      }

      return true;
    } catch (error) {
      console.error(`Error validating ${actionType} action:`, error);
      
      // Fallback for professional users
      if (subscription?.plan === 'professional') {
        console.log('Error occurred but user is professional, allowing action');
        return true;
      }
      
      toast({
        title: "Validation Error",
        description: `Failed to validate ${actionType} limit. Please try again.`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [user, company, limits, subscription, usage, refetch]);

  const checkCanPerformAction = useCallback(async (
    actionType: 'invoice' | 'customer' | 'credit_note' | 'product'
  ): Promise<boolean> => {
    if (!user || !company || !limits) return false;

    // Professional users can always perform actions
    if (subscription?.plan === 'professional') return true;

    const currentUsage = Number(usage?.[`${actionType}s_count` as keyof typeof usage] || 0);
    const limit = Number(limits[`${actionType}s` as keyof typeof limits] || 0);

    // Unlimited limit
    if (limit === -1) return true;

    // Check if under limit
    return currentUsage < limit;
  }, [user, company, limits, subscription, usage]);

  const getRemainingCount = useCallback((
    actionType: 'invoice' | 'customer' | 'credit_note' | 'product'
  ): number => {
    if (!limits) return 0;
    
    const limit = Number(limits[`${actionType}s` as keyof typeof limits] || 0);
    if (limit === -1) return -1; // Unlimited
    
    const currentUsage = Number(usage?.[`${actionType}s_count` as keyof typeof usage] || 0);
    return Math.max(0, limit - currentUsage);
  }, [limits, usage]);

  return {
    validateAndPerformAction,
    checkCanPerformAction,
    getRemainingCount,
    isValidating,
    subscription,
    limits,
    usage
  };
};
