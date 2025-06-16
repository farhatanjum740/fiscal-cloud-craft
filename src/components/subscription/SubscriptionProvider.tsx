
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionLimits, UserUsage } from '@/types/subscription';

interface SubscriptionContextType {
  subscription: any;
  limits: SubscriptionLimits | null;
  usage: UserUsage | null;
  loading: boolean;
  error: string | null;
  canPerformAction: (actionType: string, companyId: string) => Promise<boolean>;
  checkLimitAndAct: (actionType: string, companyId: string) => Promise<boolean>;
  refetch: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const subscriptionData = useSubscription();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    subscription: subscriptionData.subscription,
    limits: subscriptionData.limits,
    usage: subscriptionData.usage,
    loading: subscriptionData.loading,
    error: subscriptionData.error,
    canPerformAction: subscriptionData.canPerformAction,
    checkLimitAndAct: subscriptionData.checkLimitAndAct,
    refetch: subscriptionData.refetch
  }), [
    subscriptionData.subscription,
    subscriptionData.limits,
    subscriptionData.usage,
    subscriptionData.loading,
    subscriptionData.error,
    subscriptionData.canPerformAction,
    subscriptionData.checkLimitAndAct,
    subscriptionData.refetch
  ]);

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};
