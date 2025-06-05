
import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/ui/AppSidebar';
import AppHeader from '@/components/AppHeader';
import { SubscriptionProvider } from '@/components/subscription/SubscriptionProvider';

const AppLayout = () => {
  return (
    <SubscriptionProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SubscriptionProvider>
  );
};

export default AppLayout;
