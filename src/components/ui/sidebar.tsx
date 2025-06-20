
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Home, Settings, Users, Package, CreditCard, FileText, BarChart } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  signOut: () => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ signOut }) => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Mobile-first: Always use mobile sidebar on small screens
  if (isMobile) {
    return (
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="fixed top-2 left-2 z-50 bg-white/90 backdrop-blur-sm shadow-sm border h-touch w-touch p-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs bg-[#0d2252] p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="p-4 border-b border-[#1a3b7a]">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-white text-lg font-bold">InvoiceHub</SheetTitle>
                </div>
                <SheetDescription className="text-gray-300 text-sm">
                  Navigate through your dashboard
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto py-4">
                {sidebarItems.map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.path}
                    className={`flex items-center space-x-3 py-3 px-4 mx-2 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.path) 
                        ? 'bg-[#1a3b7a] text-white' 
                        : 'text-gray-300 hover:bg-[#14325e] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </NavLink>
                ))}
                
                <div className="mt-6 pt-4 border-t border-[#1a3b7a] mx-2">
                  <div className="px-2 text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Settings</div>
                  <NavLink
                    to="/app/settings/company"
                    className={`flex items-center space-x-3 py-3 px-2 rounded-lg text-base font-medium transition-colors ${
                      isActive("/app/settings/company") 
                        ? 'bg-[#1a3b7a] text-white' 
                        : 'text-gray-300 hover:bg-[#14325e] hover:text-white'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Company Profile</span>
                  </NavLink>
                  <NavLink
                    to="/app/subscription"
                    className={`flex items-center space-x-3 py-3 px-2 rounded-lg text-base font-medium transition-colors ${
                      isActive("/app/subscription") 
                        ? 'bg-[#1a3b7a] text-white' 
                        : 'text-gray-300 hover:bg-[#14325e] hover:text-white'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Subscription</span>
                  </NavLink>
                </div>
              </div>
              
              <div className="p-4 border-t border-[#1a3b7a]">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "Avatar"} />
                    <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email || "User"}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 h-touch"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop sidebar (hidden on mobile)
  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 border-r border-[#1a3b7a] bg-[#0d2252] h-screen sticky top-0 z-10 hidden md:block`}>
      {/* Collapse/expand button */}
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute -right-3 top-8 h-6 w-6 rounded-full border border-[#1a3b7a] bg-[#0d2252] text-white shadow-md z-20"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <Menu className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </Button>

      <div className="flex items-center justify-between p-4">
        <span className={`font-bold text-lg text-white ${collapsed ? 'hidden' : 'block'}`}>InvoiceHub</span>
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "Avatar"} />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white z-50">
              <DropdownMenuItem onClick={() => navigate("/app/settings/company")}>
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="flex flex-col py-4">
        {sidebarItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'} py-2 px-4 rounded-md hover:bg-[#14325e] ${isActive(item.path) ? 'bg-[#1a3b7a] text-white' : 'text-gray-300'}`}
          >
            {item.icon}
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
        
        <div className={`mt-6 pt-4 border-t border-[#1a3b7a] ${collapsed ? 'mx-2' : 'mx-0'}`}>
          {!collapsed && <div className="px-4 text-sm font-medium text-gray-400 mb-2">Settings</div>}
          <NavLink
            to="/app/settings/company"
            className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'} py-2 px-4 rounded-md hover:bg-[#14325e] ${
              isActive("/app/settings/company") ? 'bg-[#1a3b7a] text-white' : 'text-gray-300'
            }`}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Company Profile</span>}
          </NavLink>
          <NavLink
            to="/app/subscription"
            className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'} py-2 px-4 rounded-md hover:bg-[#14325e] ${
              isActive("/app/subscription") ? 'bg-[#1a3b7a] text-white' : 'text-gray-300'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            {!collapsed && <span>Subscription</span>}
          </NavLink>
        </div>
      </div>
      
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="outline" 
            className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

export const sidebarItems = [
  {
    title: "Dashboard",
    path: "/app",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Invoices & Credit Notes",
    path: "/app/invoices",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Reports",
    path: "/app/reports",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    title: "Customers",
    path: "/app/customers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Products",
    path: "/app/products",
    icon: <Package className="h-5 w-5" />,
  },
];
