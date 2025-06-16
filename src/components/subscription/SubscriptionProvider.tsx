
import React, { createContext, useContext, ReactNode } from 'react';
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

  // Provide fallback values to prevent context from breaking
  const contextValue = {
    subscription: subscriptionData.subscription,
    limits: subscriptionData.limits,
    usage: subscriptionData.usage,
    loading: subscriptionData.loading,
    error: subscriptionData.error,
    canPerformAction: subscriptionData.canPerformAction,
    checkLimitAndAct: subscriptionData.checkLimitAndAct,
    refetch: subscriptionData.refetch
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};
