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
import { Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Home, Plus, Settings, Users, Package, CreditCard } from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader className="text-left">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate through your dashboard.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {sidebarItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isActive(item.path) ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'}`}
              >
                {item.icon}
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-gray-50">
        <div className="flex items-center justify-between p-4">
          <span className="font-bold text-lg">Dashboard</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "Avatar"} />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/app/profile")}>
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col py-4">
          {sidebarItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isActive(item.path) ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'}`}
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;

export const sidebarItems = [
  {
    title: "Home",
    path: "/app",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Invoices",
    path: "/app/invoices",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Credit Notes",
    path: "/app/credit-notes",
    icon: <CreditCard className="h-5 w-5" />,
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
