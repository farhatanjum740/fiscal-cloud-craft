
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AppHeader() {
  const { user, profile, signOut } = useAuth();
  const [company, setCompany] = useState<any>(null);
  
  const userInitials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('companies')
        .select('name, logo')
        .eq('user_id', user.id)
        .limit(1)
        .single();
        
      if (!error && data) {
        setCompany(data);
      }
    };
    
    fetchCompanyData();
  }, [user]);

  return (
    <header className="border-b flex items-center h-14 px-4 gap-4 bg-background">
      <SidebarTrigger />
      
      {company && company.logo && (
        <div className="flex items-center gap-2">
          <img 
            src={company.logo}
            alt={company.name}
            className="h-8 w-auto object-contain"
          />
          <span className="font-medium hidden lg:inline-block">{company.name}</span>
        </div>
      )}
      
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name || ""} />
            ) : (
              <AvatarFallback>{userInitials}</AvatarFallback>
            )}
          </Avatar>
          <span className="font-medium hidden sm:inline-block">
            {profile?.full_name || user?.email}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
