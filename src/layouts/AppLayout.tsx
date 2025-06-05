
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/AppSidebar';
import AppHeader from '@/components/AppHeader';
import { SubscriptionProvider } from '@/components/subscription/SubscriptionProvider';

const AppLayout = () => {
  return (
    <SubscriptionProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <AppHeader />
            <main className="flex-1 p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SubscriptionProvider>
  );
};

export default AppLayout;
