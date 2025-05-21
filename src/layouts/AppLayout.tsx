
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from '@/components/ui/AppSidebar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Protect the route - redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect due to the useEffect
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 ml-64">
        <AppHeader />
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
