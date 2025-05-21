
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type SubscriptionPlan = 'freemium' | 'premium';
export type BillingCycle = 'monthly' | 'yearly';

interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  active: boolean;
  startDate: string;
  endDate: string | null;
  lastPaymentDate: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerCount, setCustomerCount] = useState(0);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch the user's subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setSubscription({
            id: data.id,
            plan: data.plan as SubscriptionPlan,
            active: data.active,
            startDate: data.start_date,
            endDate: data.end_date,
            lastPaymentDate: data.last_payment_date,
          });
        } else {
          // No subscription found, create a default freemium subscription
          const { data: newSub, error: createError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              plan: 'freemium',
              active: true,
            })
            .select()
            .single();
            
          if (createError) throw createError;
          
          if (newSub) {
            setSubscription({
              id: newSub.id,
              plan: newSub.plan as SubscriptionPlan,
              active: newSub.active,
              startDate: newSub.start_date,
              endDate: newSub.end_date,
              lastPaymentDate: newSub.last_payment_date,
            });
          }
        }
        
        // Get customer count for limits
        const { count, error: countError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (countError) throw countError;
        
        setCustomerCount(count || 0);
      } catch (error: any) {
        console.error('Error fetching subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch subscription details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
    
    // Set up real-time subscription to subscription changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user?.id}`,
        },
        fetchSubscription
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const isPremium = !!subscription && subscription.plan === 'premium';
  const isFreemium = !subscription || subscription.plan === 'freemium';
  
  const canAddMoreCustomers = isPremium || customerCount < 4;
  
  const upgradeSubscription = async (plan: SubscriptionPlan, billingCycle: BillingCycle) => {
    if (!user) return false;
    
    if (plan === 'freemium') {
      // Downgrade to freemium
      try {
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            plan: 'freemium',
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription?.id);
          
        if (error) throw error;
        
        toast({
          title: 'Subscription Updated',
          description: 'Your subscription has been downgraded to Freemium',
        });
        
        return true;
      } catch (error: any) {
        console.error('Error downgrading subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to downgrade subscription',
          variant: 'destructive',
        });
        return false;
      }
    }
    
    // For premium, we'll handle it in the payment page
    return false;
  };
  
  return {
    subscription,
    loading,
    isPremium,
    isFreemium,
    customerCount,
    canAddMoreCustomers,
    upgradeSubscription,
  };
};
