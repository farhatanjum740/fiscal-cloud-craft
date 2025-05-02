
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Building, 
  Settings, 
  LogOut 
} from 'lucide-react';

const AppLayout = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Protect the route - redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
    if (!loading) {
      setIsInitializing(false);
    }
  }, [user, loading, navigate]);
  
  // Show loading state
  if (loading || isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar signOut={signOut} />
        <div className="flex flex-col flex-1">
          <AppHeader />
          <div className="flex-1 overflow-auto p-4 md:p-6 bg-background">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const AppSidebar = ({ signOut }: { signOut: () => void }) => {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold text-white">InvoiceHub</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/app">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/app/invoices">
                    <FileText className="h-5 w-5" />
                    <span>Invoices</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/app/customers">
                    <Users className="h-5 w-5" />
                    <span>Customers</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/app/products">
                    <Package className="h-5 w-5" />
                    <span>Products</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/app/settings/company">
                    <Building className="h-5 w-5" />
                    <span>Company Profile</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button 
          onClick={signOut}
          variant="outline" 
          className="w-full bg-sidebar-accent hover:bg-sidebar-accent/70"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppLayout;
