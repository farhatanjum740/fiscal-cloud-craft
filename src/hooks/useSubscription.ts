import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      // Get user's active subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(subscriptionData);

      // Get subscription limits
      const plan = subscriptionData?.plan || 'freemium';
      const { data: limitsData } = await supabase
        .rpc('get_subscription_limits', { plan_type: plan });

      // Safely cast the JSON response to SubscriptionLimits
      if (limitsData && typeof limitsData === 'object' && !Array.isArray(limitsData)) {
        setLimits(limitsData as unknown as SubscriptionLimits);
      }

      // Get current month usage
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: usageData } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      setUsage(usageData || {
        invoices_count: 0,
        customers_count: 0,
        credit_notes_count: 0,
        month_year: currentMonth
      } as UserUsage);

    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canPerformAction = async (actionType: string, companyId: string) => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .rpc('can_perform_action', {
          p_user_id: user.id,
          p_company_id: companyId,
          p_action_type: actionType
        });

      return data;
    } catch (error) {
      console.error('Error checking action permission:', error);
      return false;
    }
  };

  const incrementUsage = async (actionType: string, companyId: string) => {
    if (!user) return;

    try {
      await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_company_id: companyId,
        p_action_type: actionType
      });

      // Refresh usage data
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const checkLimitAndAct = async (actionType: string, companyId: string) => {
    const canAct = await canPerformAction(actionType, companyId);
    
    if (!canAct) {
      const plan = subscription?.plan || 'freemium';
      toast({
        title: "Limit Reached",
        description: `You've reached your ${actionType} limit for the ${plan} plan. Please upgrade to continue.`,
        variant: "destructive"
      });
      return false;
    }

    await incrementUsage(actionType, companyId);
    return true;
  };

  return {
    subscription,
    limits,
    usage,
    loading,
    canPerformAction,
    incrementUsage,
    checkLimitAndAct,
    refetch: fetchSubscriptionData
  };
};
