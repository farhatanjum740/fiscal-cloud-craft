
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionLimits, UserUsage, SubscriptionPlan } from '@/types/subscription';
import { toast } from '@/components/ui/use-toast';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Fetching subscription data for user:', user.id);

      // Get user's active subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        throw subscriptionError;
      }

      setSubscription(subscriptionData);
      console.log('Subscription data:', subscriptionData);

      // Get subscription limits
      const plan = subscriptionData?.plan || 'freemium';
      console.log('User plan:', plan);
      
      const { data: limitsData, error: limitsError } = await supabase
        .rpc('get_subscription_limits', { plan_type: plan });

      if (limitsError) {
        console.error('Error fetching limits:', limitsError);
        throw limitsError;
      }

      // Safely cast the JSON response to SubscriptionLimits
      if (limitsData && typeof limitsData === 'object' && !Array.isArray(limitsData)) {
        setLimits(limitsData as unknown as SubscriptionLimits);
        console.log('Subscription limits:', limitsData);
      }

      // Get current month usage
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      if (usageError) {
        console.error('Error fetching usage:', usageError);
        // Don't throw here, just use default values
      }

      const finalUsage = usageData || {
        invoices_count: 0,
        customers_count: 0,
        credit_notes_count: 0,
        products_count: 0,
        month_year: currentMonth
      } as UserUsage;

      setUsage(finalUsage);
      console.log('Usage data:', finalUsage);

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch subscription data');
      
      // Set fallback data for professional plan if we can't fetch subscription
      setLimits({
        invoices: -1,
        customers: -1,
        credit_notes: -1,
        products: -1,
        users: -1,
        templates: 10,
        reports: true,
        priority_support: true,
        api_access: true
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const canPerformAction = useCallback(async (actionType: string, companyId: string): Promise<boolean> => {
    if (!user) {
      console.log('No user found for action check');
      return false;
    }

    try {
      console.log(`Checking if user can perform action: ${actionType} for company: ${companyId}`);
      
      const { data, error } = await supabase
        .rpc('can_perform_action', {
          p_user_id: user.id,
          p_company_id: companyId,
          p_action_type: actionType
        });

      if (error) {
        console.error('Error checking action permission:', error);
        // Fallback: if database function fails, allow action for professional users
        if (subscription?.plan === 'professional') {
          console.log('Database function failed, but user has professional plan - allowing action');
          return true;
        }
        return false;
      }

      console.log(`Action check result for ${actionType}:`, data);
      return data;
    } catch (error) {
      console.error('Error checking action permission:', error);
      // Fallback: if database function fails, allow action for professional users
      if (subscription?.plan === 'professional') {
        console.log('Database function failed, but user has professional plan - allowing action');
        return true;
      }
      return false;
    }
  }, [user, subscription]);

  const incrementUsage = useCallback(async (actionType: string, companyId: string) => {
    if (!user) return;

    try {
      console.log(`Incrementing usage for ${actionType} in company ${companyId}`);
      
      const { error } = await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_company_id: companyId,
        p_action_type: actionType
      });

      if (error) {
        console.error('Error incrementing usage:', error);
        throw error;
      }

      // Refresh usage data
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }, [user, fetchSubscriptionData]);

  const checkLimitAndAct = useCallback(async (actionType: string, companyId: string): Promise<boolean> => {
    try {
      const canAct = await canPerformAction(actionType, companyId);
      
      if (!canAct) {
        const plan = subscription?.plan || 'freemium';
        const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
        
        console.log(`Limit reached for ${actionType} on ${plan} plan`);
        
        toast({
          title: "Limit Reached",
          description: `You've reached your ${actionType} limit for the ${planName} plan. Please upgrade to continue.`,
          variant: "destructive"
        });
        return false;
      }

      await incrementUsage(actionType, companyId);
      return true;
    } catch (error) {
      console.error('Error in checkLimitAndAct:', error);
      toast({
        title: "Error",
        description: "There was an error checking subscription limits. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [canPerformAction, incrementUsage, subscription]);

  return {
    subscription,
    limits,
    usage,
    loading,
    error,
    canPerformAction,
    incrementUsage,
    checkLimitAndAct,
    refetch: fetchSubscriptionData
  };
};
