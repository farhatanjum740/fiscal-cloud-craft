
import React, { createContext, useContext } from 'react';
import { useSubscription, SubscriptionPlan, BillingCycle } from '@/hooks/useSubscription';

interface SubscriptionContextType {
  isPremium: boolean;
  isFreemium: boolean;
  loading: boolean;
  customerCount: number;
  canAddMoreCustomers: boolean;
  upgradeSubscription: (plan: SubscriptionPlan, billingCycle: BillingCycle) => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const subscription = useSubscription();
  
  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  
  return context;
};
