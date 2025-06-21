
import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/ui/AppSidebar';
import AppHeader from '@/components/AppHeader';
import { SubscriptionProvider } from '@/components/subscription/SubscriptionProvider';

const AppLayout = () => {
  return (
    <SubscriptionProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row">
        {/* Mobile-first: Sidebar hidden by default, shown on larger screens */}
        <AppSidebar />
        
        {/* Main content area - full width on mobile, flex-1 on desktop */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <AppHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SubscriptionProvider>
  );
};

export default AppLayout;
